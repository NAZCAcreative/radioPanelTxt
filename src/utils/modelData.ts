export interface LLMModelMeta {
  id: string;
  name: string;
  provider: string;
  costInput: string;
  costOutput: string;
  trait: string;
  recommendedRole: string;
  badgeColor: string;
  performanceTier: '🏆 Tier 1 Ultra' | '🌟 Tier 2 Flagship' | '⚡ Tier 3 High-End' | '🚀 Tier 4 Fast & Light';
  rank: number; // Higher is better performance
  contextLength?: number;
}

const LEGACY_MODEL_IDS: Record<string, string> = {
  'anthropic/claude-opus-6': 'anthropic/claude-opus-4.8-fast',
  'anthropic/claude-3.7-sonnet': 'anthropic/claude-sonnet-5',
  'anthropic/claude-3.5-sonnet': 'anthropic/claude-sonnet-4.6',
  'anthropic/claude-3.5-haiku': 'anthropic/claude-haiku-4.5',
};

export function normalizeOpenRouterModelId(modelId?: string): string | undefined {
  if (!modelId) return modelId;
  return LEGACY_MODEL_IDS[modelId] || modelId;
}

export function getModelPerformanceRank(modelId: string): { rank: number; tier: LLMModelMeta['performanceTier'] } {
  const lower = modelId.toLowerCase();

  // Tier 1 Ultra Reasoners & Flagships (Rank 95 - 100)
  if (lower.includes('gpt-5') || lower.includes('o3') || lower.includes('o1') || lower.includes('claude-3.7') || lower.includes('opus')) {
    return { rank: 100, tier: '🏆 Tier 1 Ultra' };
  }
  if (lower.includes('grok-4') || lower.includes('grok-3') || lower.includes('deepseek-v4') || lower.includes('gemini-3')) {
    return { rank: 98, tier: '🏆 Tier 1 Ultra' };
  }
  if (lower.includes('gpt-4o') && !lower.includes('mini')) {
    return { rank: 95, tier: '🏆 Tier 1 Ultra' };
  }
  if (lower.includes('claude-3.5-sonnet') || lower.includes('claude-3-5-sonnet')) {
    return { rank: 94, tier: '🏆 Tier 1 Ultra' };
  }
  if (lower.includes('deepseek-r1') || lower.includes('r1')) {
    return { rank: 93, tier: '🏆 Tier 1 Ultra' };
  }

  // Tier 2 Flagships & High Reasoners (Rank 80 - 92)
  if (lower.includes('glm-5') || lower.includes('nemotron') || lower.includes('gemini-2.0-pro')) {
    return { rank: 90, tier: '🌟 Tier 2 Flagship' };
  }
  if (lower.includes('grok-2')) {
    return { rank: 88, tier: '🌟 Tier 2 Flagship' };
  }
  if (lower.includes('sonar-reasoning') || lower.includes('command-r')) {
    return { rank: 86, tier: '🌟 Tier 2 Flagship' };
  }
  if (lower.includes('mistral-large') || lower.includes('voxtral')) {
    return { rank: 85, tier: '🌟 Tier 2 Flagship' };
  }
  if (lower.includes('llama-3.3-70b') || lower.includes('qwen-3')) {
    return { rank: 84, tier: '🌟 Tier 2 Flagship' };
  }

  // Tier 3 High-End Fast & Workhorse Models (Rank 60 - 79)
  if (lower.includes('gemini-2.0-flash') || lower.includes('gemini-2.5-flash')) {
    return { rank: 78, tier: '⚡ Tier 3 High-End' };
  }
  if (lower.includes('deepseek-chat') || lower.includes('deepseek-v3')) {
    return { rank: 76, tier: '⚡ Tier 3 High-End' };
  }
  if (lower.includes('qwen-2.5-coder') || lower.includes('qwen-2.5-72b')) {
    return { rank: 74, tier: '⚡ Tier 3 High-End' };
  }
  if (lower.includes('claude-3.5-haiku')) {
    return { rank: 70, tier: '⚡ Tier 3 High-End' };
  }

  // Tier 4 Fast & Light (Rank 1 - 59)
  if (lower.includes('gpt-4o-mini') || lower.includes('gpt-oss')) {
    return { rank: 55, tier: '🚀 Tier 4 Fast & Light' };
  }
  if (lower.includes('gemini-1.5-flash')) {
    return { rank: 50, tier: '🚀 Tier 4 Fast & Light' };
  }

  return { rank: 40, tier: '🚀 Tier 4 Fast & Light' };
}

