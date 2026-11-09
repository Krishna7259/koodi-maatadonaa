import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { CallSession, CallType, UserProfile } from '../types';

interface CallContextType {
  activeCall: CallSession | null;
  incomingCall: CallSession | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  callDuration: number;
  callHistory: CallSession[];
  startCall: (callee: UserProfile, type: CallType) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState<CallSession[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<any>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize ringtone sound generator
  useEffect(() => {
    // Generate gentle dial tone oscillator or audio
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 1. Listen for incoming calls
  useEffect(() => {
    if (!userProfile?.uid) {
      setIncomingCall(null);
      return;
    }

    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('calleeId', '==', userProfile.uid),
      where('status', '==', 'offering')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callDoc = snapshot.docs[0];
        const data = { id: callDoc.id, ...callDoc.data() } as CallSession;
        // Only trigger if we are not already in a call
        if (!activeCall) {
          setIncomingCall(data);
          playRingtone();
        }
      } else {
        setIncomingCall(null);
        stopRingtone();
      }
    });

    return () => unsubscribe();
  }, [userProfile?.uid, activeCall]);

  // 2. Fetch call history
  useEffect(() => {
    if (!userProfile?.uid) return;

    const callsRef = collection(db, 'calls');
    const q1 = query(callsRef, where('callerId', '==', userProfile.uid));
    const q2 = query(callsRef, where('calleeId', '==', userProfile.uid));

    const loadHistory = async () => {
      try {
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const combined: CallSession[] = [];
        snap1.forEach(d => combined.push({ id: d.id, ...d.data() } as CallSession));
        snap2.forEach(d => combined.push({ id: d.id, ...d.data() } as CallSession));

        combined.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return tB - tA;
        });

        setCallHistory(combined);
      } catch (e) {}
    };

    loadHistory();
  }, [userProfile?.uid, activeCall]);

  // Call timer
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCall?.status]);

  const playRingtone = () => {
    try {
      // Audio notification beep
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try { osc.stop(); ctx.close(); } catch (e) {}
      }, 1500);
    } catch (e) {}
  };

  const stopRingtone = () => {
    if (ringtoneAudioRef.current) {
      ringtoneAudioRef.current.pause();
    }
  };

  // START CALL (Caller side)
  const startCall = async (callee: UserProfile, type: CallType) => {
    if (!userProfile) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote stream
      const remote = new MediaStream();
      setRemoteStream(remote);
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };

      // Create call document
      const callRef = doc(collection(db, 'calls'));
      const callData: CallSession = {
        id: callRef.id,
        callerId: userProfile.uid,
        callerName: userProfile.displayName,
        callerPhoto: userProfile.photoURL || '',
        calleeId: callee.uid,
        calleeName: callee.displayName,
        calleePhoto: callee.photoURL || '',
        type,
        status: 'offering',
        createdAt: serverTimestamp(),
      };

      // ICE Candidates collection
      const callerCandidatesCol = collection(db, 'calls', callRef.id, 'callerCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(callerCandidatesCol, event.candidate.toJSON());
        }
      };

      // Create Offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callRef, { ...callData, offer });
      setActiveCall({ ...callData, offer });

      // Listen to Call doc for Answer or Status change
      const unsubCall = onSnapshot(callRef, (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        if (data.status === 'rejected' || data.status === 'ended') {
          cleanup();
          unsubCall();
          return;
        }

        if (!pc.currentRemoteDescription && data.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
          setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
        }
      });

      // Listen to callee candidates
      const calleeCandidatesCol = collection(db, 'calls', callRef.id, 'calleeCandidates');
      const unsubCandidates = onSnapshot(calleeCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate).catch(() => {});
          }
        });
      });

    } catch (err) {
      console.error('[WebRTC startCall error]', err);
      alert('Unable to access microphone or camera. Please check browser permissions.');
      cleanup();
    }
  };

  // ANSWER CALL (Callee side)
  const answerCall = async () => {
    if (!incomingCall || !userProfile) return;
    stopRingtone();

    const callToAnswer = incomingCall;
    setIncomingCall(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callToAnswer.type === 'video'
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remote = new MediaStream();
      setRemoteStream(remote);
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };

      const callRef = doc(db, 'calls', callToAnswer.id);
      const calleeCandidatesCol = collection(db, 'calls', callToAnswer.id, 'calleeCandidates');

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(calleeCandidatesCol, event.candidate.toJSON());
        }
      };

      // Set Remote Description from Offer
      if (callToAnswer.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callToAnswer.offer));
      }

      // Create Answer
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callRef, {
        answer,
        status: 'connected'
      });

      setActiveCall({ ...callToAnswer, status: 'connected', answer });

      // Listen for caller candidates
      const callerCandidatesCol = collection(db, 'calls', callToAnswer.id, 'callerCandidates');
      onSnapshot(callerCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate).catch(() => {});
          }
        });
      });

      // Listen for status end
      onSnapshot(callRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.status === 'ended') {
          cleanup();
        }
      });

    } catch (err) {
      console.error('[WebRTC answerCall error]', err);
      cleanup();
    }
  };

  // REJECT CALL
  const rejectCall = async () => {
    stopRingtone();
    if (!incomingCall) return;

    try {
      const callRef = doc(db, 'calls', incomingCall.id);
      await updateDoc(callRef, { status: 'rejected' });
    } catch (e) {}
    setIncomingCall(null);
  };

  // END CALL
  const endCall = async () => {
    stopRingtone();
    if (activeCall) {
      try {
        const callRef = doc(db, 'calls', activeCall.id);
        await updateDoc(callRef, { 
          status: 'ended',
          duration: callDuration
        });
      } catch (e) {}
    }
    cleanup();
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        callDuration,
        callHistory,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};

