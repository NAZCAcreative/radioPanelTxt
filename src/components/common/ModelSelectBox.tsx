import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, DollarSign, Edit3, Check, Search, RefreshCw } from 'lucide-react';
import { OPENROUTER_MODELS, getModelMeta, fetchLiveOpenRouterModels, type LLMModelMeta } from '../../utils/modelData';
import { useDebateStore } from '../../store/useDebateStore';

interface ModelSelectBoxProps {
  value: string;
  onChange: (modelId: string) => void;
  label?: string;
}

export const ModelSelectBox: React.FC<ModelSelectBoxProps> = ({ value, onChange, label }) => {
  const { settings } = useDebateStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelsList, setModelsList] = useState<LLMModelMeta[]>(OPENROUTER_MODELS);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = settings.theme !== 'dark';
  const currentMeta = getModelMeta(value);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFetchLive = async () => {
    setIsLoadingLive(true);
    const live = await fetchLiveOpenRouterModels();
    setModelsList(live);
    setIsLoadingLive(false);
  };

  const filteredModels = modelsList.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectModel = (modelId: string) => {
    setIsCustomMode(false);
    onChange(modelId);
    setIsOpen(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onChange(customInput.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className={`block text-sm font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
          {label}
        </label>
      )}

      {/* Main Select Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-2.5 rounded-xl border transition shadow-sm flex items-center justify-between gap-2 ${
          isLight
            ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
            : 'bg-gray-950 hover:bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate">{currentMeta.name}</span>
            <span className={`text-[13px] font-bold px-2 py-0.5 rounded border shrink-0 font-mono ${currentMeta.badgeColor}`}>
              {currentMeta.provider}
            </span>
            <span className="text-[13px] font-mono text-slate-400 shrink-0">
              {currentMeta.costInput}
            </span>
          </div>

          <p className="text-[14px] text-slate-500 dark:text-gray-400 truncate mt-0.5">
            {currentMeta.trait}
          </p>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Rich Dropdown Modal / Popover */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl border-2 shadow-2xl z-[100] overflow-hidden animate-fadeIn ${
            isLight ? 'bg-white border-indigo-200 text-slate-800 shadow-indigo-500/20' : 'bg-gray-900 border-indigo-500/30 text-gray-100 shadow-black/80'
          }`}
        >
          {/* Header & Controls */}
          <div className={`p-2.5 border-b space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 shrink-0 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>OpenRouter LLM 모델 목록</span>
              </span>

              {/* Fetch Live Models Button */}
              <button
                type="button"
                onClick={handleFetchLive}
                disabled={isLoadingLive}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[13px] font-bold transition active:scale-95 shrink-0 whitespace-nowrap"
                title="OpenRouter에서 최신 300+개 전체 모델 가져오기"
              >
                <RefreshCw className={`w-3 h-3 shrink-0 ${isLoadingLive ? 'animate-spin' : ''}`} />
                <span>{isLoadingLive ? '불러오는 중...' : '🔄 실시간 목록 불러오기'}</span>
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="모델명 검색 (예: o3, claude-3.7, gemini-2.0, r1, grok)..."
                className={`w-full border rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-gray-900 border-gray-700 text-gray-100'
                }`}
              />
            </div>
          </div>

          {/* Model Options List */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredModels.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                일치하는 모델이 없습니다. 아래에서 모델명을 직접 입력하세요.
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = value === model.id && !isCustomMode;

                return (
                  <div
                    key={model.id}
                    onClick={() => handleSelectModel(model.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition space-y-1 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-500/20'
                        : isLight
                        ? 'bg-slate-50/60 hover:bg-slate-100 border-slate-200'
                        : 'bg-gray-950/60 hover:bg-gray-800/60 border-gray-800/80'
                    }`}
                  >
                    {/* Line 1: Name (full width, never cut off) */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white break-words">{model.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>

                    {/* Line 2: Provider & Performance Tier badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[13px] font-bold px-1.5 py-0.2 rounded border font-mono ${model.badgeColor}`}>
                        {model.provider}
                      </span>
                      {model.performanceTier && (
                        <span className="text-[12px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {model.performanceTier}
                        </span>
                      )}
                    </div>

                    {/* Line 3: Cost */}
                    <div className="flex items-center gap-2 text-[13px] font-mono text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>In: {model.costInput}</span>
                      </span>
                      <span>·</span>
                      <span>Out: {model.costOutput}</span>
                    </div>

                    {/* Line 4: LLM Character & Trait */}
                    <p className="text-[14px] text-slate-600 dark:text-gray-300 font-medium leading-tight">
                      {model.trait}
                    </p>

                    {/* Line 5: Recommended Role */}
                    <div className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">
                      🎯 {model.recommendedRole}
                    </div>
                  </div>
                );
              })
            )}

            {/* Custom Model Direct Input Box */}
            <div
              className={`p-2.5 rounded-xl border space-y-2 mt-2 ${
                isCustomMode
                  ? 'bg-indigo-50 border-indigo-500'
                  : isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-gray-950 border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-1 text-slate-700 dark:text-gray-300">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>직접 입력 (Custom OpenRouter Model)</span>
                </span>
              </div>

              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="예: openai/o3-mini, anthropic/claude-3.7-sonnet"
                  className={`flex-1 border rounded-lg px-2.5 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-gray-900 border-gray-700 text-gray-100'
                  }`}
                />
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow transition shrink-0 whitespace-nowrap"
                >
                  적용
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
