import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Video as VideoIcon, 
  Check 
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ReplyContext, Message } from '../../types';
import { EmojiPickerModal } from './EmojiPickerModal';
import { MediaUploadModal } from './MediaUploadModal';
import { VoiceRecorder } from './VoiceRecorder';

interface MessageInputProps {
  replyContext: ReplyContext | null;
  onClearReply: () => void;
  editingMessage: Message | null;
  onClearEdit: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyContext,
  onClearReply,
  editingMessage,
  onClearEdit,
}) => {
  const { sendMessage, editMessage, uploadMedia, setTyping } = useChat();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set editing text if editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.trim().length > 0) {
      setTyping(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (editingMessage) {
      await editMessage(editingMessage.id, trimmed);
      onClearEdit();
    } else {
      await sendMessage(trimmed, 'text', undefined, undefined, undefined, replyContext || undefined);
      if (replyContext) onClearReply();
    }

    setText('');
    setTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
    setShowAttachmentMenu(false);
    e.target.value = '';
  };

  const handleSendMediaUpload = async (file: File, caption: string, onProgress: (p: number) => void) => {
    const uploaded = await uploadMedia(file, onProgress);
    let type: any = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    await sendMessage(
      caption.trim(),
      type,
      uploaded.url,
      uploaded.name,
      uploaded.size,
      replyContext || undefined
    );
    if (replyContext) onClearReply();
    setSelectedFile(null);
  };

  const handleSendVoiceNote = async (audioFile: File, durationSeconds: number) => {
    const uploaded = await uploadMedia(audioFile);
    await sendMessage(
      '',
      'voice',
      uploaded.url,
      uploaded.name,
      uploaded.size,
      replyContext || undefined
    );
    if (replyContext) onClearReply();
    setIsRecordingVoice(false);
  };

  return (
    <div className="bg-[#F0F2F5] dark:bg-[#202C33] border-t border-[#E9EDEF] dark:border-[#222E35] p-2 sm:p-2.5 z-20 shrink-0">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChosen}
        className="hidden"
      />

      {/* Media Upload Preview Modal */}
      {selectedFile && (
        <MediaUploadModal
          file={selectedFile}
          onSend={handleSendMediaUpload}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <EmojiPickerModal
          onSelectEmoji={(emoji) => {
            setText((prev) => prev + emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Reply Quote Banner */}
      {replyContext && (
        <div className="flex items-center justify-between p-2 mb-1.5 bg-white/70 dark:bg-black/20 rounded-xl border-l-4 border-[#128C7E] text-xs">
          <div className="truncate">
            <span className="font-bold text-[#128C7E] dark:text-[#25D366] block">
              Replying to {replyContext.senderName}
            </span>
            <span className="text-gray-600 dark:text-gray-300 truncate">
              {replyContext.text}
            </span>
          </div>
          <button onClick={onClearReply} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Edit Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between p-2 mb-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border-l-4 border-amber-500 text-xs">
          <span className="font-bold text-amber-700 dark:text-amber-400">
            Editing message
          </span>
          <button onClick={onClearEdit} className="p-1 hover:bg-amber-100 rounded-full">
            <X className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      )}

      {/* Live Voice Recorder */}
      {isRecordingVoice ? (
        <VoiceRecorder
          onSendVoice={handleSendVoiceNote}
          onCancel={() => setIsRecordingVoice(false)}
        />
      ) : (
        /* Regular Input Row */
        <div className="flex items-end gap-1.5 sm:gap-2">
          
          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emojis"
            className="p-2 text-[#54656F] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white rounded-full transition-colors mb-0.5"
          >
            <Smile className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Attachment Button */}
          <div className="relative mb-0.5">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              title="Attach media or document"
              className="p-2 text-[#54656F] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Attachment Dropdown Menu */}
            {showAttachmentMenu && (
              <div 
                className="absolute bottom-12 left-0 z-40 bg-white dark:bg-[#233138] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 flex flex-col gap-1 w-48 text-xs font-semibold text-gray-700 dark:text-gray-200"
                onMouseLeave={() => setShowAttachmentMenu(false)}
              >
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  Photos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'video/*';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <VideoIcon className="w-4 h-4" />
                  </div>
                  Videos
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip';
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  Document / PDF
                </button>
              </div>
            )}
          </div>

          {/* Text Input Area */}
          <div className="flex-1 bg-white dark:bg-[#2A3942] rounded-xl px-3.5 py-2 flex items-center shadow-xs border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Type a message"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent resize-none max-h-32 text-sm text-[#111B21] dark:text-[#E9EDEF] placeholder-[#667781] dark:placeholder-[#8696A0] focus:outline-none"
            />
          </div>

          {/* Right Action Button (Send or Mic) */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              title="Send message"
              className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md transition-all mb-0.5"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingVoice(true)}
              title="Record voice message"
              className="p-2 text-[#54656F] dark:text-[#8696A0] hover:text-[#111B21] dark:hover:text-white rounded-full transition-colors mb-0.5"
            >
              <Mic className="w-6 h-6 stroke-[1.8]" />
            </button>
          )}

        </div>
      )}

    </div>
  );
};

