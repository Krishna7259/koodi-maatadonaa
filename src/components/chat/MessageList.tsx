import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Message, ReplyContext } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  isGroup: boolean;
  loading: boolean;
  onReply: (reply: ReplyContext) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string, forEveryone: boolean) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGroup,
  loading,
  onReply,
  onEdit,
  onDelete,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatDateHeader = (timestamp: any) => {
    if (!timestamp) return 'Today';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return 'Today';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="text-xs text-gray-400 bg-white/70 dark:bg-black/30 px-3 py-1.5 rounded-full shadow-sm">
          Loading messages...
        </span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-white/80 dark:bg-[#182229]/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-sm">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
            No messages here yet
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Send a message or tap an attachment to start conversation. Messages are synchronized across your devices.
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date
  let lastDateStr = '';

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1">
      {messages.map((message) => {
        const currentDateStr = formatDateHeader(message.createdAt);
        const showDateSeparator = currentDateStr !== lastDateStr;
        lastDateStr = currentDateStr;

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <div className="flex justify-center my-3 select-none">
                <span className="bg-white/90 dark:bg-[#182229]/90 text-[#54656F] dark:text-[#8696A0] text-[11px] font-semibold py-1 px-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                  {currentDateStr}
                </span>
              </div>
            )}

            <MessageBubble
              message={message}
              isGroup={isGroup}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

