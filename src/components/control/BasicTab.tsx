import React, { useState } from 'react';
import {
  Key,
  Sparkles,
  UserPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Bot,
  UserCheck,
  Newspaper,
  Minus,
  Plus,
  Save,
  FileText,
  Code,
  Loader2,
  Check,
} from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import type { DebateSettings, DiscussionGoal } from '../../types/debate';
import { HelpTooltip } from '../common/HelpTooltip';
import { PromptPreviewModal } from '../common/PromptPreviewModal';
import { ModelSelectBox } from '../common/ModelSelectBox';
import { fetchHotNews } from '../../utils/newsFetcher';
import { saveAgentPreset } from '../../utils/agentPresetArchive';
import { exportAgentAsJson, exportAgentPromptAsText } from '../../utils/agentExport';

export const BasicTab: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateAgent,
    addAgent,
    removeAgent,
    generateRandomPersonasForTopic,
    startDebate,
    session,
  } = useDebateStore();

  const [expandedAgentIds, setExpandedAgentIds] = useState<Set<string>>(
    () => new Set(settings.agents[0] ? [settings.agents[0].id] : [])
  );
  const [previewTargetId, setPreviewTargetId] = useState<string | null>(null);
  const [justSavedAgentId, setJustSavedAgentId] = useState<string | null>(null);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  const [newsStatus, setNewsStatus] = useState<{
    isLive: boolean;
    keyErrorMessage?: string;
  } | null>(null);
  const [justSavedSettings, setJustSavedSettings] = useState(false);

  const isLight = settings.theme !== 'dark';

  const handleSaveAgentPreset = (agentId: string) => {
    const agent = settings.agents.find((a) => a.id === agentId);
    if (!agent) return;
    saveAgentPreset(agent);
    setJustSavedAgentId(agentId);
    setTimeout(() => setJustSavedAgentId((cur) => (cur === agentId ? null : cur)), 1500);
  };

  const handleSaveSettings = () => {
    // Switching keyStorage to 'localstorage' immediately persists the entire
    // current settings object, and every future change auto-saves from then
    // on (see the store's global settings-change subscription).
    updateSettings({ keyStorage: 'localstorage' });
    setJustSavedSettings(true);
    setTimeout(() => setJustSavedSettings(false), 1500);
  };

  const handleDeleteSavedSettings = () => {
    if (!window.confirm('이 브라우저에 저장된 설정을 삭제할까요? (지금 화면의 설정은 이번 세션에서는 계속 사용됩니다)')) {
      return;
    }
    updateSettings({ keyStorage: 'donotsave' });
  };

  const toggleAgentExpanded = (agentId: string) => {
    setExpandedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  };

  const expandAllAgents = () => setExpandedAgentIds(new Set(settings.agents.map((a) => a.id)));
  const collapseAllAgents = () => setExpandedAgentIds(new Set());

  const handleFetchHotNews = async () => {
    setIsFetchingNews(true);
    setNewsStatus(null);
    try {
      const news = await fetchHotNews(settings.apiKey, settings.globalModel);
      updateSettings({
        topic: news.topic,
        backgroundContext: news.backgroundContext,
      });
      setNewsStatus({
        isLive: news.isLive,
        keyErrorMessage: news.keyErrorMessage,
      });
    } finally {
      setIsFetchingNews(false);
    }
  };

  const handleStartClick = () => {
    if (session.messages.length > 0) {
      const confirmed = window.confirm(
        '현재 진행 중인 토론 내용이 모두 사라지고 새로 시작됩니다. 필요하다면 먼저 헤더의 "세션 저장/불러오기"로 저장하세요. 계속할까요?'
      );
      if (!confirmed) return;
    }
    startDebate();
  };

  const goalOptions: { value: DiscussionGoal; label: string }[] = [
    { value: 'open_debate', label: '열린 토론 (Open Debate)' },
    { value: 'pro_con', label: '찬반 토론 (Pro/Con Debate)' },
    { value: 'problem_solving', label: '문제 해결 (Problem Solving)' },
    { value: 'brainstorming', label: '아이디어 발산 (Brainstorming)' },
    { value: 'policy_decision', label: '정책 결정 (Policy Decision)' },
    { value: 'expert_panel', label: '전문가 패널 (Expert Panel)' },
    { value: 'philosophical', label: '철학적 토론 (Philosophical)' },
    { value: 'news_analysis', label: '뉴스 분석 (News Analysis)' },
    { value: 'fact_verification', label: '사실 검증 (Fact Check)' },
    { value: 'consensus', label: '합의 도출 (Consensus)' },
    { value: 'unresolved_allowed', label: '합의하지 않아도 됨 (Unresolved Allowed)' },
    { value: 'roleplay', label: '역할극 토론 (Roleplay)' },
  ];

  return (
    <div className={`space-y-6 pb-8 transition-colors ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
      {/* 1. API PROVIDER & GLOBAL SETTINGS BAR */}
      <div
        className={`p-3 rounded-xl border space-y-3 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 min-w-0">
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">AI 응답 방식</span>
            <HelpTooltip
              title="AI 응답 방식이란?"
              description={`이 앱은 OpenRouter(여러 AI 모델을 하나의 키로 쓸 수 있는 서비스)를 사용합니다. openrouter.ai에서 발급받은 API 키를 아래에 입력해야 진짜 AI가 실시간으로 답변을 생성합니다.`}
            />
          </div>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">🌐 OpenRouter</span>
        </div>

        {/* API Key - single input shared by moderator, every agent, and the hot-news lookup */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-gray-800">
          <span className="text-[14px] font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <span>API 키:</span>
            <HelpTooltip
              title="API 키"
              description="여기 하나만 입력하면 사회자와 모든 에이전트, '오늘의 핫 뉴스 가져오기'까지 전부 이 키를 공통으로 사용합니다. openrouter.ai에서 가입 후 발급받을 수 있습니다."
            />
          </span>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => updateSettings({ apiKey: e.target.value })}
            placeholder="sk-or-v1-••••••••••••••••"
            className={`flex-1 border rounded-lg px-2.5 py-1 text-sm font-mono focus:outline-none ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
            }`}
          />
        </div>

        {/* Default Response Model - used by any agent/moderator without its own override */}
        <div className="pt-1 border-t border-slate-100 dark:border-gray-800">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[14px] font-semibold text-slate-500 shrink-0">기본 응답 모델:</span>
            <HelpTooltip
              title="기본 응답 모델이란?"
              description="사회자나 각 에이전트 카드에서 모델을 따로 지정하지 않으면 전부 여기서 고른 모델을 공통으로 사용합니다. 카드별로 다른 모델을 쓰고 싶으면 해당 카드에서 개별로 바꾸면 됩니다."
            />
          </div>
          <ModelSelectBox
            value={settings.globalModel}
            onChange={(modelId) => updateSettings({ globalModel: modelId })}
          />
        </div>

        {/* Full Settings Local Save / Delete */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-gray-800">
          <span className="text-[14px] font-semibold text-slate-500 shrink-0 flex items-center gap-1">
            <span>설정 저장:</span>
            <HelpTooltip
              title="설정 저장이란?"
              description={`API 키, 토론 주제, 사회자/에이전트 구성(이름·페르소나 포함), 모든 정책 슬라이더 등 지금 화면에 있는 설정 전체를 이 브라우저에 저장해둡니다. 저장해두면 다음에 다시 열거나 새로고침해도 그대로 유지됩니다.\n\n"저장"을 한 번 누르면 그 이후 바뀌는 모든 설정이 자동으로 계속 저장되고, "삭제"를 누르면 저장된 내용을 이 브라우저에서 지웁니다 (온라인 서버가 아니라 이 브라우저에만 저장됩니다). 진행 중인 토론 대화 내용은 별도로 "세션 저장/불러오기"를 이용하세요.`}
            />
          </span>

          {settings.keyStorage === 'localstorage' ? (
            <>
              <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Check className="w-3.5 h-3.5" />
                {justSavedSettings ? '저장됨!' : '이 브라우저에 저장됨 (자동 저장 중)'}
              </span>
              <button
                onClick={handleDeleteSavedSettings}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[13px] font-bold border bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 transition shrink-0 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            </>
          ) : (
            <>
              <span className="text-[13px] text-slate-400 shrink-0 whitespace-nowrap">저장 안 함 (새로고침하면 초기화됨)</span>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[13px] font-bold border bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 transition shrink-0 whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>저장</span>
              </button>
            </>
          )}
        </div>
        {settings.keyStorage === 'localstorage' && (
          <p className="text-[13px] text-amber-600 dark:text-amber-400 leading-relaxed">
            ⚠️ API 키를 포함한 전체 설정이 이 브라우저의 localStorage에 평문으로 저장됩니다. 공용 PC에서는 사용하지 마세요.
          </p>
        )}
      </div>

      {/* 2. DEBATE TOPIC & CONTEXT */}
      <div
        className={`p-4 rounded-xl border space-y-4 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex flex-wrap items-center justify-between gap-y-2 gap-x-3 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shrink-0 whitespace-nowrap">
            <span>Debate Topic & Background</span>
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Hot News Button */}
            <button
              onClick={handleFetchHotNews}
              disabled={isFetchingNews}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 text-amber-800 font-bold rounded-lg text-sm border border-amber-200 transition active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
              title={settings.apiKey ? 'OpenRouter로 오늘의 토론 이슈 추천받기' : '예시 이슈 목록에서 무작위로 가져오기 (실시간 추천은 위에서 API 키 입력)'}
            >
              {isFetchingNews ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-spin" />
              ) : (
                <Newspaper className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span>📰 {isFetchingNews ? '가져오는 중...' : '오늘의 핫 뉴스 가져오기'}</span>
            </button>

            <button
              onClick={generateRandomPersonasForTopic}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-sm border border-indigo-200 transition active:scale-95 shadow-sm shrink-0 whitespace-nowrap"
              title="Generate diverse personas tailored to this topic"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>🎲 Personas 생성</span>
            </button>
          </div>
        </div>

        {/* Hot News Fetch Status */}
        <div className="space-y-1.5">
          {!settings.apiKey.trim() && (
            <p className="text-[13px] text-slate-500 leading-relaxed">
              ℹ️ 위의 API 키를 입력하지 않으면 예시 주제 목록에서 무작위로 가져옵니다. API 키를 입력하면 매번 새로운 이슈를 추천받습니다.
            </p>
          )}

          {/* Result of the most recent fetch attempt */}
          {newsStatus && newsStatus.isLive && (
            <p className="text-[13px] leading-relaxed text-emerald-600 dark:text-emerald-400">
              ✅ OpenRouter가 추천한 이슈를 가져왔습니다
            </p>
          )}
          {newsStatus && !newsStatus.isLive && newsStatus.keyErrorMessage && (
            <p className="text-[13px] leading-relaxed text-amber-600 dark:text-amber-400">
              ⚠️ 입력하신 API 키로 이슈를 가져오지 못해 예시 주제로 대체했습니다. ({newsStatus.keyErrorMessage})
            </p>
          )}
          {newsStatus && !newsStatus.isLive && !newsStatus.keyErrorMessage && settings.apiKey.trim() && (
            <p className="text-[13px] leading-relaxed text-slate-500">
              ℹ️ 예시 주제 목록에서 가져왔습니다.
            </p>
          )}
        </div>

        {/* Topic Input */}
        <div>
          <label className={`block text-sm font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            토론 주제 (Debate Topic)
          </label>
          <textarea
            rows={3}
            value={settings.topic}
            onChange={(e) => updateSettings({ topic: e.target.value })}
            placeholder="토론할 주제를 입력하세요..."
            className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none font-medium ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
            }`}
          />
          <div className="mt-2 space-y-2">
            <select
              value={settings.contextVisibility}
              onChange={(e) => updateSettings({ contextVisibility: e.target.value as DebateSettings['contextVisibility'] })}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-gray-950 border-gray-800'}`}
            >
              <option value="all">모든 참가자에게 공개</option>
              <option value="moderator_only">사회자에게만 공개</option>
              <option value="selected">선택한 참가자에게만 공개</option>
            </select>
            {settings.contextVisibility === 'selected' && (
              <div className="flex flex-wrap gap-2">
                {settings.agents.map((agent) => (
                  <label key={agent.id} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.selectedContextAgentIds.includes(agent.id)}
                      onChange={(e) => updateSettings({
                        selectedContextAgentIds: e.target.checked
                          ? [...settings.selectedContextAgentIds, agent.id]
                          : settings.selectedContextAgentIds.filter((id) => id !== agent.id),
                      })}
                    />
                    {agent.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Background Context */}
        <div>
          <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            배경 정보 / Context (Optional)
          </label>
          <textarea
            rows={2}
            value={settings.backgroundContext}
            onChange={(e) => updateSettings({ backgroundContext: e.target.value })}
            placeholder="자료나 사전 사건 설명, 배경 정보를 입력하세요..."
            className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-300'
            }`}
          />
        </div>

        {/* Discussion Goal & Participant Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              토론 목적 (어떤 방식으로 대화를 진행할지)
            </label>
            <select
              value={settings.discussionGoal}
              onChange={(e) => updateSettings({ discussionGoal: e.target.value as DiscussionGoal })}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
              }`}
            >
              {goalOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className={`flex justify-between text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              <span>패널 참가자 수 (사회자 제외)</span>
              <span className="text-indigo-600 font-bold">{settings.agents.length}명</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => removeAgent(settings.agents[settings.agents.length - 1].id)}
                disabled={settings.agents.length <= 2}
                className={`shrink-0 p-1.5 rounded-lg border transition disabled:opacity-30 ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
                }`}
                title="참가자 1명 감소"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={2}
                max={10}
                value={settings.agents.length}
                onChange={(e) => {
                  const targetCount = parseInt(e.target.value, 10);
                  if (targetCount > settings.agents.length) {
                    addAgent();
                  } else if (targetCount < settings.agents.length) {
                    removeAgent(settings.agents[settings.agents.length - 1].id);
                  }
                }}
                className="w-full accent-indigo-600"
              />
              <button
                type="button"
                onClick={addAgent}
                disabled={settings.agents.length >= 10}
                className={`shrink-0 p-1.5 rounded-lg border transition disabled:opacity-30 ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
                }`}
                title="참가자 1명 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODERATOR AGENT CARD WITH MODEL SELECTOR */}
      <div
        className={`p-4 rounded-xl border space-y-3 shadow-sm transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
        }`}
      >
        <div className={`flex flex-wrap items-center justify-between gap-y-2 gap-x-3 border-b pb-2.5 ${isLight ? 'border-slate-100' : 'border-gray-800'}`}>
          <div className="flex items-center gap-2 font-bold text-base text-purple-600 dark:text-purple-400 min-w-0">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Moderator Agent (사회자) 설정</span>
            <HelpTooltip
              title="사회자 에이전트 (Moderator)"
              description="사회자는 토론에 참가해 중립을 유지하면서 발언자를 지정하고 질문 및 근거 요구를 주도하는 진행자 역할을 수행합니다."
              impact="중립성 slider(85%) 및 개입 빈도(60%)에 따라 발언 타이밍이 결정됩니다."
              promptExample="YOU ARE THE DEBATE MODERATOR: 유진 (시사 토론 전문 진행자). NEUTRALITY: 85% Neutral."
            />
          </div>
          <button
            onClick={() => setPreviewTargetId('moderator')}
            className="text-[14px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1 transition shrink-0 whitespace-nowrap"
          >
            <span>👁️ 프롬프트 미리보기</span>
          </button>
        </div>

        {/* 1. Moderator Model Selector (Independent Top Row Above Name) */}
        <div>
          <ModelSelectBox
            value={settings.moderator.customModel || settings.globalModel}
            onChange={(modelId) =>
              updateSettings({
                moderator: { ...settings.moderator, customModel: modelId },
              })
            }
            label="사회자가 사용할 AI 모델 (두뇌) 선택"
          />
        </div>

        {/* 2. Moderator Name */}
        <div>
          <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            사회자 이름
          </label>
          <input
            type="text"
            value={settings.moderator.name}
            onChange={(e) =>
              updateSettings({
                moderator: { ...settings.moderator, name: e.target.value },
              })
            }
            className={`w-full border rounded px-2.5 py-1.5 text-sm font-semibold ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
            }`}
          />
        </div>

        <div>
          <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            사회자 Persona
          </label>
          <textarea
            rows={2}
            value={settings.moderator.persona}
            onChange={(e) =>
              updateSettings({
                moderator: { ...settings.moderator, persona: e.target.value },
              })
            }
            className={`w-full border rounded p-2 text-sm resize-none ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-300'
            }`}
          />
        </div>
      </div>

      {/* 4. AGENT CARDS LIST WITH PER-AGENT MODEL SELECTION */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
          <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 flex items-center gap-2 shrink-0 whitespace-nowrap">
            <Bot className="w-4 h-4 shrink-0" />
            <span>토론 참가자 목록 ({settings.agents.length}명)</span>
            <HelpTooltip
              title="참가자(에이전트) 카드"
              description="아래 카드 하나가 토론에 참가하는 AI 캐릭터 한 명입니다. 카드를 펼쳐서 이름, 직업, 성격, 초기 입장을 자유롭게 바꿀 수 있습니다."
            />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={expandAllAgents}
              className="flex items-center gap-1 text-[14px] text-slate-500 font-bold hover:text-indigo-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0 whitespace-nowrap"
              title="모든 에이전트 카드 펼치기"
            >
              <ChevronsDown className="w-3.5 h-3.5 shrink-0" />
              <span>모두 펼치기</span>
            </button>
            <button
              onClick={collapseAllAgents}
              className="flex items-center gap-1 text-[14px] text-slate-500 font-bold hover:text-indigo-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0 whitespace-nowrap"
              title="모든 에이전트 카드 접기"
            >
              <ChevronsUp className="w-3.5 h-3.5 shrink-0" />
              <span>모두 접기</span>
            </button>
            <button
              onClick={addAgent}
              className="flex items-center gap-1 text-sm text-indigo-600 font-bold hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 shrink-0 whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Agent</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {settings.agents.map((agent) => {
            const isExpanded = expandedAgentIds.has(agent.id);

            return (
              <div
                key={agent.id}
                className={`rounded-xl border transition shadow-sm relative ${
                  isExpanded ? 'z-30' : 'z-10'
                } ${
                  isLight ? 'bg-white border-slate-200' : 'bg-gray-900/80 border-gray-800'
                }`}
              >
                {/* Header bar */}
                <div
                  onClick={() => toggleAgentExpanded(agent.id)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition select-none rounded-t-xl ${
                    isLight ? 'bg-slate-50/80 hover:bg-slate-100' : 'bg-gray-950/60 hover:bg-gray-950'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                      style={{ backgroundColor: agent.avatarColor }}
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-bold text-sm shrink-0 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {agent.name}
                      </span>
                      <span className="text-[14px] text-slate-500 font-medium truncate">· {agent.job}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Per-Agent Model Badge */}
                    <span className="hidden sm:inline-block max-w-[110px] truncate text-[13px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                      {agent.customModel || settings.globalModel}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTargetId(agent.id);
                      }}
                      className="text-[13px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 transition shrink-0 whitespace-nowrap"
                      title="Inspect compiled System & User Prompt"
                    >
                      <span className="hidden sm:inline">👁️ 프롬프트</span>
                      <span className="sm:hidden">👁️</span>
                    </button>

                    {settings.agents.length > 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAgent(agent.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                        title="Remove Agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`p-4 space-y-4 border-t rounded-b-xl ${isLight ? 'border-slate-100 bg-white' : 'border-gray-800 bg-gray-900/50'}`}>
                    {/* 0. Persona Save & Export Toolbar */}
                    <div
                      className={`p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
                      }`}
                    >
                      <span className="text-[14px] font-semibold text-slate-500 shrink-0 whitespace-nowrap">
                        이 설정이 마음에 드시나요?
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleSaveAgentPreset(agent.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[14px] font-bold border transition shrink-0 whitespace-nowrap ${
                            justSavedAgentId === agent.id
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200'
                          }`}
                          title="이 에이전트 페르소나를 프리셋 라이브러리에 저장"
                        >
                          <Save className="w-3.5 h-3.5 shrink-0" />
                          <span>{justSavedAgentId === agent.id ? '저장됨!' : '프리셋 저장'}</span>
                        </button>
                        <button
                          onClick={() => exportAgentPromptAsText(agent, settings)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[14px] font-bold border bg-white hover:bg-slate-100 text-slate-700 border-slate-300 transition shrink-0 whitespace-nowrap"
                          title="다른 사이트에 붙여넣을 수 있는 프롬프트(.txt)로 내보내기"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>TXT</span>
                        </button>
                        <button
                          onClick={() => exportAgentAsJson(agent)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[14px] font-bold border bg-white hover:bg-slate-100 text-slate-700 border-slate-300 transition shrink-0 whitespace-nowrap"
                          title="전체 설정을 JSON으로 내보내기 (백업 / 재가져오기용)"
                        >
                          <Code className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* 1. Per-Agent Model Selection (Standalone Top Row Above Name) */}
                    <div>
                      <ModelSelectBox
                        value={agent.customModel || settings.globalModel}
                        onChange={(modelId) => updateAgent(agent.id, { customModel: modelId })}
                        label="이 참가자가 사용할 AI 모델 (두뇌) 선택"
                      />
                    </div>

                    {/* 2. Name & Job */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          이름 (자유롭게 변경 가능)
                        </label>
                        <input
                          type="text"
                          value={agent.name}
                          onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                          title="이 참가자의 표시 이름을 원하는 대로 바꿀 수 있습니다."
                          className={`w-full border rounded px-2.5 py-1.5 text-sm font-semibold ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          직업 (Job)
                        </label>
                        <input
                          type="text"
                          value={agent.job}
                          onChange={(e) => updateAgent(agent.id, { job: e.target.value })}
                          className={`w-full border rounded px-2.5 py-1.5 text-sm ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-gray-950 border-gray-800 text-gray-200'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Simple Persona */}
                    <div>
                      <label className={`block text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                        Persona (성격 및 가치관)
                      </label>
                      <textarea
                        rows={3}
                        value={agent.simplePersona}
                        onChange={(e) => updateAgent(agent.id, { simplePersona: e.target.value })}
                        className={`w-full border rounded p-2.5 text-sm leading-relaxed resize-none ${
                          isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-gray-950 border-gray-800 text-gray-200'
                        }`}
                      />
                    </div>

                    {/* Initial Stance Slider */}
                    <div>
                      <div className={`flex justify-between text-[14px] font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                        <span>초기 입장 (Initial Stance)</span>
                        <span
                          className={`font-bold ${
                            agent.initialStance > 0
                              ? 'text-emerald-600'
                              : agent.initialStance < 0
                              ? 'text-rose-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {agent.initialStance > 0
                            ? `찬성 (+${agent.initialStance})`
                            : agent.initialStance < 0
                            ? `반대 (${agent.initialStance})`
                            : '중립 (0)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={agent.initialStance}
                        onChange={(e) =>
                          updateAgent(agent.id, {
                            initialStance: parseInt(e.target.value, 10),
                            currentStance: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartClick}
        disabled={session.status === 'running'}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-md shadow-indigo-500/30 hover:opacity-95 transition disabled:opacity-50 active:scale-95"
      >
        🚀 Start Debate Simulation
      </button>

      <PromptPreviewModal
        key={previewTargetId || 'agent_1'}
        isOpen={Boolean(previewTargetId)}
        onClose={() => setPreviewTargetId(null)}
        targetId={previewTargetId || 'agent_1'}
      />
    </div>
  );
};
