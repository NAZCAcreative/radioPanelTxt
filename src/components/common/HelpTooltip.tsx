import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Code, Info, X } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';

interface HelpTooltipProps {
  title: string;
  description: string;
  impact?: string;
  promptExample?: string;
  method?: string;
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
  method,
}) => {
  const { settings } = useDebateStore();
  const [isOpen, setIsOpen] = useState(false);
  const isLight = settings.theme !== 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click, matching ModelSelectBox's dropdown behavior.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className={`relative inline-block ml-1 ${isOpen ? 'z-[1000]' : 'z-10'}`}
      ref={containerRef}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-center rounded-full transition ${method ? 'gap-1 px-2 py-0.5 text-[12px] font-bold border' : 'p-0.5'} ${
          isLight
            ? 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200 border-slate-300'
            : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800 border-gray-700'
        }`}
        title="설명 및 프롬프트 주입 방식 보기"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {method && <span>방법 설명</span>}
      </button>

      {/* Popover Card */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/35 p-3 sm:p-6 backdrop-blur-[1px]"
          onMouseDown={() => setIsOpen(false)}
        >
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto p-4 rounded-xl border shadow-2xl isolate animate-fadeIn ${
            isLight
              ? 'bg-white border-indigo-200 text-slate-800 shadow-indigo-950/25'
              : 'bg-gray-900 border-gray-800 text-gray-100 shadow-black/50'
          }`}
          onMouseDown={(e) => e.stopPropagation()}
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

            {method && (
              <div className={`p-2.5 rounded border text-[14px] ${
                isLight ? 'bg-purple-50 border-purple-200 text-slate-700' : 'bg-purple-950/30 border-purple-900/60 text-gray-300'
              }`}>
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">⚙️ 실제 동작 방법</span>
                <p className="whitespace-pre-line">{method}</p>
              </div>
            )}

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
        </div>,
        document.body
      )}
    </div>
  );
};
