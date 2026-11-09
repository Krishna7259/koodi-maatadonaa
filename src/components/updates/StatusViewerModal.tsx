import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, User } from 'lucide-react';
import { StatusStory } from '../../types';
import { useStatus } from '../../context/StatusContext';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface StatusViewerModalProps {
  stories: StatusStory[];
  isOpen: boolean;
  onClose: () => void;
}

export const StatusViewerModal: React.FC<StatusViewerModalProps> = ({
  stories,
  isOpen,
  onClose,
}) => {
  const { userProfile } = useAuth();
  const { markStatusAsViewed } = useStatus();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);

  const durationMs = 5000;
  const currentStory = stories[currentIndex];
  const isMine = currentStory?.userId === userProfile?.uid;

  // Mark status as viewed whenever currentStory changes
  useEffect(() => {
    if (isOpen && currentStory && !isMine) {
      markStatusAsViewed(currentStory.id);
    }
  }, [isOpen, currentIndex, currentStory?.id, isMine]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setProgress(0);
      setShowViewers(false);
    }
  }, [isOpen, stories]);

  // Timer loop for progress bar
  useEffect(() => {
    if (!isOpen || isPaused || showViewers || !currentStory) return;

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Reached the end
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, isPaused, showViewers, stories.length, currentStory]);

  if (!isOpen || !currentStory) return null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const formatStoryTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Container matching mobile / WhatsApp Web proportions */}
      <div className="relative w-full max-w-md h-[90vh] bg-black rounded-xl overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Top Progress Bars */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 flex gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
          {stories.map((s, idx) => {
            let width = 0;
            if (idx < currentIndex) width = 100;
            else if (idx === currentIndex) width = progress;

            return (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${width}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Header Bar */}
        <div className="absolute top-6 inset-x-0 z-30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-white font-bold border border-white/20">
              {currentStory.userPhoto ? (
                <img src={currentStory.userPhoto} alt={currentStory.userName} className="w-full h-full object-cover" />
              ) : (
                <span>{currentStory.userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">{currentStory.userName}</p>
              <p className="text-white/70 text-xs">{formatStoryTime(currentStory.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {currentStory.type === 'text' ? (
            <div
              className="w-full h-full p-8 flex items-center justify-center text-center text-white text-2xl font-bold leading-relaxed whitespace-pre-wrap select-text"
              style={{ backgroundColor: currentStory.backgroundColor || '#075E54' }}
            >
              {currentStory.content}
            </div>
          ) : currentStory.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <video
                src={currentStory.content}
                autoPlay
                playsInline
                muted
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img
                src={currentStory.content}
                alt="Story"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Caption if media story */}
          {currentStory.caption && (
            <div className="absolute bottom-16 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-center text-sm font-medium">
              {currentStory.caption}
            </div>
          )}

          {/* Navigation Tap Zones */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />

          {/* Desktop Arrow Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors hidden sm:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 z-30 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors hidden sm:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Footer / Viewers Area */}
        {isMine ? (
          <div className="relative z-30 px-4 py-3 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center">
            <button
              onClick={() => setShowViewers(!showViewers)}
              className="flex items-center gap-2 text-white/90 hover:text-white text-xs font-semibold px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{currentStory.viewers?.length || 0} views</span>
            </button>

            {/* Viewers Tray */}
            {showViewers && (
              <div className="absolute bottom-14 inset-x-2 bg-[#202C33] border border-[#2A3942] rounded-xl max-h-56 overflow-y-auto p-2 shadow-2xl z-40 text-left">
                <p className="text-xs font-bold text-[#8696A0] px-2 py-1 uppercase tracking-wider">
                  Viewed by ({currentStory.viewers?.length || 0})
                </p>
                {(!currentStory.viewers || currentStory.viewers.length === 0) ? (
                  <p className="text-xs text-[#8696A0] px-2 py-3 text-center">No views yet</p>
                ) : (
                  currentStory.viewers.map((v, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#111B21] rounded-lg">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                        {v.userPhoto ? (
                          <img src={v.userPhoto} alt={v.userName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{v.userName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{v.userName}</p>
                        <p className="text-[10px] text-[#8696A0]">{formatStoryTime(v.viewedAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>
    </div>
  );
};

