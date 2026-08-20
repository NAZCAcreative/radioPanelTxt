import React, { useState } from 'react';
import { Send, Terminal } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import type { AudiencePriority } from '../../types/debate';

export const AudienceInput: React.FC = () => {
  const { settings, injectAudienceQuestion, executeSlashCommand } = useDebateStore();

  const [input, setInput] = useState('');
  const [targetType, setTargetType] = useState<'moderator' | 'all' | 'agent'>('moderator');
  const [targetAgentId, setTargetAgentId] = useState<string>(settings.agents[0]?.id || '');
  const [priority, setPriority] = useState<AudiencePriority>('HIGH');

  const isChatDark = settings.chatTheme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (input.trim().startsWith('/host')) {
      executeSlashCommand(input);
    } else {
      injectAudienceQuestion(input, targetType, targetType === 'agent' ? targetAgentId : undefined, priority);
    }

    setInput('');
  };

  const quickCommands = [
    { label: '📌 지금까지 정리', cmd: '/host 지금까지의 핵심 논점과 입장을 요약 정리해줘' },
    { label: '🔍 근거 검증 요청', cmd: '/host 방금 언급된 주장에 대한 데이터와 구체적 근거를 검증해줘' },
    { label: '⚖️ 반론 기회 부여', cmd: '/host 소수 입장에 있는 패널에게 반론 기회를 부여해줘' },
    { label: '🎯 관점 집중 요청', cmd: '/host 토론 논점을 실질적 비용과 법적 책임을 중심으로 좁혀줘' },
  ];

  return (
    <div
      className={`border-t p-3 space-y-2 transition-colors ${
        isChatDark
          ? 'bg-slate-900 border-slate-800 text-slate-200'
          : 'bg-white border-slate-200 text-slate-800 shadow-lg'
      }`}
    >
      {/* Quick Slash Command Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[14px]">
        <span className={`flex items-center gap-1 shrink-0 font-mono font-bold ${isChatDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <Terminal className="w-3 h-3 text-indigo-500" />
          <span>Commands:</span>
        </span>
        {quickCommands.map((qc, idx) => (
          <button
            key={idx}
            onClick={() => setInput(qc.cmd)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[14px] font-semibold border transition active:scale-95 ${
              isChatDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border-slate-300'
            }`}
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-0.5">
          {/* Target Selector */}
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as any)}
            className={`border rounded-lg px-2.5 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 ${
              isChatDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="moderator">받는 사람: 사회자</option>
            <option value="all">받는 사람: 전체 패널</option>
            <option value="agent">받는 사람: 특정 참가자</option>
          </select>

          {targetType === 'agent' && (
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className={`border rounded-lg px-2.5 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 ${
                isChatDark ? 'bg-slate-950 border-slate-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
            >
              {settings.agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          )}

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as AudiencePriority)}
            className={`border rounded-lg px-2 py-1.5 text-[14px] font-semibold focus:outline-none shrink-0 ${
              isChatDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'
            }`}
          >
            <option value="LOW">중요도: 낮음</option>
            <option value="NORMAL">중요도: 보통</option>
            <option value="HIGH">중요도: 높음</option>
            <option value="IMMEDIATE">중요도: 즉시 반영</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="관객 질문, 반론 개입, 또는 /host 명령어를 입력하세요..."
            className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
              isChatDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <span>보내기</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
