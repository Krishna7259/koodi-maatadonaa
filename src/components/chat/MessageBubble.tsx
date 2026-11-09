import React, { useState } from 'react';
import { 
  Check, 
  CheckCheck, 
  ChevronDown, 
  Reply, 
  Edit2, 
  Trash2, 
  FileText, 
  Download, 
  Play, 
  Pause,
  ExternalLink 
} from 'lucide-react';
import { Message, ReplyContext } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isGroup: boolean;
  onReply: (reply: ReplyContext) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string, forEveryone: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isGroup,
  onReply,
  onEdit,
  onDelete,
}) => {
  const { userProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isMine = message.senderId === userProfile?.uid;

  const formatMessageTime = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return format(d, 'h:mm a');
    } catch (e) {
      return '';
    }
  };

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (message.type === 'image') {
      return (
        <div className="mb-1.5 rounded-lg overflow-hidden max-w-xs sm:max-w-sm">
          <img
            src={message.mediaUrl}
            alt="Shared photo"
            className="w-full h-auto max-h-72 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(message.mediaUrl, '_blank')}
          />
        </div>
      );
    }

    if (message.type === 'video') {
      return (
        <div className="mb-1.5 rounded-lg overflow-hidden max-w-xs sm:max-w-sm">
          <video
            src={message.mediaUrl}
            controls
            className="w-full h-auto max-h-72 rounded-lg"
          />
        </div>
      );
    }

    if (message.type === 'audio' || message.type === 'voice') {
      return (
        <div className="flex items-center gap-2.5 p-2 bg-black/5 dark:bg-white/5 rounded-xl mb-1 min-w-[220px]">
          <audio
            src={message.mediaUrl}
            controls
            className="w-full h-8"
          />
        </div>
      );
    }

    if (message.type === 'document') {
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl mb-1.5 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#128C7E] text-white flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">
              {message.mediaName || 'Document'}
            </p>
            {Boolean(message.mediaSize) && (
              <p className="text-[10px] text-gray-500">
                {(message.mediaSize! / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <Download className="w-4 h-4 text-[#128C7E] shrink-0" />
        </a>
      );
    }

    return null;
  };

  return (
    <div className={`flex w-full my-1 relative group ${isMine ? 'justify-end' : 'justify-start'}`}>
      
      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-3 pt-2 pb-1.5 shadow-sm text-sm ${
          isMine
            ? 'bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] rounded-tr-none'
            : 'bg-white dark:bg-[#202C33] text-[#111B21] dark:text-[#E9EDEF] rounded-tl-none'
        }`}
      >
        {/* Group Sender Name */}
        {isGroup && !isMine && (
          <p className="text-xs font-bold text-[#128C7E] dark:text-[#25D366] mb-1">
            {message.senderName}
          </p>
        )}

        {/* Reply Quote Banner */}
        {message.replyTo && (
          <div className="mb-1.5 p-2 bg-black/5 dark:bg-black/20 border-l-4 border-[#128C7E] rounded-r-lg text-xs">
            <span className="font-bold text-[#128C7E] dark:text-[#25D366] block">
              {message.replyTo.senderName}
            </span>
            <p className="text-gray-600 dark:text-gray-300 truncate">
              {message.replyTo.text}
            </p>
          </div>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Message Text */}
        {message.text && (
          <p className={`whitespace-pre-wrap break-words leading-relaxed select-text ${message.deleted ? 'italic opacity-60' : ''}`}>
            {message.text}
          </p>
        )}

        {/* Footer: Timestamp, Edited tag, Ticks */}
        <div className="flex items-center justify-end gap-1.5 mt-0.5 select-none float-right ml-3">
          {message.edited && !message.deleted && (
            <span className="text-[10px] text-gray-500 italic">edited</span>
          )}

          <span className="text-[10px] text-[#667781] dark:text-[#8696A0]">
            {formatMessageTime(message.createdAt)}
          </span>

          {isMine && !message.deleted && (
            <span className="ml-0.5">
              {message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
              ) : message.status === 'delivered' ? (
                <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-[#8696a0]" />
              )}
            </span>
          )}
        </div>

        {/* Hover Dropdown Toggle Button */}
        {!message.deleted && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute top-1 right-1 p-1 bg-black/10 dark:bg-white/10 hover:bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronDown className="w-3.5 h-3.5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        {/* Context Dropdown Menu */}
        {showMenu && (
          <div 
            className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-[#233138] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1.5 text-xs text-gray-700 dark:text-gray-200"
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              onClick={() => {
                setShowMenu(false);
                onReply({ id: message.id, text: message.text, senderName: message.senderName });
              }}
              className="w-full px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2"
            >
              <Reply className="w-3.5 h-3.5 text-[#128C7E]" />
              Reply
            </button>

            {isMine && message.type === 'text' && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(message);
                }}
                className="w-full px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                Edit
              </button>
            )}

            {isMine && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(message.id, true);
                }}
                className="w-full px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete for everyone
              </button>
            )}

            <button
              onClick={() => {
                setShowMenu(false);
                onDelete(message.id, false);
              }}
              className="w-full px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete for me
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

