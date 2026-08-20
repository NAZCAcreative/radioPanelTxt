// PANELOGUE - Local Session Save / Load Archive (browser localStorage)

import type { DebateSessionState, DebateSettings } from '../types/debate';

const STORAGE_KEY = 'debateLab.savedSessions';
const MAX_SAVED = 20;

export interface SavedDebateSession {
  id: string;
  label: string;
  savedAt: number;
  topic: string;
  turnCount: number;
  messageCount: number;
  settings: DebateSettings;
  session: DebateSessionState;
}

function readAll(): SavedDebateSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: SavedDebateSession[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function listSavedSessions(): SavedDebateSession[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveSession(
  settings: DebateSettings,
  session: DebateSessionState,
  label?: string
): SavedDebateSession {
  const entry: SavedDebateSession = {
    id: `saved_${Date.now()}`,
    label: label?.trim() || settings.topic.slice(0, 40) || '제목 없는 토론',
    savedAt: Date.now(),
    topic: settings.topic,
    turnCount: session.currentTurn,
    messageCount: session.messages.length,
    settings,
    session,
  };

  const items = [entry, ...readAll()].slice(0, MAX_SAVED);
  if (!writeAll(items)) {
    throw new Error('브라우저 저장 공간이 부족하거나 저장 기능을 사용할 수 없습니다.');
  }
  return entry;
}

export function deleteSavedSession(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}

export function getSavedSession(id: string): SavedDebateSession | undefined {
  return readAll().find((s) => s.id === id);
}
