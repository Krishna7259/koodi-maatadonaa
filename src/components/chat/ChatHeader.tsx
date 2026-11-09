import React from 'react';
import { Phone, Video, Search, MoreVertical, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { format, isToday } from 'date-fns';

interface ChatHeaderProps {
  onBackMobile?: () => void;
  onOpenInfo?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onBackMobile, onOpenInfo }) => {
  const { userProfile } = useAuth();
  const { activeChat } = useChat();
  const { startCall } = useCall();

  if (!activeChat) return null;

  let displayName = activeChat.name || 'Conversation';
  let photoURL = activeChat.photoURL;
  let subtitle = '';
  let otherUser: any = null;

  if (!activeChat.isGroup && userProfile) {
    const otherUid = activeChat.participants.find(p => p !== userProfile.uid);
    if (otherUid && activeChat.participantDetails?.[otherUid]) {
      otherUser = { uid: otherUid, ...activeChat.participantDetails[otherUid] };
      displayName = otherUser.displayName;
      photoURL = otherUser.photoURL;

      const isTyping = activeChat.typing?.[otherUid];
      if (isTyping) {
        subtitle = 'typing...';
      } else if (otherUser.isOnline) {
        subtitle = 'online';
      } else if (otherUser.lastSeen) {
        try {
          const date = otherUser.lastSeen.toDate ? otherUser.lastSeen.toDate() : new Date(otherUser.lastSeen);
          subtitle = isToday(date) ? `last seen today at ${format(date, 'h:mm a')}` : `last seen ${format(date, 'dd/MM/yy')}`;
        } catch (e) {
          subtitle = 'offline';
        }
      } else {
        subtitle = 'offline';
      }
    }
  } else if (activeChat.isGroup) {
    const isTyping = activeChat.typing && Object.entries(activeChat.typing).some(([uid, typing]) => uid !== userProfile?.uid && typing);
    if (isTyping) {
      subtitle = 'someone is typing...';
    } else {
      const names = Object.values(activeChat.participantDetails || {}).map(p => p.displayName).slice(0, 3).join(', ');
      subtitle = `${activeChat.participants.length} members: ${names}...`;
    }
  }

  const handleStartCall = (type: 'audio' | 'video') => {
    if (!otherUser) {
      alert('Group calling can be started in a direct conversation.');
      return;
    }
    startCall(otherUser, type);
  };

  return (
    <div className="h-15 px-4 bg-[#F0F2F5] dark:bg-[#202C33] border-b border-[#E9EDEF] dark:border-[#222E35] flex items-center justify-between z-10 shrink-0 select-none">
      
      {/* Left: Avatar & Title info */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenInfo}>
        {onBackMobile && (
          <button onClick={onBackMobile} className="md:hidden p-1.5 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative shrink-0">
          <img
            src={photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
          />
          {otherUser?.isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-white dark:border-[#202C33]" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-[#111B21] dark:text-[#E9EDEF] truncate leading-tight">
            {displayName}
          </span>
          <span className={`text-[11px] truncate ${subtitle === 'online' || subtitle.includes('typing') ? 'text-[#25D366] font-semibold' : 'text-[#667781] dark:text-[#8696A0]'}`}>
            {subtitle}
          </span>
        </div>
      </div>

      {/* Right: Calling and Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 text-[#54656F] dark:text-[#AEBAC1]">
        {/* Video Call */}
        <button
          onClick={() => handleStartCall('video')}
          title="Video Call (WebRTC)"
          className="p-2.5 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 rounded-full transition-colors text-emerald-700 dark:text-emerald-400"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Audio Call */}
        <button
          onClick={() => handleStartCall('audio')}
          title="Voice Call (WebRTC)"
          className="p-2.5 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 rounded-full transition-colors text-teal-700 dark:text-teal-400"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Group Info / Details */}
        <button
          onClick={onOpenInfo}
          title="Chat info"
          className="p-2.5 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 rounded-full transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};

