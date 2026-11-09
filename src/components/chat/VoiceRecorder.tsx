import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioFile: File, durationSeconds: number) => Promise<void>;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (e) {
      console.error('[Voice record error]', e);
      alert('Could not access microphone.');
      onCancel();
    }
  };

  const handleStopAndSend = () => {
    if (!mediaRecorderRef.current) return;
    setLoading(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      try {
        await onSendVoice(audioFile, seconds);
      } catch (err) {
        console.error(err);
      } finally {
        cleanup();
        onCancel();
      }
    };

    mediaRecorderRef.current.stop();
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center justify-between w-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-2xl px-4 py-2">
      
      {/* Live recording indicator */}
      <div className="flex items-center gap-3">
        <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping shrink-0" />
        <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
          {formatTimer(seconds)}
        </span>
        <span className="text-xs text-gray-500 hidden sm:inline">Recording voice note...</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            cleanup();
            onCancel();
          }}
          title="Cancel recording"
          disabled={loading}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <button
          onClick={handleStopAndSend}
          disabled={loading}
          title="Send voice note"
          className="w-9 h-9 rounded-full bg-[#128C7E] hover:bg-[#075E54] active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </button>
      </div>

    </div>
  );
};

