import React from 'react';
import { Database, Cpu, Flame, Users } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import type { ConsensusMode, EvidenceMode, MemoryDecayRate, MemoryMode, TurnMode } from '../../types/debate';
import { HelpTooltip } from '../common/HelpTooltip';

export const ResearchTab: React.FC = () => {
  const { settings, updateSettings } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  return (
    <div className={`space-y-6 pb-8 transition-colors ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
      {/* 1. MEMORY SYSTEM POLICY */}
      <div
        className={`p-4 rounded-xl border space-y-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-base text-indigo-600 dark:text-indigo-400 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <Database className="w-4 h-4" />
          <span>1. 기억 및 망각 체계 (Memory Policy)</span>
          <HelpTooltip
            title="Memory Mode & Decay (기억 체계)"
            description="에이전트가 과거 토론 발언을 어떤 구조로 저장하고 망각할지 결정합니다. Structured Memory 모드는 핵심 주장(CLAIM)과 반론(REBUTTAL)을 분류하여 저장합니다."
            impact="Structured Memory 활성화 시 에이전트가 상대의 과거 실언이나 주장의 contradiction(모순)을 예리하게 기억하여 반박합니다."
            promptExample="WORKING MEMORY TURNS: 10 turns. [RELEVANT MEMORIES]: mina claim_031 'AI 기업이 재교육 비용 일부를 부담해야 한다'"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              기억 저장 모드 (Memory Mode)
            </label>
            <select
              value={settings.memoryMode}
              onChange={(e) => updateSettings({ memoryMode: e.target.value as MemoryMode })}
              className={`w-full border rounded px-3 py-2 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="OFF">OFF (기억 없음)</option>
              <option value="recent_context">Recent Context (최근 대화만)</option>
              <option value="important_memories">Important Memories (중요 발언 추출)</option>
              <option value="structured_memory">Structured Memory (구조화 기억 - 권장)</option>
              <option value="full_experimental">Full Experimental (전체 기억 그래프)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              망각 속도 (Memory Decay)
            </label>
            <select
              value={settings.memoryDecay}
              onChange={(e) => updateSettings({ memoryDecay: e.target.value as MemoryDecayRate })}
              className={`w-full border rounded px-3 py-2 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="OFF">OFF (기억 감소 없음)</option>
              <option value="LOW">LOW (천천히 망각)</option>
              <option value="MEDIUM">MEDIUM (보통 속도 망각)</option>
              <option value="HIGH">HIGH (빠른 망각)</option>
            </select>
          </div>
        </div>

        <div>
          <div className={`flex justify-between text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <span>최신 기억 직접 보존 턴 수</span>
            <span className="text-indigo-600 font-bold">{settings.recentWorkingMemoryTurns}턴</span>
          </div>
          <input
            type="range"
            min={4}
            max={30}
            value={settings.recentWorkingMemoryTurns}
            onChange={(e) => updateSettings({ recentWorkingMemoryTurns: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
        }`}>
          <div>
            <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
              팩트 보존 원장 (Fact Preservation Ledger)
            </span>
            <span className="text-[14px] text-slate-500">
              중요 검증 사실을 별도 FACT LEDGER로 보존하여 대화 중 왜곡 방지
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.factPreservation}
            onChange={(e) => updateSettings({ factPreservation: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 rounded"
          />
        </label>
      </div>

      {/* 2. TURN TAKING & MODERATOR POLICY */}
      <div
        className={`p-4 rounded-xl border space-y-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-base text-purple-600 dark:text-purple-400 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <Users className="w-4 h-4" />
          <span>2. 발언 순서 정책 (누가, 언제 말할지)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              <span>발언 순서 방식 (Turn Mode)</span>
              <HelpTooltip
                title="발언 순서 방식 4가지"
                description={`• 기본(Dynamic): AI가 상황에 맞게 우선순위를 계산하고, 사회자가 중간중간 개입해 발언자를 지정합니다. 가장 자연스러운 토론 느낌.\n• 순차적(Round Robin): 참가자들이 정해진 순서대로 돌아가며 한 번씩 말합니다.\n• 사회자 전권(Moderator Controlled): 사회자가 매번 다음 발언자를 직접 지목합니다.\n• 자율 토론(Free Debate): 사회자 개입 없이 참가자들끼리 자유롭게 끼어들며 말합니다.`}
              />
            </label>
            <select
              value={settings.turnMode}
              onChange={(e) => updateSettings({ turnMode: e.target.value as TurnMode })}
              className={`w-full border rounded px-3 py-2 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="dynamic">기본 (AI가 우선순위 계산 + 사회자 개입)</option>
              <option value="round_robin">순차적 (참가자가 돌아가며 발언)</option>
              <option value="moderator_controlled">사회자 전권 (사회자가 매번 지목)</option>
              <option value="free_debate">자율 토론 (사회자 개입 없이 자유롭게)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              1회 발언 최대 문장 수
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxSentenceCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v)) updateSettings({ maxSentenceCount: Math.max(1, Math.min(10, v)) });
              }}
              className={`w-full border rounded px-3 py-2 text-sm font-mono font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2">
          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div>
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                특정 에이전트 독점 방지 (Speaker Dominance)
              </span>
              <span className="text-[14px] text-slate-500">지나치게 많이 말한 에이전트의 다음 발언 우선순위 감점</span>
            </div>
            <input
              type="checkbox"
              checked={settings.preventSpeakerDominance}
              onChange={(e) => updateSettings({ preventSpeakerDominance: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div>
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                소수 의견 보호 기능 (Protect Minority)
              </span>
              <span className="text-[14px] text-slate-500">다수 의견과 다른 소수 입장의 에이전트에게 사회자가 발언 기회 부여</span>
            </div>
            <input
              type="checkbox"
              checked={settings.protectMinorityOpinion}
              onChange={(e) => updateSettings({ protectMinorityOpinion: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div>
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                무의미 동조 금지 모드 (Anti-Echo)
              </span>
              <span className="text-[14px] text-slate-500 font-medium">"저도 동의합니다" 식의 정보 없는 맹목적 동조 답변 차단</span>
            </div>
            <input
              type="checkbox"
              checked={settings.antiEchoMode}
              onChange={(e) => updateSettings({ antiEchoMode: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* 3. DEBATE DYNAMICS & CONSENSUS */}
      <div
        className={`p-4 rounded-xl border space-y-4 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-base text-emerald-600 dark:text-emerald-400 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <Flame className="w-4 h-4" />
          <span>3. 토론 분위기 설정</span>
          <HelpTooltip
            title="토론 분위기란?"
            description="이 섹션의 슬라이더/드롭다운은 특정 에이전트가 아니라 토론 '전체'의 분위기를 조절합니다. 아래 개별 항목의 물음표(?)를 눌러 자세히 확인하세요."
          />
        </div>

        <div>
          <div className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <span>도전/반박 수위 (협력 0 ↔ 적대/공격 100)</span>
            <HelpTooltip
              title="도전/반박 수위"
              description="값이 낮으면 참가자들이 서로 부드럽게 협력하며 대화하고, 값이 높으면 상대 주장을 적극적으로 공격하고 몰아붙이는 치열한 토론이 됩니다."
            />
            <span className="ml-auto text-emerald-600 font-bold">{settings.challengeMode}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.challengeMode}
            onChange={(e) => updateSettings({ challengeMode: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-600"
          />
        </div>

        <div>
          <div className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <span>관점 다양성 압력 (의견 수렴 0 ↔ 다양성 유지 100)</span>
            <HelpTooltip
              title="관점 다양성 압력"
              description="값이 낮으면 시간이 지나며 참가자들의 의견이 자연스럽게 하나로 모아지는 경향이 생기고, 값이 높으면 끝까지 각자의 원래 입장과 개성을 잃지 않도록 유도합니다."
            />
            <span className="ml-auto text-emerald-600 font-bold">{settings.diversityPressure}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.diversityPressure}
            onChange={(e) => updateSettings({ diversityPressure: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              <span>근거 요구 수위 (Evidence Mode)</span>
              <HelpTooltip
                title="근거 요구 수위"
                description="주장을 할 때 데이터나 출처 같은 '근거'를 얼마나 엄격하게 요구할지 정합니다. '사실 검증 중심'으로 갈수록 뜬소문이나 감에 의존한 주장이 어려워집니다."
              />
            </label>
            <select
              value={settings.evidenceMode}
              onChange={(e) => updateSettings({ evidenceMode: e.target.value as EvidenceMode })}
              className={`w-full border rounded px-3 py-2 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="free">자유 토론 (근거 없어도 됨)</option>
              <option value="encouraged">근거 권장</option>
              <option value="enforced">근거 필수</option>
              <option value="fact_check">사실 검증 중심 (가장 엄격)</option>
            </select>
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              <span>최종 합의 도출 방식 (Consensus Mode)</span>
              <HelpTooltip
                title="최종 합의 도출 방식"
                description="토론이 끝날 때 반드시 하나의 결론으로 모아야 하는지, 아니면 의견 차이가 남아있어도 괜찮은지를 정합니다."
              />
            </label>
            <select
              value={settings.consensusMode}
              onChange={(e) => updateSettings({ consensusMode: e.target.value as ConsensusMode })}
              className={`w-full border rounded px-3 py-2 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="unresolved_allowed">미해결 이견 허용 (기본값)</option>
              <option value="majority">다수결 합의 (Majority)</option>
              <option value="supermajority">2/3 이상 찬성 (Supermajority)</option>
              <option value="unanimous">만장일치 도출 (Unanimous)</option>
              <option value="moderator_judgment">사회자 최종 판단 (Moderator)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. COST & TOKEN LIMITS */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex items-center gap-2 font-bold text-base text-amber-600 dark:text-amber-400 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <Cpu className="w-4 h-4" />
          <span>4. 토론 종료 조건 및 비용 한도</span>
          <HelpTooltip
            title="'턴'과 '토큰'이 뭔가요?"
            description={`턴(Turn): 누군가 한 번 발언하는 것을 1턴으로 셉니다. 아래 셋 중 하나라도 먼저 도달하면 토론이 자동으로 종료됩니다.\n\n토큰(Token): AI가 글자를 세는 단위로, 한글은 대략 1~2글자, 영단어는 1개가 토큰 1개 정도입니다. 실제 API 비용과 직결되므로, 토론이 길어질 것 같다면 한도를 넉넉히 잡아두세요.`}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              최대 진행 턴 수 (전체 발언 횟수)
            </label>
            <input
              type="number"
              min={1}
              value={settings.maxTurns}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v) && v >= 1) updateSettings({ maxTurns: v });
              }}
              className={`w-full border rounded px-2.5 py-1.5 text-sm font-mono font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              최대 토큰 한도 (AI 사용량 상한)
            </label>
            <input
              type="number"
              min={0}
              value={settings.maxTotalTokens}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v) && v >= 0) updateSettings({ maxTotalTokens: v });
              }}
              className={`w-full border rounded px-2.5 py-1.5 text-sm font-mono font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              최대 허용 비용 ($ USD)
            </label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={settings.maxCostLimitUsd}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v >= 0) updateSettings({ maxCostLimitUsd: v });
              }}
              className={`w-full border rounded px-2.5 py-1.5 text-sm font-mono font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
