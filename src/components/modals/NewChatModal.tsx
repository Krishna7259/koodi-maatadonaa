import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Phone, Video, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { UserProfile } from '../../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'chat' | 'call';
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  mode = 'chat',
}) => {
  const { userProfile } = useAuth();
  const { searchUsers, startOrGetPrivateChat, setActiveChat } = useChat();
  const { startCall } = useCall();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialUsers();
    }
  }, [isOpen]);

  const loadInitialUsers = async () => {
    setLoading(true);
    try {
      const results = await searchUsers('');
      // Filter out self
      setUsers(results.filter((u) => u.uid !== userProfile?.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    setLoading(true);
    try {
      const results = await searchUsers(val);
      setUsers(results.filter((u) => u.uid !== userProfile?.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (targetUser: UserProfile) => {
    if (mode === 'chat') {
      try {
        const chat = await startOrGetPrivateChat(targetUser);
        setActiveChat(chat);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Failed to start chat');
      }
    }
  };

  const handleCallUser = async (targetUser: UserProfile, type: 'audio' | 'video') => {
    try {
      await startCall(targetUser, type);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to initiate call');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#111B21]">
          <h2 className="text-base font-bold text-[#111B21] dark:text-[#E9EDEF]">
            {mode === 'call' ? 'New Call' : 'New Chat'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#E9EDEF] dark:border-[#2A3942]">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl">
            <Search className="w-4 h-4 text-[#54656F] dark:text-[#8696A0]" />
            <input
              type="text"
              placeholder="Search by name or phone (+91...)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#111B21] dark:text-[#E9EDEF] placeholder-[#54656F] dark:placeholder-[#8696A0] outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E9EDEF]/60 dark:divide-[#2A3942]/60 p-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-[#128C7E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 px-6">
              <UserPlus className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">No users found</p>
              <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                Make sure the user is registered with their phone number.
              </p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.uid}
                onClick={() => handleSelectUser(u)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#F5F6F6] dark:hover:bg-[#111B21] rounded-xl transition-colors cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold text-sm shrink-0">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{u.displayName.charAt(0).toUpperCase()}</span>
                  )}
                  {u.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white dark:border-[#202C33]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF] truncate">
                      {u.displayName}
                    </h3>
                  </div>
                  <p className="text-xs text-[#667781] dark:text-[#8696A0] truncate">
                    {u.phoneNumber || u.about || 'Hey there! I am using Koodi Maatadona.'}
                  </p>
                </div>

                {/* Call buttons if call mode or quick call */}
                {mode === 'call' ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallUser(u, 'audio');
                      }}
                      className="p-2 text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                      title="Audio call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallUser(u, 'video');
                      }}
                      className="p-2 text-[#075E54] dark:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full transition-colors"
                      title="Video call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-[#128C7E] transition-colors" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

