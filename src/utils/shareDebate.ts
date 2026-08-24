import { supabase } from '../services/supabaseClient';
import type { DebateSessionState, DebateSettings } from '../types/debate';

export interface SharedDebatePayload {
  topic: string;
  settings: Omit<DebateSettings, 'apiKey'>;
  messages: DebateSessionState['messages'];
  claims: DebateSessionState['claims'];
  decisionLogs: DebateSessionState['decisionLogs'];
  stanceHistory: DebateSessionState['stanceHistory'];
  reflections: DebateSessionState['reflections'];
  consensusSnapshots: DebateSessionState['consensusSnapshots'];
  initialStances: DebateSessionState['initialStances'];
  currentStances: DebateSessionState['currentStances'];
}

// Uploads a read-only snapshot of the current debate and returns a
// shareable URL (?share=<id>). The API key never leaves the browser for
// live LLM calls - and it must not leave the browser for this either, so
// it's stripped before the row is ever built.
export async function createShareLink(
  settings: DebateSettings,
  session: DebateSessionState
): Promise<string> {
  const { apiKey: _apiKey, ...safeSettings } = settings;

  // Same claim-id dedupe as the end-of-debate report, so a share doesn't
  // carry the pre-fix duplicate claims an older local session might have.
  const uniqueClaims = Array.from(new Map(session.claims.map((c) => [c.claimId, c])).values());

  const payload: SharedDebatePayload = {
    topic: settings.topic,
    settings: safeSettings,
    messages: session.messages,
    claims: uniqueClaims,
    decisionLogs: session.decisionLogs,
    stanceHistory: session.stanceHistory,
    reflections: session.reflections,
    consensusSnapshots: session.consensusSnapshots,
    initialStances: session.initialStances,
    currentStances: session.currentStances,
  };

  const { data, error } = await supabase
    .from('shared_debates')
    .insert({ topic: settings.topic, payload })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`공유 링크 생성에 실패했습니다: ${error?.message || '알 수 없는 오류'}`);
  }

  const url = new URL(window.location.href);
  url.search = `share=${data.id}`;
  url.hash = '';
  return url.toString();
}

export async function fetchSharedDebate(id: string): Promise<SharedDebatePayload> {
  const { data, error } = await supabase
    .from('shared_debates')
    .select('payload')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error('공유된 토론을 찾을 수 없습니다. 링크가 잘못되었거나 삭제되었을 수 있습니다.');
  }
  return data.payload as SharedDebatePayload;
}
