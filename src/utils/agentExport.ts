// DEBATE LAB - Agent Persona Export Helpers
// Produces files meant to leave this app: a paste-ready plain-text system
// prompt for use in other chat tools, and a JSON backup that can be
// re-imported here (or on another browser/device) later.

import type { Agent, DebateSettings } from '../types/debate';
import { generateAgentSystemPrompt } from './promptBuilder';

const EXPORT_FORMAT_VERSION = 1;

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'agent';
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// The exported .txt is exactly the compiled system prompt, nothing added,
// so it can be pasted directly as-is into another site's "system prompt" /
// "custom instructions" field.
export function exportAgentPromptAsText(agent: Agent, settings: DebateSettings) {
  const prompt = generateAgentSystemPrompt(agent, settings);
  downloadTextFile(`${safeFileName(agent.name)}_persona_prompt.txt`, prompt);
}

export function exportAgentAsJson(agent: Agent) {
  downloadJsonFile(`${safeFileName(agent.name)}_agent_config.json`, {
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    agent,
  });
}

export async function copyAgentPromptToClipboard(agent: Agent, settings: DebateSettings) {
  const prompt = generateAgentSystemPrompt(agent, settings);
  await navigator.clipboard.writeText(prompt);
}
