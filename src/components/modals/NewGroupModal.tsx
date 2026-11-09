import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Users, Search, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { UserProfile } from '../../types';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const { searchUsers, createGroup, setActiveChat, uploadMedia } = useChat();

  const [step, setStep] = useState<1 | 2>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setStep(1);
      setSelectedUids([]);
      setGroupName('');
      setGroupDescription('');
      setPhotoURL('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const results = await searchUsers('');
      setAllUsers(results.filter((u) => u.uid !== userProfile?.uid));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectUser = (uid: string) => {
    if (selectedUids.includes(uid)) {
      setSelectedUids(selectedUids.filter((id) => id !== uid));
    } else {
      setSelectedUids([...selectedUids, uid]);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadMedia(file);
      setPhotoURL(res.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload group photo');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    if (selectedUids.length === 0) {
      alert('Please select at least one member');
      return;
    }

    setIsCreating(true);
    try {
      const newGroup = await createGroup(
        groupName.trim(),
        groupDescription.trim(),
        selectedUids,
        photoURL || undefined
      );
      setActiveChat(newGroup);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter((u) =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    u.phoneNumber.includes(searchTerm.trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#111B21]">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-bold text-[#111B21] dark:text-[#E9EDEF]">
              {step === 1 ? 'Add group members' : 'New group details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 ? (
          <>
            {/* Selected Members Chips */}
            {selectedUids.length > 0 && (
              <div className="p-3 border-b border-[#E9EDEF] dark:border-[#2A3942] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {selectedUids.map((uid) => {
                  const u = allUsers.find((user) => user.uid === uid);
                  if (!u) return null;
                  return (
                    <span
                      key={uid}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-[#075E54] dark:text-[#25D366] rounded-full text-xs font-semibold"
                    >
                      {u.displayName}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-red-500"
                        onClick={() => toggleSelectUser(uid)}
                      />
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="p-3 border-b border-[#E9EDEF] dark:border-[#2A3942]">
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl">
                <Search className="w-4 h-4 text-[#54656F] dark:text-[#8696A0]" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#111B21] dark:text-[#E9EDEF] placeholder-[#54656F] dark:placeholder-[#8696A0] outline-none"
                />
              </div>
            </div>

            {/* User List with Checkboxes */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E9EDEF]/50 dark:divide-[#2A3942]/50 p-1">
              {filteredUsers.map((u) => {
                const isSelected = selectedUids.includes(u.uid);
                return (
                  <div
                    key={u.uid}
                    onClick={() => toggleSelectUser(u.uid)}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#F5F6F6] dark:hover:bg-[#111B21] rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold text-sm shrink-0">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{u.displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF] truncate">
                        {u.displayName}
                      </h4>
                      <p className="text-xs text-[#667781] dark:text-[#8696A0] truncate">
                        {u.phoneNumber}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#128C7E] border-[#128C7E] text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="p-3 bg-[#F0F2F5] dark:bg-[#111B21] border-t border-[#E9EDEF] dark:border-[#2A3942] flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={selectedUids.length === 0}
                className="px-5 py-2.5 bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Next ({selectedUids.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Group Details */
          <div className="p-6 flex flex-col items-center gap-5">
            {/* Group Photo */}
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-[#111B21] border-2 border-dashed border-[#128C7E] flex items-center justify-center text-[#128C7E]">
                {photoURL ? (
                  <img src={photoURL} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-10 h-10 opacity-70" />
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              </label>
            </div>

            {/* Name Input */}
            <div className="w-full">
              <label className="block text-xs font-bold text-[#54656F] dark:text-[#AEBAC1] uppercase mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group subject..."
                maxLength={40}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] dark:bg-[#111B21] text-[#111B21] dark:text-[#E9EDEF] text-sm rounded-xl border border-transparent focus:border-[#128C7E] outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Description Input */}
            <div className="w-full">
              <label className="block text-xs font-bold text-[#54656F] dark:text-[#AEBAC1] uppercase mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What is this group about?"
                rows={3}
                className="w-full px-4 py-2.5 bg-[#F0F2F5] dark:bg-[#111B21] text-[#111B21] dark:text-[#E9EDEF] text-sm rounded-xl border border-transparent focus:border-[#128C7E] outline-none transition-colors resize-none"
              />
            </div>

            {/* Member count summary */}
            <p className="text-xs text-[#667781] dark:text-[#8696A0]">
              Members: {selectedUids.length + 1} (including you)
            </p>

            {/* Create Group Button */}
            <button
              onClick={handleCreateGroup}
              disabled={isCreating || !groupName.trim()}
              className="w-full py-3 bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all mt-2"
            >
              {isCreating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

