import React, { useState } from 'react';
import { X, Save, FolderOpen, Trash2, Clock, MessageSquare } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import {
  deleteSavedSession,
  listSavedSessions,
  saveSession,
  type SavedDebateSession,
} from '../../utils/sessionArchive';

interface SessionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatSavedAt(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const SessionManagerModal: React.FC<SessionManagerModalProps> = ({ isOpen, onClose }) => {
  const { settings, session, restoreSession } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  const [label, setLabel] = useState('');
  const [savedList, setSavedList] = useState<SavedDebateSession[]>(() => listSavedSessions());
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const entry = saveSession(settings, session, label);
      setSavedList(listSavedSessions());
      setJustSavedId(entry.id);
      setSaveError(null);
      setLabel('');
      setTimeout(() => setJustSavedId(null), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '세션을 저장하지 못했습니다.');
    }
  };

  const handleLoad = (id: string) => {
    const target = savedList.find((s) => s.id === id);
    if (!target) return;
    if (
      session.messages.length > 0 &&
      !window.confirm('현재 진행 중인 토론 내용을 덮어쓰고 저장된 토론을 불러옵니다. 계속할까요?')
    ) {
      return;
    }
    restoreSession(target.settings, target.session);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('이 저장된 토론을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    deleteSavedSession(id);
    setSavedList(listSavedSessions());
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="세션 저장 및 불러오기" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}
        >
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Save className="w-5 h-5 text-emerald-600" />
            <span>세션 저장 / 불러오기</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700 bg-slate-200/60' : 'text-gray-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar text-sm">
          {saveError && <p className="rounded-lg bg-rose-50 p-2 text-rose-700">{saveError}</p>}
          {/* Save Current Session */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
            }`}
          >
            <span className="font-bold text-sm block text-emerald-600 dark:text-emerald-400">
              현재 토론 저장하기
            </span>
            <p className="text-[14px] text-slate-500">
              설정, 진행 상황, 대화 기록을 이 브라우저에 저장합니다. (현재 {session.messages.length}개 발언, {session.currentTurn}턴 진행)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={settings.topic.slice(0, 30) || '저장할 이름 (선택)'}
                className={`flex-1 border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-gray-900 border-gray-700 text-gray-100'
                }`}
              />
              <button
                onClick={handleSave}
                disabled={session.messages.length === 0}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-sm transition shrink-0"
              >
                저장
              </button>
            </div>
          </div>

          {/* Saved Sessions List */}
          <div className="space-y-2">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>저장된 토론 ({savedList.length})</span>
            </span>

            {savedList.length === 0 ? (
              <p className="text-slate-400 italic px-1">아직 저장된 토론이 없습니다.</p>
            ) : (
              <div className="space-y-1.5">
                {savedList.map((s) => (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                      justSavedId === s.id
                        ? 'bg-emerald-50 border-emerald-400'
                        : isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-gray-950 border-gray-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{s.label}</div>
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatSavedAt(s.savedAt)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {s.messageCount}개 발언 · {s.turnCount}턴
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoad(s.id)}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[14px] shrink-0 whitespace-nowrap transition"
                    >
                      불러오기
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0 transition"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
