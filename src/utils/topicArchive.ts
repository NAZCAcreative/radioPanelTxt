import type { DiscussionGoal } from '../types/debate';

const STORAGE_KEY = 'panelogue.savedTopics';
const MAX_SAVED_TOPICS = 50;

export interface SavedTopic {
  id: string;
  label: string;
  topic: string;
  backgroundContext: string;
  discussionGoal: DiscussionGoal;
  savedAt: number;
}

function readTopics(): SavedTopic[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTopics(topics: SavedTopic[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
}

export function listSavedTopics(): SavedTopic[] {
  return readTopics().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveTopic(
  topic: string,
  backgroundContext: string,
  discussionGoal: DiscussionGoal,
  label?: string
): SavedTopic {
  const trimmedTopic = topic.trim();
  if (!trimmedTopic) throw new Error('저장할 토론 주제를 먼저 입력해주세요.');

  const entry: SavedTopic = {
    id: `topic_${Date.now()}`,
    label: label?.trim() || trimmedTopic.slice(0, 50),
    topic: trimmedTopic,
    backgroundContext: backgroundContext.trim(),
    discussionGoal,
    savedAt: Date.now(),
  };
  writeTopics([entry, ...readTopics()].slice(0, MAX_SAVED_TOPICS));
  return entry;
}

export function deleteSavedTopic(id: string) {
  writeTopics(readTopics().filter((topic) => topic.id !== id));
}
