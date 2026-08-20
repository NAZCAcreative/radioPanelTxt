// DEBATE LAB - Korean display labels for internal English enum values.
// The engine/types use English identifiers internally, but the UI should
// never show a raw English enum value to the user without translation.

import type { DebatePhase, MessageMetadata } from '../types/debate';

export const PHASE_LABELS: Record<DebatePhase, string> = {
  Opening: '오프닝 (입장 발표)',
  Exploration: '탐색',
  Challenge: '반박',
  Reflection: '성찰',
  FinalPosition: '최종 입장',
  Completed: '완료',
};

export function getPhaseLabel(phase: DebatePhase): string {
  return PHASE_LABELS[phase] ?? phase;
}

export const PHASE_EXPLANATION =
  '토론은 오프닝(각자 입장 발표) → 탐색 → 반박 → 성찰 → 최종 입장 순서로 자동 진행되다가 완료됩니다.';

type SpeechAct = NonNullable<MessageMetadata['speechAct']>;

export const SPEECH_ACT_LABELS: Record<SpeechAct, string> = {
  claim: '주장',
  rebuttal: '반박',
  question: '질문',
  concession: '양보',
  clarification: '설명',
  moderation: '진행',
};

export function getSpeechActLabel(act?: string): string {
  if (!act) return act ?? '';
  return SPEECH_ACT_LABELS[act as SpeechAct] ?? act;
}
