import { useState } from 'react';
import { Header } from './components/common/Header';
import { ControlPanel } from './components/control/ControlPanel';
import { LiveChatRoom } from './components/chat/LiveChatRoom';
import { PresetsModal } from './components/common/PresetsModal';
import { EndSummaryModal } from './components/summary/EndSummaryModal';
import { SessionManagerModal } from './components/common/SessionManagerModal';
import { AgentPresetLibraryModal } from './components/common/AgentPresetLibraryModal';
import { MyDebatesModal } from './components/common/MyDebatesModal';
import { SharedDebateView } from './components/share/SharedDebateView';
import { Sliders } from 'lucide-react';

// A shared replay link (?share=<id>) opens a standalone read-only page
// instead of the live app shell - it has its own settings/session snapshot
// baked in and has no business touching the viewer's local store.
const sharedDebateId = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('share')
  : null;

export function App() {
  return sharedDebateId ? <SharedDebateView shareId={sharedDebateId} /> : <MainApp />;
}

function MainApp() {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [isAgentLibraryOpen, setIsAgentLibraryOpen] = useState(false);
  const [isMyDebatesOpen, setIsMyDebatesOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Top Header */}
      <Header
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        onOpenSessionManager={() => setIsSessionManagerOpen(true)}
        onOpenAgentLibrary={() => setIsAgentLibraryOpen(true)}
        onOpenMyDebates={() => setIsMyDebatesOpen(true)}
      />

      {/* Mobile Control Panel Toggle Button */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between z-10">
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="flex items-center gap-2 text-sm font-bold text-indigo-400 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800"
        >
          <Sliders className="w-4 h-4" />
          <span>토론 설정 패널 (Control Panel)</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left 38% Control Panel */}
        <div className="hidden md:block w-[38%] h-full shrink-0">
          <ControlPanel />
        </div>

        {/* Mobile Control Panel Drawer */}
        {isMobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex">
            <div className="w-[85%] max-w-md h-full bg-gray-900 shadow-2xl">
              <ControlPanel onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)} />
            </div>
            <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Right 62% Live Debate Chatroom */}
        <div className="flex-1 h-full overflow-hidden">
          <LiveChatRoom onOpenSummary={() => setIsSummaryOpen(true)} />
        </div>
      </div>

      {/* Modals */}
      <PresetsModal isOpen={isPresetsOpen} onClose={() => setIsPresetsOpen(false)} />
      <EndSummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} />
      <SessionManagerModal isOpen={isSessionManagerOpen} onClose={() => setIsSessionManagerOpen(false)} />
      <AgentPresetLibraryModal
        key={isAgentLibraryOpen ? 'open' : 'closed'}
        isOpen={isAgentLibraryOpen}
        onClose={() => setIsAgentLibraryOpen(false)}
      />
      <MyDebatesModal isOpen={isMyDebatesOpen} onClose={() => setIsMyDebatesOpen(false)} />
    </div>
  );
}

export default App;
