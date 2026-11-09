import React, { useState } from 'react';
import { 
  MessageSquarePlus, 
  Users, 
  Search, 
  Filter, 
  Check, 
  CheckCheck, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Video as VideoIcon,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Chat, MessageType } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface SidebarProps {
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewChat, onOpenNewGroup }) => {
  const { userProfile } = useAuth();
  const { chats, activeChat, setActiveChat, loadingChats } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Filtered chats
  const filteredChats = chats.filter((c) => {
    let name = c.name || '';
    if (!c.isGroup && userProfile) {
      const otherUid = c.participants.find((uid) => uid !== userProfile.uid);
      if (otherUid && c.participantDetails?.[otherUid]) {
        name = c.participantDetails[otherUid].displayName;
      }
    }

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (filterUnreadOnly && userProfile) {
      const unread = c.unreadCounts?.[userProfile.uid] || 0;
      return matchesSearch && unread > 0;
    }
    return matchesSearch;
  });

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'dd/MM/yy');
      }
    } catch (e) {
      return '';
    }
  };

  const renderLastMessageSnippet = (chat: Chat) => {
    const last = chat.lastMessage;
    if (!last) return <span className="italic text-gray-400">No messages yet</span>;

    const isMine = last.senderId === userProfile?.uid;

    const getIcon = (type: MessageType) => {
      switch (type) {
        case 'image': return <ImageIcon className="w-3.5 h-3.5 inline mr-1 text-[#54656F]" />;
        case 'video': return <VideoIcon className="w-3.5 h-3.5 inline mr-1 text-[#54656F]" />;
        case 'voice':
        case 'audio': return <Mic className="w-3.5 h-3.5 inline mr-1 text-[#54656F]" />;
        case 'document': return <FileText className="w-3.5 h-3.5 inline mr-1 text-[#54656F]" />;
        case 'call': return <PhoneCall className="w-3.5 h-3.5 inline mr-1 text-[#54656F]" />;
        default: return null;
      }
    };

    return (
      <span className="flex items-center gap-1 truncate text-xs text-[#667781] dark:text-[#8696A0]">
        {/* Ticks for my outgoing message */}
        {isMine && (
          <span className="shrink-0">
            {last.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
            ) : last.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
            ) : (
              <Check className="w-3.5 h-3.5 text-[#8696a0]" />
            )}
          </span>
        )}
        {getIcon(last.type)}
        <span className="truncate">{last.text}</span>
      </span>
    );
  };

  return (
    <div className="w-80 sm:w-96 md:w-[400px] h-full bg-white dark:bg-[#111B21] border-r border-[#E9EDEF] dark:border-[#222E35] flex flex-col shrink-0 select-none">
      
      {/* 1. Top Header */}
      <div className="h-15 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between border-b border-[#E9EDEF] dark:border-[#222E35] shrink-0">
        <h1 className="text-xl font-bold text-[#111B21] dark:text-white">
          Chats
        </h1>

        <div className="flex items-center gap-1.5 text-[#54656F] dark:text-[#AEBAC1]">
          {/* New Group Button */}
          <button
            onClick={onOpenNewGroup}
            title="New Group"
            className="p-2 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 rounded-full transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onOpenNewChat}
            title="New Conversation"
            className="p-2 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 rounded-full transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-2.5 bg-white dark:bg-[#111B21] border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <div className="flex-1 bg-[#F0F2F5] dark:bg-[#202C33] rounded-xl px-3 py-1.5 flex items-center gap-2.5 focus-within:ring-1 focus-within:ring-[#128C7E]">
          <Search className="w-4 h-4 text-[#54656F] dark:text-[#8696A0] shrink-0" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-[#111B21] dark:text-[#E9EDEF] placeholder-[#667781] dark:placeholder-[#8696A0] focus:outline-none"
          />
        </div>

        {/* Filter Unread Toggle */}
        <button
          onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          title="Filter unread chats"
          className={`p-2 rounded-xl transition-colors ${
            filterUnreadOnly 
              ? 'bg-[#E7F3FF] dark:bg-[#2A3942] text-[#075E54] dark:text-[#25D366]' 
              : 'text-[#54656F] dark:text-[#8696A0] hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/40">
        {loadingChats ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading conversations...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No chats found
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              {searchTerm 
                ? 'No matching conversations.' 
                : 'Start a new conversation with your friends by tapping the new chat icon above!'}
            </p>
            <button
              onClick={onOpenNewChat}
              className="mt-3 text-xs bg-[#128C7E] text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-[#075E54] transition-colors"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = activeChat?.id === chat.id;

            // Determine details (group or 1-to-1)
            let chatName = chat.name || 'Conversation';
            let chatPhoto = chat.photoURL;
            let isOnline = false;

            if (!chat.isGroup && userProfile) {
              const otherUid = chat.participants.find((uid) => uid !== userProfile.uid);
              if (otherUid && chat.participantDetails?.[otherUid]) {
                const other = chat.participantDetails[otherUid];
                chatName = other.displayName;
                chatPhoto = other.photoURL;
                isOnline = Boolean(other.isOnline);
              }
            }

            const unreadCount = userProfile ? (chat.unreadCounts?.[userProfile.uid] || 0) : 0;
            const isTyping = chat.typing && Object.entries(chat.typing).some(([uid, typing]) => uid !== userProfile?.uid && typing);

            return (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#F0F2F5] dark:bg-[#2A3942]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#202C33]/60'
                }`}
              >
                {/* Avatar with Online Dot */}
                <div className="relative shrink-0">
                  <img
                    src={chatPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={chatName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white dark:border-[#111B21]" />
                  )}
                </div>

                {/* Name, Last Message, Time, Badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-sm font-bold text-[#111B21] dark:text-[#E9EDEF] truncate">
                      {chatName}
                    </span>
                    <span className={`text-[11px] shrink-0 font-medium ${unreadCount > 0 ? 'text-[#25D366] font-bold' : 'text-[#667781] dark:text-[#8696A0]'}`}>
                      {formatTimestamp(chat.lastMessage?.timestamp || chat.updatedAt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-1">
                    {isTyping ? (
                      <span className="text-xs font-semibold text-[#25D366] italic">typing...</span>
                    ) : (
                      <div className="truncate">{renderLastMessageSnippet(chat)}</div>
                    )}

                    {unreadCount > 0 && (
                      <span className="bg-[#25D366] text-white text-[11px] font-extrabold h-4.5 min-w-4.5 px-1.5 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

