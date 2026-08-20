// DEBATE LAB - Zustand Global Store

import { create } from 'zustand';
import { DebateEngine } from '../engine/DebateEngine';
import type {
  Agent,
  AudiencePriority,
  AudienceQuestion,
  DebateSessionState,
  DebateSettings,
  Message,
} from '../types/debate';
import {
  DEBATE_PRESETS,
  DEFAULT_MODERATOR,
  generateRandomPersonas,
  getInitialAgents,
} from '../utils/presets';
import { loadSavedSettings, syncSettingsPersistence } from '../utils/settingsStorage';
import { normalizeOpenRouterModelId } from '../utils/modelData';

// If the user previously opted into browser-local storage, this holds the
// entire saved workspace (topic, agents, moderator, every policy slider,
// etc.) - not just the global API key.
const savedSettings = loadSavedSettings();

const DEFAULT_SETTINGS: DebateSettings = {
  apiProvider: 'openrouter',
  apiKey: '',
  keyStorage: 'donotsave',
  globalModel: 'openai/gpt-5.6',
  advancedModelPerAgent: false,
  chatPaceMode: 'normal',
  agentModelDefaultsVersion: 1,

  topic: 'AI 자동화로 인해 발생하는 실업 문제에 AI 기업이 경제적 책임을 져야 하는가?',
  backgroundContext: '2026년 이후 AI 자동화 도입율이 급상승하며 일부 직군에서의 고용 불안이 대두되고 있음. 주요 신흥 AI 기업들의 이익율은 가파르게 상승 중.',
  contextVisibility: 'all',
  selectedContextAgentIds: [],
  discussionGoal: 'open_debate',

  agentCount: 4,
  agents: getInitialAgents(),
  moderator: DEFAULT_MODERATOR,

  turnMode: 'dynamic',
  maxSentenceCount: 3,
  memoryMode: 'structured_memory',
  recentWorkingMemoryTurns: 10,
  memoryDecay: 'LOW',
  factPreservation: true,

  antiSycophancyGlobal: true,
  perspectivePreservationGlobal: true,
  antiEchoMode: true,
  preventSpeakerDominance: true,
  protectMinorityOpinion: true,

  challengeMode: 55,
  diversityPressure: 70,
  evidenceMode: 'encouraged',
  uncertaintyTracking: true,

  consensusMode: 'unresolved_allowed',
  reflectionIntervalTurns: 5,

  maxTurns: 30,
  maxResponseTokens: 300,
  maxTotalTokens: 100000,
  maxCostLimitUsd: 2.0,
  debugMode: false,
  theme: 'light',
  chatTheme: 'dark',
};

// Merge (not replace) so a saved blob from an older app version that's
// missing newly-added fields still falls back to sane defaults for those.
// apiProvider is always forced to 'openrouter' - the provider picker was
// removed from the UI, so any older saved value (e.g. 'demo', 'openai') is
// no longer selectable and must not linger.
const mergedSettings: DebateSettings = savedSettings
  ? { ...DEFAULT_SETTINGS, ...savedSettings, apiProvider: 'openrouter' }
  : DEFAULT_SETTINGS;

const shouldApplyAgentModelDefaults = (savedSettings?.agentModelDefaultsVersion ?? 0) < 1;
const defaultModelByAgentName: Record<string, string> = {
  '이종현': 'x-ai/grok-4.6',
  '김범수': 'deepseek/deepseek-v4-pro-0813',
  '김동건': 'anthropic/claude-opus-5',
};

const INITIAL_SETTINGS: DebateSettings = {
  ...mergedSettings,
  globalModel: normalizeOpenRouterModelId(mergedSettings.globalModel) || DEFAULT_SETTINGS.globalModel,
  moderator: {
    ...mergedSettings.moderator,
    customModel: normalizeOpenRouterModelId(mergedSettings.moderator.customModel),
  },
  agentModelDefaultsVersion: 1,
  agents: mergedSettings.agents.map((agent) => ({
    ...agent,
    customModel: shouldApplyAgentModelDefaults && defaultModelByAgentName[agent.name]
      ? defaultModelByAgentName[agent.name]
      : normalizeOpenRouterModelId(agent.customModel),
  })),
};

