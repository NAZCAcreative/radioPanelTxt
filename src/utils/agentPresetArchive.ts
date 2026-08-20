// PANELOGUE - Local Agent Persona Preset Archive (browser localStorage)
// Distinct from sessionArchive.ts: this saves a single tuned Agent config,
// independent of any debate session, so a good persona can be found, kept,
// and reused (in this app or exported elsewhere) on its own.

import type { Agent } from '../types/debate';

const STORAGE_KEY = 'debateLab.agentPresets';
const MAX_SAVED = 50;

export interface SavedAgentPreset {
  id: string;
  label: string;
  savedAt: number;
  agent: Agent;
}

function readAll(): SavedAgentPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: SavedAgentPreset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable or quota exceeded - silently skip persistence
  }
}

export function listAgentPresets(): SavedAgentPreset[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveAgentPreset(agent: Agent, label?: string): SavedAgentPreset {
  const entry: SavedAgentPreset = {
    id: `agentpreset_${Date.now()}`,
    label: label?.trim() || `${agent.name} · ${agent.job}`,
    savedAt: Date.now(),
    agent,
  };

  const items = [entry, ...readAll()].slice(0, MAX_SAVED);
  writeAll(items);
  return entry;
}

export function deleteAgentPreset(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

// Minimal shape check for JSON files imported from disk (could be from another
// browser/device, or a previously exported preset), before trusting the data.
export function isValidAgentShape(data: unknown): data is Agent {
  if (!data || typeof data !== 'object') return false;
  const a = data as Record<string, unknown>;
  return (
    typeof a.name === 'string' &&
    typeof a.job === 'string' &&
    typeof a.simplePersona === 'string' &&
    typeof a.coreValues === 'object' &&
    typeof a.personality === 'object' &&
    typeof a.behavior === 'object' &&
    typeof a.epistemic === 'object'
  );
}

export function importAgentPresetFromFile(file: File): Promise<SavedAgentPreset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const agent: unknown = parsed?.agent ?? parsed; // accept both the exported envelope and a raw Agent
        if (!isValidAgentShape(agent)) {
          reject(new Error('올바른 에이전트 설정 파일이 아닙니다.'));
          return;
        }
        resolve(saveAgentPreset(agent, `${agent.name} · ${agent.job} (가져옴)`));
      } catch {
        reject(new Error('JSON 파일을 읽을 수 없습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsText(file);
  });
}
