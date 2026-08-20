import React from 'react';
import { X, Layers, Users, GraduationCap, Flame, Lightbulb, Tv, ShieldAlert, Check } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { DEBATE_PRESETS } from '../../utils/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ isOpen, onClose }) => {
  const { settings, applyDebatePreset } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-600" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-600" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-emerald-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'
          }`}
        >
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>패널로그 토론 프리셋</span>
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700 bg-slate-200/60' : 'text-gray-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            원하는 토론 분위기와 사회자 성격을 즉시 적용하는 프리셋을 선택하세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEBATE_PRESETS.map((preset) => {
              const isActive = settings.activePresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    applyDebatePreset(preset.id);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                      : 'bg-gray-950 border-gray-800 hover:border-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${isLight ? 'bg-white border-slate-200' : 'bg-gray-900 border-gray-800'}`}>
                        {getIcon(preset.iconName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{preset.name}</h3>
                        <span className="text-[13px] text-slate-500">Goal: {preset.goal}</span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="bg-indigo-600 text-white p-1 rounded-full text-sm">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-[14px] text-slate-600 dark:text-gray-400 leading-relaxed">{preset.description}</p>

                  <div className="flex items-center gap-2 text-[13px] text-slate-400 font-mono pt-2 border-t border-slate-200/60">
                    <span>Challenge: {preset.challengeMode}%</span>
                    <span>·</span>
                    <span>Mod Neutral: {preset.moderatorNeutrality}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
