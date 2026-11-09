import React, { useState } from 'react';
import { 
  Phone, 
  Video, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Search, 
  Plus, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import { UserProfile, CallSession } from '../../types';
import { format, isToday, isYesterday } from 'date-fns';

interface CallsTabProps {
  onStartNewCall: () => void;
}

export const CallsTab: React.FC<CallsTabProps> = ({ onStartNewCall }) => {
  const { userProfile } = useAuth();
  const { callHistory, startCall } = useCall();
  const { searchUsers } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const formatCallDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `(${mins > 0 ? `${mins}m ` : ''}${secs}s)`;
  };

  const filteredHistory = callHistory.filter((call) => {
    const otherName = call.callerId === userProfile?.uid ? call.calleeName : call.callerName;
    return otherName.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const handleCallBack = async (call: CallSession, type: 'audio' | 'video') => {
    const targetUid = call.callerId === userProfile?.uid ? call.calleeId : call.callerId;
    const targetName = call.callerId === userProfile?.uid ? call.calleeName : call.callerName;
    const targetPhoto = call.callerId === userProfile?.uid ? call.calleePhoto : call.callerPhoto;

    const mockProfile: UserProfile = {
      uid: targetUid,
      displayName: targetName,
      photoURL: targetPhoto,
      phoneNumber: '',
      isOnline: true,
    };

    await startCall(mockProfile, type);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111B21] border-r border-[#E9EDEF] dark:border-[#222E35]">
      {/* Header */}
      <div className="h-16 px-4 bg-[#F0F2F5] dark:bg-[#202C33] flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-[#111B21] dark:text-[#E9EDEF]">Calls</h1>
        <button
          onClick={onStartNewCall}
          title="New call"
          className="p-2 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-[#E9EDEF] dark:border-[#222E35]">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#F0F2F5] dark:bg-[#202C33] rounded-lg">
          <Search className="w-4 h-4 text-[#54656F] dark:text-[#8696A0]" />
          <input
            type="text"
            placeholder="Search call logs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#111B21] dark:text-[#E9EDEF] placeholder-[#54656F] dark:placeholder-[#8696A0] outline-none"
          />
        </div>
      </div>

      {/* Call History List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E9EDEF]/50 dark:divide-[#222E35]/50">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[#128C7E] mb-3">
              <Phone className="w-8 h-8 stroke-[1.8]" />
            </div>
            <p className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">No calls yet</p>
            <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1 max-w-xs">
              Start crystal-clear audio or video calls with your contacts.
            </p>
            <button
              onClick={onStartNewCall}
              className="mt-4 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-full shadow-sm transition-colors"
            >
              Start a Call
            </button>
          </div>
        ) : (
          filteredHistory.map((call) => {
            const isOutgoing = call.callerId === userProfile?.uid;
            const otherName = isOutgoing ? call.calleeName : call.callerName;
            const otherPhoto = isOutgoing ? call.calleePhoto : call.callerPhoto;
            const isMissed = !isOutgoing && (call.status === 'rejected' || call.status === 'offering');

            return (
              <div
                key={call.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F6F6] dark:hover:bg-[#202C33] transition-colors group cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold shrink-0">
                  {otherPhoto ? (
                    <img src={otherPhoto} alt={otherName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{otherName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Call Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${isMissed ? 'text-rose-500 font-semibold' : 'text-[#111B21] dark:text-[#E9EDEF]'}`}>
                    {otherName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#667781] dark:text-[#8696A0]">
                    {isMissed ? (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-500" />
                    ) : isOutgoing ? (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <PhoneIncoming className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    <span>{formatCallDate(call.createdAt)}</span>
                    {call.duration ? <span>{formatDuration(call.duration)}</span> : null}
                  </div>
                </div>

                {/* Call Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCallBack(call, 'audio')}
                    title="Audio call"
                    className="p-2 text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCallBack(call, 'video')}
                    title="Video call"
                    className="p-2 text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

