import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, answerCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === 'video';

  return (
    <div className="fixed top-6 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-[#202C33] rounded-3xl shadow-2xl border-2 border-[#25D366] p-5 animate-in slide-in-from-top-4 duration-300 select-none">
      
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={incomingCall.callerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt={incomingCall.callerName}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#128C7E]"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[10px] shadow-sm">
            {isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-[#128C7E] dark:text-[#25D366] uppercase tracking-wider block">
            Incoming {isVideo ? 'Video' : 'Voice'} Call
          </span>
          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
            {incomingCall.callerName}
          </h3>
          <p className="text-xs text-gray-500 animate-pulse">Ringing...</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={rejectCall}
          className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all"
        >
          <PhoneOff className="w-4 h-4" />
          Decline
        </button>

        <button
          onClick={answerCall}
          className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#128C7E] active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-md transition-all"
        >
          <Phone className="w-4 h-4 animate-bounce" />
          Accept
        </button>
      </div>

    </div>
  );
};

