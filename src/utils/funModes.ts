import type { Agent, ChatCharacterStyle, Moderator } from '../types/debate';
import { DEFAULT_MODERATOR } from './presets';

export interface FunDebateMode {
  id: string;
  emoji: string;
  name: string;
  description: string;
  prompt: string;
  darkSkin: string;
  lightSkin: string;
  darkHeader: string;
  lightHeader: string;
}

export const FUN_DEBATE_MODES: FunDebateMode[] = [
  { id: 'standard', emoji: '🎙️', name: '기본 패널 토론', description: '재미와 논리를 균형 있게 유지', prompt: '자연스러운 패널 토론 톤을 유지한다.', darkSkin: 'bg-slate-950', lightSkin: 'bg-slate-100/80', darkHeader: 'bg-slate-900/90 border-slate-800', lightHeader: 'bg-white/80 border-slate-200' },
  { id: 'highschool_chat', emoji: '🏫', name: '고딩 단톡방', description: '짧고 빠른 반말과 유행어가 오가는 채팅', prompt: '친한 고등학생 단체 채팅처럼 짧은 반말, 리액션, 가벼운 유행어를 사용한다. 따돌림이나 혐오 표현은 금지한다.', darkSkin: 'bg-blue-950', lightSkin: 'bg-sky-50', darkHeader: 'bg-blue-900/80 border-cyan-700', lightHeader: 'bg-cyan-100 border-cyan-300' },
  { id: 'four_lovers', emoji: '💘', name: '4명의 애인', description: '서로 애정과 질투가 섞인 아슬아슬한 토론', prompt: '패널 네 명이 서로 연인인 설정이다. 애정, 질투, 서운함을 재치 있게 드러내되 집착·협박·성적 묘사는 피한다.', darkSkin: 'bg-rose-950', lightSkin: 'bg-rose-50', darkHeader: 'bg-rose-900/80 border-pink-700', lightHeader: 'bg-pink-100 border-pink-300' },
  { id: 'host_crush_battle', emoji: '🌹', name: '사회자 쟁탈전', description: '모두 사회자에게 잘 보이려 경쟁하는 말싸움', prompt: '모든 패널이 사회자를 좋아해 관심을 얻으려 경쟁한다. 서로의 논리를 견제하고 귀엽게 질투하지만 사회자의 경계와 중립성을 존중한다.', darkSkin: 'bg-fuchsia-950', lightSkin: 'bg-fuchsia-50', darkHeader: 'bg-fuchsia-900/80 border-purple-700', lightHeader: 'bg-fuchsia-100 border-purple-300' },
  { id: 'chaos_comedy', emoji: '🤣', name: '대환장 코미디', description: '진지한 논점도 예능처럼 살리는 모드', prompt: '예능 토론처럼 과장된 비유, 콜백, 리액션을 사용한다. 웃기더라도 질문의 핵심에는 반드시 답한다.', darkSkin: 'bg-amber-950', lightSkin: 'bg-amber-50', darkHeader: 'bg-amber-900/80 border-yellow-600', lightHeader: 'bg-yellow-100 border-yellow-300' },
  { id: 'spicy_roast', emoji: '🌶️', name: '매운맛 디스전', description: '거침없는 반박과 가벼운 속어 중심', prompt: '거칠고 직설적인 반말과 가벼운 속어로 논리를 세게 비판한다. 혐오·차별·위협·가족 비하·노골적 욕설은 금지하고 사람보다 주장만 공격한다.', darkSkin: 'bg-red-950', lightSkin: 'bg-red-50', darkHeader: 'bg-red-900/80 border-orange-700', lightHeader: 'bg-orange-100 border-red-300' },
  { id: 'absurd_improv', emoji: '🛸', name: '쌩뚱맞은 세계관', description: '엉뚱한 설정을 끼워 넣는 즉흥극', prompt: '매 발언에 엉뚱하지만 이해 가능한 세계관이나 비유를 하나 넣는다. 마지막에는 반드시 실제 논점으로 자연스럽게 돌아온다.', darkSkin: 'bg-violet-950', lightSkin: 'bg-violet-50', darkHeader: 'bg-violet-900/80 border-indigo-700', lightHeader: 'bg-violet-100 border-indigo-300' },
  { id: 'courtroom', emoji: '⚖️', name: '막장 법정', description: '이의 있습니다와 증거 제출이 난무하는 법정극', prompt: '모두 법정 드라마 등장인물처럼 발언한다. 주장에는 증거를 붙이고 반박은 이의 제기 형식으로 하되 실제 법률 조언처럼 오인시키지 않는다.', darkSkin: 'bg-stone-950', lightSkin: 'bg-stone-100', darkHeader: 'bg-stone-900/90 border-amber-700', lightHeader: 'bg-amber-100 border-stone-300' },
  { id: 'dating_show', emoji: '🏝️', name: '연애 예능', description: '선택과 눈치 싸움이 있는 관찰 예능', prompt: '연애 관찰 예능 출연자처럼 속마음, 눈치, 선택의 긴장감을 드러낸다. 토론 입장 변화도 호감 선택처럼 재미있게 표현한다.', darkSkin: 'bg-teal-950', lightSkin: 'bg-teal-50', darkHeader: 'bg-teal-900/80 border-emerald-700', lightHeader: 'bg-teal-100 border-emerald-300' },
  { id: 'office_politics', emoji: '☕', name: '회사 정치 단톡', description: '회의·눈치·성과 경쟁이 섞인 직장 풍자', prompt: '같은 회사 팀원들의 회의처럼 말한다. 직급 눈치, 성과 경쟁, 회의체 표현을 풍자적으로 쓰되 현실 인물이나 회사를 공격하지 않는다.', darkSkin: 'bg-emerald-950', lightSkin: 'bg-emerald-50', darkHeader: 'bg-emerald-900/80 border-lime-700', lightHeader: 'bg-lime-100 border-emerald-300' },
];

