import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Code, Info, X } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';

interface HelpTooltipProps {
  title: string;
  description: string;
  impact?: string;
  promptExample?: string;
  // Which edge of the trigger the popover hangs from. Default 'right' expands
  // leftward from the trigger (fine when there's room to the left). Use 'left'
  // when the trigger sits near the left edge of a clipped (overflow-hidden)
  // container, so the popover expands rightward instead and doesn't get cut off.
  align?: 'left' | 'right';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  description,
  impact,
  promptExample,
  align = 'right',
}) => {
  const { settings } = useDebateStore();
  const [isOpen, setIsOpen] = useState(false);
  const isLight = settings.theme !== 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click, matching ModelSelectBox's dropdown behavior.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block ml-1 z-20" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-center p-0.5 rounded-full transition ${
          isLight
            ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'
            : 'text-gray-500 hover:text-indigo-400 hover:bg-gray-800'
        }`}
        title="설명 및 프롬프트 주입 방식 보기"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div
          className={`fixed inset-0 sm:absolute sm:inset-auto sm:top-6 ${align === 'left' ? 'sm:left-0' : 'sm:right-0'} w-full sm:w-80 p-4 rounded-xl border shadow-xl z-50 animate-fadeIn ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 shadow-indigo-500/10'
              : 'bg-gray-900 border-gray-800 text-gray-100 shadow-black/50'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-1.5 font-bold text-sm text-indigo-600 dark:text-indigo-400">
              <Info className="w-4 h-4" />
              <span>{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2 text-sm leading-relaxed">
            <p className={`whitespace-pre-line ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{description}</p>

            {impact && (
              <div className={`p-2 rounded border text-[14px] ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-gray-950 border-gray-800 text-gray-400'
              }`}>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                  💡 지표 영향 (Impact):
                </span>
                <span>{impact}</span>
              </div>
            )}

            {/* Dynamic Prompt Injection Preview */}
            {promptExample && (
              <div className={`p-2 rounded border text-[14px] font-mono ${
                isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-gray-950 border-indigo-900/50 text-indigo-300'
              }`}>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1 flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  <span>시스템 프롬프트 반영 예시:</span>
                </span>
                <p className="whitespace-pre-wrap leading-tight text-[13px]">"{promptExample}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
