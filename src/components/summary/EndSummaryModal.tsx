import React from 'react';
import { X, FileText, Code, TrendingUp, Sparkles } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { HelpTooltip } from '../common/HelpTooltip';

interface EndSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EndSummaryModal: React.FC<EndSummaryModalProps> = ({ isOpen, onClose }) => {
  const { settings, session } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  if (!isOpen) return null;

  // Calculate stance deltas
  const stanceDeltas = settings.agents.map((agent) => {
    const init = session.initialStances[agent.id] ?? agent.initialStance;
    const curr = session.currentStances[agent.id] ?? agent.currentStance;
    const delta = curr - init;
    return {
      agent,
      init,
      curr,
      delta,
    };
  });

  // Find most changed position
  const mostChanged = [...stanceDeltas].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];

  // Sessions saved before claim ids were deduped on write can still contain
  // repeats of the same claim; drop those here too so old exports/reports
  // don't show the same statement multiple times.
  const uniqueClaims = Array.from(
    new Map(session.claims.map((c) => [c.claimId, c])).values()
  );

  // Export Generators
  const generateExportText = (format: 'txt' | 'md' | 'json') => {
    if (format === 'json') {
      const data = {
        topic: settings.topic,
        settings,
        messages: session.messages,
        claims: uniqueClaims,
        memories: session.memories,
        decisionLogs: session.decisionLogs,
        stanceHistory: session.stanceHistory,
        consensusSnapshots: session.consensusSnapshots,
        finalStances: stanceDeltas,
      };
      return JSON.stringify(data, null, 2);
    }

    if (format === 'md') {
      let md = `# 토론 결과 보고서: ${settings.topic}\n\n`;
      md += `**총 턴 수**: ${session.currentTurn} | **총 사용 토큰**: ${session.totalTokensUsed}\n\n`;
      md += `## 최종 입장\n\n`;
      stanceDeltas.forEach((sd) => {
        md += `- **${sd.agent.name}** (${sd.agent.job}): 시작 ${sd.init} → 최종 ${sd.curr} (변화량: ${sd.delta > 0 ? '+' + sd.delta : sd.delta})\n`;
      });
      md += `\n## 입장 변화 이력\n\n`;
      session.stanceHistory.forEach((item) => {
        md += `- 턴 ${item.turn} · ${item.agentName}: ${item.previousStance} → ${item.newStance} — ${item.reason}\n`;
      });
      md += `\n## 의사결정·근거 로그\n\n`;
      session.decisionLogs.forEach((log) => {
        md += `- 턴 ${log.turn} · ${log.actorName} · ${log.category}: ${log.summary}${log.rationale ? ` / 이유: ${log.rationale}` : ''}${log.evidence.length ? ` / 근거: ${log.evidence.join(', ')}` : ''}\n`;
      });
      md += `\n## 전체 대화 기록\n\n`;
      session.messages.forEach((m) => {
        md += `### ${m.speakerName} (${m.timestamp})\n${m.text}\n\n`;
      });
      return md;
    }

    // TXT
    let txt = `토론 결과 요약\n주제: ${settings.topic}\n\n최종 입장:\n`;
    stanceDeltas.forEach((sd) => {
      txt += `${sd.agent.name}: ${sd.init} -> ${sd.curr}\n`;
    });
    txt += `\n입장 변화 이력:\n`;
    session.stanceHistory.forEach((item) => {
      txt += `[턴 ${item.turn}] ${item.agentName}: ${item.previousStance} -> ${item.newStance} / ${item.reason}\n`;
    });
    txt += `\n의사결정·근거 로그:\n`;
    session.decisionLogs.forEach((log) => {
      txt += `[턴 ${log.turn}] ${log.actorName} (${log.category}): ${log.summary}${log.rationale ? ` / ${log.rationale}` : ''}${log.evidence.length ? ` / 근거: ${log.evidence.join(', ')}` : ''}\n`;
    });
    txt += `\n전체 대화 기록:\n`;
    session.messages.forEach((m) => {
      txt += `[${m.timestamp}] ${m.speakerName}: ${m.text}\n`;
    });
    return txt;
  };

  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    const content = generateExportText(format);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debate_report.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="토론 결과 요약" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}
        >
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>토론 완료 - 결과 요약</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700 bg-slate-200/60' : 'text-gray-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm">
          {/* Topic Banner */}
          <div
            className={`p-4 rounded-xl border ${
              isLight ? 'bg-indigo-50/60 border-indigo-200 text-slate-800' : 'bg-indigo-950/40 border-indigo-500/30 text-white'
            }`}
          >
            <span className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
              토론 주제
            </span>
            <p className="text-base font-bold leading-relaxed">"{settings.topic}"</p>
          </div>

          {/* Final Stances Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>참가자별 최종 입장 변화</span>
              <HelpTooltip
                title="입장 변화란?"
                description="각 참가자가 토론 시작 시 가졌던 입장(-100 반대 ~ +100 찬성)이 토론을 거치며 어떻게 바뀌었는지 보여줍니다. '변화량'이 클수록 토론 중 생각이 많이 바뀌었다는 뜻입니다."
              />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stanceDeltas.map((sd) => (
                <div
                  key={sd.agent.id}
                  className={`p-3 rounded-xl border flex items-center justify-between shadow-sm ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: sd.agent.avatarColor }} />
                    <div>
                      <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-gray-200'}`}>
                        {sd.agent.name}
                      </span>
                      <span className="text-[13px] text-slate-500">{sd.agent.job}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm">
                      {sd.init > 0 ? `+${sd.init}` : sd.init} → <strong className="font-bold">{sd.curr > 0 ? `+${sd.curr}` : sd.curr}</strong>
                    </div>
                    <span className={`text-[13px] font-bold ${sd.delta > 0 ? 'text-emerald-600' : sd.delta < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      변화량: {sd.delta > 0 ? `+${sd.delta}` : sd.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Changed Spotlight */}
          {mostChanged && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 ${
                isLight ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-purple-950/30 border-purple-800/40 text-purple-200'
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block text-purple-800 dark:text-purple-300">
                  가장 입장이 많이 바뀐 참가자
                </span>
                <p className="text-sm">
                  <strong>{mostChanged.agent.name}</strong>님이 가장 큰 입장 변화를 보여주었습니다 ({mostChanged.init} → {mostChanged.curr}).
                </p>
              </div>
            </div>
          )}

          {/* Major Claims & Arguments */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <span>주요 주장 정리</span>
              <HelpTooltip
                title="주요 주장 정리"
                description="토론 중 각 참가자가 제시한 핵심 주장들을 자동으로 추출해 모아 보여줍니다."
              />
            </h3>
            <div className="space-y-1.5">
              {uniqueClaims.length === 0 ? (
                <p className="text-slate-400 italic">추출된 주장이 없습니다.</p>
              ) : (
                uniqueClaims.slice(0, 5).map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-sm ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-300'
                    }`}
                  >
                    <span className="font-bold text-indigo-600">{c.speakerName}: </span>
                    <span>{c.claimText}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm">합의 판정</h3>
            {session.consensusSnapshots.length ? (() => {
              const latest = session.consensusSnapshots[session.consensusSnapshots.length - 1];
              return (
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'}`}>
                  <div className="font-bold">{latest.label} · 일치율 {Math.round(latest.agreementRatio * 100)}%</div>
                  <div className="text-slate-500 mt-1">찬성 {latest.proCount} · 중립 {latest.neutralCount} · 반대 {latest.conCount}</div>
                  {!!latest.unresolvedClaims.length && <div className="mt-2">미해결 주장: {latest.unresolvedClaims.join(' / ')}</div>}
                  {!!latest.issues.length && (
                    <div className="mt-2 space-y-1">
                      {latest.issues.map((issue) => (
                        <div key={issue.claimId}>[{issue.resolved ? '정리됨' : '미해결'} · {issue.status}] {issue.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })() : <p className="text-slate-400 italic">아직 판정 기록이 없습니다.</p>}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm">입장 변화 이력</h3>
            {session.stanceHistory.length ? session.stanceHistory.map((item, index) => (
              <div key={`${item.agentId}_${item.turn}_${index}`} className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'}`}>
                <span className="font-bold">턴 {item.turn} · {item.agentName}: </span>
                {item.previousStance} → {item.newStance} · {item.reason}
              </div>
            )) : <p className="text-slate-400 italic">기록된 입장 변화가 없습니다.</p>}
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm">사회자·패널 의사결정 및 근거 로그</h3>
            <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar">
              {session.decisionLogs.map((log) => (
                <div key={log.id} className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'}`}>
                  <div className="font-bold">턴 {log.turn} · {log.actorName} · {log.category}</div>
                  <div>{log.summary}</div>
                  {log.rationale && <div className="text-slate-500">이유: {log.rationale}</div>}
                  {!!log.evidence.length && <div className="text-slate-500">근거: {log.evidence.join(' · ')}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div
            className={`p-4 rounded-xl border space-y-3 pt-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
            }`}
          >
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <span>결과 내보내기</span>
              <HelpTooltip
                title="어떤 형식을 골라야 하나요?"
                description={`TXT: 메모장 등에서 바로 열리는 가장 단순한 텍스트 파일.\nMarkdown: 제목/목록 서식이 있는 문서 (노션, 깃허브 등에서 보기 좋음).\nJSON: 프로그램에서 다시 읽어들이기 위한 원본 데이터 (일반 사용자는 TXT 추천).`}
              />
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload('txt')}
                title="가장 단순한 텍스트 파일로 저장"
                className={`flex-1 min-w-[130px] py-2 px-3 font-bold rounded-lg flex items-center justify-center gap-1.5 transition border shadow-sm whitespace-nowrap ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span>텍스트 파일 (TXT)</span>
              </button>

              <button
                onClick={() => handleDownload('md')}
                title="서식이 있는 문서 파일로 저장 (노션, 깃허브 등)"
                className={`flex-1 min-w-[130px] py-2 px-3 font-bold rounded-lg flex items-center justify-center gap-1.5 transition border shadow-sm whitespace-nowrap ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span>문서 파일 (Markdown)</span>
              </button>

              <button
                onClick={() => handleDownload('json')}
                title="프로그램에서 다시 불러올 수 있는 원본 데이터로 저장"
                className={`flex-1 min-w-[130px] py-2 px-3 font-bold rounded-lg flex items-center justify-center gap-1.5 transition border shadow-sm whitespace-nowrap ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                }`}
              >
                <Code className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>원본 데이터 (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
