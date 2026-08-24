// PANELOGUE - Code-Driven Debate Runtime Engine

import { callLLMProvider } from '../services/llmService';
import type {
  Agent,
  ArgumentClaim,
  AudienceQuestion,
  ConsensusSnapshot,
  DebatePhase,
  DebateSessionState,
  DebateSettings,
  ImportantMemory,
  Message,
  Moderator,
} from '../types/debate';
import { getCharacterStyle, getFunDebateMode } from '../utils/funModes';
import { NATURAL_KOREAN_STYLE_RULES } from '../utils/naturalKoreanRules';

// Varied "thinking" indicator phrases so the live typing card doesn't feel
// robotic/repetitive - picked once per turn and held stable in session state.
const AGENT_THINKING_PHRASES = [
  (name: string) => `${name}님이 생각을 정리하고 있어요`,
  (name: string) => `${name}님이 다음 말을 고민하고 있어요`,
  (name: string) => `${name}님이 반박거리를 찾고 있어요`,
  (name: string) => `${name}님이 입력 중`,
  (name: string) => `${name}님이 답변을 작성하고 있습니다`,
];

const MODERATOR_THINKING_PHRASES = [
  (name: string) => `${name}님이 다음 발언자를 고르고 있어요`,
  (name: string) => `${name}님이 논점을 정리하고 있어요`,
  (name: string) => `${name}님이 진행 멘트를 준비하고 있어요`,
  (name: string) => `${name}님이 입력 중`,
];

function pickThinkingLabel(name: string, isModerator: boolean): string {
  const pool = isModerator ? MODERATOR_THINKING_PHRASES : AGENT_THINKING_PHRASES;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick(name);
}

