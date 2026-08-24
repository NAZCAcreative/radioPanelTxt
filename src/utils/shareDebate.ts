import { supabase } from '../services/supabaseClient';
import type { DebateSessionState, DebateSettings } from '../types/debate';
import { hashApiKey, nicknameFromKeyHash } from './anonymousIdentity';

export interface SharedDebatePayload {
  topic: string;
  ownerName: string | null;
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

export interface MyDebateSummary {
  id: string;
  topic: string;
  createdAt: string;
}

// Uploads a read-only snapshot of the current debate and returns a
// shareable URL (?share=<id>). The API key never leaves the browser for
// live LLM calls - and it must not leave the browser for this either, so
// it's stripped before the row is ever built. A hash of the key (never the
// key itself) tags the row with a stable, deterministic nickname so a
// "내 토론 목록" list is possible without any account system.
export async function createShareLink(
  settings: DebateSettings,
  session: DebateSessionState
): Promise<string> {
  const { apiKey: _apiKey, ...safeSettings } = settings;

  const ownerKeyHash = settings.apiKey ? await hashApiKey(settings.apiKey) : null;
  const ownerName = ownerKeyHash ? nicknameFromKeyHash(ownerKeyHash) : null;

  // Same claim-id dedupe as the end-of-debate report, so a share doesn't
  // carry the pre-fix duplicate claims an older local session might have.
  const uniqueClaims = Array.from(new Map(session.claims.map((c) => [c.claimId, c])).values());

  const payload: SharedDebatePayload = {
    topic: settings.topic,
    ownerName,
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
    .insert({ topic: settings.topic, payload, owner_key_hash: ownerKeyHash, owner_name: ownerName })
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

// Every debate shared under the same API key, newest first - "who I am" is
// just the deterministic nickname derived from that key's hash, so this is
// really "list rows where owner_key_hash matches mine".
export async function listMyDebates(apiKey: string): Promise<MyDebateSummary[]> {
  if (!apiKey.trim()) return [];
  const ownerKeyHash = await hashApiKey(apiKey);

  const { data, error } = await supabase
    .from('shared_debates')
    .select('id, topic, created_at')
    .eq('owner_key_hash', ownerKeyHash)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`목록을 불러오지 못했습니다: ${error.message}`);
  return (data || []).map((row) => ({ id: row.id, topic: row.topic, createdAt: row.created_at }));
}
