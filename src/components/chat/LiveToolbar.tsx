import React from 'react';
import { SkipForward, StopCircle, Moon, Sun, Turtle, Rabbit } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { HelpTooltip } from '../common/HelpTooltip';
import { getPhaseLabel, PHASE_EXPLANATION } from '../../utils/labels';

export const LiveToolbar: React.FC = () => {
  const {
    settings,
    session,
    stepNextTurn,
    endDebate,
    toggleChatTheme,
    updateSettings,
  } = useDebateStore();

  const isLight = settings.theme !== 'dark';
  const isChatDark = settings.chatTheme === 'dark';

  return (
    <div
      className={`border-b px-4 py-2 flex items-center justify-between z-10 shrink-0 transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-950/80 border-gray-800 text-gray-200'
      }`}
    >
      {/* Current Phase & Goal indicator */}
      <div className="flex items-center gap-1.5 text-sm shrink-0 whitespace-nowrap">
        <span className={`font-bold ${isLight ? 'text-slate-600' : 'text-indigo-400'}`}>진행 단계:</span>
        <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded border border-indigo-300">
          {getPhaseLabel(session.phase)}
        </span>
        <HelpTooltip title="토론 진행 단계" description={PHASE_EXPLANATION} align="left" />
      </div>

      {/* Manual Control Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar min-w-0 pl-2">
        {/* Conversation Pace: 기본모드 (realistic delays) vs 배속모드 (fast) */}
        <div
          className={`flex items-center gap-1 p-0.5 rounded-lg border shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-gray-900 border-gray-700'
          }`}
        >
          <button
            onClick={() => updateSettings({ chatPaceMode: 'normal' })}
            title="실제 채팅처럼 생각하는 시간과 타이핑 속도에 여유를 둡니다"
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-bold transition whitespace-nowrap ${
              settings.chatPaceMode === 'normal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Turtle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">기본모드</span>
          </button>
          <button
            onClick={() => updateSettings({ chatPaceMode: 'fast' })}
            title="생각/타이핑 딜레이를 최소화해 토론을 빠르게 진행합니다"
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-bold transition whitespace-nowrap ${
              settings.chatPaceMode === 'fast'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Rabbit className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">배속모드</span>
          </button>
        </div>

        {/* Chatroom Specific Dark Mode Toggle Button */}
        <button
          onClick={toggleChatTheme}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-sm font-bold border transition shrink-0 whitespace-nowrap ${
            isChatDark
              ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title="채팅창 색상만 밝게/어둡게 전환 (전체 화면 테마와 별개)"
        >
          {isChatDark ? <Moon className="w-3.5 h-3.5 text-amber-300 shrink-0" /> : <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          <span className="hidden md:inline">채팅창 {isChatDark ? '어둡게' : '밝게'}</span>
        </button>

        <button
          onClick={() => stepNextTurn()}
          className={`flex items-center gap-1 px-2.5 py-1 rounded text-sm font-bold border transition shrink-0 whitespace-nowrap ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
          }`}
          title="일시정지 중에도 한 턴을 강제로 진행시킵니다"
        >
          <SkipForward className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="hidden sm:inline">다음 턴 강제 진행</span>
        </button>

        {session.status !== 'completed' && (
          <button
            onClick={() => {
              if (window.confirm('토론을 지금 종료할까요? 종료 후에는 추가 발언 없이 최종 요약으로 넘어갑니다.')) {
                endDebate();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold border border-rose-200 transition shrink-0 whitespace-nowrap"
          >
            <StopCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">토론 종료</span>
          </button>
        )}
      </div>
    </div>
  );
};
