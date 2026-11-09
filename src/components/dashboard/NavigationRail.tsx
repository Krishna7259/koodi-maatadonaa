import React from 'react';
import { 
  MessageSquare, 
  CircleDot, 
  Users, 
  Phone, 
  Settings, 
  Sparkles, 
  Moon, 
  Sun, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { useTheme } from '../../context/ThemeContext';
import { KoodiLogo } from '../common/KoodiLogo';

export type ActiveTab = 'chats' | 'updates' | 'communities' | 'calls' | 'ai' | 'settings';

interface NavigationRailProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile
}) => {
  const { userProfile, logout } = useAuth();
  const { chats } = useChat();
  const { callHistory } = useCall();
  const { darkMode, toggleDarkMode } = useTheme();

  // Calculate total unread chats
  const totalUnread = chats.reduce((acc, c) => {
    if (userProfile && c.unreadCounts && c.unreadCounts[userProfile.uid]) {
      return acc + (c.unreadCounts[userProfile.uid] > 0 ? 1 : 0);
    }
    return acc;
  }, 0);

  const navItems = [
    { id: 'chats' as ActiveTab, label: 'Chats', icon: MessageSquare, badge: totalUnread },
    { id: 'updates' as ActiveTab, label: 'Updates', icon: CircleDot },
    { id: 'communities' as ActiveTab, label: 'Communities', icon: Users },
    { id: 'calls' as ActiveTab, label: 'Calls', icon: Phone },
    { id: 'ai' as ActiveTab, label: 'Koodi AI Assistant', icon: Sparkles, highlight: true },
  ];

  return (
    <div className="w-16 sm:w-18 bg-[#F0F2F5] dark:bg-[#202C33] border-r border-[#E9EDEF] dark:border-[#222E35] flex flex-col items-center justify-between py-3.5 z-20 shrink-0 select-none">
      
      {/* Top Group: Brand Logo & Navigation Tabs */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Logo */}
        <div className="mb-1 cursor-pointer" onClick={() => setActiveTab('chats')}>
          <KoodiLogo size={36} />
        </div>

        {/* Tab Icons */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative w-12 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-[#E7F3FF] dark:bg-[#2A3942] text-[#075E54] dark:text-[#25D366]' 
                    : item.highlight
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200/60 dark:hover:bg-gray-700/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.highlight ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />

                {/* Badge indicator */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute top-1 right-1.5 bg-[#25D366] text-[#075E54] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}

                {/* AI Sparkle Dot */}
                {item.highlight && !isActive && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Group: Settings, Dark Mode, Profile, Logout */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Light Theme' : 'Dark Theme'}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200/60 dark:hover:bg-gray-700/40 transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Settings Tab Button */}
        <button
          onClick={() => setActiveTab('settings')}
          title="Settings"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#E7F3FF] dark:bg-[#2A3942] text-[#075E54] dark:text-[#25D366]'
              : 'text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200/60 dark:hover:bg-gray-700/40'
          }`}
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* User Profile Avatar Button */}
        <button
          onClick={onOpenProfile}
          title={userProfile?.displayName || 'My Profile'}
          className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-[#128C7E] transition-all my-1 shrink-0"
        >
          <img
            src={userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {userProfile?.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white dark:border-[#202C33]" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title="Log Out"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

    </div>
  );
};

