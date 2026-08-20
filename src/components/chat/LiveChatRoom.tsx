import React, { useRef, useEffect, useState } from 'react';
import { useDebateStore } from '../../store/useDebateStore';
import { LiveToolbar } from './LiveToolbar';
import { MessageItem } from './MessageItem';
import { AudienceInput } from './AudienceInput';
import { Sparkles, MessageSquare, Award, AlertTriangle, X, RotateCcw, Info } from 'lucide-react';
import { getFunDebateMode } from '../../utils/funModes';

interface LiveChatRoomProps {
  onOpenSummary: () => void;
}

// Cap how many messages are mounted in the DOM at once for very long debates.
// The full transcript stays in state (export/summary are unaffected).
const RENDER_WINDOW = 150;

export const LiveChatRoom: React.FC<LiveChatRoomProps> = ({ onOpenSummary }) => {
  const { settings, session, resumeDebate, dismissError } = useDebateStore();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const [showAllMessages, setShowAllMessages] = useState(false);

  const isChatDark = settings.chatTheme === 'dark';
  const funMode = getFunDebateMode(settings.funDebateModeId);

  // Auto scroll to bottom when new messages arrive or when thinking text streams
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages.length, session.activeThinkingText]);

  const activeAgent = settings.agents.find((a) => a.id === session.activeThinkingAgentId) ||
    (session.activeThinkingAgentId === settings.moderator.id ? settings.moderator : null);

  // True when no API key has been entered, meaning every LLM call will fail
  // until one is entered.
  const noEffectiveApiKey = !settings.apiKey;

  const totalMessages = session.messages.length;
  const visibleMessages =
    showAllMessages || totalMessages <= RENDER_WINDOW
      ? session.messages
      : session.messages.slice(totalMessages - RENDER_WINDOW);
  const hiddenCount = totalMessages - visibleMessages.length;

  return (
    <div
      className={`h-full flex flex-col relative overflow-hidden transition-colors ${
        isChatDark ? `${funMode.darkSkin} text-slate-100` : `${funMode.lightSkin} text-slate-900`
      }`}
    >
      {/* Live Toolbar */}
      <LiveToolbar />

      {/* Topic Header Summary Bar */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-sm transition-colors ${
          isChatDark ? `${funMode.darkHeader} text-slate-200` : `${funMode.lightHeader} text-slate-700`
        }`}
      >
        <div className="truncate pr-4">
          <span className={`font-bold mr-2 ${isChatDark ? 'text-slate-400' : 'text-slate-500'}`}>주제:</span>
          <span className={`font-bold ${isChatDark ? 'text-slate-100' : 'text-slate-900'}`}>"{settings.topic}"</span>
        </div>
        <span className="shrink-0 text-[14px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-sm">
          {funMode.emoji} {funMode.name}
        </span>
      </div>

      {/* No API Key Warning: provider selected but no API key exists anywhere */}
      {noEffectiveApiKey && (
        <div className="px-4 py-2 border-b border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[14px] font-semibold flex items-center gap-2 shrink-0">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            "{settings.apiProvider}" 제공자가 선택되어 있지만 API 키가 입력되지 않아 토론을 진행할 수 없습니다.
            (기본 설정 탭에서 API 키를 입력하세요)
          </span>
        </div>
      )}

      {/* Turn Execution Error Banner */}
      {session.lastErrorMessage && (
        <div className="px-4 py-2 border-b border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[14px] font-semibold flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 truncate" title={session.lastErrorMessage}>
            토론 진행 중 오류가 발생하여 일시정지되었습니다: {session.lastErrorMessage}
          </span>
          <button
            onClick={() => resumeDebate()}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 whitespace-nowrap transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>재시도</span>
          </button>
          <button
            onClick={() => dismissError()}
            className="p-0.5 rounded hover:bg-rose-500/20 shrink-0 transition"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {hiddenCount > 0 && (
          <div className="flex justify-center pb-2">
            <button
              onClick={() => setShowAllMessages(true)}
              className={`text-[14px] font-semibold px-3 py-1 rounded-full border transition ${
                isChatDark
                  ? 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                  : 'bg-white text-slate-500 border-slate-300 hover:text-slate-800'
              }`}
            >
              이전 메시지 {hiddenCount.toLocaleString()}개 숨김 · 전체 보기
            </button>
          </div>
        )}

        {session.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md ${
              isChatDark ? 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400' : 'bg-indigo-100 border-indigo-200 text-indigo-600'
            }`}>
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isChatDark ? 'text-slate-200' : 'text-slate-800'}`}>
                실시간 토론이 준비되었습니다
              </h3>
              <p className={`text-sm max-w-sm mt-1 leading-relaxed ${isChatDark ? 'text-slate-400' : 'text-slate-500'}`}>
                상단 또는 왼쪽 설정 패널의 <strong>'토론 시작'</strong> 버튼을 눌러 패널로그 토론을 시작하세요.
              </p>
            </div>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            // Look up reply targets in the full transcript, even if the target
            // message itself is outside the currently rendered window.
            const replyTarget = msg.metadata?.replyToId
              ? session.messages.find((m) => m.id === msg.metadata?.replyToId)
              : undefined;

            return <MessageItem key={msg.id} message={msg} replyToMessage={replyTarget} />;
          })
        )}

        {/* Live Streaming Active Thinking Indicator Card */}
        {activeAgent && (
          <div
            className={`my-3 p-3.5 rounded-2xl border space-y-2 shadow-sm animate-pulse-subtle ${
              isChatDark ? 'bg-slate-900 border-indigo-500/40 text-slate-200' : 'bg-white border-indigo-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="font-bold text-sm text-indigo-400 dark:text-indigo-300">
                {session.activeThinkingLabel || `${activeAgent.name}님이 답변을 작성하고 있습니다`}
                <span className="typing-ellipsis" />
              </span>
            </div>

            {/* Partial streaming text */}
            {session.activeThinkingText ? (
              <p className={`text-sm font-sans leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-indigo-500 ${isChatDark ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
                {session.activeThinkingText}
                <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-1 animate-ping" />
              </p>
            ) : (
              <div className="flex items-center gap-1 pl-6">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot-1" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot-2" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot-3" />
              </div>
            )}
          </div>
        )}

        {/* Completed Banner */}
        {session.status === 'completed' && (
          <div className="my-6 p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-500/40 rounded-2xl text-center space-y-2 shadow-sm">
            <h3 className={`font-bold text-lg tracking-wide ${isChatDark ? 'text-white' : 'text-indigo-900'}`}>
              패널로그 토론 완료
            </h3>
            <p className={`text-sm ${isChatDark ? 'text-slate-300' : 'text-slate-600'}`}>
              토론이 성공적으로 완료되었습니다.
            </p>
            <button
              onClick={onOpenSummary}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>최종 요약 및 결과 보고서 보기</span>
            </button>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>

      {/* Audience Input Bar */}
      <AudienceInput />
    </div>
  );
};
