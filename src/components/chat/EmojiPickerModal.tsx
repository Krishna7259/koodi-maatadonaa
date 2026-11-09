import React from 'react';

interface EmojiPickerModalProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    category: 'Smileys & Emotion',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓']
  },
  {
    category: 'Gestures & People',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  {
    category: 'Objects & Celebrations',
    emojis: ['🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🍻', '🥂', '🍾', '☕', '🚀', '🔥', '✨', '⭐', '🌟', '💥', '💯', '📱', '💻', '💡', '📚', '📌', '📎', '🔒', '🔑', '❤️‍🔥', '💬', '👁️', '👀']
  }
];

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({ onSelectEmoji, onClose }) => {
  return (
    <div 
      className="absolute bottom-16 left-4 z-40 w-72 sm:w-80 h-72 bg-white dark:bg-[#202C33] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
      onMouseLeave={onClose}
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-[#F0F2F5] dark:bg-[#111B21]">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Emojis</span>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-2"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <div key={idx}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {cat.category}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {cat.emojis.map((emoji, eIdx) => (
                <button
                  key={eIdx}
                  onClick={() => onSelectEmoji(emoji)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