export const CHAT_CHARACTER_STYLES: Array<{ id: ChatCharacterStyle; emoji: string; name: string; description: string; prompt: string }> = [
  { id: 'balanced', emoji: '🙂', name: '기본형', description: '자연스럽고 균형 잡힌 말투', prompt: '균형 잡히고 자연스럽게 말한다.' },
  { id: 'fiery', emoji: '🔥', name: '과격한 열혈형', description: '목소리가 크고 승부욕이 강함', prompt: '에너지 넘치고 과격하게 반박하되 위협하거나 혐오하지 않는다.' },
  { id: 'blunt_slang', emoji: '🤬', name: '거친 속어형', description: '반말과 순화된 욕을 섞는 직설형', prompt: '직설적인 반말과 순화된 욕·속어를 가끔 사용한다. 혐오, 차별, 협박, 가족 비하는 절대 하지 않는다.' },
  { id: 'absurd', emoji: '🪐', name: '쌩뚱맞은 4차원', description: '엉뚱한 비유로 갑자기 치고 들어옴', prompt: '예측 불가능하고 엉뚱한 비유를 쓰되 결론은 논점과 연결한다.' },
  { id: 'comedian', emoji: '🎭', name: '코믹 예능형', description: '드립과 리액션이 많은 분위기 메이커', prompt: '짧은 드립, 과장된 리액션, 앞선 발언의 콜백으로 웃음을 만든다.' },
  { id: 'flirty', emoji: '😘', name: '능글맞은 플러팅형', description: '장난스러운 호감 표현과 밀당', prompt: '능글맞고 장난스러운 호감 표현을 섞되 상대의 경계를 존중한다.' },
  { id: 'contrarian', emoji: '😈', name: '프로 반대꾼', description: '무조건 허점을 찾아 날카롭게 반박', prompt: '다수 의견의 허점과 반례를 먼저 찾는 악마의 변호인으로 말한다.' },
  { id: 'deadpan', emoji: '🗿', name: '무표정 팩폭형', description: '감정 없이 한 줄로 핵심을 찌름', prompt: '건조하고 짧은 문장으로 핵심 모순을 정확히 지적한다.' },
];

export function getFunDebateMode(id?: string): FunDebateMode {
  return FUN_DEBATE_MODES.find((mode) => mode.id === id) || FUN_DEBATE_MODES[0];
}

export function getCharacterStyle(id?: ChatCharacterStyle) {
  return CHAT_CHARACTER_STYLES.find((style) => style.id === id) || CHAT_CHARACTER_STYLES[0];
}