// Real providers are instructed to respond with structured JSON
// (e.g. {"message": "...", "stance": ...}), and the live "typing" preview
// receives that raw JSON as it streams in. Rather than flash the raw
// braces/quotes at the viewer, pull out just the "message" field's value
// (even from a still-incomplete string) so the live preview always reads
// like the chat bubble it will become.
function extractLiveMessagePreview(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const keyIdx = trimmed.indexOf('"message"');
  if (keyIdx === -1) {
    // Doesn't look like JSON yet (or isn't JSON at all, e.g. a provider
    // that streams plain text) - show it as-is unless it's clearly the
    // start of a JSON object/code fence still being written out.
    return /^```|^\{/.test(trimmed) ? '' : trimmed;
  }

  const afterKey = trimmed.slice(keyIdx + '"message"'.length);
  const colonIdx = afterKey.indexOf(':');
  if (colonIdx === -1) return '';

  let rest = afterKey.slice(colonIdx + 1).trimStart();
  if (!rest.startsWith('"')) return '';
  rest = rest.slice(1);

  let end = -1;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '"' && rest[i - 1] !== '\\') {
      end = i;
      break;
    }
  }
  const value = end !== -1 ? rest.slice(0, end) : rest;
  return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export class DebateEngine {
  private settings: DebateSettings;
  private state: DebateSessionState;
  private updateStateCallback: (updater: (prev: DebateSessionState) => DebateSessionState) => void;
  private isProcessingTurn: boolean = false;
  private activeRequest: AbortController | null = null;
  private moderatorSelectedSpeakerId: string | null = null;

  constructor(
    settings: DebateSettings,
    state: DebateSessionState,
    updateStateCallback: (updater: (prev: DebateSessionState) => DebateSessionState) => void
  ) {
    this.settings = settings;
    this.state = state;
    this.updateStateCallback = updateStateCallback;
  }

  public setSettings(settings: DebateSettings) {
    this.settings = settings;
  }

  public setState(state: DebateSessionState) {
    this.state = state;
  }

  public cancelPendingTurn() {
    this.activeRequest?.abort();
    this.activeRequest = null;
  }

  // --- MAIN SIMULATION STEP LOOP ---
  public async executeNextStep(): Promise<boolean> {
    if (this.isProcessingTurn || this.state.status === 'idle' || this.state.status === 'completed') {
      return false;
    }

    // Check Termination Conditions
    if (this.checkTermination()) {
      this.updateState((s) => ({ ...s, status: 'completed', phase: 'Completed' }));
      return false;
    }

    this.isProcessingTurn = true;
    this.activeRequest = new AbortController();

    try {
      const currentTurn = this.state.currentTurn + 1;

      // 1. Check Phase Transition
      const currentPhase = this.determinePhase(currentTurn);
      this.updateState((s) => ({ ...s, phase: currentPhase, currentTurn, lastErrorMessage: null }));

      // 2. Evaluate Speaker Selection
      const { selectedSpeaker, isModerator, speakPriorityScores } = this.selectNextSpeaker();

      // 3. Process Audience Question Injection if pending & high priority
      const pendingAudienceQ = this.getPendingAudienceQuestion();
      const noModerator = this.settings.noModeratorMode;

      if (!noModerator && (isModerator || (pendingAudienceQ && pendingAudienceQ.priority === 'IMMEDIATE'))) {
        await this.handleModeratorTurn(currentTurn, pendingAudienceQ);
      } else if (selectedSpeaker) {
        await this.handleAgentTurn(
          selectedSpeaker,
          currentTurn,
          speakPriorityScores[selectedSpeaker.id] || 50,
          noModerator ? pendingAudienceQ : undefined,
        );
      }

      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return false;
      console.error('Error executing debate step:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.updateState((s) => ({
        ...s,
        status: 'paused',
        activeThinkingAgentId: null,
        activeThinkingText: '',
        activeThinkingLabel: '',
        lastErrorMessage: errorMessage,
      }));
      return false;
    } finally {
      this.isProcessingTurn = false;
      this.activeRequest = null;
    }
  }

  // --- TERMINATION CHECK ---
  private checkTermination(): boolean {
    if (this.state.currentTurn >= this.settings.maxTurns) return true;
    if (this.state.totalTokensUsed >= this.settings.maxTotalTokens) return true;
    if (this.state.estimatedCostUsd >= this.settings.maxCostLimitUsd) return true;
    return false;
  }

  // --- PHASE MANAGEMENT ---
  private determinePhase(turn: number): DebatePhase {
    if (turn <= this.settings.agents.length) return 'Opening';
    if (turn <= Math.floor(this.settings.maxTurns * 0.4)) return 'Exploration';
    if (turn <= Math.floor(this.settings.maxTurns * 0.75)) return 'Challenge';
    if (turn < this.settings.maxTurns) return 'Reflection';
    return 'FinalPosition';
  }

  // --- SPEAK PRIORITY CALCULATION (Section 28) ---
  private selectNextSpeaker(): {
    selectedSpeaker: Agent | null;
    isModerator: boolean;
    speakPriorityScores: Record<string, number>;
  } {
    const { agents, turnMode, preventSpeakerDominance, protectMinorityOpinion } = this.settings;
    const noModerator = this.settings.noModeratorMode;
    const { messages } = this.state;
    const scores: Record<string, number> = {};
    const stanceValues = agents.map((agent) => this.state.currentStances[agent.id] ?? agent.currentStance);
    const averageStance = stanceValues.length
      ? stanceValues.reduce((sum, stance) => sum + stance, 0) / stanceValues.length
      : 0;

    if (!noModerator && this.moderatorSelectedSpeakerId) {
      const selected = agents.find((agent) => agent.id === this.moderatorSelectedSpeakerId);
      this.moderatorSelectedSpeakerId = null;
      if (selected) return { selectedSpeaker: selected, isModerator: false, speakPriorityScores: { [selected.id]: 100 } };
    }

    // In Opening phase, ensure each agent speaks once in order
    if (this.state.phase === 'Opening') {
      if (noModerator) {
        const speaker = agents[this.state.currentTurn % agents.length];
        return { selectedSpeaker: speaker, isModerator: false, speakPriorityScores: { [speaker.id]: 100 } };
      }
      const turnIdx = this.state.currentTurn % (agents.length + 1);
      if (turnIdx === 0) {
        return { selectedSpeaker: null, isModerator: true, speakPriorityScores: {} };
      }
      const speaker = agents[turnIdx - 1];
      return { selectedSpeaker: speaker, isModerator: false, speakPriorityScores: { [speaker.id]: 100 } };
    }

    // Moderator Control / Round Robin Modes
    if (turnMode === 'round_robin') {
      const idx = (this.state.currentTurn - 1) % agents.length;
      return { selectedSpeaker: agents[idx], isModerator: false, speakPriorityScores: {} };
    }

    if (turnMode === 'moderator_controlled' && !noModerator) {
      return { selectedSpeaker: null, isModerator: true, speakPriorityScores: {} };
    }

    // Dynamic Speak Priority Formula calculation
    const recentMessages = messages.slice(-6);

    agents.forEach((agent) => {
      let priority = 50; // base

      // Expertise Relevance
      const hasExpertiseMatch = agent.expertise.some((exp) =>
        this.settings.topic.toLowerCase().includes(exp.toLowerCase())
      );
      if (hasExpertiseMatch) priority += 15;

      // Was Challenged / Replied to recently
      const lastMsg = recentMessages[recentMessages.length - 1];
      if (lastMsg && lastMsg.metadata?.targetAgentIds?.includes(agent.id)) {
        priority += 25;
      }

      // Assertiveness & Desire to speak
      priority += (agent.personality.assertiveness - 50) * 0.2;

      if (protectMinorityOpinion) {
        const stance = this.state.currentStances[agent.id] ?? agent.currentStance;
        const isMinority = (averageStance > 15 && stance < -15) || (averageStance < -15 && stance > 15);
        if (isMinority) priority += 20;
      }

      // Anti-Dominance Penalty (Section 36)
      if (preventSpeakerDominance) {
        const agentRecentCount = recentMessages.filter((m) => m.speakerId === agent.id).length;
        if (agentRecentCount >= 2) {
          priority -= 35; // Heavy penalty for speaking twice in last 6 turns
        }
      }

      scores[agent.id] = Math.max(0, Math.min(100, Math.round(priority)));
    });

    // Check if Moderator should intervene (Intervention frequency & anti-echo)
    const modInterventionThreshold = 100 - this.settings.moderator.interventionFrequency;
    const turnsSinceLastMod = messages.length - 1 - messages.findLastIndex((m) => m.isModerator);

    const shouldModeratorIntervene =
      turnsSinceLastMod >= 4 || Math.random() * 100 > modInterventionThreshold;

    if (!noModerator && shouldModeratorIntervene && turnMode !== 'free_debate') {
      return { selectedSpeaker: null, isModerator: true, speakPriorityScores: scores };
    }

    // Pick agent with highest score
    let bestAgent = agents[0];
    let maxScore = -1;

    agents.forEach((a) => {
      if ((scores[a.id] || 0) > maxScore) {
        maxScore = scores[a.id] || 0;
        bestAgent = a;
      }
    });

    return { selectedSpeaker: bestAgent, isModerator: false, speakPriorityScores: scores };
  }

  // --- MODERATOR TURN HANDLER ---
  private async handleModeratorTurn(turn: number, audienceQuestion?: AudienceQuestion) {
    const mod = this.settings.moderator;

    this.updateState((s) => ({
      ...s,
      activeThinkingAgentId: mod.id,
      activeThinkingText: '',
      activeThinkingLabel: pickThinkingLabel(mod.name, true),
    }));

    const systemPrompt = this.buildModeratorSystemPrompt(mod);
    const userPrompt = this.buildModeratorUserPrompt(turn, audienceQuestion);
    const signal = this.activeRequest?.signal;
    if (!signal) return;

    const response = await callLLMProvider({
      systemPrompt,
      userPrompt,
      settings: this.settings,
      agentOverrideModel: mod.customModel,
      onChunk: (text) => {
        if (signal.aborted) return;
        this.updateState((s) => ({ ...s, activeThinkingText: extractLiveMessagePreview(text) }));
      },
      signal,
    });

    if (signal.aborted) return;

    const selectedSpeaker = this.resolveModeratorSpeaker(response.nextSpeakerId);
    if (selectedSpeaker) this.moderatorSelectedSpeakerId = selectedSpeaker.id;

    const newMsg: Message = {
      id: `msg_mod_${Date.now()}`,
      speakerId: mod.id,
      speakerName: mod.name,
      speakerRole: mod.role,
      avatarColor: '#64748b', // Slate
      isModerator: true,
      text: response.message,
      timestamp: this.getFormattedTime(),
      turn,
      metadata: {
        speechAct: 'moderation',
        tokensUsed: response.tokensUsed,
        latencyMs: response.latencyMs,
        rationale: response.rationale,
        evidence: response.evidence,
        selectedSpeakerId: selectedSpeaker?.id,
      },
    };

    if (audienceQuestion) {
      this.markAudienceQuestionAddressed(audienceQuestion.id);
    }

    this.updateState((s) => ({
      ...s,
      messages: [...s.messages, newMsg],
      activeThinkingAgentId: null,
      activeThinkingText: '',
      activeThinkingLabel: '',
      totalTokensUsed: s.totalTokensUsed + (response.tokensUsed || 0),
      estimatedCostUsd: s.estimatedCostUsd + (response.tokensUsed || 0) * 0.000002,
      decisionLogs: [...s.decisionLogs, {
        id: `log_mod_${turn}`,
        turn,
        actorId: mod.id,
        actorName: mod.name,
        category: selectedSpeaker ? 'speaker_selection' : 'moderation',
        summary: selectedSpeaker ? `${selectedSpeaker.name} 패널을 다음 발언자로 지정` : '토론 진행 및 논점 정리',
        rationale: response.rationale || (selectedSpeaker ? '발언 균형과 토론 흐름을 기준으로 자동 보정' : undefined),
        evidence: response.evidence || [],
        selectedSpeakerId: selectedSpeaker?.id,
        timestamp: Date.now(),
      }, ...(response.usedFallbackModel ? [{
        id: `log_fallback_mod_${turn}`,
        turn,
        actorId: mod.id,
        actorName: mod.name,
        category: 'model_fallback' as const,
        summary: `설정된 모델이 빈 응답을 반복해 이번 턴만 ${response.usedFallbackModel}로 대체되었습니다.`,
        evidence: [],
        timestamp: Date.now(),
      }] : []),
      ],
    }));
  }

  // --- AGENT TURN HANDLER ---
  private async handleAgentTurn(agent: Agent, turn: number, priorityScore: number, audienceQuestion?: AudienceQuestion) {
    this.updateState((s) => ({
      ...s,
      activeThinkingAgentId: agent.id,
      activeThinkingText: '',
      activeThinkingLabel: pickThinkingLabel(agent.name, false),
    }));

    const systemPrompt = this.buildAgentSystemPrompt(agent);
    const userPrompt = this.buildAgentUserPrompt(agent, turn, audienceQuestion);
    const signal = this.activeRequest?.signal;
    if (!signal) return;

    const response = await callLLMProvider({
      systemPrompt,
      userPrompt,
      settings: this.settings,
      agentOverrideModel: agent.customModel,
      onChunk: (text) => {
        if (signal.aborted) return;
        this.updateState((s) => ({ ...s, activeThinkingText: extractLiveMessagePreview(text) }));
      },
      signal,
    });

    if (signal.aborted) return;

    if (audienceQuestion) this.markAudienceQuestionAddressed(audienceQuestion.id);

    // Update stance if provided
    const priorStance = this.state.currentStances[agent.id] ?? agent.currentStance;
    const newStance = response.stance !== undefined ? response.stance : priorStance;

    const newMsg: Message = {
      id: `msg_${agent.id}_${Date.now()}`,
      speakerId: agent.id,
      speakerName: agent.name,
      speakerRole: agent.job,
      avatarColor: agent.avatarColor,
      text: response.message,
      timestamp: this.getFormattedTime(),
      turn,
      metadata: {
        stance: newStance,
        confidence: response.confidence || 80,
        replyToId: response.replyToId,
        referencedClaimId: response.referencedClaimId,
        speechAct: response.speechAct || 'claim',
        targetAgentIds: response.targetAgentIds,
        agentId: agent.id,
        turn,
        speakPriorityScore: priorityScore,
        tokensUsed: response.tokensUsed,
        latencyMs: response.latencyMs,
        rationale: response.rationale,
        evidence: response.evidence,
        stanceReason: response.stanceReason,
      },
    };

    // Process Memory & Claims Candidates
    this.processStructuredOutput(agent, response, turn);

    this.updateState((s) => {
      const updatedStances = { ...s.currentStances, [agent.id]: newStance };
      const stanceChanged = newStance !== priorStance;
      const stanceHistory = stanceChanged ? [...s.stanceHistory, {
        agentId: agent.id,
        agentName: agent.name,
        turn,
        previousStance: priorStance,
        newStance,
        reason: response.stanceReason || response.rationale || '응답에서 입장 값이 변경됨',
        influencedByMessageIds: response.replyToId ? [response.replyToId] : [],
      }] : s.stanceHistory;
      const consensus = this.calculateConsensus(updatedStances, turn, s.claims);
      return {
      ...s,
      messages: [...s.messages, newMsg],
      activeThinkingAgentId: null,
      activeThinkingText: '',
      activeThinkingLabel: '',
      currentStances: updatedStances,
      totalTokensUsed: s.totalTokensUsed + (response.tokensUsed || 0),
      estimatedCostUsd: s.estimatedCostUsd + (response.tokensUsed || 0) * 0.000002,
      stanceHistory,
      consensusSnapshots: [...s.consensusSnapshots, consensus],
      decisionLogs: [...s.decisionLogs, {
        id: `log_agent_${agent.id}_${turn}`,
        turn,
        actorId: agent.id,
        actorName: agent.name,
        category: stanceChanged ? 'stance_change' : 'argument',
        summary: response.stanceReason || `${response.speechAct || 'claim'} 발언`,
        rationale: response.rationale,
        evidence: response.evidence || [],
        timestamp: Date.now(),
      }, {
        id: `log_consensus_${turn}`,
        turn,
        actorId: 'system',
        actorName: '합의 판정 엔진',
        category: 'consensus',
        summary: consensus.label,
        rationale: `찬성 ${consensus.proCount}, 중립 ${consensus.neutralCount}, 반대 ${consensus.conCount}; 일치율 ${Math.round(consensus.agreementRatio * 100)}%`,
        evidence: consensus.unresolvedClaims,
        timestamp: Date.now(),
      }, ...(response.usedFallbackModel ? [{
        id: `log_fallback_${agent.id}_${turn}`,
        turn,
        actorId: agent.id,
        actorName: agent.name,
        category: 'model_fallback' as const,
        summary: `설정된 모델이 빈 응답을 반복해 이번 턴만 ${response.usedFallbackModel}로 대체되었습니다.`,
        evidence: [],
        timestamp: Date.now(),
      }] : []),
      ],
    }});
  }

  private resolveModeratorSpeaker(requestedId?: string): Agent | undefined {
    const requested = requestedId && this.settings.agents.find((agent) => agent.id === requestedId);
    if (requested) return requested;
    const recent = this.state.messages.slice(-8);
    return [...this.settings.agents].sort((a, b) =>
      recent.filter((m) => m.speakerId === a.id).length - recent.filter((m) => m.speakerId === b.id).length
    )[0];
  }

  private calculateConsensus(stances: Record<string, number>, turn: number, claims: ArgumentClaim[]): ConsensusSnapshot {
    const values = this.settings.agents.map((agent) => stances[agent.id] ?? agent.initialStance);
    const proCount = values.filter((value) => value > 15).length;
    const conCount = values.filter((value) => value < -15).length;
    const neutralCount = values.length - proCount - conCount;
    const largestGroup = Math.max(proCount, conCount, neutralCount);
    const agreementRatio = values.length ? largestGroup / values.length : 0;
    const reached = this.settings.consensusMode === 'unanimous' ? agreementRatio === 1
      : this.settings.consensusMode === 'supermajority' ? agreementRatio >= 2 / 3
      : this.settings.consensusMode === 'majority' ? agreementRatio > 0.5
      : this.settings.consensusMode === 'moderator_judgment' ? agreementRatio >= 0.6
      : false;
    return {
      turn,
      mode: this.settings.consensusMode,
      reached,
      label: this.settings.consensusMode === 'none' ? '합의 판정 비활성화' : reached ? '설정된 합의 기준 달성' : '합의 기준 미달성',
      proCount,
      neutralCount,
      conCount,
      agreementRatio,
      unresolvedClaims: claims.filter((claim) => claim.status === 'unresolved' || claim.status === 'contested').map((claim) => claim.claimText).slice(0, 5),
      issues: claims.slice(-20).map((claim) => ({
        claimId: claim.claimId,
        text: claim.claimText,
        status: claim.status,
        resolved: claim.status === 'supported' || claim.status === 'conceded' || claim.status === 'strengthened',
      })),
    };
  }

  // --- PROMPT BUILDERS ---
  private buildModeratorSystemPrompt(mod: Moderator): string {
    const funMode = getFunDebateMode(this.settings.funDebateModeId);
    const enabledBehaviors = Object.entries(mod.behaviors)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(', ');
    return `
YOU ARE THE DEBATE MODERATOR: ${mod.name} (${mod.role}).
PERSONA: ${mod.persona}
NEUTRALITY: ${mod.neutrality}% Neutral (0 = take an active viewpoint, 100 = fully neutral facilitator).
INTERVENTION FREQUENCY: ${this.settings.moderator.interventionFrequency}%
CHALLENGE INTENSITY: ${this.settings.challengeMode}/100
ENABLED ACTIONS: ${enabledBehaviors || 'basic facilitation only'}
CONSENSUS POLICY: ${this.settings.consensusMode}
SHOW MODE: ${funMode.name}. ${funMode.prompt}

YOUR RESPONSIBILITIES:
1. Orchestrate and direct the debate between participants.
2. Ask probing questions, demand evidence for unsupported claims, and prevent off-topic rambling.
3. ${this.settings.protectMinorityOpinion ? 'Protect minority viewpoints' : 'Facilitate viewpoints neutrally'} and prevent speaker dominance.
4. Keep responses concise (2-3 sentences max).
5. Choose the next panel when useful. Output JSON with public_message, action, next_speaker_id, rationale, and evidence.
6. rationale must be a concise, user-visible decision basis, not hidden chain-of-thought. evidence is a list of claims or message IDs used.
7. Your tone is not fixed to polite and gentle by default - match CHALLENGE INTENSITY and NEUTRALITY above. At high challenge/low neutrality, interrupt more, press evasive answers hard, and openly call out weak logic; at low challenge/high neutrality, stay measured and even-handed. Let the room's actual mood set your tone, not a generic host persona.
8. ${NATURAL_KOREAN_STYLE_RULES}
    `.trim();
  }

  private buildModeratorUserPrompt(turn: number, audienceQuestion?: AudienceQuestion): string {
    const recent = this.state.messages.slice(-6).map((m) => `${m.speakerName}: "${m.text}"`).join('\n');
    let audienceStr = '';
    if (audienceQuestion) {
      audienceStr = `\nAUDIENCE QUESTION RECEIVED: "${audienceQuestion.userText}" (Target: ${audienceQuestion.targetType})`;
    }
    const background = this.settings.backgroundContext &&
      (this.settings.contextVisibility === 'all' || this.settings.contextVisibility === 'moderator_only')
      ? `\nBACKGROUND CONTEXT:\n${this.settings.backgroundContext}`
      : '';

    return `
TOPIC: "${this.settings.topic}"${background}
DEBATE GOAL: ${this.settings.discussionGoal}
PHASE: ${this.state.phase} (Turn ${turn}/${this.settings.maxTurns})

RECENT CONTEXT:
${recent}${audienceStr}

Please provide your moderation response.
Return JSON: {"public_message":"...","action":"SELECT_SPEAKER|ASK_QUESTION|REQUEST_EVIDENCE|SUMMARIZE","next_speaker_id":"valid agent id or empty","rationale":"concise public reason","evidence":["message id or factual basis"]}.
Valid agents: ${this.settings.agents.map((agent) => `${agent.id}=${agent.name}`).join(', ')}
    `.trim();
  }

  private buildAgentSystemPrompt(agent: Agent): string {
    const { coreValues } = agent;
    const funMode = getFunDebateMode(this.settings.funDebateModeId);
    const characterStyle = getCharacterStyle(agent.chatCharacterStyle);

    return `
YOU ARE: ${agent.name}
JOB: ${agent.job}
EXPERTISE: ${agent.expertise.join(', ')}
ROLE IN DEBATE: ${agent.roleInDebate}

PERSONA:
${agent.personaMode === 'SIMPLE' ? agent.simplePersona : `Core Values: Progressive(${coreValues.progressiveVsConservative}), Fairness(${coreValues.efficiencyVsFairness}), TechOptimism(${coreValues.techOptimismVsSkepticism}).`}
SPEAKING STYLE: ${agent.speakingStyle}
CHARACTER CHAT STYLE: ${characterStyle.name}. ${characterStyle.prompt}
SHOW MODE & RELATIONSHIP: ${funMode.name}. ${funMode.prompt}
MODERATION: ${this.settings.noModeratorMode ? 'No moderator exists. Address other panelists directly and keep the conversation moving without host cues.' : 'A moderator is present.'}

STRICT BEHAVIORAL RULES:
1. Stay true to your persona and core values.
2. Anti-Sycophancy: Do NOT agree unconditionally just because others or the host said so. Hold your ground unless compelling evidence is provided.
3. Do NOT make useless empty agreements ("저도 동의합니다"). Bring new evidence, counter-examples, or sharp questions.
4. Response Length Limit: Maximum ${Math.min(agent.maxSentenceCount, this.settings.maxSentenceCount)} sentences. Keep it punchy like a real KakaoTalk/Discord chat.
5. Express uncertainty cautiously if epistemic style is cautious.
6. Evidence policy is ${this.settings.evidenceMode}; never fabricate citations or present uncertain claims as verified facts.
7. Challenge intensity is ${this.settings.challengeMode}/100 and perspective diversity pressure is ${this.settings.diversityPressure}/100.
8. ${this.settings.antiSycophancyGlobal ? 'Independently evaluate every claim.' : 'You may converge when the discussion supports it.'}
9. ${this.settings.perspectivePreservationGlobal ? 'Preserve your distinct expert perspective unless strong evidence changes it.' : 'Natural convergence is allowed.'}
10. ${NATURAL_KOREAN_STYLE_RULES}
11. Return your response as JSON in the format:
{
  "message": "Visible chat message text in Korean",
  "stance": -100 to +100 stance integer,
  "confidence": 0 to 100,
  "reply_to": "msg_id if replying directly",
  "speech_act": "claim" | "rebuttal" | "question" | "concession",
  "rationale": "concise public basis for this response, not private chain-of-thought",
  "evidence": ["message id, fact, or source used"],
  "stance_reason": "why the stance changed or stayed stable",
  "claims_created": ["stable claim id"],
  "claims_attacked": ["claim id being challenged"],
  "memory_candidates": [{"summary":"important reusable point","importance":0.0 to 1.0}],
  "reflection": {"current_position":"...","strongest_opposing_argument":"...","unresolved_question":"...","next_strategy":"..."}
}
Only include "reflection" on a REFLECTION TURN (see below); omit it entirely otherwise.
    `.trim();
  }

  private buildAgentUserPrompt(agent: Agent, turn: number, audienceQuestion?: AudienceQuestion): string {
    const recentTurnsCount = this.settings.recentWorkingMemoryTurns;
    const recent = this.state.messages
      .slice(-recentTurnsCount)
      .map((m) => `[${m.id}] ${m.speakerName}: "${m.text}"`)
      .join('\n');

    let backgroundContextStr = '';
    if (
      this.settings.backgroundContext &&
      (this.settings.contextVisibility === 'all' ||
        (this.settings.contextVisibility === 'selected' &&
          (this.settings.selectedContextAgentIds ?? []).includes(agent.id)))
    ) {
      backgroundContextStr = `\nBACKGROUND CONTEXT:\n${this.settings.backgroundContext}\n`;
    }

    const currentStance = this.state.currentStances[agent.id] ?? agent.currentStance;
    const memories = this.settings.memoryMode === 'OFF'
      ? ''
      : this.state.memories
          .slice(-Math.max(1, this.settings.recentWorkingMemoryTurns))
          .map((m) => `[${m.type}/${m.reliabilityStatus}] ${m.speakerName}: ${m.summary}`)
          .join('\n');
    const facts = this.settings.factPreservation
      ? this.state.factLedger.map((f) => `[${f.status}] ${f.factText}${f.source ? ` (${f.source})` : ''}`).join('\n')
      : '';
    const reflectionInstruction = this.settings.reflectionIntervalTurns > 0 && turn % this.settings.reflectionIntervalTurns === 0
      ? 'REFLECTION TURN: Before responding, fill the "reflection" field with your current_position, the strongest_opposing_argument you have heard so far, one unresolved_question, and your next_strategy.'
      : '';
    const audienceInstruction = audienceQuestion
      ? `AUDIENCE MESSAGE: "${audienceQuestion.userText}". Address it directly as a panelist without handing it to a moderator.`
      : '';

    return `
TOPIC: "${this.settings.topic}"${backgroundContextStr}
YOUR CURRENT STANCE: ${currentStance} (-100 Con to +100 Pro)
PHASE: ${this.state.phase} (Turn ${turn}/${this.settings.maxTurns})

RECENT MESSAGES:
${recent}

RELEVANT MEMORIES:
${memories || '(none)'}

FACT LEDGER:
${facts || '(disabled or empty)'}

DEBATE POLICY: evidence=${this.settings.evidenceMode}, consensus=${this.settings.consensusMode}, challenge=${this.settings.challengeMode}/100, diversity=${this.settings.diversityPressure}/100.
Do not invent sources. Clearly label uncertain factual claims.${this.settings.antiEchoMode ? ' Add new information instead of empty agreement.' : ''}
${reflectionInstruction}
${audienceInstruction}

SPEAKER: ${agent.name}
Please respond as ${agent.name} adhering to JSON format.
    `.trim();
  }

  // --- MEMORY & STRUCTURED OUTPUT PROCESSOR ---
  private processStructuredOutput(agent: Agent, response: any, turn: number) {
    if (response.memoryCandidates && response.memoryCandidates.length > 0) {
      const newMemories: ImportantMemory[] = response.memoryCandidates.map((mem: any, idx: number) => ({
        id: `mem_${turn}_${agent.id}_${idx}`,
        speakerId: agent.id,
        speakerName: agent.name,
        type: 'CLAIM',
        summary: mem.summary,
        importance: mem.importance || 0.8,
        reliability: 1.0,
        reliabilityStatus: 'verified',
        turn,
        timestamp: Date.now(),
      }));

      this.updateState((s) => ({ ...s, memories: [...s.memories, ...newMemories] }));
    }

    const claimsCreated: string[] = response.claimsCreated || [];
    const claimsAttacked: string[] = response.claimsAttacked || [];
    if (claimsCreated.length > 0 || claimsAttacked.length > 0) {
      this.updateState((s) => {
        // Panels are instructed to reuse a "stable claim id" when they
        // return to a point they already raised. Appending unconditionally
        // duplicated the same claim text every time the id recurred, so
        // skip ids already recorded this session.
        const existingIds = new Set(s.claims.map((c) => c.claimId));
        const seenThisTurn = new Set<string>();
        const newIds = claimsCreated.filter((cId) => {
          if (existingIds.has(cId) || seenThisTurn.has(cId)) return false;
          seenThisTurn.add(cId);
          return true;
        });

        // An attack needs a claim to originate from. Reuse this turn's new
        // claim id if there is one; otherwise synthesize one from the
        // rebuttal itself so attacks made without proposing a fresh claim
        // (a pure rebuttal) still have a source node in the argument graph.
        const attackSourceId = newIds[0] || (claimsAttacked.length ? `implicit_${agent.id}_t${turn}` : undefined);
        const needsImplicitSource = newIds.length === 0 && !!attackSourceId;

        const newClaims: ArgumentClaim[] = [
          ...newIds.map((cId) => ({
            claimId: cId,
            speakerId: agent.id,
            speakerName: agent.name,
            claimText: response.message,
            supports: [],
            attackedBy: [],
            status: 'proposed' as const,
          })),
          ...(needsImplicitSource ? [{
            claimId: attackSourceId!,
            speakerId: agent.id,
            speakerName: agent.name,
            claimText: response.message,
            supports: [],
            attackedBy: [],
            status: 'proposed' as const,
          }] : []),
        ];

        let claims = newClaims.length ? [...s.claims, ...newClaims] : s.claims;
        if (attackSourceId && claimsAttacked.length) {
          claims = claims.map((c) =>
            claimsAttacked.includes(c.claimId) && c.claimId !== attackSourceId && !c.attackedBy.includes(attackSourceId)
              ? { ...c, attackedBy: [...c.attackedBy, attackSourceId], status: 'contested' as const }
              : c
          );
        }

        return claims === s.claims ? s : { ...s, claims };
      });
    }

    if (response.reflection) {
      const reflection = response.reflection;
      this.updateState((s) => ({
        ...s,
        reflections: {
          ...s.reflections,
          [agent.id]: [
            ...(s.reflections[agent.id] || []),
            {
              agentId: agent.id,
              turn,
              currentPosition: reflection.currentPosition,
              strongestOpposingArgument: reflection.strongestOpposingArgument,
              unresolvedQuestion: reflection.unresolvedQuestion,
              nextStrategy: reflection.nextStrategy,
            },
          ],
        },
      }));
    }
  }

  // --- AUDIENCE HELPERS ---
  private getPendingAudienceQuestion(): AudienceQuestion | undefined {
    return this.state.audienceQuestions.find((q) => q.status === 'pending');
  }

  private markAudienceQuestionAddressed(qId: string) {
    this.updateState((s) => ({
      ...s,
      audienceQuestions: s.audienceQuestions.map((q) =>
        q.id === qId ? { ...q, status: 'addressed' } : q
      ),
    }));
  }

  private updateState(updater: (prev: DebateSessionState) => DebateSessionState) {
    this.updateStateCallback(updater);
  }

  private getFormattedTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes}:${seconds}`;
  }
}
