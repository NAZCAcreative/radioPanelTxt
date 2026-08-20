import React, { useState } from 'react';
import { X, Copy, Check, Eye, Download } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import {
  generateAgentSystemPrompt,
  generateAgentUserPrompt,
  generateModeratorSystemPrompt,
} from '../../utils/promptBuilder';
import { downloadTextFile } from '../../utils/agentExport';

interface PromptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string; // 'moderator' or agentId
}

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  isOpen,
  onClose,
  targetId = 'agent_1',
}) => {
  const { settings } = useDebateStore();
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targetId);
  const [activeTab, setActiveTab] = useState<'system' | 'user'>('system');
  const [copied, setCopied] = useState(false);

  const isLight = settings.theme !== 'dark';

  if (!isOpen) return null;

  const isModeratorTarget = selectedTargetId === 'moderator';
  const selectedAgent = settings.agents.find((a) => a.id === selectedTargetId) || settings.agents[0];

  const systemPrompt = isModeratorTarget
    ? generateModeratorSystemPrompt(settings.moderator, settings)
    : generateAgentSystemPrompt(selectedAgent, settings);

  const userPrompt = isModeratorTarget
    ? `TOPIC: "${settings.topic}"\nDEBATE GOAL: ${settings.discussionGoal}\nPHASE: Exploration (Turn 4/30)\n\nRECENT CONTEXT:\n[msg_1] MINA: "기업 책임이 필요합니다."\n[msg_2] JACK: "인과관계를 확증할 수 없습니다."`
    : generateAgentUserPrompt(selectedAgent, settings, 4, `[msg_1] MINA: "기업 책임이 필요합니다."\n[msg_2] JACK: "인과관계를 확증할 수 없습니다."`);

  const currentPromptText = activeTab === 'system' ? systemPrompt : userPrompt;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const who = isModeratorTarget ? settings.moderator.name : selectedAgent.name;
    downloadTextFile(`${who}_${activeTab}_prompt.txt`, currentPromptText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-start justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>지시문(프롬프트) 미리보기</span>
              </h2>
              <p className="text-sm text-slate-500">
                이 에이전트가 실제 AI 모델에 전달할 지시문이 지금 설정으로 어떻게 만들어지는지 확인합니다. (개발자/고급 사용자용 기능)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Selector Bar */}
        <div
          className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-sm ${
            isLight ? 'bg-white border-slate-100' : 'bg-gray-900 border-gray-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-slate-500 shrink-0 whitespace-nowrap">누구의 지시문:</span>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className={`min-w-0 border rounded-lg px-3 py-1 font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-indigo-700' : 'bg-gray-950 border-gray-800 text-indigo-300'
              }`}
            >
              <option value="moderator">사회자 ({settings.moderator.name})</option>
              {settings.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  참가자: {a.name} ({a.job})
                </option>
              ))}
            </select>
          </div>

          {/* Sub-tab selection: System Prompt vs User Prompt */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-lg border border-slate-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => setActiveTab('system')}
              title="이 캐릭터의 성격/규칙을 정하는 고정 지시문"
              className={`px-3 py-1 rounded text-sm font-bold transition shrink-0 whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900'
              }`}
            >
              성격/규칙 지시문
            </button>
            <button
              onClick={() => setActiveTab('user')}
              title="매 턴마다 바뀌는 대화 맥락(주제, 최근 발언 등)"
              className={`px-3 py-1 rounded text-sm font-bold transition shrink-0 whitespace-nowrap ${
                activeTab === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900'
              }`}
            >
              대화 맥락 지시문
            </button>
          </div>
        </div>

        {/* Prompt View Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950 text-emerald-400 font-mono text-sm leading-relaxed relative">
          <div className="flex flex-wrap items-center justify-end gap-2 mb-3 sm:absolute sm:top-4 sm:right-4 sm:mb-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-sans font-semibold text-sm border border-gray-700 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap"
              title="다른 사이트에 붙여넣을 수 있는 .txt 파일로 다운로드"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>다운로드</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-sans font-semibold text-sm border border-gray-700 flex items-center gap-1.5 transition shrink-0 whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{copied ? '복사 완료!' : '복사하기'}</span>
            </button>
          </div>

          <pre className="whitespace-pre-wrap sm:pr-40">{currentPromptText}</pre>
        </div>
      </div>
    </div>
  );
};
