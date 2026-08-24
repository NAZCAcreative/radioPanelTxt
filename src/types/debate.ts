// PANELOGUE - Core Type Definitions

export type ApiProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'ollama'
  | 'custom_openai';

export type KeyStorageOption = 'donotsave' | 'localstorage';

// 'normal' = long, human-like thinking/typing delays for a realistic chat
// feel. 'fast' = minimal delays to speed through a debate.
export type ChatPaceMode = 'normal' | 'fast';

export type DiscussionGoal =
  | 'open_debate'
  | 'pro_con'
  | 'problem_solving'
  | 'brainstorming'
  | 'policy_decision'
  | 'expert_panel'
  | 'philosophical'
  | 'news_analysis'
  | 'fact_verification'
  | 'consensus'
  | 'unresolved_allowed'
  | 'roleplay';

export type EvidencePreference =
  | 'data'
  | 'papers'
  | 'experience'
  | 'cases'
  | 'law'
  | 'logic'
  | 'intuition'
  | 'expert_opinion'
  | 'balanced';

export type UncertaintyExpression = 'decisive' | 'cautious';

export type MemoryMode =
  | 'OFF'
  | 'recent_context'
  | 'important_memories'
  | 'structured_memory'
  | 'full_experimental';

export type MemoryDecayRate = 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH';

export type TurnMode =
  | 'round_robin'
  | 'moderator_controlled'
  | 'dynamic'
  | 'free_debate'
  | 'request_to_speak';

export type EvidenceMode = 'free' | 'encouraged' | 'enforced' | 'fact_check';

export type ConsensusMode =
  | 'none'
  | 'majority'
  | 'supermajority'
  | 'unanimous'
  | 'moderator_judgment'
  | 'unresolved_allowed';

export type ContextVisibility = 'all' | 'moderator_only' | 'selected';

// Agent Core Values (0 - 100)
export interface CoreValues {
  progressiveVsConservative: number; // 진보 ↔ 보수
  libertyVsCommunity: number; // 개인 자유 ↔ 공동체 책임
  marketVsGovernment: number; // 시장 중심 ↔ 정부 개입
  efficiencyVsFairness: number; // 효율성 ↔ 공정성
  techOptimismVsSkepticism: number; // 기술 낙관 ↔ 기술 회의
  idealismVsRealism: number; // 이상주의 ↔ 현실주의
  riskVsSecurity: number; // 위험 감수 ↔ 안정 추구
  traditionVsChange: number; // 전통 ↔ 변화
  individualismVsCollectivism: number; // 개인주의 ↔ 집단주의
}

// Agent Personality Parameters (0 - 100)
export interface PersonalityParameters {
  assertiveness: number; // 소극적 ↔ 적극적
  openness: number; // 고집 ↔ 유연
  agreeableness: number; // 대립적 ↔ 협력적
  skepticism: number; // 수용적 ↔ 회의적
  empathy: number; // 공감능력
  curiosity: number; // 탐색 성향
  confidence: number; // 지식 자신감
  emotionality: number; // 감정 반응성
  humor: number; // 위트/비유 사용
  formality: number; // 격식성
}

// Agent Debate Behavior Parameters (0 - 100)
export interface DebateBehavior {
  aggressiveness: number; // 공격성
  rebuttalFrequency: number; // 반박 빈도
  questionFrequency: number; // 질문 빈도
  evidenceDemand: number; // 근거 요구
  evidenceProvision: number; // 근거 제시
  quoteOthers: number; // 상대 발언 인용
  concessionProbability: number; // 양보 가능성
  stanceShiftProbability: number; // 입장 변경 가능성
  interruptFrequency: number; // 끼어들기
  topicFocusVsExpansion: number; // 논점 집중 ↔ 논점 확장
  devilsAdvocateTendency: number; // 악마의 대변인
  consensusPreference: number; // 합의 선호
  independentJudgment: number; // 독립적 판단
}

// Epistemic Personality
export interface EpistemicStyle {
  evidencePreference: EvidencePreference;
  evidenceStrictness: number; // 0 - 100
  uncertaintyExpression: UncertaintyExpression;
  factChallengeFrequency: number; // 0 - 100
}

export type ChatCharacterStyle = 'balanced' | 'fiery' | 'blunt_slang' | 'absurd' | 'comedian' | 'flirty' | 'contrarian' | 'deadpan';

// Single Agent Definition
export interface Agent {
  id: string;
  name: string;
  avatarColor: string;
  job: string;
  expertise: string[];
  background: string;
  age?: number;
  culture?: string;
  roleInDebate: string;
  