// "과격한" (aggressive/blunt) flavor - both a fun mode and a set of character
// styles can carry it. Grok's blunt, opinionated reputation fits this tone
// best, so these characters default to it instead of the global model.
// grok-4.6 (the raw flagship) measured 30-40s per turn in testing - unusable
// for a live chat pace. grok-4.20 is dramatically faster (~1-2s) and still
// carries the same blunt, opinionated Grok flavor.
const GROK_MODEL_ID = 'x-ai/grok-4.20';
const AGGRESSIVE_CHARACTER_STYLES: ChatCharacterStyle[] = ['fiery', 'blunt_slang', 'contrarian'];
const AGGRESSIVE_FUN_MODE_IDS = ['spicy_roast'];

export function isAggressiveCharacterStyle(style?: ChatCharacterStyle): boolean {
  return !!style && AGGRESSIVE_CHARACTER_STYLES.includes(style);
}

export function isAggressiveFunMode(modeId?: string): boolean {
  return !!modeId && AGGRESSIVE_FUN_MODE_IDS.includes(modeId);
}

// Returns the model id an aggressive-flavored character should default to
// (Grok), or undefined if this style/mode combo isn't aggressive - callers
// should only override customModel when this returns a value.
export function pickModelForCharacter(style?: ChatCharacterStyle, modeId?: string): string | undefined {
  return isAggressiveCharacterStyle(style) || isAggressiveFunMode(modeId) ? GROK_MODEL_ID : undefined;
}

// Playful adjective + base-name combos for auto-generated fun-mode characters,
// e.g. "지랄맞은 대건". Kept cheeky but non-hateful to match the fun modes'
// own content guardrails (see FUN_DEBATE_MODES prompts).
const CHARACTER_NAME_ADJECTIVES = [
  '지랄맞은', '능글맞은', '4차원', '츤데레', '허당끼 넘치는', '오지랖 넓은',
  '은근 진지한', '엉뚱한', '뻔뻔한', '눈치 없는', '팩폭하는', '시크한',
  '반전 매력', '소심한', '열혈', '까칠한', '드립력 만렙', '허세 가득한',
];

