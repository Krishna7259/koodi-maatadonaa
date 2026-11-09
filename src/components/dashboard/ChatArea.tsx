import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatHeader } from '../chat/ChatHeader';
import { MessageList } from '../chat/MessageList';
import { MessageInput } from '../chat/MessageInput';
import { KoodiLogo } from '../common/KoodiLogo';
import { Message, ReplyContext } from '../../types';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  onOpenInfo: () => void;
  onBackMobile?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onOpenInfo, onBackMobile }) => {
  const { activeChat, messages, loadingMessages, deleteMessage } = useChat();
  const [replyContext, setReplyContext] = useState<ReplyContext | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  if (!activeChat) {
    return (
      <div className="flex-1 h-full bg-[#F7F8F6] dark:bg-[#222E35] flex flex-col items-center justify-center p-8 select-none text-center border-b-[6px] border-[#25D366]">
        <div className="flex flex-col items-center max-w-md">
          <KoodiLogo size={90} />
          
          <h2 className="mt-6 text-2xl font-bold text-[#111B21] dark:text-[#E9EDEF]">
            Koodi Maatadona for Web
          </h2>

          <p className="mt-2 text-sm text-[#667781] dark:text-[#8696A0] leading-relaxed">
            Send and receive real-time messages, make peer-to-peer WebRTC calls, share media, and chat with Gemini AI assistant.
          </p>

          <div className="mt-8 flex items-center gap-2 text-xs text-[#8696A0]">
            <Lock className="w-3.5 h-3.5 text-[#128C7E]" />
            <span>Secure Cloud Messaging & Calling</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-[#EFEAE2] dark:bg-[#0B141A] relative overflow-hidden">
      
      {/* Background WhatsApp Pattern Tint */}
      <div 
        className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#128C7E 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Chat Top Header */}
      <ChatHeader onBackMobile={onBackMobile} onOpenInfo={onOpenInfo} />

      {/* Messages Scroll Area */}
      <MessageList
        messages={messages}
        isGroup={activeChat.isGroup}
        loading={loadingMessages}
        onReply={(r) => setReplyContext(r)}
        onEdit={(m) => setEditingMessage(m)}
        onDelete={(id, forEveryone) => deleteMessage(id, forEveryone)}
      />

      {/* Message Input Bottom Bar */}
      <MessageInput
        replyContext={replyContext}
        onClearReply={() => setReplyContext(null)}
        editingMessage={editingMessage}
        onClearEdit={() => setEditingMessage(null)}
      />

    </div>
  );
};

