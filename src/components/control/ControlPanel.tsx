import React from 'react';
import { Sliders, Sparkles, Database, X } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { BasicTab } from './BasicTab';
import { AdvancedTab } from './AdvancedTab';
import { ResearchTab } from './ResearchTab';

interface ControlPanelProps {
  onCloseMobileDrawer?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onCloseMobileDrawer }) => {
  const { settings, activeTab, setActiveTab } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  return (
    <div
      className={`h-full flex flex-col border-r overflow-hidden transition-colors ${
        isLight ? 'bg-slate-50/90 border-slate-200 text-slate-800' : 'bg-gray-900/95 border-gray-800 text-gray-100'
      }`}
    >
      {/* Tab Navigation Header */}
      <div
        className={`flex items-center justify-between border-b px-4 pt-3 pb-2.5 z-10 shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-gray-950/80 border-gray-800'
        }`}
      >
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border w-full min-w-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-gray-900 border-gray-800'
          }`}
        >
          <button
            onClick={() => setActiveTab('BASIC')}
            className={`flex-1 min-w-0 py-1.5 px-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden ${
              activeTab === 'BASIC'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">기본 설정</span>
          </button>

          <button
            onClick={() => setActiveTab('ADVANCED')}
            className={`flex-1 min-w-0 py-1.5 px-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden ${
              activeTab === 'ADVANCED'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">가치관</span>
          </button>

          <button
            onClick={() => setActiveTab('RESEARCH')}
            className={`flex-1 min-w-0 py-1.5 px-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap overflow-hidden ${
              activeTab === 'RESEARCH'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">기억/정책</span>
          </button>
        </div>

        {onCloseMobileDrawer && (
          <button
            onClick={onCloseMobileDrawer}
            className={`md:hidden p-1 rounded ${
              isLight ? 'text-slate-500 hover:text-slate-800 bg-slate-200' : 'text-gray-400 hover:text-white bg-gray-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tab Content Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'BASIC' && <BasicTab />}
        {activeTab === 'ADVANCED' && <AdvancedTab />}
        {activeTab === 'RESEARCH' && <ResearchTab />}
      </div>
    </div>
  );
};
