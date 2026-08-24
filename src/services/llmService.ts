// PANELOGUE - LLM Provider Service with Streaming & High-Fidelity Simulation Fallback

import type { ChatPaceMode, DebateSettings } from '../types/debate';

export interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  settings: DebateSettings;
  agentOverrideModel?: string;
  onChunk: (chunkText: string) => void;
  signal?: AbortSignal;
}

export interface LLMResponseResult {
  message: string;
  stance?: number;
  confidence?: number;
  replyToId?: string;
  referencedClaimId?: string;
  speechAct?: 'claim' | 'rebuttal' | 'question' | 'concession' | 'clarification' | 'moderation';
  targetAgentIds?: string[];
  claimsCreated?: string[];
  claimsAttacked?: string[];
  memoryCandidates?: { summary: string; importance: number }[];
  action?: string;
  nextSpeakerId?: string;
  rationale?: string;
  evidence?: string[];
  stanceReason?: string;
  tokensUsed?: number;
  latencyMs?: number;
  usedFallbackModel?: string;
  reflection?: {
    currentPosition: string;
    strongestOpposingArgument: string;
    unresolvedQuestion: string;
    nextStrategy: string;
  };
}

class StructuredResponseParseError extends Error {
  constructor() {
    super('모델이 완성된 응답 형식을 반환하지 않았습니다. 자동 재시도 후에도 복구하지 못했습니다.');
    this.name = 'StructuredResponseParseError';
  }
}

// --- HUMAN-LIKE PACING HELPERS ---
// Give speakers a believable "thinking" beat before they start typing, then
// reveal their message the way a person actually types: in short bursts with
// natural pauses (longer ones after sentence-ending punctuation), instead of
// a perfectly uniform character drip.
//
// Two paces:
// - 'normal' (기본모드): long, deliberately human delays for a realistic
//   "real chat" feel.
// - 'fast' (배속모드): minimal delays to speed through a debate.

// HTTP header values must be Latin-1 (ISO-8859-1) encodable per the Fetch
// spec. API keys copied from rich-text sources (chat apps, docs, PDFs) can
// carry invisible characters or smart quotes outside that range, which
// throws a raw, unreadable "non ISO-8859-1 code point" TypeError from
// fetch() itself before any request is even sent. Strip those out and trim
// whitespace before a key is ever placed in a header.
function sanitizeApiKey(key: string): string {
  return key.trim().replace(/[^\x20-\x7E]/g, '');
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

async function humanThinkingDelay(pace: ChatPaceMode, signal?: AbortSignal): Promise<void> {
  const [min, range] = pace === 'fast' ? [80, 160] : [1300, 2200];
  await sleep(min + Math.random() * range, signal);
}

const SENTENCE_PAUSE_CHARS = /[.!?~…,、。！？]/;

async function humanTypeReveal(
  fullText: string,
  onChunk: (text: string) => void,
  pace: ChatPaceMode,
  signal?: AbortSignal
): Promise<void> {
  let i = 0;
  while (i < fullText.length) {
    const step = pace === 'fast' ? 3 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 2);
    i = Math.min(i + step, fullText.length);
    onChunk(fullText.slice(0, i));

    const lastChar = fullText[i - 1] || '';
    const isPause = SENTENCE_PAUSE_CHARS.test(lastChar);
    const delay =
      pace === 'fast'
        ? isPause
          ? 40 + Math.random() * 60
          : 3 + Math.random() * 7
        : isPause
        ? 380 + Math.random() * 480
        : 55 + Math.random() * 65;
    await sleep(delay, signal);
  }
  onChunk(fullText);
}

// Well-known, always-available OpenRouter model used as a last-resort
// stand-in for a single turn when a panel's configured model keeps returning
// an empty completion (common with reasoning models that spend their whole
// token budget on hidden reasoning). Only ever swapped in for one call so a
// single misbehaving model doesn't pause the entire debate.
const EMPTY_RESPONSE_FALLBACK_MODEL = 'openai/gpt-4o-mini';
const MODEL_SWITCHABLE_PROVIDERS: DebateSettings['apiProvider'][] = ['openrouter', 'custom_openai', 'openai'];

function isEmptyResponseError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('빈 응답을 반환했습니다');
}