  personaMode: 'SIMPLE' | 'ADVANCED';
  simplePersona: string;
  speakingStyle: string;
  chatCharacterStyle?: ChatCharacterStyle;
  
  customModel?: string; // Per-agent model override

  coreValues: CoreValues;
  personality: PersonalityParameters;
  behavior: DebateBehavior;
  epistemic: EpistemicStyle;

  initialStance: number; // -100 (Strong Con) to +100 (Strong Pro)
  currentStance: number;
  stanceFlexibility: number; // 0 - 100

  independentThinking: boolean; // Anti-Sycophancy toggle
  independentJudgmentScore: number; // 0 - 100

  preserveDistinctPerspective: boolean;
  maxSentenceCount: number; // Default 2 - 4
}

// Moderator Definition
export interface Moderator {
  id: string;
  name: string;
  role: string;
  persona: string;
  speakingStyle: string;
  customModel?: string; // Per-moderator model override
  neutrality: number; // 0 (active viewpoint) to 100 (complete neutrality), default 85
  interventionFrequency: number; // 0 (min) to 100 (max intervention)
  
  // Moderator Behaviors
  behaviors: {
    assignSpeaker: boolean;
    askNextQuestion: boolean;
    requestRebuttal: boolean;
    requestEvidence: boolean;
    requestExamples: boolean;
    separateFactAndOpinion: boolean;
    pointOutEvasion: boolean;
    summarizeTopic: boolean;
    interimSummary: boolean;
    protectMinority: boolean;
    callDevilsAdvocate: boolean;
    askSpecificExpert: boolean;
    passAudienceQuestion: boolean;
    shiftTopic: boolean;
    checkConsensus: boolean;
    identifyUnresolved: boolean;
    finalSummary: boolean;
  };
}

// Memory Types
export type MemoryType =
  | 'CLAIM'
  | 'EVIDENCE'
  | 'QUESTION'
  | 'REBUTTAL'
  | 'CONCESSION'
  | 'DISAGREEMENT'
  | 'AGREEMENT'
  | 'FACT'
  | 'UNCERTAINTY'
  | 'PERSONAL_ATTACK'
  | 'AUDIENCE_EVENT';

export interface ImportantMemory {
  id: string;
  speakerId: string;
  speakerName: string;
  type: MemoryType;
  summary: string;
  importance: number; // 0 - 1 normalized
  reliability: number; // 0 - 1
  reliabilityStatus: 'verified' | 'unverified' | 'disputed' | 'incorrect' | 'outdated';
  turn: number;
  timestamp: number;
}

export type ClaimStatus =
  | 'proposed'
  | 'supported'
  | 'contested'
  | 'weakened'
  | 'strengthened'
  | 'conceded'
  | 'unresolved';

export interface ArgumentClaim {
  claimId: string;
  speakerId: string;
  speakerName: string;
  claimText: string;
  supports: string[]; // Evidence IDs or Claim IDs
  attackedBy: string[]; // Counter Claim IDs
  status: ClaimStatus;
}

export interface FactLedgerItem {
  id: string;
  factText: string;
  source?: string;
  status: 'SUPPORTED' | 'UNSUPPORTED' | 'DISPUTED' | 'UNKNOWN';
  referencedBy: string[]; // Agent IDs
}

export interface AgentPrivateMemory {
  targetAgentId: string;
  notes: string[];
}

export interface ReflectionState {
  agentId: string;
  turn: number;
  currentPosition: string;
  strongestOpposingArgument: string;
  unresolvedQuestion: string;
  nextStrategy: string;
}

export interface DebateDecisionLog {
  id: string;
  turn: number;
  actorId: string;
  actorName: string;
  category: 'speaker_selection' | 'moderation' | 'argument' | 'stance_change' | 'consensus' | 'model_fallback';
  summary: string;
  rationale?: string;
  evidence: string[];
  selectedSpeakerId?: string;
  timestamp: number;
}

export interface StanceHistoryItem {
  agentId: string;
  agentName: string;
  turn: number;
  previousStance: number;
  newStance: number;
  reason: string;
  influencedByMessageIds: string[];
}

export interface ConsensusSnapshot {
  turn: number;
  mode: ConsensusMode;
  reached: boolean;
  label: string;
  proCount: number;
  neutralCount: number;
  conCount: number;
  agreementRatio: number;
  unresolvedClaims: string[];
  issues: { claimId: string; text: string; status: ClaimStatus; resolved: boolean }[];
}

// Audience Interruption Event
export type AudiencePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'IMMEDIATE';