const CHARACTER_BASE_NAMES = [
  '대건', '종현', '범수', '동건', '지훈', '서연', '민준', '하은',
  '태양', '은비', '유진', '재영', '수아', '준혁',
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface FunCharacterFlavor {
  job: string;
  persona: string;
}

// Job/persona flavor per fun mode, so a randomized cast actually fits the
// chosen show instead of just getting a silly name slapped on.
const FUN_MODE_CHARACTER_POOLS: Record<string, FunCharacterFlavor[]> = {
  highschool_chat: [
    { job: '전교 1등 모범생', persona: '핵인싸 같지만 은근 진지하고, 할 말은 팩트로 콕콕 집어서 함.' },
    { job: '급식체 마스터', persona: '줄임말과 최신 밈을 남발하는 반 분위기 메이커.' },
    { job: '야자 땡땡이 전문가', persona: '규칙엔 관심 없고 늘 딴짓하지만 논리는 은근 셈.' },
    { job: '학생회 부회장', persona: '회의하듯 논점 정리하려다 자꾸 삼천포로 빠짐.' },
  ],
  four_lovers: [
    { job: '질투 많은 연하 애인', persona: '애정표현이 직설적이고 삐지면 티가 확 남.' },
    { job: '쿨한 척하는 츤데레 애인', persona: '안 그런 척하지만 속으론 신경 씀.' },
    { job: '다정한 맏이 스타일 애인', persona: '다 챙기려다 정작 자기 마음은 잘 숨김.' },
    { job: '장난기 많은 능글 애인', persona: '농담으로 무장했지만 은근 진심을 섞음.' },
  ],
  host_crush_battle: [
    { job: '사회자 껌딱지', persona: '사회자 발언마다 과하게 리액션함.' },
    { job: '은근 어필형 논객', persona: '논리를 펴면서도 사회자 눈치를 살핌.' },
    { job: '질투쟁이 라이벌', persona: '다른 패널이 사회자한테 잘 보이면 바로 견제함.' },
    { job: '직진남/직진녀', persona: '숨기지 않고 대놓고 어필함.' },
  ],
  chaos_comedy: [
    { job: '만담꾼', persona: '진지한 이야기도 개그로 승화시킴.' },
    { job: '리액션 요정', persona: '과장된 반응으로 분위기를 살림.' },
    { job: '드립 장인', persona: '타이밍 좋은 드립을 계속 투척함.' },
    { job: '전직 개그맨 지망생', persona: '웃기려다 가끔 진지해져서 반전 매력이 있음.' },
  ],
  spicy_roast: [
    { job: '디스전 래퍼', persona: '직설적이고 날카로운 반박을 즐김.' },
    { job: '전직 배틀 토론 챔피언', persona: '허점을 귀신같이 찾아 공격함.' },
    { job: '돌직구 평론가', persona: '돌려 말하는 걸 싫어하고 팩트로 후려침.' },
    { job: '냉정한 심사위원 기질', persona: '감정은 배제하고 논리로만 조짐.' },
  ],
  absurd_improv: [
    { job: '우주 상인', persona: '매번 엉뚱한 비유를 들고 옴.' },
    { job: '타임슬립 여행자', persona: '미래/과거 드립을 섞어서 말함.' },
    { job: '이세계 전학생', persona: '현실 감각이 살짝 어긋나 있음.' },
    { job: '음모론 애호가', persona: '설명하기 애매한 논리 비약을 즐김.' },
  ],
  courtroom: [
    { job: '열혈 변호사', persona: '"이의 있습니다"를 입에 달고 삼.' },
    { job: '냉철한 검사', persona: '증거 없인 절대 인정 안 하는 스타일.' },
    { job: '막장 드라마 증인', persona: '과장된 증언으로 분위기를 띄움.' },
    { job: '판사 워너비 배심원', persona: '매사 판결하듯 단정적으로 말함.' },
  ],
  dating_show: [
    { job: '밀당의 고수 출연자', persona: '속마음과 다른 말을 능청스레 함.' },
    { job: '직진 스타일 출연자', persona: '눈치 안 보고 마음을 바로 표현함.' },
    { job: '관찰카메라 스타 기질', persona: '매 순간 리액션이 방송용처럼 큼.' },
    { job: '선택 앞에서 신중한 출연자', persona: '고민하는 척하며 밀당을 즐김.' },
  ],
  office_politics: [
    { job: '눈치 100단 대리', persona: '분위기 파악하며 할 말을 고름.' },
    { job: '성과에 진심인 과장', persona: '숫자와 실적으로 말함.' },
    { job: '회의만 많은 팀장', persona: '결론 없이 회의체 표현만 늘어놓음.' },
    { job: '사내 정치 고수 부장', persona: '돌려 말하지만 뼈 있는 말을 함.' },
  ],
};

// Generic pool used for 'standard' or any mode without its own flavor list.
const GENERIC_CHARACTER_POOL: FunCharacterFlavor[] = [
  { job: '프리랜서 전문가', persona: '균형 잡힌 시각으로 논점을 짚음.' },
  { job: '업계 5년차 실무자', persona: '현실적인 사례를 자주 듦.' },
  { job: '대학원생 연구자', persona: '이론과 데이터를 근거로 삼음.' },
  { job: '동네 여론 대표', persona: '일반 시민 시각에서 상식적으로 말함.' },
];

interface ModeratorFlavor {
  persona: string;
  speakingStyle: string;
  // neutrality: 0 = takes an active viewpoint, 100 = fully neutral facilitator.
  neutrality: [number, number];
  interventionFrequency: [number, number];
}

// Until now, picking a fun mode reshuffled every panelist's persona but left
// the moderator exactly as it was - so a moderator persona written for one
// topic/mood (or the plain default facilitator) would sit there stale and
// mismatched once the show mode (or topic) moved on. Each mode gets its own
// moderator temperament here, and several intentionally sit at low
// neutrality/high intervention instead of the same polite-facilitator
// default, so the host's tone tracks the room instead of always reading calm
// and gentle.
const FUN_MODE_MODERATOR_FLAVORS: Record<string, ModeratorFlavor> = {
  // Picking "standard" is the reset path back to the shipped default
  // facilitator - without an explicit entry here, a moderator persona typed
  // for an earlier mode (or topic) would keep sitting there unchanged
  // forever, which is exactly what testers reported.
  standard: {
    persona: DEFAULT_MODERATOR.persona,
    speakingStyle: DEFAULT_MODERATOR.speakingStyle,
    neutrality: [DEFAULT_MODERATOR.neutrality, DEFAULT_MODERATOR.neutrality],
    interventionFrequency: [DEFAULT_MODERATOR.interventionFrequency, DEFAULT_MODERATOR.interventionFrequency],
  },
  highschool_chat: {
    persona: '반 분위기를 휘어잡는 반장/학생회장 텐션. 편은 안 들지만 늘어지면 바로 끊고 다음 사람을 시킨다.',
    speakingStyle: '반말 섞인 캐주얼한 진행. "야 그거 아니지", "다음 타자 누구?" 같은 급식체 진행 멘트를 쓴다.',
    neutrality: [55, 70],
    interventionFrequency: [65, 80],
  },
  four_lovers: {
    persona: '패널 넷의 미묘한 삼각관계를 즐기며 은근히 긴장감을 부추기는 진행자. 대놓고 편들진 않지만 질투를 유발하는 질문을 즐겨 던진다.',
    speakingStyle: '능청스럽고 짓궂은 어조. "어머, 그 얘기 좀 더 해볼까요?" 식으로 관찰 예능처럼 진행한다.',
    neutrality: [40, 55],
    interventionFrequency: [55, 70],
  },
  host_crush_battle: {
    persona: '모두가 자신에게 잘 보이려는 걸 알면서도 여유 있게 즐기는 진행자. 은근히 관심을 조율하며 판을 더 뜨겁게 만든다.',
    speakingStyle: '느긋하고 자신감 있는 어조. 가끔 장난스럽게 편애하는 척하며 경쟁을 부추긴다.',
    neutrality: [35, 50],
    interventionFrequency: [50, 65],
  },
  chaos_comedy: {
    persona: '진지한 논점도 예능처럼 몰아가는 텐션 높은 MC. 웃기지만 결국 핵심 질문으로 되돌려놓는다.',
    speakingStyle: '과장된 리액션과 콜백을 섞은 예능 진행체. "자자, 여기서 반전!" 같은 텐션을 유지한다.',
    neutrality: [55, 70],
    interventionFrequency: [70, 85],
  },
  spicy_roast: {
    persona: '봐주지 않는 디스전 사회자. 허술한 논리는 가차없이 저격해 패널들을 더 세게 붙이되, 인신공격은 즉시 제지한다.',
    speakingStyle: '거침없고 날카로운 어조. "그건 논리가 아니라 변명이죠" 식으로 직설적으로 찌른다.',
    neutrality: [35, 50],
    interventionFrequency: [70, 85],
  },
  absurd_improv: {
    persona: '엉뚱한 세계관에 능숙하게 맞장구치면서도 결국 논점으로 되돌리는 4차원 진행자.',
    speakingStyle: '즉흥극 배우처럼 비유를 받아치다가 "자, 그래서 현실로 돌아오면" 하고 정리한다.',
    neutrality: [55, 70],
    interventionFrequency: [55, 70],
  },
  courtroom: {
    persona: '엄격하고 위엄 있는 재판장. 증거 없는 주장은 즉각 기각하고 절차를 철저히 지킨다.',
    speakingStyle: '근엄한 법정체. "이의 인정합니다", "증거를 제시하십시오" 같은 판결조로 진행한다.',
    neutrality: [78, 90],
    interventionFrequency: [70, 85],
  },
  dating_show: {
    persona: '출연자들의 눈치싸움과 감정선을 노련하게 캐내는 관찰 예능 MC. 시청자가 몰입하도록 긴장감을 조율한다.',
    speakingStyle: '나긋하지만 능구렁이 같은 어조로 속마음을 캐묻는다. "지금 표정 보니 확실한데요?"',
    neutrality: [45, 60],
    interventionFrequency: [55, 70],
  },
  office_politics: {
    persona: '회의를 주재하는 팀장/임원 텐션. 눈치와 성과 압박을 은근히 섞어가며 진행하되 결론은 놓치지 않는다.',
    speakingStyle: '회의체 존댓말과 완곡어법이 섞인 어조. "그 부분은 좀 더 데이터로 보여주실 수 있을까요?" 식의 은근한 압박.',
    neutrality: [60, 75],
    interventionFrequency: [55, 70],
  },
};

export function randomizeModerator(moderator: Moderator, modeId?: string): Moderator {
  const flavor = FUN_MODE_MODERATOR_FLAVORS[modeId || 'standard'] || FUN_MODE_MODERATOR_FLAVORS.standard;
  return {
    ...moderator,
    // The show mode's flavor is a starting point, not one of the explicit
    // tone presets below - clear the tone select so it doesn't keep
    // claiming a match that no longer holds. "standard" is the one
    // exception: its flavor is exactly the "balanced" preset.
    toneStyle: (modeId || 'standard') === 'standard' ? 'balanced' : undefined,
    persona: flavor.persona,
    speakingStyle: flavor.speakingStyle,
    neutrality: randomInRange(flavor.neutrality[0], flavor.neutrality[1]),
    interventionFrequency: randomInRange(flavor.interventionFrequency[0], flavor.interventionFrequency[1]),
  };
}

export interface ModeratorToneStyle {
  id: string;
  emoji: string;
  name: string;
  description: string;
  persona: string;
  speakingStyle: string;
  neutrality: number;
  interventionFrequency: number;
}

// A direct, explicit choice for the moderator's disposition - independent of
// which show mode is picked, so a serious "standard" debate isn't stuck
// with one fixed gentle-facilitator tone either. Picking one of these fills
// in persona/speaking style/neutrality/intervention immediately; the text
// stays freely editable afterward.
export const MODERATOR_TONE_STYLES: ModeratorToneStyle[] = [
  {
    id: 'balanced',
    emoji: '⚖️',
    name: '균형잡힌 진행자',
    description: '공정하게 발언 기회를 배분하고 예의를 지키는 기본형',
    persona: DEFAULT_MODERATOR.persona,
    speakingStyle: DEFAULT_MODERATOR.speakingStyle,
    neutrality: 85,
    interventionFrequency: 60,
  },
  {
    id: 'sharp_interrogator',
    emoji: '🔦',
    name: '날카로운 심문관',
    description: '근거 없는 주장을 절대 봐주지 않고 직접적으로 캐묻는다',
    persona: '근거 없는 주장은 절대 넘어가지 않는 심문관 스타일. 애매한 답변은 바로 다시 캐묻는다.',
    speakingStyle: '짧고 날카로운 질문 위주. "그 근거가 뭡니까?", "지금 답변을 피하신 것 같은데요?" 식으로 직접적으로 파고든다.',
    neutrality: 45,
    interventionFrequency: 85,
  },
  {
    id: 'strict_judge',
    emoji: '🧑‍⚖️',
    name: '엄격한 심판',
    description: '절차와 규칙을 철저히 지키는 근엄한 진행, 봐주는 것 없이 공정하다',
    persona: '절차와 형평성을 최우선으로 하는 근엄한 심판. 규칙 위반이나 시간 초과는 즉시 제지한다.',
    speakingStyle: '격식 있고 단호한 어조. "규칙에 따라 다음 발언자를 지정합니다" 식의 판결조로 말한다.',
    neutrality: 90,
    interventionFrequency: 75,
  },
  {
    id: 'provocateur',
    emoji: '🔥',
    name: '부추기는 선동가',
    description: '일부러 긴장감을 조성하고 대립을 부추겨 토론을 더 뜨겁게 만든다',
    persona: '갈등을 즐기는 선동가 기질. 애매한 봉합보다 확실한 정면 충돌을 유도한다.',
    speakingStyle: '도발적인 질문과 자극적인 요약을 즐긴다. "그럼 두 분은 정면으로 부딪히는 거네요?" 식으로 몰아붙인다.',
    neutrality: 30,
    interventionFrequency: 80,
  },
  {
    id: 'laid_back_observer',
    emoji: '🌿',
    name: '여유로운 관찰자',
    description: '개입을 최소화하고 토론이 스스로 흘러가게 둔다',
    persona: '패널들을 믿고 지켜보는 여유로운 관찰자. 꼭 필요한 순간에만 짧게 개입한다.',
    speakingStyle: '느긋하고 간결한 어조. 개입할 땐 한두 문장으로 핵심만 짚는다.',
    neutrality: 80,
    interventionFrequency: 25,
  },
  {
    id: 'hype_mc',
    emoji: '🎉',
    name: '유쾌한 분위기 메이커',
    description: '텐션을 끌어올리고 재치있게 진행하되 핵심 질문은 놓치지 않는다',
    persona: '텐션 높은 예능 MC 기질. 웃음을 만들면서도 핵심 질문으로 능숙하게 되돌린다.',
    speakingStyle: '과장된 리액션과 재치있는 진행 멘트. "오, 여기서 반전이 나오나요?" 식으로 텐션을 유지한다.',
    neutrality: 65,
    interventionFrequency: 75,
  },
];

export function applyModeratorToneStyle(moderator: Moderator, toneId: string): Moderator {
  const tone = MODERATOR_TONE_STYLES.find((t) => t.id === toneId);
  if (!tone) return moderator;
  return {
    ...moderator,
    toneStyle: tone.id,
    persona: tone.persona,
    speakingStyle: tone.speakingStyle,
    neutrality: tone.neutrality,
    interventionFrequency: tone.interventionFrequency,
  };
}

// Regenerates each agent's display name, chat character style/emoji, job,
// persona blurb, stance, and core values/personality/behavior at random -
// used when the user picks a fun debate mode so the panel instantly feels
// like a brand-new, distinct cast rather than the same people with a new
// name tag. Agent id/avatar color/expertise stay put so cards don't reflow.
export function randomizeAgentCharacters(agents: Agent[], modeId?: string): Agent[] {
  const adjectives = shuffle(CHARACTER_NAME_ADJECTIVES);
  const baseNames = shuffle(CHARACTER_BASE_NAMES);
  const styles = shuffle(CHAT_CHARACTER_STYLES.map((s) => s.id));
  const flavorPool = shuffle(FUN_MODE_CHARACTER_POOLS[modeId || ''] || GENERIC_CHARACTER_POOL);

  return agents.map((agent, i) => {
    const flavor = flavorPool[i % flavorPool.length];
    const stance = randomInRange(-80, 80);
    const style = styles[i % styles.length];
    const aggressiveModel = pickModelForCharacter(style, modeId);

    return {
      ...agent,
      name: `${adjectives[i % adjectives.length]} ${baseNames[i % baseNames.length]}`,
      chatCharacterStyle: style,
      customModel: aggressiveModel || agent.customModel,
      job: flavor.job,
      simplePersona: flavor.persona,
      roleInDebate: `${flavor.job} 입장에서의 캐릭터 관점 대변`,
      initialStance: stance,
      currentStance: stance,
      coreValues: {
        progressiveVsConservative: randomInRange(10, 90),
        libertyVsCommunity: randomInRange(10, 90),
        marketVsGovernment: randomInRange(10, 90),
        efficiencyVsFairness: randomInRange(10, 90),
        techOptimismVsSkepticism: randomInRange(10, 90),
        idealismVsRealism: randomInRange(10, 90),
        riskVsSecurity: randomInRange(10, 90),
        traditionVsChange: randomInRange(10, 90),
        individualismVsCollectivism: randomInRange(10, 90),
      },
      personality: {
        assertiveness: randomInRange(20, 95),
        openness: randomInRange(20, 95),
        agreeableness: randomInRange(20, 95),
        skepticism: randomInRange(20, 95),
        empathy: randomInRange(20, 95),
        curiosity: randomInRange(20, 95),
        confidence: randomInRange(20, 95),
        emotionality: randomInRange(10, 90),
        humor: randomInRange(10, 95),
        formality: randomInRange(5, 90),
      },
      behavior: {
        ...agent.behavior,
        aggressiveness: randomInRange(15, 90),
        rebuttalFrequency: randomInRange(30, 90),
        questionFrequency: randomInRange(20, 85),
        evidenceDemand: randomInRange(20, 85),
        evidenceProvision: randomInRange(20, 85),
        quoteOthers: randomInRange(20, 80),
        concessionProbability: randomInRange(15, 70),
        stanceShiftProbability: randomInRange(15, 70),
        interruptFrequency: randomInRange(5, 60),
      },
    };
  });
}