export async function callLLMProvider(
  options: LLMRequestOptions
): Promise<LLMResponseResult> {
  const startTime = Date.now();
  const effectiveApiKey = sanitizeApiKey(options.settings.apiKey);

  if (!effectiveApiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 기본 설정 탭에서 API 키를 입력해주세요.');
  }

  const originalModel = options.agentOverrideModel || options.settings.globalModel;
  const canSwitchModel =
    MODEL_SWITCHABLE_PROVIDERS.includes(options.settings.apiProvider) &&
    originalModel !== EMPTY_RESPONSE_FALLBACK_MODEL;

  let accumulatedTokensUsed = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const retrying = attempt > 0;
    // Last attempt: if the model keeps returning nothing, swap it out for a
    // known-good default rather than giving up on the whole turn.
    const switchModel = attempt === 2 && canSwitchModel;
    const requestOptions: LLMRequestOptions = retrying
      ? {
          ...options,
          agentOverrideModel: switchModel ? EMPTY_RESPONSE_FALLBACK_MODEL : options.agentOverrideModel,
          settings: {
            ...options.settings,
            maxResponseTokens: Math.max(options.settings.maxResponseTokens || 0, 1200),
          },
          userPrompt: `${options.userPrompt}\n\nRETRY: Return one complete JSON object only. Do not use markdown. Put the visible message field first and keep metadata concise.`,
        }
      : options;

    try {
      let rawResponseText = '';
      const provider = requestOptions.settings.apiProvider;

      if (provider === 'gemini') {
        rawResponseText = await callGeminiAPI(requestOptions);
      } else if (provider === 'anthropic') {
        rawResponseText = await callAnthropicAPI(requestOptions);
      } else if (provider === 'ollama') {
        rawResponseText = await callOllamaAPI(requestOptions);
      } else {
        rawResponseText = await callOpenAICompatibleAPI(requestOptions);
      }

      const latencyMs = Date.now() - startTime;
      accumulatedTokensUsed += Math.round(rawResponseText.length / 4);
      const parsed = parseLLMStructuredResponse(rawResponseText, accumulatedTokensUsed, latencyMs);
      return switchModel ? { ...parsed, usedFallbackModel: EMPTY_RESPONSE_FALLBACK_MODEL } : parsed;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      const retryable = error instanceof StructuredResponseParseError || isEmptyResponseError(error);
      if (retryable && attempt < 2) {
        options.onChunk('');
        continue;
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  throw new StructuredResponseParseError();
}

// --- API IMPLEMENTATIONS ---

async function callOpenAICompatibleAPI(options: LLMRequestOptions): Promise<string> {
  const { systemPrompt, userPrompt, settings, agentOverrideModel, onChunk } = options;
  const effectiveKey = sanitizeApiKey(settings.apiKey);

  let baseUrl = 'https://api.openai.com/v1/chat/completions';
  if (settings.apiProvider === 'openrouter') {
    baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  } else if (settings.apiProvider === 'custom_openai' && settings.customEndpointUrl) {
    baseUrl = settings.customEndpointUrl.replace(/\/$/, '') + '/chat/completions';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${effectiveKey}`,
  };

  if (settings.apiProvider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    headers['X-Title'] = 'Panelogue';
  }

  const modelName = agentOverrideModel || settings.globalModel || 'openai/gpt-4o-mini';

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: settings.maxResponseTokens || undefined,
      stream: true,
      ...(settings.apiProvider === 'openrouter'
        ? {
            response_format: { type: 'json_object' },
            // Reasoning models can burn their entire max_tokens budget on
            // hidden reasoning and never emit the visible answer. Cap the
            // reasoning budget so at least half of max_tokens stays
            // reserved for the actual completion.
            reasoning: { max_tokens: Math.max(400, Math.round((settings.maxResponseTokens || 1000) * 0.5)) },
          }
        : {}),
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || `API 오류 ${res.status}: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  // Some reasoning models (e.g. DeepSeek's reasoning tiers via OpenRouter)
  // stream their output entirely through delta.reasoning /
  // delta.reasoning_content and leave delta.content empty. Track it
  // separately so it can stand in for the visible message if content never
  // arrives, instead of surfacing a hard "empty response" failure.
  let reasoningText = '';
  // SSE lines can be split across separate reader.read() chunks at arbitrary
  // byte boundaries - buffer any trailing partial line instead of discarding it.
  let lineBuffer = '';
  let streamError = '';

  const consumeSseLine = (rawLine: string) => {
    const line = rawLine.trim();
    if (!line.startsWith('data: ') || line === 'data: [DONE]') return;
    try {
      const json = JSON.parse(line.slice(6));
      if (json.error) {
        streamError = json.error.message || 'OpenRouter 스트리밍 오류';
        return;
      }
      const delta = json.choices?.[0]?.delta;
      const content = delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(fullText);
      }
      const reasoning = delta?.reasoning || delta?.reasoning_content || '';
      if (reasoning) reasoningText += reasoning;
    } catch {
      // Ignore malformed non-data events; incomplete lines remain buffered.
    }
  };

  if (reader) {
    let done = false;
    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      if (value) {
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        lines.forEach(consumeSseLine);
      }
    }
  }

  lineBuffer += decoder.decode();
  if (lineBuffer.trim()) consumeSseLine(lineBuffer);
  if (streamError) throw new Error(streamError);

  if (!fullText.trim()) {
    if (reasoningText.trim()) {
      fullText = reasoningText.trim();
    } else {
      throw new Error('OpenRouter가 빈 응답을 반환했습니다. 모델 설정이나 사용 한도를 확인해주세요.');
    }
  }

  return fullText;
}

async function callGeminiAPI(options: LLMRequestOptions): Promise<string> {
  const { systemPrompt, userPrompt, settings, agentOverrideModel, onChunk } = options;
  const modelName = agentOverrideModel || settings.globalModel || 'gemini-2.5-flash';
  const effectiveKey = sanitizeApiKey(settings.apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(effectiveKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
      ],
      generationConfig: {
        temperature: 0.7,
        ...(settings.maxResponseTokens ? { maxOutputTokens: settings.maxResponseTokens } : {}),
      },
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Stream simulate locally for UX
  await humanThinkingDelay(settings.chatPaceMode, options.signal);
  await humanTypeReveal(fullText, onChunk, settings.chatPaceMode, options.signal);

  return fullText;
}

async function callAnthropicAPI(options: LLMRequestOptions): Promise<string> {
  const { systemPrompt, userPrompt, settings, agentOverrideModel, onChunk } = options;
  const modelName = agentOverrideModel || settings.globalModel || 'claude-3-5-sonnet-20241022';
  const effectiveKey = sanitizeApiKey(settings.apiKey);
  const url = 'https://api.anthropic.com/v1/messages';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': effectiveKey,
      'anthropic-version': '2023-06-01',
      // This is the real opt-in Anthropic requires for direct browser calls;
      // without it the browser's CORS preflight is rejected outright.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelName,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: settings.maxResponseTokens || 1000,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}`);
  }

  const data = await res.json();
  const fullText = data.content?.[0]?.text || '';

  await humanThinkingDelay(settings.chatPaceMode, options.signal);
  await humanTypeReveal(fullText, onChunk, settings.chatPaceMode, options.signal);

  return fullText;
}

async function callOllamaAPI(options: LLMRequestOptions): Promise<string> {
  const { systemPrompt, userPrompt, settings, agentOverrideModel, onChunk } = options;
  const url = (settings.customEndpointUrl || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
  const modelName = agentOverrideModel || settings.globalModel || 'llama3';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      ...(settings.maxResponseTokens ? { options: { num_predict: settings.maxResponseTokens } } : {}),
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    throw new Error(`Ollama error ${res.status}`);
  }

  const data = await res.json();
  const fullText = data.message?.content || '';

  await humanThinkingDelay(settings.chatPaceMode, options.signal);
  await humanTypeReveal(fullText, onChunk, settings.chatPaceMode, options.signal);

  return fullText;
}

// --- PARSER ---

export function parseLLMStructuredResponse(
  rawText: string,
  tokensUsed: number,
  latencyMs: number
): LLMResponseResult {
  // Extract JSON from potential codeblocks
  let cleanJsonText = rawText.trim();
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanJsonText = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(cleanJsonText);
    const message = typeof parsed.message === 'string'
      ? parsed.message.trim()
      : typeof parsed.public_message === 'string' ? parsed.public_message.trim() : '';
    if (!message) throw new Error('LLM response did not contain a message');
    const speechActs = ['claim', 'rebuttal', 'question', 'concession', 'clarification', 'moderation'];
    const stringArray = (value: unknown) => Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string').slice(0, 20)
      : [];
    const memoryCandidates = Array.isArray(parsed.memory_candidates)
      ? parsed.memory_candidates.flatMap((item: unknown) => {
          if (!item || typeof item !== 'object') return [];
          const candidate = item as Record<string, unknown>;
          if (typeof candidate.summary !== 'string' || !candidate.summary.trim()) return [];
          const importance = typeof candidate.importance === 'number' ? candidate.importance : 0.5;
          return [{ summary: candidate.summary.trim(), importance: Math.max(0, Math.min(1, importance)) }];
        }).slice(0, 10)
      : [];
    const reflectionRaw = parsed.reflection && typeof parsed.reflection === 'object'
      ? parsed.reflection as Record<string, unknown>
      : undefined;
    const reflectionField = (key: string) => {
      const value = reflectionRaw?.[key];
      return typeof value === 'string' ? value.trim() : '';
    };
    const reflection = reflectionRaw
      ? {
          currentPosition: reflectionField('current_position'),
          strongestOpposingArgument: reflectionField('strongest_opposing_argument'),
          unresolvedQuestion: reflectionField('unresolved_question'),
          nextStrategy: reflectionField('next_strategy'),
        }
      : undefined;
    return {
      message,
      stance: typeof parsed.stance === 'number' ? Math.max(-100, Math.min(100, Math.round(parsed.stance))) : undefined,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.confidence))) : undefined,
      replyToId: typeof parsed.reply_to === 'string' ? parsed.reply_to : undefined,
      speechAct: speechActs.includes(parsed.speech_act) ? parsed.speech_act : undefined,
      targetAgentIds: stringArray(parsed.target_agents),
      claimsCreated: stringArray(parsed.claims_created),
      claimsAttacked: stringArray(parsed.claims_attacked),
      memoryCandidates,
      action: typeof parsed.action === 'string' ? parsed.action : undefined,
      nextSpeakerId: typeof parsed.next_speaker_id === 'string' ? parsed.next_speaker_id : undefined,
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale.trim() : undefined,
      evidence: stringArray(parsed.evidence),
      stanceReason: typeof parsed.stance_reason === 'string' ? parsed.stance_reason.trim() : undefined,
      reflection: reflection && Object.values(reflection).some(Boolean) ? reflection : undefined,
      tokensUsed,
      latencyMs,
    };
  } catch {
    // Models can hit the token limit after completing the visible `message`
    // but before closing later metadata fields. Recover that field instead of
    // leaking raw JSON syntax into the chat bubble.
    const partialMessage = extractJsonStringField(rawText, 'message', true) ||
      extractJsonStringField(rawText, 'public_message', true);
    if (partialMessage) {
      const partialStance = extractJsonNumberField(rawText, 'stance');
      const partialConfidence = extractJsonNumberField(rawText, 'confidence');
      return {
        message: partialMessage,
        stance: partialStance === undefined ? undefined : Math.max(-100, Math.min(100, Math.round(partialStance))),
        confidence: partialConfidence === undefined ? undefined : Math.max(0, Math.min(100, Math.round(partialConfidence))),
        replyToId: extractJsonStringField(rawText, 'reply_to'),
        speechAct: normalizeSpeechAct(extractJsonStringField(rawText, 'speech_act')),
        rationale: extractJsonStringField(rawText, 'rationale'),
        stanceReason: extractJsonStringField(rawText, 'stance_reason'),
        tokensUsed,
        latencyMs,
      };
    }

    // Plain-text responses remain usable. JSON-looking failures are retried
    // by callLLMProvider instead of being inserted into the public chat.
    const plainText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    if (/^[\s{[]/.test(plainText) || !plainText) throw new StructuredResponseParseError();
    return { message: plainText, tokensUsed, latencyMs };
  }
}

function extractJsonStringField(rawText: string, field: string, allowTruncated = false): string | undefined {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rawText.match(new RegExp(`"${escapedField}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`));
  if (!match) {
    if (!allowTruncated) return undefined;
    const opening = new RegExp(`"${escapedField}"\\s*:\\s*"`).exec(rawText);
    if (!opening) return undefined;
    const remainder = rawText.slice(opening.index + opening[0].length);
    let escaped = false;
    let partial = '';
    for (const char of remainder) {
      if (!escaped && char === '"') break;
      partial += char;
      if (char === '\\' && !escaped) escaped = true;
      else escaped = false;
    }
    // Drop a dangling escape introduced by token truncation, then decode the
    // common JSON escapes without requiring the enclosing object to be valid.
    if (partial.endsWith('\\')) partial = partial.slice(0, -1);
    try {
      return JSON.parse(`"${partial}"`).trim() || undefined;
    } catch {
      return partial
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim() || undefined;
    }
  }
  try {
    return JSON.parse(`"${match[1]}"`).trim() || undefined;
  } catch {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() || undefined;
  }
}

function extractJsonNumberField(rawText: string, field: string): number | undefined {
  const match = rawText.match(new RegExp(`"${field}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function normalizeSpeechAct(value?: string): LLMResponseResult['speechAct'] {
  const allowed: NonNullable<LLMResponseResult['speechAct']>[] = [
    'claim', 'rebuttal', 'question', 'concession', 'clarification', 'moderation',
  ];
  return allowed.includes(value as NonNullable<LLMResponseResult['speechAct']>)
    ? value as NonNullable<LLMResponseResult['speechAct']>
    : undefined;
}
