import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import { StatusProvider } from './context/StatusContext';

import { AuthContainer } from './components/auth/AuthContainer';
import { NavigationRail, ActiveTab } from './components/dashboard/NavigationRail';
import { Sidebar } from './components/dashboard/Sidebar';
import { ChatArea } from './components/dashboard/ChatArea';
import { CallsTab } from './components/calls/CallsTab';
import { UpdatesTab } from './components/updates/UpdatesTab';
import { CommunitiesTab } from './components/communities/CommunitiesTab';
import { AIAssistantChat } from './components/ai/AIAssistantChat';

import { NewChatModal } from './components/modals/NewChatModal';
import { NewGroupModal } from './components/modals/NewGroupModal';
import { GroupInfoModal } from './components/modals/GroupInfoModal';
import { ProfileSettingsModal } from './components/modals/ProfileSettingsModal';
import { CallModal } from './components/calls/CallModal';
import { IncomingCallModal } from './components/calls/IncomingCallModal';
import { KoodiLogo } from './components/common/KoodiLogo';
import { Lock } from 'lucide-react';

const MainApp: React.FC = () => {
  const { userProfile, loading } = useAuth();
  const { activeChat, setActiveChat } = useChat();

  const [activeTab, setActiveTab] = useState<ActiveTab>('chats');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [splashExceeded, setSplashExceeded] = useState(false);

  // Safety timer: Never hold the splash screen for more than 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashExceeded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Splash Loading Screen
  if (loading && !splashExceeded) {
    return (
      <div className="h-screen w-screen bg-[#F0F2F5] dark:bg-[#111B21] flex flex-col items-center justify-between py-12 select-none">
        <div />
        <div className="flex flex-col items-center gap-4">
          <KoodiLogo size={80} />
          <h1 className="text-xl font-bold text-[#075E54] dark:text-[#25D366] tracking-wide mt-2">
            Koodi Maatadona
          </h1>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
            <div className="w-1/2 h-full bg-[#128C7E] rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8696A0]">
          <Lock className="w-3.5 h-3.5 text-[#128C7E]" />
          <span>Secure Real-Time Cloud Messaging</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Phone Auth / Welcome flow
  if (!userProfile) {
    return <AuthContainer />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#111B21]">
      {/* 1. Leftmost WhatsApp Navigation Rail */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* 2. Middle Column: Dynamic Sidebar based on ActiveTab */}
      <div
        className={`${
          activeChat && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } w-full md:w-[380px] lg:w-[420px] h-full flex-col shrink-0`}
      >
        {activeTab === 'chats' && (
          <Sidebar
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
          />
        )}

        {activeTab === 'updates' && <UpdatesTab />}

        {activeTab === 'communities' && (
          <CommunitiesTab onOpenNewGroup={() => setIsNewGroupOpen(true)} />
        )}

        {activeTab === 'calls' && (
          <CallsTab onStartNewCall={() => setIsNewCallOpen(true)} />
        )}

        {activeTab === 'ai' && (
          <div className="hidden md:flex flex-col h-full bg-white dark:bg-[#111B21] border-r border-[#E9EDEF] dark:border-[#222E35]">
            <div className="h-16 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-[#111B21] dark:text-[#E9EDEF]">
                AI Assistant
              </h2>
            </div>
            <div className="p-4 space-y-3 text-xs text-[#667781] dark:text-[#8696A0]">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                Powered by Google Gemini 1.5 Flash
              </p>
              <p>
                Your AI assistant is ready to help you formulate messages, translate languages, code, and answer questions securely.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-200">
                🔒 Gemini API keys are processed server-side through our secure Node.js proxy and never exposed to the client.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Column: Active Conversation or AI Assistant */}
      <div
        className={`${
          !activeChat && activeTab === 'chats' ? 'hidden md:flex' : 'flex'
        } flex-1 h-full flex-col min-w-0`}
      >
        {activeTab === 'ai' ? (
          <AIAssistantChat />
        ) : (
          <ChatArea
            onOpenInfo={() => {
              if (activeChat?.isGroup) setIsGroupInfoOpen(true);
            }}
            onBackMobile={() => setActiveChat(null)}
          />
        )}
      </div>

      {/* 4. Global Modals */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        mode="chat"
      />

      <NewChatModal
        isOpen={isNewCallOpen}
        onClose={() => setIsNewCallOpen(false)}
        mode="call"
      />

      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
      />

      {activeChat && (
        <GroupInfoModal
          chat={activeChat}
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
        />
      )}

      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* WebRTC Video/Audio Call Screens */}
      <CallModal />
      <IncomingCallModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <CallProvider>
            <StatusProvider>
              <MainApp />
            </StatusProvider>
          </CallProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
