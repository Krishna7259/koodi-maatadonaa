import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const CallModal: React.FC = () => {
  const { 
    activeCall, 
    localStream, 
    remoteStream, 
    isMuted, 
    isVideoOff, 
    callDuration, 
    toggleMute, 
    toggleVideo, 
    endCall 
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  const isVideo = activeCall.type === 'video';
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111B21] flex flex-col justify-between items-center p-6 text-white select-none">
      
      {/* Top Header */}
      <div className="w-full flex justify-between items-center z-20">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#25D366]">
            {activeCall.status === 'connected' ? 'Connected • WebRTC' : 'Connecting / Ringing...'}
          </span>
          <h2 className="text-xl font-bold mt-0.5">
            {activeCall.calleeName || activeCall.callerName}
          </h2>
        </div>
        <div className="font-mono text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full">
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Main Video View Area */}
      <div className="relative w-full flex-1 max-w-4xl my-4 rounded-3xl overflow-hidden bg-[#202C33] flex items-center justify-center border border-gray-800 shadow-2xl">
        
        {isVideo ? (
          <>
            {/* Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local Video Stream Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-32 sm:w-44 h-48 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-xs font-bold text-gray-400">
                  Camera Off
                </div>
              )}
            </div>
          </>
        ) : (
          /* Audio Call Avatar View */
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={activeCall.calleePhoto || activeCall.callerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt="Caller"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#128C7E] shadow-xl"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#25D366] text-black font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                Voice Call
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-300">
              {activeCall.status === 'connected' ? 'Call in progress' : 'Ringing...'}
            </p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-4 sm:gap-6 z-20 pb-4">
        {/* Mute Audio */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle (if video call) */}
        {isVideo && (
          <button
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn video on' : 'Turn video off'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOff ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={endCall}
          title="End Call"
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
};

