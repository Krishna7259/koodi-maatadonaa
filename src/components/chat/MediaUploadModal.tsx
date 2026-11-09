import React, { useState } from 'react';
import { X, Send, FileText, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface MediaUploadModalProps {
  file: File;
  onSend: (file: File, caption: string, onProgress: (p: number) => void) => Promise<void>;
  onClose: () => void;
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ file, onSend, onClose }) => {
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const previewUrl = (isImage || isVideo) ? URL.createObjectURL(file) : null;

  const handleSend = async () => {
    setError(null);
    try {
      await onSend(file, caption, (percent) => {
        setUploadProgress(percent);
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#202C33] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#F0F2F5] dark:bg-[#111B21] border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isImage ? <ImageIcon className="w-4 h-4 text-[#128C7E]" /> : <FileText className="w-4 h-4 text-[#128C7E]" />}
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate max-w-xs">
              {file.name}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center min-h-[240px] bg-gray-50 dark:bg-[#111B21]">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-72 max-w-full rounded-xl object-contain shadow-sm" />
          ) : isVideo && previewUrl ? (
            <video src={previewUrl} controls className="max-h-72 max-w-full rounded-xl shadow-sm" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <FileText className="w-16 h-16 text-[#128C7E]" />
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB • Document</p>
            </div>
          )}

          {/* Progress bar */}
          {uploadProgress !== null && (
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#128C7E] transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
          )}
        </div>

        {/* Caption & Send Bar */}
        <div className="p-3 bg-white dark:bg-[#202C33] border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploadProgress !== null}
            className="flex-1 py-2 px-3.5 bg-gray-100 dark:bg-[#111B21] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#128C7E] text-gray-800 dark:text-white"
          />

          <button
            onClick={handleSend}
            disabled={uploadProgress !== null}
            className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md transition-all"
          >
            {uploadProgress !== null ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

