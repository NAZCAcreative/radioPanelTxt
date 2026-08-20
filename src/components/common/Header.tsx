import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bug,
  Layers,
  MessageSquare,
  Award,
  Sun,
  Moon,
  Save,
  Drama,
} from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';

interface HeaderProps {
  onOpenPresets: () => void;
  onOpenSummary: () => void;
  onOpenSessionManager: () => void;
  onOpenAgentLibrary: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPresets,
  onOpenSummary,
  onOpenSessionManager,
  onOpenAgentLibrary,
}) => {
  const {
    settings,
    session,
    startDebate,
    pauseDebate,
    resumeDebate,
    resetDebate,
    toggleDebugMode,
    toggleTheme,
  } = useDebateStore();

  const isLight = settings.theme !== 'dark';
  const isRunning = session.status === 'running';
  const isPaused = session.status === 'paused';
  const isCompleted = session.status === 'completed';

  const activeThinkingAgent = settings.agents.find((a) => a.id === session.activeThinkingAgentId) ||
    (session.activeThinkingAgentId === settings.moderator.id ? settings.moderator : null);

  return (
    <header
      className={`h-16 border-b px-4 flex items-center justify-between z-20 sticky top-0 transition-colors ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800 backdrop-blur-md shadow-sm'
          : 'bg-gray-900/90 border-gray-800 text-gray-100 backdrop-blur-md'
      }`}
    >
      {/* App Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-xl tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              DEBATE LAB
            </h1>
            <span
              className={`hidden sm:inline-block text-[13px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                isLight
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}
            >
              v1.0 Multi-Agent
            </span>
          </div>
          <p className={`hidden sm:block text-sm whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            여러 AI 캐릭터가 함께 토론하는 시뮬레이터
          </p>
        </div>
      </div>

      {/* Live Status Indicator & Thinking Banner */}
      <div
        className={`hidden xl:flex items-center gap-4 px-4 py-1.5 rounded-full border shrink-0 ${
          isLight
            ? 'bg-slate-100/80 border-slate-200 text-slate-700'
            : 'bg-gray-950/60 border-gray-800 text-gray-200'
        }`}
      >
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning
                ? 'bg-emerald-500 animate-pulse'
                : isPaused
                ? 'bg-amber-500'
                : isCompleted
                ? 'bg-blue-500'
                : 'bg-slate-400'
            }`}
          />
          <span className="text-sm font-bold">
            {isRunning ? '● 토론 진행중' : isPaused ? '일시정지' : isCompleted ? '토론 완료' : '준비됨'}
          </span>
        </div>

        <div className={`h-3 w-[1px] ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />

        {/* Turn Counter */}
        <div className="text-sm font-mono flex items-center gap-1">
          <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>진행 턴:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{session.currentTurn}</span>
          <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>/ {settings.maxTurns}턴</span>
        </div>

        {/* Active Thinking Agent Indicator */}
        {activeThinkingAgent && (
          <>
            <div className={`h-3 w-[1px] ${isLight ? 'bg-slate-300' : 'bg-gray-800'}`} />
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                <strong>{activeThinkingAgent.name}</strong>님이 답변을 생각하는 중...
              </span>
            </div>
          </>
        )}
      </div>

      {/* Secondary Header Actions & Cost Display - scrolls horizontally if needed,
          so it never pushes the primary Start/Pause/Resume control off-screen */}
      <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar min-w-0 flex-1 pl-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition shrink-0 whitespace-nowrap ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300'
              : 'bg-gray-800 hover:bg-gray-700 text-amber-400 border-gray-700'
          }`}
          title="전체 UI 화면 밝은 테마 / 어두운 테마 전환"
        >
          {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-amber-300" />}
          <span className="hidden lg:inline">{isLight ? '밝은 모드' : '어두운 모드'}</span>
        </button>

        {/* Presets Modal Button */}
        <button
          onClick={onOpenPresets}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition border shrink-0 whitespace-nowrap ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span className="hidden lg:inline">토론 프리셋</span>
        </button>

        {/* Session Save/Load Modal Button */}
        <button
          onClick={onOpenSessionManager}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition border shrink-0 whitespace-nowrap ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
          }`}
          title="현재 토론을 저장하거나 저장된 토론을 불러옵니다"
        >
          <Save className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden xl:inline">세션 저장/불러오기</span>
        </button>

        {/* Agent Persona Library Modal Button */}
        <button
          onClick={onOpenAgentLibrary}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition border shrink-0 whitespace-nowrap ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
          }`}
          title="저장된 에이전트 페르소나를 관리하고 다른 사이트용 프롬프트로 내보냅니다"
        >
          <Drama className="w-3.5 h-3.5 text-pink-500" />
          <span className="hidden xl:inline">에이전트 프리셋</span>
        </button>

        {/* Debug Mode Toggle */}
        <button
          onClick={toggleDebugMode}
          className={`p-2 rounded-lg text-sm font-medium transition border shrink-0 ${
            settings.debugMode
              ? 'bg-amber-500/20 text-amber-600 border-amber-500/40 font-bold'
              : isLight
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-slate-300'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border-gray-700'
          }`}
          title="디버그 정보 토글"
        >
          <Bug className="w-4 h-4" />
        </button>

        {/* Summary Modal Button */}
        {session.messages.length > 0 && (
          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold transition border border-indigo-200 shadow-sm shrink-0 whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">요약 및 결과 보고서</span>
          </button>
        )}
      </div>

      {/* Primary Play / Pause / Reset Control - kept outside the scrollable
          area above so it's always fully visible, never scrolled off-screen */}
      <div className="shrink-0 pl-2.5">
        {session.status === 'idle' ? (
          <button
            onClick={startDebate}
            title="토론 시작"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="hidden sm:inline">토론 시작</span>
          </button>
        ) : isRunning ? (
          <button
            onClick={pauseDebate}
            title="일시정지"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition shadow-sm shrink-0 whitespace-nowrap"
          >
            <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="hidden sm:inline">일시정지</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeDebate}
            title="재개"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-sm shrink-0 whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span className="hidden sm:inline">재개</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (
                window.confirm(
                  '현재 토론 기록이 초기화됩니다. 필요하다면 먼저 "요약 및 결과 보고서"에서 내보내거나 "세션 저장"을 이용하세요. 계속할까요?'
                )
              ) {
                resetDebate();
              }
            }}
            title="새 토론 시작"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm transition border border-slate-300 shrink-0 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">새 토론 시작</span>
          </button>
        )}
      </div>
    </header>
  );
};