const INITIAL_SESSION_STATE: DebateSessionState = {
  status: 'idle',
  currentTurn: 0,
  phase: 'Opening',
  phaseModeActive: true,
  messages: [],
  activeThinkingAgentId: null,
  activeThinkingText: '',
  activeThinkingLabel: '',
  memories: [],
  claims: [],
  factLedger: [
    { id: 'F01', factText: '국내 기술 직군 취업률 전년 대비 4.2% 변화', status: 'SUPPORTED', referencedBy: [] },
    { id: 'F02', factText: '해당 법안 2026년 7월 정식 제출됨', status: 'SUPPORTED', referencedBy: [] },
  ],
  reflections: {},
  privateMemories: {},
  audienceQuestions: [],
  totalTokensUsed: 0,
  estimatedCostUsd: 0,
  initialStances: {},
  currentStances: {},
  decisionLogs: [],
  stanceHistory: [],
  consensusSnapshots: [],
  lastErrorMessage: null,
};

interface DebateStore {
  settings: DebateSettings;
  session: DebateSessionState;
  engine: DebateEngine | null;
  activeTab: 'BASIC' | 'ADVANCED' | 'RESEARCH';

  // State Updaters
  setActiveTab: (tab: 'BASIC' | 'ADVANCED' | 'RESEARCH') => void;
  updateSettings: (partial: Partial<DebateSettings>) => void;
  updateAgent: (agentId: string, partial: Partial<Agent>) => void;
  addAgent: () => void;
  addAgentFromPreset: (presetAgent: Agent) => void;
  removeAgent: (agentId: string) => void;
  generateRandomPersonasForTopic: () => void;
  applyDebatePreset: (presetId: string) => void;
  toggleDebugMode: () => void;
  toggleTheme: () => void;
  toggleChatTheme: () => void;

  // Engine Actions
  startDebate: () => void;
  pauseDebate: () => void;
  resumeDebate: () => void;
  stepNextTurn: () => Promise<void>;
  endDebate: () => void;
  injectAudienceQuestion: (text: string, targetType: 'moderator' | 'all' | 'agent', targetAgentId?: string, priority?: AudiencePriority) => void;
  executeSlashCommand: (command: string) => void;
  resetDebate: () => void;
  dismissError: () => void;
  restoreSession: (settings: DebateSettings, session: DebateSessionState) => void;
}

