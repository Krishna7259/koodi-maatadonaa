import React, { useState } from 'react';
import { X, Users, UserPlus, Shield, UserMinus, LogOut, Phone, Video } from 'lucide-react';
import { Chat, UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface GroupInfoModalProps {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({ chat, isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const { addMembersToGroup, removeMemberFromGroup, leaveGroup, searchUsers } = useChat();

  const [showAddMembers, setShowAddMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !chat.isGroup) return null;

  const isAdmin = Boolean(chat.admins?.includes(userProfile?.uid || ''));

  const handleOpenAddMembers = async () => {
    try {
      const all = await searchUsers('');
      // Filter out existing members
      setAvailableUsers(all.filter((u) => !chat.participants.includes(u.uid)));
      setShowAddMembers(true);
      setSelectedToAdd([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAddMembers = async () => {
    if (selectedToAdd.length === 0) return;
    setIsSubmitting(true);
    try {
      await addMembersToGroup(chat.id, selectedToAdd);
      setShowAddMembers(false);
      setSelectedToAdd([]);
    } catch (err) {
      console.error(err);
      alert('Failed to add members');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (uid: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMemberFromGroup(chat.id, uid);
      } catch (err) {
        console.error(err);
        alert('Failed to remove member');
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (confirm('Are you sure you want to leave this group?')) {
      try {
        await leaveGroup(chat.id);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Failed to leave group');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#111B21]">
          <h2 className="text-base font-bold text-[#111B21] dark:text-[#E9EDEF]">Group info</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Hero Details */}
        <div className="p-6 flex flex-col items-center border-b border-[#E9EDEF] dark:border-[#2A3942] text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold text-2xl shadow-md mb-3">
            {chat.photoURL ? (
              <img src={chat.photoURL} alt={chat.name} className="w-full h-full object-cover" />
            ) : (
              <span>{chat.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#111B21] dark:text-[#E9EDEF]">{chat.name}</h3>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
            Group • {chat.participants.length} participants
          </p>
          {chat.description && (
            <p className="text-xs text-[#54656F] dark:text-[#AEBAC1] mt-2 max-w-sm">
              {chat.description}
            </p>
          )}
        </div>

        {/* Participants Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-[#54656F] dark:text-[#8696A0] uppercase tracking-wider">
              {chat.participants.length} Participants
            </h4>
            {isAdmin && (
              <button
                onClick={handleOpenAddMembers}
                className="text-xs font-semibold text-[#128C7E] dark:text-[#25D366] flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add member
              </button>
            )}
          </div>

          <div className="divide-y divide-[#E9EDEF]/50 dark:divide-[#2A3942]/50">
            {chat.participants.map((uid) => {
              const info = chat.participantDetails?.[uid];
              const isUserAdmin = chat.admins?.includes(uid);
              const isSelf = uid === userProfile?.uid;

              return (
                <div key={uid} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs font-bold text-[#075E54] dark:text-[#25D366] shrink-0">
                      {info?.photoURL ? (
                        <img src={info.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{info?.displayName?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF] truncate">
                        {isSelf ? 'You' : info?.displayName || 'Unknown'}
                      </p>
                      <p className="text-xs text-[#667781] dark:text-[#8696A0] truncate">
                        {info?.phoneNumber || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUserAdmin && (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-[#075E54] dark:text-[#25D366] text-[10px] font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                        Admin
                      </span>
                    )}
                    {isAdmin && !isSelf && (
                      <button
                        onClick={() => handleRemoveMember(uid)}
                        title="Remove member"
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Members Drawer */}
          {showAddMembers && (
            <div className="mt-4 p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#2A3942]">
              <h5 className="text-xs font-bold text-[#111B21] dark:text-[#E9EDEF] mb-2">
                Select contacts to add
              </h5>
              <div className="max-h-36 overflow-y-auto space-y-1 mb-2">
                {availableUsers.length === 0 ? (
                  <p className="text-xs text-gray-500">No other contacts available</p>
                ) : (
                  availableUsers.map((u) => {
                    const isSelected = selectedToAdd.includes(u.uid);
                    return (
                      <div
                        key={u.uid}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedToAdd(selectedToAdd.filter((id) => id !== u.uid));
                          } else {
                            setSelectedToAdd([...selectedToAdd, u.uid]);
                          }
                        }}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#202C33] cursor-pointer text-xs"
                      >
                        <span className="font-medium text-[#111B21] dark:text-[#E9EDEF]">
                          {u.displayName}
                        </span>
                        <input type="checkbox" checked={isSelected} readOnly />
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddMembers(false)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddMembers}
                  disabled={selectedToAdd.length === 0 || isSubmitting}
                  className="px-3.5 py-1 bg-[#128C7E] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#F0F2F5] dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#2A3942] flex justify-center">
          <button
            onClick={handleLeaveGroup}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit group</span>
          </button>
        </div>
      </div>
    </div>
  );
};