export const OPENROUTER_MODELS: LLMModelMeta[] = [
  // --- OPENAI ---
  {
    id: 'openai/gpt-5.6',
    name: 'OpenAI GPT-5.6 (Latest Flagship)',
    provider: 'OpenAI',
    costInput: '$13.00 / 1M',
    costOutput: '$39.00 / 1M',
    trait: '최신 플래그십 업데이트, 향상된 종합 추론과 응답 속도 및 안정성',
    recommendedRole: '최고 종합 연구원 & 주요 좌장',
    badgeColor: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 102,
  },
  {
    id: 'openai/gpt-5.5',
    name: 'OpenAI GPT-5.5 (Next Flagship)',
    provider: 'OpenAI',
    costInput: '$12.00 / 1M',
    costOutput: '$36.00 / 1M',
    trait: '차세대 넥스트 에이전트 플래그십, 완벽한 종합 추론 및 코딩 능력',
    recommendedRole: '최고 종합 연구원 & 주요 좌장',
    badgeColor: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 101,
  },
  {
    id: 'openai/gpt-5',
    name: 'OpenAI GPT-5 / Latest',
    provider: 'OpenAI',
    costInput: '$10.00 / 1M',
    costOutput: '$30.00 / 1M',
    trait: '차세대 에이전트 플래그십, 완벽한 종합 추론 및 코딩 능력',
    recommendedRole: '최고 종합 연구원 & 주요 좌장',
    badgeColor: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 100,
  },
  {
    id: 'openai/o1',
    name: 'OpenAI o1 (Flagship Reasoning)',
    provider: 'OpenAI',
    costInput: '$15.00 / 1M',
    costOutput: '$60.00 / 1M',
    trait: '최상위 복합 체계 추론, 깊이 있는 다각도 고난도 토론 및 논리 수호',
    recommendedRole: '수석 연구원 & 최고 학술 전문가',
    badgeColor: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 99,
  },
  {
    id: 'openai/o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    costInput: '$1.10 / 1M',
    costOutput: '$4.40 / 1M',
    trait: '최신 Reasoning 모델, 과학/코딩/논리 추론 특화 초고속 파이프라인',
    recommendedRole: '논리 추론 & 수학/데이터 토론 전문',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 98,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o (Omnimodal)',
    provider: 'OpenAI',
    costInput: '$2.50 / 1M',
    costOutput: '$10.00 / 1M',
    trait: '범용 최고 성능, 균형 잡힌 논리적 타협 능력 및 매우 유연한 페르소나 소화',
    recommendedRole: '사회자(Host) & 주도적 패널 추천',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 95,
  },
  {
    id: 'openai/gpt-oss',
    name: 'OpenAI GPT-OSS',
    provider: 'OpenAI',
    costInput: '$0.20 / 1M',
    costOutput: '$0.60 / 1M',
    trait: 'OpenAI 오픈웨이트 가성비 모델, 빠른 대화 및 다목적 토론',
    recommendedRole: '일반 토론 패널',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    performanceTier: '🚀 Tier 4 Fast & Light',
    rank: 55,
  },

  // --- ANTHROPIC ---
  {
    id: 'anthropic/claude-opus-4.8-fast',
    name: 'Claude Opus 4.8 Fast',
    provider: 'Anthropic',
    costInput: '$18.00 / 1M',
    costOutput: '$90.00 / 1M',
    trait: '차세대 Opus 6 최고 지능, 무제한 복잡성 문서 및 심층 에이전트 분석',
    recommendedRole: '최고 학술 석학 & 수석 리서처',
    badgeColor: 'bg-orange-300 text-orange-950 border-orange-500',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 102,
  },
  {
    id: 'anthropic/claude-opus-5',
    name: 'Claude Opus 5 (Flagship)',
    provider: 'Anthropic',
    costInput: '$15.00 / 1M',
    costOutput: '$75.00 / 1M',
    trait: '차세대 Opus 5 플래그십, 장문 분석 및 에이전트 코딩 최고 인텔리전스',
    recommendedRole: '학술 석학 & 정책 기획위원',
    badgeColor: 'bg-orange-200 text-orange-900 border-orange-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 100,
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'Anthropic',
    costInput: '$3.00 / 1M',
    costOutput: '$15.00 / 1M',
    trait: '최신 하이브리드 추론 플래그십, 에이전트/코딩/문서 심층 반론',
    recommendedRole: '주요 논객 & 사상적 대표 패널',
    badgeColor: 'bg-orange-200 text-orange-900 border-orange-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 98,
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    costInput: '$3.00 / 1M',
    costOutput: '$15.00 / 1M',
    trait: '압도적 문해력과 섬세한 뉘앙스, 예리한 반론 구성 및 정교한 문체 소화',
    recommendedRole: '핵심 정반론 주도 패널',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 94,
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    costInput: '$0.80 / 1M',
    costOutput: '$4.00 / 1M',
    trait: '경량 고속 클로드, 날카로운 즉각 반응과 짧고 강렬한 반박 스타일',
    recommendedRole: '재치있는 공격적 토론자',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    performanceTier: '⚡ Tier 3 High-End',
    rank: 70,
  },

  // --- GOOGLE ---
  {
    id: 'google/gemini-3.0-flash',
    name: 'Gemini 3.x Flash',
    provider: 'Google',
    costInput: '$0.15 / 1M',
    costOutput: '$0.60 / 1M',
    trait: '차세대 멀티모달 & 초장문 컨텍스트, 압도적 가성비와 무제한 기억',
    recommendedRole: '사회자(Host) & 팩트체커',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 96,
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    costInput: '$0.10 / 1M',
    costOutput: '$0.40 / 1M',
    trait: '차세대 초고속 모델, 방대한 맥락 수용 및 빠른 요약 정리',
    recommendedRole: '사회자(Host) & 팩트체커',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    performanceTier: '⚡ Tier 3 High-End',
    rank: 78,
  },

  // --- XAI (GROK) ---
  {
    id: 'x-ai/grok-4.5',
    name: 'xAI Grok 4.5 / Latest',
    provider: 'xAI',
    costInput: '$3.00 / 1M',
    costOutput: '$15.00 / 1M',
    trait: '최신 Grok 플래그십, 무제약 직설적 추론 및 통찰력 강한 논쟁어조',
    recommendedRole: '직설적 현실 비판 논객',
    badgeColor: 'bg-stone-300 text-stone-950 border-stone-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 97,
  },
  {
    id: 'x-ai/grok-2-1212',
    name: 'xAI Grok 2',
    provider: 'xAI',
    costInput: '$2.00 / 1M',
    costOutput: '$10.00 / 1M',
    trait: '위트 있고 직설적인 현실적 토론 스타일, 기조 발언 시 선명한 입장',
    recommendedRole: '위트 있는 비판적 논객',
    badgeColor: 'bg-stone-200 text-stone-900 border-stone-400',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 88,
  },

  // --- DEEPSEEK ---
  {
    id: 'deepseek/deepseek-v4',
    name: 'DeepSeek V4 Flash/Pro',
    provider: 'DeepSeek',
    costInput: '$0.25 / 1M',
    costOutput: '$0.85 / 1M',
    trait: '차세대 저비용 극상위 추론/코딩 모델, 극강의 가성비 논리 전개',
    recommendedRole: '핵심 실증주의적 논객',
    badgeColor: 'bg-purple-200 text-purple-900 border-purple-400',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 97,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    costInput: '$0.55 / 1M',
    costOutput: '$2.19 / 1M',
    trait: 'Deep Reasoning (심층 추론 전문), 논리 체계와 모순을 끝까지 파헤침',
    recommendedRole: '심층 분석가 & 수사학적 비판자',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    performanceTier: '🏆 Tier 1 Ultra',
    rank: 93,
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    costInput: '$0.14 / 1M',
    costOutput: '$0.28 / 1M',
    trait: '저비용 고효율, 자연스러운 한국어 대화 및 유연한 반론 제시',
    recommendedRole: '일반 보조 패널',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    performanceTier: '⚡ Tier 3 High-End',
    rank: 76,
  },

  // --- ALIBABA QWEN ---
  {
    id: 'qwen/qwen-3.8-72b',
    name: 'Alibaba Qwen 3.8 / 3.6',
    provider: 'Alibaba',
    costInput: '$0.30 / 1M',
    costOutput: '$0.60 / 1M',
    trait: '차세대 Qwen 3 시리즈, 멀티모달 & 정교한 코딩/수치 데이터 검증',
    recommendedRole: '데이터/통계 정밀 분석관',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 87,
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Alibaba',
    costInput: '$0.20 / 1M',
    costOutput: '$0.20 / 1M',
    trait: '논리적 구조화 및 기술/숫자 데이터 검증에 매우 뛰어남',
    recommendedRole: '기술/통계 전문 연구원',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    performanceTier: '⚡ Tier 3 High-End',
    rank: 74,
  },

  // --- Z.AI (ZHIPU AI) ---
  {
    id: 'z-ai/glm-5-flagship',
    name: 'Z.ai GLM 5.x Flagship',
    provider: 'Z.ai',
    costInput: '$0.50 / 1M',
    costOutput: '$1.50 / 1M',
    trait: '에이전트 지능 및 코딩/장문 복합 맥락 추론 전문',
    recommendedRole: '복합 맥락 종합 판단위원',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 89,
  },

  // --- MISTRAL AI ---
  {
    id: 'mistralai/voxtral-large',
    name: 'Mistral / Voxtral Large',
    provider: 'Mistral',
    costInput: '$2.00 / 1M',
    costOutput: '$6.00 / 1M',
    trait: '범용 논리와 멀티모달 음성/텍스트 결합 원칙주의적 논조',
    recommendedRole: '규범 & 윤리 전문 패널',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 86,
  },

  // --- NVIDIA ---
  {
    id: 'nvidia/nemotron-4-340b',
    name: 'NVIDIA Nemotron 4 / 70B',
    provider: 'NVIDIA',
    costInput: '$0.50 / 1M',
    costOutput: '$1.50 / 1M',
    trait: '고성능 합성 데이터 및 정밀 추론 전문 엔터프라이즈 모델',
    recommendedRole: '엔지니어링 & 과학 기술 패널',
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 88,
  },

  // --- PERPLEXITY & COHERE ---
  {
    id: 'perplexity/sonar-reasoning',
    name: 'Perplexity Sonar Reasoning',
    provider: 'Perplexity',
    costInput: '$1.00 / 1M',
    costOutput: '$5.00 / 1M',
    trait: '검색 기반 실시간 최신 정보 및 근거 기반 추론 전문',
    recommendedRole: '팩트체크 & 데이터 검증위원',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 86,
  },
  {
    id: 'cohere/command-r-plus',
    name: 'Cohere Command R+',
    provider: 'Cohere',
    costInput: '$2.50 / 1M',
    costOutput: '$10.00 / 1M',
    trait: '기업형 RAG 및 정교한 다국어 반론 구조화',
    recommendedRole: '기업 정책 & 리스크 관리위원',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 85,
  },

  // --- META ---
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    costInput: '$0.40 / 1M',
    costOutput: '$0.40 / 1M',
    trait: '오픈소스 최강자, 솔직하고 거침없는 직설적 논쟁 성향',
    recommendedRole: '강한 솔직함/직설적 주장자',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    performanceTier: '🌟 Tier 2 Flagship',
    rank: 84,
  },
];