export interface AudienceQuestion {
  id: string;
  userText: string;
  targetType: 'moderator' | 'all' | 'agent';
  targetAgentId?: string;
  priority: AudiencePriority;
  turnAdded: number;
  status: 'pending' | 'addressed' | 'skipped';
}

// Chat Message & Metadata
export interface MessageMetadata {
  stance?: number;
  confidence?: number;
  replyToId?: string;
  referencedClaimId?: string;
  speechAct?: 'claim' | 'rebuttal' | 'question' | 'concession' | 'clarification' | 'moderation';
  targetAgentIds?: string[];
  
  // Debug mode details
  agentId?: string;
  turn?: number;
  retrievedMemoryIds?: string[];
  speakPriorityScore?: number;
  speakPriorityBreakdown?: Record<string, number>;
  tokensUsed?: number;
  latencyMs?: number;
  rationale?: string;
  evidence?: string[];
  stanceReason?: string;
  selectedSpeakerId?: string;
}

export interface Message {
  id: string;
  speakerId: string; // 'host' | agentId | 'user' | 'system'
  speakerName: string;
  speakerRole?: string;
  avatarColor?: string;
  isModerator?: boolean;
  isAudience?: boolean;
  isSystem?: boolean;
  text: string;
  timestamp: string; // e.g. "오전 11:33"
  turn: number;
  metadata?: MessageMetadata;
}

// Main Debate Settings State
export interface DebateSettings {
  // API
  apiProvider: ApiProvider;
  apiKey: string;
  keyStorage: KeyStorageOption;
  globalModel: string;
  customEndpointUrl?: string;
  advancedModelPerAgent: boolean;
  chatPaceMode: ChatPaceMode; // '기본모드' (realistic delays) vs '배속모드' (fast)
  agentModelDefaultsVersion: number;
  funDebateModeId: string;
  noModeratorMode: boolean;

  // Topic & Context
  topic: string;
  backgroundContext: string;
  contextVisibility: ContextVisibility;
  selectedContextAgentIds: string[];
  discussionGoal: DiscussionGoal;

  // Participants
  agentCount: number;
  agents: Agent[];
  moderator: Moderator;

  // Presets
  activePresetId?: string;

  // Steering & Policies
  turnMode: TurnMode;
  maxSentenceCount: number; // Global default
  memoryMode: MemoryMode;
  recentWorkingMemoryTurns: number; // 4 to 30, default 10
  memoryDecay: MemoryDecayRate;
  factPreservation: boolean;

  antiSycophancyGlobal: boolean;
  perspectivePreservationGlobal: boolean;
  antiEchoMode: boolean;
  preventSpeakerDominance: boolean; // Anti-Dominance toggle
  protectMinorityOpinion: boolean;
  
  challengeMode: number; // 0 (cooperative) to 100 (hostile)
  diversityPressure: number; // 0 (natural convergence) to 100 (maintain diversity)
  evidenceMode: EvidenceMode;
  uncertaintyTracking: boolean;

  consensusMode: ConsensusMode;
  reflectionIntervalTurns: number; // e.g. 3, 5, 8, 10

  // Flow & Limits
  maxTurns: number; // Default 30
  maxResponseTokens: number;
  maxTotalTokens: number;
  maxCostLimitUsd: number;
  debugMode: boolean;
  theme: 'light' | 'dark';
  chatTheme: 'light' | 'dark';
}

// Live Debate Session Runtime State
export type DebatePhase = 'Opening' | 'Exploration' | 'Challenge' | 'Reflection' | 'FinalPosition' | 'Completed';

export interface DebateSessionState {
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentTurn: number;
  phase: DebatePhase;
  phaseModeActive: boolean;
  
  messages: Message[];
  activeThinkingAgentId: string | null;
  activeThinkingText: string; // Partial streaming text
  activeThinkingLabel: string; // e.g. "박대건님이 생각을 정리하고 있어요" - picked once per turn, shown while activeThinkingText is empty

  memories: ImportantMemory[];
  claims: ArgumentClaim[];
  factLedger: FactLedgerItem[];
  reflections: Record<string, ReflectionState[]>; // agentId -> list
  privateMemories: Record<string, Record<string, string[]>>; // agentId -> (targetAgentId -> notes)
  
  audienceQuestions: AudienceQuestion[];
  
  totalTokensUsed: number;
  estimatedCostUsd: number;
  
  initialStances: Record<string, number>;
  currentStances: Record<string, number>;
  decisionLogs: DebateDecisionLog[];
  stanceHistory: StanceHistoryItem[];
  consensusSnapshots: ConsensusSnapshot[];

  lastErrorMessage: string | null; // set when a turn fails to execute; cleared on the next attempt
}
