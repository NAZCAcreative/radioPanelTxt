// DEBATE LAB - LLM Provider Service with Streaming & High-Fidelity Simulation Fallback

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

export async function callLLMProvider(
  options: LLMRequestOptions
): Promise<LLMResponseResult> {
  const startTime = Date.now();
  const provider = options.settings.apiProvider;
  const effectiveApiKey = sanitizeApiKey(options.settings.apiKey);

  if (!effectiveApiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 기본 설정 탭에서 API 키를 입력해주세요.');
  }

  try {
    let rawResponseText = '';

    if (provider === 'gemini') {
      rawResponseText = await callGeminiAPI(options);
    } else if (provider === 'anthropic') {
      rawResponseText = await callAnthropicAPI(options);
    } else if (provider === 'ollama') {
      rawResponseText = await callOllamaAPI(options);
    } else {
      // OpenAI / OpenRouter / Custom OpenAI-compatible
      rawResponseText = await callOpenAICompatibleAPI(options);
    }

    const latencyMs = Date.now() - startTime;
    const tokensUsed = Math.round(rawResponseText.length / 4);

    return parseLLMStructuredResponse(rawResponseText, tokensUsed, latencyMs);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    // Surface the failure so the engine can pause and let the user retry.
    throw error instanceof Error ? error : new Error(String(error));
  }
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
    headers['X-Title'] = 'Debate Lab Multi-Agent Simulator';
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
      const content = json.choices?.[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(fullText);
      }
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
    throw new Error('OpenRouter가 빈 응답을 반환했습니다. 모델 설정이나 사용 한도를 확인해주세요.');
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
      tokensUsed,
      latencyMs,
    };
  } catch {
    // Models can hit the token limit after completing the visible `message`
    // but before closing later metadata fields. Recover that field instead of
    // leaking raw JSON syntax into the chat bubble.
    const partialMessage = extractJsonStringField(rawText, 'message') ||
      extractJsonStringField(rawText, 'public_message');
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

    // Plain-text responses remain usable, but JSON-looking failures are
    // replaced with a readable error rather than displayed verbatim.
    const plainText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    return {
      message: /^[\s{[]/.test(plainText)
        ? '응답 형식이 완성되지 않아 발언 내용을 표시하지 못했습니다. 이 턴을 다시 시도해주세요.'
        : plainText,
      tokensUsed,
      latencyMs,
    };
  }
}

function extractJsonStringField(rawText: string, field: string): string | undefined {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = rawText.match(new RegExp(`"${escapedField}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`));
  if (!match) return undefined;
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
