// PANELOGUE - Optional Browser-Local Full Settings Persistence
// Only used when the user explicitly opts into keyStorage: 'localstorage'.
// Persists the ENTIRE DebateSettings object - topic, agents (including each
// agent's own API key override), moderator (including its key override),
// and every policy slider - not just the global API key. This way turning
// "키 저장" on preserves the whole configured workspace across a reload.

import type { DebateSettings } from '../types/debate';

const STORAGE_KEY = 'debateLab.savedSettings';
const LEGACY_STORAGE_KEY = 'debateLab.apiKeyStore'; // pre-fullsettings format, no longer used

try {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
} catch {
  // ignore
}

export function loadSavedSettings(): Partial<DebateSettings> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.keyStorage === 'localstorage') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function syncSettingsPersistence(settings: DebateSettings) {
  try {
    if (settings.keyStorage === 'localstorage') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private mode / quota) - silently skip persistence
  }
}