export function getModelMeta(modelId: string): LLMModelMeta {
  const found = OPENROUTER_MODELS.find((m) => m.id === modelId);
  if (found) return found;
  
  const providerName = modelId.split('/')[0] || 'Custom';
  const { rank, tier } = getModelPerformanceRank(modelId);

  return {
    id: modelId,
    name: modelId,
    provider: providerName.toUpperCase(),
    costInput: '가격 미확인',
    costOutput: '가격 미확인',
    trait: 'OpenRouter 실시간 제공 모델',
    recommendedRole: '사용자 지정 토론자',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    performanceTier: tier,
    rank,
  };
}

// Live OpenRouter Model Fetcher API
let liveModelsCache: LLMModelMeta[] | null = null;

export async function fetchLiveOpenRouterModels(): Promise<LLMModelMeta[]> {
  if (liveModelsCache) return liveModelsCache;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    const parsedModels: LLMModelMeta[] = data.map((item: any) => {
      const promptCost = parseFloat(item.pricing?.prompt || '0') * 1000000;
      const completionCost = parseFloat(item.pricing?.completion || '0') * 1000000;
      const provider = item.id.split('/')[0] || 'OpenRouter';
      const { rank, tier } = getModelPerformanceRank(item.id);

      return {
        id: item.id,
        name: item.name || item.id,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        costInput: `$${promptCost.toFixed(2)} / 1M`,
        costOutput: `$${completionCost.toFixed(2)} / 1M`,
        trait: item.description ? item.description.slice(0, 75) + '...' : 'OpenRouter 실시간 제공 모델',
        recommendedRole: '실시간 OpenRouter 파이프라인',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
        performanceTier: tier,
        rank,
        contextLength: item.context_length,
      };
    });

    // SORT BY PERFORMANCE RANK (DESCENDING)
    parsedModels.sort((a, b) => b.rank - a.rank);

    liveModelsCache = parsedModels;
    return parsedModels;
  } catch (error) {
    console.warn('Failed to fetch live OpenRouter models list:', error);
    return OPENROUTER_MODELS;
  }
}
