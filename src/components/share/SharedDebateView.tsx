import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, ArrowLeft, TrendingUp } from 'lucide-react';
import { fetchSharedDebate, type SharedDebatePayload } from '../../utils/shareDebate';
import { ClaimGraph } from '../summary/ClaimGraph';

interface SharedDebateViewProps {
  shareId: string;
}

export const SharedDebateView: React.FC<SharedDebateViewProps> = ({ shareId }) => {
  const [payload, setPayload] = useState<SharedDebatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSharedDebate(shareId)
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  const goHome = () => {
    const url = new URL(window.location.href);
    url.search = '';
    window.location.href = url.toString();
  };

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-sm w-full bg-white border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-slate-700 font-semibold">{error}</p>
          <button
            onClick={goHome}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            패널로그 홈으로
          </button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isLight = payload.settings.theme !== 'dark';
  const stanceDeltas = payload.settings.agents.map((agent) => {
    const init = payload.initialStances[agent.id] ?? agent.initialStance;
    const curr = payload.currentStances[agent.id] ?? agent.currentStance;
    return { agent, init, curr, delta: curr - init };
  });
  const latestConsensus = payload.consensusSnapshots[payload.consensusSnapshots.length - 1];
  const reflectionEntries = Object.entries(payload.reflections)
    .flatMap(([agentId, entries]) =>
      entries.map((r) => ({ ...r, agentName: payload.settings.agents.find((a) => a.id === agentId)?.name || agentId }))
    )
    .sort((a, b) => a.turn - b.turn);

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-gray-950 text-gray-100'}`}>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <header className="space-y-2">
          <button
            onClick={goHome}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isLight ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-300'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            패널로그에서 새 토론 시작하기
          </button>
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-indigo-950/40 border-indigo-500/30'}`}>
            <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">공유된 토론 리플레이</span>
            <p className="text-lg font-bold leading-relaxed">"{payload.topic}"</p>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="font-bold text-base flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            참가자별 최종 입장 변화
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stanceDeltas.map((sd) => (
              <div
                key={sd.agent.id}
                className={`p-3 rounded-xl border flex items-center justify-between shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-gray-900 border-gray-800'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: sd.agent.avatarColor }} />
                  <div>
                    <span className="font-bold block">{sd.agent.name}</span>
                    <span className="text-[13px] text-slate-500">{sd.agent.job}</span>
                  </div>
                </div>
                <div className="text-right font-mono text-sm">
                  {sd.init > 0 ? `+${sd.init}` : sd.init} → <strong>{sd.curr > 0 ? `+${sd.curr}` : sd.curr}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-bold text-base">주장 관계도</h2>
          <ClaimGraph claims={payload.claims} agents={payload.settings.agents} isLight={isLight} />
        </section>

        {latestConsensus && (
          <section className="space-y-2">
            <h2 className="font-bold text-base">합의 판정</h2>
            <div className={`p-3 rounded-xl border text-sm ${isLight ? 'bg-white border-slate-200' : 'bg-gray-900 border-gray-800'}`}>
              <div className="font-bold">{latestConsensus.label} · 일치율 {Math.round(latestConsensus.agreementRatio * 100)}%</div>
              <div className="text-slate-500 mt-1">찬성 {latestConsensus.proCount} · 중립 {latestConsensus.neutralCount} · 반대 {latestConsensus.conCount}</div>
            </div>
          </section>
        )}

        {reflectionEntries.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold text-base">패널 성찰 기록</h2>
            {reflectionEntries.map((r, idx) => (
              <div key={`${r.agentId}_${r.turn}_${idx}`} className={`p-2.5 rounded-lg border text-sm space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-gray-900 border-gray-800'}`}>
                <div className="font-bold">턴 {r.turn} · {r.agentName}</div>
                {r.currentPosition && <div><span className="text-slate-500">현재 입장: </span>{r.currentPosition}</div>}
                {r.strongestOpposingArgument && <div><span className="text-slate-500">가장 강한 반론: </span>{r.strongestOpposingArgument}</div>}
              </div>
            ))}
          </section>
        )}

        <section className="space-y-2">
          <h2 className="font-bold text-base">전체 대화 기록</h2>
          <div className="space-y-2">
            {payload.messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl border text-sm ${isLight ? 'bg-white border-slate-200' : 'bg-gray-900 border-gray-800'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.avatarColor || '#64748b' }} />
                  <span className="font-bold">{m.speakerName}</span>
                  <span className="text-[12px] text-slate-400">{m.timestamp}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
