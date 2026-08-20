import React, { useState } from 'react';
import type { Message } from '../../types/debate';
import { Bot, User, Info } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { getSpeechActLabel } from '../../utils/labels';
import { getCharacterStyle } from '../../utils/funModes';

interface MessageItemProps {
  message: Message;
  replyToMessage?: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, replyToMessage }) => {
  const { settings } = useDebateStore();
  const [showMetadata, setShowMetadata] = useState(false);

  const isChatDark = settings.chatTheme === 'dark';
  const { isModerator, isAudience, isSystem, metadata } = message;

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span
          className={`text-[14px] px-3 py-1 rounded-full border shadow-sm ${
            isChatDark
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {message.text}
        </span>
      </div>
    );
  }

  const stance = metadata?.stance;
  const speakerAgent = !isModerator && !isAudience
    ? settings.agents.find((a) => a.id === message.speakerId)
    : undefined;
  const characterEmoji = speakerAgent ? getCharacterStyle(speakerAgent.chatCharacterStyle).emoji : null;

  return (
    <div
      className={`group relative flex gap-3 my-3 p-3 rounded-2xl transition border shadow-sm ${
        isModerator
          ? isChatDark
            ? 'bg-purple-950/40 border-purple-800/50 text-slate-100'
            : 'bg-purple-50/70 border-purple-200 text-slate-800'
          : isAudience
          ? isChatDark
            ? 'bg-indigo-950/40 border-indigo-800/50 text-slate-100'
            : 'bg-indigo-50/70 border-indigo-200 text-slate-800'
          : isChatDark
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-100'
          : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
      }`}
    >
      {/* Avatar Badge */}
      <div className="shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
          style={{ backgroundColor: message.avatarColor || (isModerator ? '#8b5cf6' : '#4f46e5') }}
        >
          {isModerator ? (
            <Bot className="w-5 h-5" />
          ) : isAudience ? (
            <User className="w-5 h-5 text-white" />
          ) : characterEmoji ? (
            <span className="text-lg leading-none">{characterEmoji}</span>
          ) : (
            message.speakerName.slice(0, 2)
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {/* Header line */}
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${isChatDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {characterEmoji && <span className="mr-1">{characterEmoji}</span>}
            {message.speakerName}
          </span>
          {message.speakerRole && (
            <span
              className={`text-[13px] font-medium px-1.5 py-0.5 rounded ${
                isChatDark
                  ? 'text-slate-400 bg-slate-800 border border-slate-700'
                  : 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
            >
              {message.speakerRole}
            </span>
          )}
          {isModerator && (
            <span className="text-[13px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/40">
              Host / Moderator
            </span>
          )}
          {isAudience && (
            <span className="text-[13px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/40">
              Audience Question
            </span>
          )}

          <span className={`text-[13px] font-mono ml-auto ${isChatDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {message.timestamp}
          </span>
        </div>

        {/* Reply Box Quote if replying to a previous turn */}
        {replyToMessage && (
          <div
            className={`border-l-3 p-2 rounded text-sm my-1 font-sans ${
              isChatDark
                ? 'bg-slate-950 border-indigo-500 text-slate-400'
                : 'bg-slate-100 border-indigo-500 text-slate-700'
            }`}
          >
            <span className="font-bold text-indigo-400 dark:text-indigo-300 block text-[14px]">
              ┌ Replying to {replyToMessage.speakerName}
            </span>
            <p className="line-clamp-1 italic">"{replyToMessage.text}"</p>
          </div>
        )}

        {/* Message Content */}
        <div className={`text-sm leading-relaxed font-sans whitespace-pre-wrap pt-0.5 ${isChatDark ? 'text-slate-200' : 'text-slate-800 font-medium'}`}>
          {message.text}
        </div>

        {/* Hover / Click Metadata Bar */}
        <div className="flex items-center gap-2 pt-1 text-[14px]">
          {/* Stance Indicator Badge */}
          {typeof stance === 'number' && (
            <span
              className={`px-2 py-0.5 rounded font-mono text-[13px] font-bold ${
                stance > 15
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : stance < -15
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : isChatDark
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              입장: {stance > 0 ? `+${stance}` : stance}
            </span>
          )}

          {metadata?.confidence && (
            <span className={`font-mono text-[13px] ${isChatDark ? 'text-slate-400' : 'text-slate-500'}`} title="이 발언에 대한 AI 스스로의 확신 정도">
              확신도: {metadata.confidence}%
            </span>
          )}

          {metadata?.speechAct && (
            <span className="text-indigo-400 font-mono text-[13px] font-bold">
              [{getSpeechActLabel(metadata.speechAct)}]
            </span>
          )}

          {/* Toggle Metadata details */}
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className={`ml-auto flex items-center gap-0.5 text-[13px] font-semibold ${
              isChatDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>상세보기</span>
          </button>
        </div>

        {/* Detailed Debug Metadata Card */}
        {(showMetadata || settings.debugMode) && (
          <div
            className={`mt-2 p-2.5 rounded-lg border text-[13px] font-mono space-y-1 ${
              isChatDark
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className={`flex justify-between border-b pb-1 font-bold ${isChatDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-800'}`}>
              <span>디버그 정보 (개발자용)</span>
              <span>{message.turn}번째 턴</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span title="발언자 고유 식별자">화자 ID: {message.speakerId}</span>
              </div>
              <div>
                <span title="다음 발언 순서를 정할 때 이 에이전트가 받은 우선순위 점수">발언 우선순위: {metadata?.speakPriorityScore || 50}/100</span>
              </div>
              <div>
                <span title="이 발언을 생성하는 데 사용된 토큰(AI 처리 단위) 수">사용 토큰: {metadata?.tokensUsed || 0}</span>
              </div>
              <div>
                <span title="AI가 응답하는 데 걸린 시간">응답 시간: {metadata?.latencyMs || 0} ms</span>
              </div>
            </div>
            {(metadata?.rationale || metadata?.stanceReason || metadata?.selectedSpeakerId || metadata?.evidence?.length) && (
              <div className={`mt-2 space-y-1 border-t pt-2 ${isChatDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="font-bold">의사결정·근거 기록</div>
                {metadata.rationale && <div><span className="font-semibold">발언/선정 이유:</span> {metadata.rationale}</div>}
                {metadata.stanceReason && <div><span className="font-semibold">입장 판단:</span> {metadata.stanceReason}</div>}
                {metadata.selectedSpeakerId && <div><span className="font-semibold">지정 발언자:</span> {metadata.selectedSpeakerId}</div>}
                {!!metadata.evidence?.length && (
                  <div><span className="font-semibold">사용 근거:</span> {metadata.evidence.join(' · ')}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