export const useDebateStore = create<DebateStore>((set, get) => {
  let engineInstance: DebateEngine | null = null;

  const getEngine = () => {
    if (!engineInstance) {
      engineInstance = new DebateEngine(
        get().settings,
        get().session,
        (updater) => {
          set((state) => ({ session: updater(state.session) }));
        }
      );
    } else {
      engineInstance.setSettings(get().settings);
      engineInstance.setState(get().session);
    }
    return engineInstance;
  };

  return {
    settings: INITIAL_SETTINGS,
    session: INITIAL_SESSION_STATE,
    engine: null,
    activeTab: 'BASIC',

    setActiveTab: (tab) => set({ activeTab: tab }),

    updateSettings: (partial) => {
      set((state) => {
        const newSettings = { ...state.settings, ...partial };
        if (engineInstance) engineInstance.setSettings(newSettings);
        return { settings: newSettings };
      });
    },

    updateAgent: (agentId, partial) => {
      set((state) => {
        const updatedAgents = state.settings.agents.map((a) =>
          a.id === agentId ? { ...a, ...partial } : a
        );
        const newSettings = { ...state.settings, agents: updatedAgents };
        if (engineInstance) engineInstance.setSettings(newSettings);
        return { settings: newSettings };
      });
    },

    addAgent: () => {
      set((state) => {
        if (state.settings.agents.length >= 10) return state;
        const newCount = state.settings.agents.length + 1;
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
        const newAgent: Agent = {
          id: `agent_${Date.now()}`,
          name: `참가자 ${newCount}`,
          job: '전문 연구원',
          avatarColor: colors[newCount % colors.length],
          expertise: ['정책분석', '사회학'],
          background: '관련 학문 전문가.',
          roleInDebate: '추가 패널',
          personaMode: 'SIMPLE',
          simplePersona: '신중하고 논리적인 전문가.',
          speakingStyle: '단정하고 차분함.',
          coreValues: INITIAL_SETTINGS.agents[0].coreValues,
          personality: INITIAL_SETTINGS.agents[0].personality,
          behavior: INITIAL_SETTINGS.agents[0].behavior,
          epistemic: INITIAL_SETTINGS.agents[0].epistemic,
          initialStance: 0,
          currentStance: 0,
          stanceFlexibility: 50,
          independentThinking: true,
          independentJudgmentScore: 80,
          preserveDistinctPerspective: true,
          maxSentenceCount: 3,
        };
        const newAgents = [...state.settings.agents, newAgent];
        return {
          settings: { ...state.settings, agentCount: newAgents.length, agents: newAgents },
        };
      });
    },

    addAgentFromPreset: (presetAgent) => {
      set((state) => {
        if (state.settings.agents.length >= 10) return state;
        const newAgent: Agent = {
          ...presetAgent,
          id: `agent_${Date.now()}`,
          currentStance: presetAgent.initialStance,
        };
        const newAgents = [...state.settings.agents, newAgent];
        return {
          settings: { ...state.settings, agentCount: newAgents.length, agents: newAgents },
        };
      });
    },

    removeAgent: (agentId) => {
      set((state) => {
        if (state.settings.agents.length <= 2) return state;
        const newAgents = state.settings.agents.filter((a) => a.id !== agentId);
        return {
          settings: { ...state.settings, agentCount: newAgents.length, agents: newAgents },
        };
      });
    },

    generateRandomPersonasForTopic: () => {
      const { topic, agentCount } = get().settings;
      const randomAgents = generateRandomPersonas(topic, agentCount);
      set((state) => ({
        settings: { ...state.settings, agents: randomAgents },
      }));
    },

    applyDebatePreset: (presetId) => {
      const preset = DEBATE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

      set((state) => ({
        settings: {
          ...state.settings,
          activePresetId: preset.id,
          discussionGoal: preset.goal,
          challengeMode: preset.challengeMode,
          diversityPressure: preset.diversityPressure,
          evidenceMode: preset.evidenceMode,
          // Presets also nudge each agent's debate behavior/personality so the
          // chosen tone (e.g. "Heated Debate" vs "Friendly Roundtable") is
          // actually felt in how agents argue, not just in global sliders.
          agents: state.settings.agents.map((a) => ({
            ...a,
            behavior: {
              ...a.behavior,
              aggressiveness: clamp((a.behavior.aggressiveness + preset.challengeMode) / 2),
              rebuttalFrequency: clamp((a.behavior.rebuttalFrequency + preset.challengeMode) / 2),
            },
            personality: {
              ...a.personality,
              agreeableness: clamp((a.personality.agreeableness + (100 - preset.challengeMode)) / 2),
            },
            preserveDistinctPerspective: preset.diversityPressure >= 50,
          })),
          moderator: {
            ...state.settings.moderator,
            neutrality: preset.moderatorNeutrality,
            interventionFrequency: preset.moderatorIntervention,
          },
        },
      }));
    },

    toggleDebugMode: () => {
      set((state) => ({
        settings: { ...state.settings, debugMode: !state.settings.debugMode },
      }));
    },

    toggleTheme: () => {
      set((state) => ({
        settings: {
          ...state.settings,
          theme: state.settings.theme === 'light' ? 'dark' : 'light',
        },
      }));
    },

    toggleChatTheme: () => {
      set((state) => ({
        settings: {
          ...state.settings,
          chatTheme: state.settings.chatTheme === 'dark' ? 'light' : 'dark',
        },
      }));
    },

    // --- DEBATE ENGINE CONTROLS ---

    startDebate: () => {
      const { settings } = get();
      const initialStances: Record<string, number> = {};
      const currentStances: Record<string, number> = {};

      settings.agents.forEach((a) => {
        initialStances[a.id] = a.initialStance;
        currentStances[a.id] = a.initialStance;
      });

      const newSession: DebateSessionState = {
        ...INITIAL_SESSION_STATE,
        status: 'running',
        currentTurn: 0,
        phase: 'Opening',
        initialStances,
        currentStances,
      };

      set({ session: newSession });

      // Run loop automatically
      get().stepNextTurn();
    },

    pauseDebate: () => {
      set((state) => ({
        session: { ...state.session, status: 'paused' },
      }));
    },

    resumeDebate: () => {
      set((state) => ({
        session: { ...state.session, status: 'running' },
      }));
      get().stepNextTurn();
    },

    stepNextTurn: async () => {
      const eng = getEngine();
      const success = await eng.executeNextStep();

      // If running and executed turn successfully, continue automatically after a
      // pause between speakers - long in 기본모드 for a realistic chat cadence,
      // short in 배속모드 to speed through the debate.
      if (success && get().session.status === 'running') {
        const isFast = get().settings.chatPaceMode === 'fast';
        const delay = isFast ? 150 : 2200;
        setTimeout(() => {
          if (get().session.status === 'running') {
            get().stepNextTurn();
          }
        }, delay);
      }
    },

    endDebate: () => {
      engineInstance?.cancelPendingTurn();
      set((state) => ({
        session: { ...state.session, status: 'completed', phase: 'Completed' },
      }));
    },

    injectAudienceQuestion: (text, targetType, targetAgentId, priority = 'HIGH') => {
      const newQuestion: AudienceQuestion = {
        id: `aud_q_${Date.now()}`,
        userText: text,
        targetType,
        targetAgentId,
        priority,
        turnAdded: get().session.currentTurn,
        status: 'pending',
      };

      // Add audience event message to chat feed
      const audienceMsg: Message = {
        id: `aud_msg_${Date.now()}`,
        speakerId: 'user',
        speakerName: 'USER (관객)',
        isAudience: true,
        text: `[관객 질문] ${text} (대상: ${targetType === 'moderator' ? '사회자' : targetType === 'all' ? '전체 패널' : targetAgentId})`,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        turn: get().session.currentTurn,
      };

      set((state) => ({
        session: {
          ...state.session,
          messages: [...state.session.messages, audienceMsg],
          audienceQuestions: [...state.session.audienceQuestions, newQuestion],
        },
      }));
    },

    executeSlashCommand: (cmdText) => {
      const command = cmdText.trim();
      if (!command.startsWith('/host')) return;

      const hostMsgText = `[사용자 진행 지시] ${command}`;
      get().injectAudienceQuestion(hostMsgText, 'moderator', undefined, 'IMMEDIATE');
    },

    resetDebate: () => {
      engineInstance?.cancelPendingTurn();
      set({
        session: INITIAL_SESSION_STATE,
      });
    },

    dismissError: () => {
      set((state) => ({
        session: { ...state.session, lastErrorMessage: null },
      }));
    },

    restoreSession: (settings, session) => {
      engineInstance?.cancelPendingTurn();
      const restoredGlobalModel = normalizeOpenRouterModelId(settings.globalModel) || DEFAULT_SETTINGS.globalModel;
      // A restored session should never silently resume auto-play; the user
      // must explicitly press Resume, matching a freshly-loaded paused state.
      set({
        settings: {
          ...INITIAL_SETTINGS,
          ...settings,
          globalModel: restoredGlobalModel,
          moderator: {
            ...settings.moderator,
            customModel: normalizeOpenRouterModelId(settings.moderator.customModel),
          },
          agents: settings.agents.map((agent) => ({
            ...agent,
            customModel: normalizeOpenRouterModelId(agent.customModel),
          })),
          selectedContextAgentIds: Array.isArray(settings.selectedContextAgentIds)
            ? settings.selectedContextAgentIds.filter((id) => typeof id === 'string')
            : [],
        },
        session: {
          ...INITIAL_SESSION_STATE,
          ...session,
          status: session.status === 'running' ? 'paused' : session.status,
          activeThinkingAgentId: null,
          activeThinkingText: '',
          activeThinkingLabel: '',
          lastErrorMessage: null,
        },
      });
    },
  };
});

// Auto-persist the whole settings workspace whenever it changes, from any
// action, as long as the user has "키 저장" (local save) turned on. This is a
// single global hook rather than a sync call sprinkled into every action.
useDebateStore.subscribe((state, prevState) => {
  if (state.settings !== prevState.settings) {
    syncSettingsPersistence(state.settings);
  }
});
