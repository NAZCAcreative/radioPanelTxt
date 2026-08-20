import React, { useRef, useState } from 'react';
import { X, Drama, UserPlus, Trash2, Clock, FileText, Code, Upload } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import {
  deleteAgentPreset,
  importAgentPresetFromFile,
  listAgentPresets,
  type SavedAgentPreset,
} from '../../utils/agentPresetArchive';
import { exportAgentAsJson, exportAgentPromptAsText } from '../../utils/agentExport';

interface AgentPresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatSavedAt(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const AgentPresetLibraryModal: React.FC<AgentPresetLibraryModalProps> = ({ isOpen, onClose }) => {
  const { settings, addAgentFromPreset } = useDebateStore();
  const isLight = settings.theme !== 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [presets, setPresets] = useState<SavedAgentPreset[]>(() => listAgentPresets());
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const rosterFull = settings.agents.length >= 10;

  const handleApply = (preset: SavedAgentPreset) => {
    addAgentFromPreset(preset.agent);
    setJustAddedId(preset.id);
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('이 저장된 에이전트 프리셋을 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
    deleteAgentPreset(id);
    setPresets(listAgentPresets());
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImportError(null);
      await importAgentPresetFromFile(file);
      setPresets(listAgentPresets());
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '가져오기에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-start justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}
        >
          <div className="min-w-0 flex-1">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Drama className="w-5 h-5 text-pink-600 shrink-0" />
              <span>에이전트 프리셋 라이브러리</span>
            </h2>
            <p className="text-[14px] text-slate-500 mt-0.5">
              잘 만든 에이전트 페르소나를 저장해두고, 나중에 다시 불러오거나 다른 사이트에서 쓸 프롬프트로 내보내세요.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg shrink-0 ${isLight ? 'text-slate-400 hover:text-slate-700 bg-slate-200/60' : 'text-gray-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar text-sm">
          {/* Import */}
          <div
            className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="font-bold block">JSON 파일에서 가져오기</span>
              <span className="text-[14px] text-slate-500">
                이전에 내보낸 에이전트 설정(.json)을 불러와 라이브러리에 추가합니다. 다른 브라우저/기기에서도 사용 가능.
              </span>
            </div>
            <button
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm transition shrink-0 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>가져오기</span>
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          </div>
          {importError && (
            <p className="text-[14px] text-rose-500 font-semibold px-1">⚠️ {importError}</p>
          )}

          {/* Saved Presets List */}
          <div className="space-y-2">
            <div className="font-bold text-sm flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="shrink-0 whitespace-nowrap">저장된 에이전트 ({presets.length})</span>
              {rosterFull && (
                <span className="text-[13px] text-amber-500 font-semibold">현재 참가자가 10명이라 추가할 수 없습니다</span>
              )}
            </div>

            {presets.length === 0 ? (
              <p className="text-slate-400 italic px-1">
                아직 저장된 에이전트가 없습니다. "기본 설정" 탭의 각 에이전트 카드에서 "💾 프리셋 저장"을 눌러보세요.
              </p>
            ) : (
              <div className="space-y-1.5">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                      justAddedId === p.id
                        ? 'bg-emerald-50 border-emerald-400'
                        : isLight
                        ? 'bg-white border-slate-200'
                        : 'bg-gray-950 border-gray-800'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.agent.avatarColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{p.label}</div>
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-400 mt-0.5">
                        <span className="truncate">{p.agent.job}</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatSavedAt(p.savedAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => exportAgentPromptAsText(p.agent, settings)}
                      className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 shrink-0 transition"
                      title="TXT 프롬프트로 내보내기 (다른 사이트에 붙여넣기용)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => exportAgentAsJson(p.agent)}
                      className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 shrink-0 transition"
                      title="JSON으로 내보내기 (백업 / 재가져오기용)"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApply(p)}
                      disabled={rosterFull}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold text-[14px] shrink-0 whitespace-nowrap transition"
                      title="현재 토론에 새 참가자로 추가"
                    >
                      <UserPlus className="w-3.5 h-3.5 shrink-0" />
                      <span>추가</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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
