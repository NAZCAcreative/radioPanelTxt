import React, { useEffect, useState } from 'react';
import { X, Link2, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useDebateStore } from '../../store/useDebateStore';
import { listMyDebates, type MyDebateSummary } from '../../utils/shareDebate';
import { hashApiKey, nicknameFromKeyHash } from '../../utils/anonymousIdentity';

interface MyDebatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export const MyDebatesModal: React.FC<MyDebatesModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useDebateStore();
  const isLight = settings.theme !== 'dark';

  const [state, setState] = useState<
    { status: 'idle' } | { status: 'loading' } | { status: 'done'; items: MyDebateSummary[] } | { status: 'error'; message: string }
  >({ status: 'idle' });
  // Computed live from the currently-entered API key via the exact same
  // hash+nickname function used when a share is created, so what's shown
  // here always matches the owner_name actually stored on this key's rows
  // - if the key changes, the nickname (and the list below) changes too.
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!settings.apiKey.trim()) {
      setState({ status: 'idle' });
      setNickname(null);
      return;
    }
    setState({ status: 'loading' });
    hashApiKey(settings.apiKey).then((hash) => setNickname(nicknameFromKeyHash(hash)));
    listMyDebates(settings.apiKey)
      .then((items) => setState({ status: 'done', items }))
      .catch((err) => setState({ status: 'error', message: err instanceof Error ? err.message : String(err) }));
  }, [isOpen, settings.apiKey]);

  if (!isOpen) return null;

  const shareUrlFor = (id: string) => {
    const url = new URL(window.location.href);
    url.search = `share=${id}`;
    url.hash = '';
    return url.toString();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="내 공유 토론 목록" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-gray-900 border-gray-800 text-gray-100'
        }`}
      >
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-gray-950 border-gray-800'}`}>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Link2 className="w-4 h-4 text-indigo-600" />
            <span>내가 공유한 토론</span>
            {nickname && (
              <span className="text-[13px] font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {nickname}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700 bg-slate-200/60' : 'text-gray-400 hover:text-white'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar space-y-2 text-sm">
          <p className={`text-[13px] mb-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            현재 입력된 API 키를 기준으로 이 키로 공유했던 토론 목록을 보여줍니다. 계정 없이 키 자체가 신원이라, 키가 바뀌면 목록도 달라집니다.
          </p>

          {!settings.apiKey.trim() ? (
            <p className="text-slate-400 italic">API 키가 입력되지 않아 목록을 불러올 수 없습니다.</p>
          ) : state.status === 'loading' ? (
            <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>불러오는 중...</span>
            </div>
          ) : state.status === 'error' ? (
            <div className="flex items-center gap-2 text-rose-500 py-4 justify-center">
              <AlertTriangle className="w-4 h-4" />
              <span>{state.message}</span>
            </div>
          ) : state.status === 'done' && state.items.length === 0 ? (
            <p className="text-slate-400 italic">아직 공유한 토론이 없습니다. 결과 요약 모달에서 "공유 링크 만들기"로 첫 토론을 공유해보세요.</p>
          ) : state.status === 'done' ? (
            state.items.map((item) => (
              <a
                key={item.id}
                href={shareUrlFor(item.id)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition ${
                  isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-gray-950 border-gray-800 hover:bg-gray-800/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{item.topic}</div>
                  <div className="text-[13px] text-slate-500">{formatCreatedAt(item.createdAt)}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-500 shrink-0" />
              </a>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};
