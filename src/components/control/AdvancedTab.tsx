import React, { useState } from 'react';
import { ShieldAlert, BrainCircuit, Scale } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import type { EvidencePreference, UncertaintyExpression } from '../../types/debate';
import { HelpTooltip } from '../common/HelpTooltip';
import { PromptPreviewModal } from '../common/PromptPreviewModal';

export const AdvancedTab: React.FC = () => {
  const { settings, updateAgent } = useDebateStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(settings.agents[0]?.id || '');

  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const isLight = settings.theme !== 'dark';
  const agent = settings.agents.find((a) => a.id === selectedAgentId) || settings.agents[0];

  if (!agent) return <div className="text-slate-500 text-sm">No agent configured.</div>;

  return (
    <div className={`space-y-6 pb-8 transition-colors ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
      {/* Agent Selector Dropdown & Prompt Preview */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10 backdrop-blur-md shadow-sm ${
          isLight ? 'bg-white/90 border-slate-200' : 'bg-gray-900/90 border-gray-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className={`min-w-0 w-full border rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isLight ? 'bg-slate-50 border-slate-300 text-indigo-700' : 'bg-gray-950 border-gray-800 text-indigo-300'
            }`}
          >
            {settings.agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.job})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsPromptPreviewOpen(true)}
          className="text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm shrink-0 whitespace-nowrap"
        >
          <span>👁️ 프롬프트 미리보기</span>
        </button>
      </div>

      {/* 1. AGENT IDENTITY */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 block border-b border-slate-100 pb-2">
          1. 정체성 및 역할 설정 (Identity & Role)
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              전문 분야 (Expertise)
            </label>
            <input
              type="text"
              value={agent.expertise.join(', ')}
              onChange={(e) =>
                updateAgent(agent.id, {
                  expertise: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className={`w-full border rounded px-2.5 py-1.5 text-sm ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>
          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              토론에서의 역할 (Role)
            </label>
            <input
              type="text"
              value={agent.roleInDebate}
              onChange={(e) => updateAgent(agent.id, { roleInDebate: e.target.value })}
              className={`w-full border rounded px-2.5 py-1.5 text-sm ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            말투 & 어조 (Speaking Style)
          </label>
          <input
            type="text"
            value={agent.speakingStyle}
            onChange={(e) => updateAgent(agent.id, { speakingStyle: e.target.value })}
            placeholder="e.g. 짧은 문장. 직설적. 필요시 상대 이름을 부름."
            className={`w-full border rounded px-2.5 py-1.5 text-sm ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
            }`}
          />
        </div>
      </div>

      {/* 2. CORE VALUES (0 - 100 Sliders) */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 block border-b border-slate-100 pb-2 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>2. Core Values (가치관 파라미터)</span>
          <HelpTooltip
            title="Core Values (가치관 파라미터)"
            description="진보/보수, 자유/공동체, 시장/정부 등 9가지 핵심 가치 축에 따라 에이전트의 이념적 성향을 결정합니다."
            impact="토론 시 어떤 측면의 가치(예: 효율 vs 공정)를 최우선으로 변호할지 판단 기준이 됩니다."
            promptExample="CORE VALUES: Progressive vs Conservative: 30/100 (Progressive/진보적), Efficiency vs Fairness: 20/100 (Fairness/공정성)"
          />
        </span>

        <div className="space-y-3 text-sm">
          <SliderRow
            leftLabel="진보"
            rightLabel="보수"
            value={agent.coreValues.progressiveVsConservative}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, progressiveVsConservative: v },
              })
            }
          />
          <SliderRow
            leftLabel="개인 자유"
            rightLabel="공동체 책임"
            value={agent.coreValues.libertyVsCommunity}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, libertyVsCommunity: v },
              })
            }
          />
          <SliderRow
            leftLabel="시장 중심"
            rightLabel="정부 개입"
            value={agent.coreValues.marketVsGovernment}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, marketVsGovernment: v },
              })
            }
          />
          <SliderRow
            leftLabel="효율성"
            rightLabel="공정성"
            value={agent.coreValues.efficiencyVsFairness}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, efficiencyVsFairness: v },
              })
            }
          />
          <SliderRow
            leftLabel="기술 낙관"
            rightLabel="기술 회의"
            value={agent.coreValues.techOptimismVsSkepticism}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, techOptimismVsSkepticism: v },
              })
            }
          />
          <SliderRow
            leftLabel="이상주의"
            rightLabel="현실주의"
            value={agent.coreValues.idealismVsRealism}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                coreValues: { ...agent.coreValues, idealismVsRealism: v },
              })
            }
          />
        </div>
      </div>

      {/* 3. PERSONALITY PARAMETERS */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 block border-b border-slate-100 pb-2 flex items-center gap-2">
          <span>3. 성격 파라미터 (Personality)</span>
          <HelpTooltip
            title="성격 파라미터"
            description="이 에이전트가 실제로 말할 때 보이는 태도를 결정합니다. 예를 들어 '적극적'을 높이면 먼저 나서서 발언하고, '회의적'을 높이면 상대 주장에 쉽게 동의하지 않습니다."
            impact="가치관(Core Values)이 '무엇을 믿는지'라면, 성격은 '그것을 어떤 태도로 말하는지'를 결정합니다."
          />
        </span>

        <div className="space-y-3 text-sm">
          <SliderRow
            leftLabel="소극적 (Passive)"
            rightLabel="적극적 (Assertive)"
            value={agent.personality.assertiveness}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                personality: { ...agent.personality, assertiveness: v },
              })
            }
          />
          <SliderRow
            leftLabel="고집 (Stubborn)"
            rightLabel="유연 (Open-minded)"
            value={agent.personality.openness}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                personality: { ...agent.personality, openness: v },
              })
            }
          />
          <SliderRow
            leftLabel="대립적 (Adversarial)"
            rightLabel="협력적 (Agreeable)"
            value={agent.personality.agreeableness}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                personality: { ...agent.personality, agreeableness: v },
              })
            }
          />
          <SliderRow
            leftLabel="수용적 (Accepting)"
            rightLabel="회의적 (Skeptical)"
            value={agent.personality.skepticism}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                personality: { ...agent.personality, skepticism: v },
              })
            }
          />
        </div>
      </div>

      {/* 4. EPISTEMIC STYLE */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <span className="font-bold text-base text-purple-600 dark:text-purple-400 block border-b border-slate-100 pb-2 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          <span>4. 지식 판단 방식 (Epistemic Style)</span>
          <HelpTooltip
            title="지식 판단 방식이란?"
            description="이 에이전트가 '무엇을 근거로 삼아 확신하는지'를 정합니다. 예: 데이터를 중시하는 사람 vs 논문을 중시하는 사람 vs 경험담을 중시하는 사람."
            impact="'근거 요구 수준'을 높이면 상대에게 더 엄격하게 증거를 요구하고, 스스로도 근거 없이는 잘 주장하지 않습니다."
          />
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              근거 선호 (Evidence Preference)
            </label>
            <select
              value={agent.epistemic.evidencePreference}
              onChange={(e) =>
                updateAgent(agent.id, {
                  epistemic: {
                    ...agent.epistemic,
                    evidencePreference: e.target.value as EvidencePreference,
                  },
                })
              }
              className={`w-full border rounded px-2.5 py-1.5 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="data">데이터 중심</option>
              <option value="papers">논문 / 학술</option>
              <option value="experience">경험 / 케이스</option>
              <option value="law">법률 / 규정</option>
              <option value="logic">논리적 연쇄</option>
              <option value="expert_opinion">전문가 의견</option>
              <option value="balanced">균형적 근거</option>
            </select>
          </div>

          <div>
            <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              불확실성 표현 방식
            </label>
            <select
              value={agent.epistemic.uncertaintyExpression}
              onChange={(e) =>
                updateAgent(agent.id, {
                  epistemic: {
                    ...agent.epistemic,
                    uncertaintyExpression: e.target.value as UncertaintyExpression,
                  },
                })
              }
              className={`w-full border rounded px-2.5 py-1.5 text-sm font-medium ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              <option value="cautious">신중형 (가능성이 있다, 불확실하다)</option>
              <option value="decisive">확신형 (단정적, 명확한 주장)</option>
            </select>
          </div>
        </div>

        <div>
          <SliderRow
            leftLabel="근거 요구 수준 (Strictness)"
            rightLabel="높음 (Strict)"
            value={agent.epistemic.evidenceStrictness}
            isLight={isLight}
            onChange={(v) =>
              updateAgent(agent.id, {
                epistemic: { ...agent.epistemic, evidenceStrictness: v },
              })
            }
          />
        </div>
      </div>

      {/* 5. ANTI-SYCOPHANCY & PERSPECTIVE PRESERVATION */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 block border-b border-slate-100 pb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>5. 무조건 동의 방지 설정</span>
          <HelpTooltip
            title="왜 필요한가요?"
            description="AI는 종종 대화 상대(사회자나 다른 패널)의 의견에 근거 없이 쉽게 동조하는 경향이 있습니다. 이 설정을 켜두면 그런 '묻지마 동의'를 막아, 토론이 더 다채롭고 실감나게 진행됩니다."
          />
        </span>

        <div className="space-y-3">
          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div>
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                독립적 판단 유지 (Independent Thinking)
              </span>
              <span className="text-[14px] text-slate-500">
                다수나 사회자가 주장해도 무조건 동의하지 않고 독립 판단
              </span>
            </div>
            <input
              type="checkbox"
              checked={agent.independentThinking}
              onChange={(e) => updateAgent(agent.id, { independentThinking: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>

          <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div>
              <span className={`text-sm font-bold block ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                고유 관점 수호 (Preserve Distinct Perspective)
              </span>
              <span className="text-[14px] text-slate-500">
                지나치게 빨리 유사한 의견으로 수렴하지 않도록 자기 관점 유지
              </span>
            </div>
            <input
              type="checkbox"
              checked={agent.preserveDistinctPerspective}
              onChange={(e) => updateAgent(agent.id, { preserveDistinctPerspective: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      <PromptPreviewModal
        key={selectedAgentId}
        isOpen={isPromptPreviewOpen}
        onClose={() => setIsPromptPreviewOpen(false)}
        targetId={selectedAgentId}
      />
    </div>
  );
};

interface SliderRowProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  isLight: boolean;
  onChange: (val: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ leftLabel, rightLabel, value, isLight, onChange }) => (
  <div>
    <div className={`flex justify-between text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
      <span>{leftLabel}</span>
      <span className="text-indigo-600 font-bold">{value}</span>
      <span>{rightLabel}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full accent-indigo-600"
    />
  </div>
);
