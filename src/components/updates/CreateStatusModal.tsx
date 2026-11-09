import React, { useState, useRef } from 'react';
import { X, Send, Image as ImageIcon, Type, Palette, Upload } from 'lucide-react';
import { useStatus } from '../../context/StatusContext';
import { useChat } from '../../context/ChatContext';

interface CreateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BG_COLORS = [
  '#075E54', // Dark green
  '#128C7E', // Teal green
  '#25D366', // Bright green
  '#1E3A8A', // Deep blue
  '#7C3AED', // Purple
  '#DB2777', // Magenta pink
  '#DC2626', // Red
  '#D97706', // Amber orange
  '#374151', // Charcoal
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({ isOpen, onClose }) => {
  const { postStatus } = useStatus();
  const { uploadMedia } = useChat();

  const [mode, setMode] = useState<'text' | 'media'>('text');
  const [textContent, setTextContent] = useState('');
  const [bgColorIndex, setBgColorIndex] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const cycleColor = () => {
    setBgColorIndex((prev) => (prev + 1) % BG_COLORS.length);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMode('media');
  };

  const handleSubmit = async () => {
    if (mode === 'text') {
      if (!textContent.trim()) return;
      setIsSubmitting(true);
      try {
        await postStatus('text', textContent.trim(), undefined, BG_COLORS[bgColorIndex]);
        handleClose();
      } catch (err) {
        console.error(err);
        alert('Failed to post status');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!mediaFile) return;
      setIsSubmitting(true);
      try {
        const result = await uploadMedia(mediaFile, (p) => setUploadPercent(p));
        const type = mediaFile.type.startsWith('video/') ? 'video' : 'image';
        await postStatus(type, result.url, caption.trim());
        handleClose();
      } catch (err) {
        console.error(err);
        alert('Failed to upload status');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setTextContent('');
    setMediaFile(null);
    setMediaPreview(null);
    setCaption('');
    setMode('text');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#202C33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9EDEF] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#111B21]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === 'text'
                  ? 'bg-[#128C7E] text-white'
                  : 'text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942]'
              }`}
            >
              <Type className="w-4 h-4" />
              Text Status
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                mode === 'media'
                  ? 'bg-[#128C7E] text-white'
                  : 'text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photo / Video
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="flex items-center gap-1">
            {mode === 'text' && (
              <button
                onClick={cycleColor}
                title="Change background color"
                className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
              >
                <Palette className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative h-80 sm:h-96 flex flex-col">
          {mode === 'text' ? (
            <div
              className="w-full h-full p-8 flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: BG_COLORS[bgColorIndex] }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type a status update..."
                maxLength={300}
                className="w-full bg-transparent text-white text-center text-xl sm:text-2xl font-bold placeholder-white/60 resize-none outline-none leading-relaxed"
                rows={4}
                autoFocus
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
              {mediaPreview ? (
                mediaFile?.type.startsWith('video/') ? (
                  <video src={mediaPreview} controls className="max-h-full max-w-full object-contain" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                )
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer flex flex-col items-center gap-2 text-white/70 hover:text-white"
                >
                  <Upload className="w-10 h-10" />
                  <span className="text-sm">Click to select photo or video</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F0F2F5] dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#2A3942] flex items-center gap-3">
          {mode === 'media' && (
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 bg-white dark:bg-[#202C33] text-sm text-[#111B21] dark:text-[#E9EDEF] px-3.5 py-2 rounded-lg border border-[#E9EDEF] dark:border-[#2A3942] outline-none"
            />
          )}

          <div className="flex items-center justify-end flex-1 gap-2">
            {isSubmitting && uploadPercent > 0 && (
              <span className="text-xs text-emerald-600 font-semibold">{uploadPercent}%</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (mode === 'text' && !textContent.trim()) || (mode === 'media' && !mediaFile)}
              className="px-5 py-2 bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-50 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Status'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

