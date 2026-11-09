import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  User, 
  Edit2, 
  Check, 
  Trash2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useChat } from '../../context/ChatContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, createOrUpdateProfile, logout } = useAuth();
  const { darkMode, toggleDarkMode, settings, updateSettings } = useTheme();
  const { uploadMedia } = useChat();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [about, setAbout] = useState(userProfile?.about || 'Hey there! I am using Koodi Maatadona 💬');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsSaving(true);
      const res = await uploadMedia(file);
      setPhotoURL(res.url);
      await createOrUpdateProfile({ photoURL: res.url });
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await createOrUpdateProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await createOrUpdateProfile({ about: about.trim() });
      setIsEditingAbout(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDEF] dark:border-[#2A3942] bg-[#F0F2F5] dark:bg-[#111B21]">
          <h2 className="text-base font-bold text-[#111B21] dark:text-[#E9EDEF]">Settings & Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#54656F] dark:text-[#AEBAC1] hover:bg-gray-200 dark:hover:bg-[#2A3942] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Profile Photo & Name Banner */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#075E54] dark:text-[#25D366] font-bold text-3xl shadow-md border-2 border-[#128C7E]">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* Phone badge */}
            <span className="px-3 py-1 bg-gray-100 dark:bg-[#111B21] text-xs font-mono font-semibold text-[#54656F] dark:text-[#AEBAC1] rounded-full">
              {userProfile?.phoneNumber || 'Demo Account'}
            </span>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {/* Display Name */}
            <div className="p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#2A3942]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#54656F] dark:text-[#8696A0]">
                Your Name
              </span>
              <div className="flex items-center justify-between mt-1">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#202C33] px-2.5 py-1 text-sm rounded border border-[#128C7E] outline-none text-[#111B21] dark:text-[#E9EDEF]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="p-1.5 bg-[#128C7E] text-white rounded-lg hover:bg-[#075E54]"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#111B21] dark:text-[#E9EDEF]">
                      {userProfile?.displayName}
                    </p>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-[#54656F] dark:text-[#8696A0] hover:text-[#128C7E]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* About */}
            <div className="p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl border border-[#E9EDEF] dark:border-[#2A3942]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#54656F] dark:text-[#8696A0]">
                About
              </span>
              <div className="flex items-center justify-between mt-1">
                {isEditingAbout ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#202C33] px-2.5 py-1 text-sm rounded border border-[#128C7E] outline-none text-[#111B21] dark:text-[#E9EDEF]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveAbout}
                      disabled={isSaving}
                      className="p-1.5 bg-[#128C7E] text-white rounded-lg hover:bg-[#075E54]"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#54656F] dark:text-[#AEBAC1]">
                      {userProfile?.about || 'Hey there! I am using Koodi Maatadona 💬'}
                    </p>
                    <button
                      onClick={() => setIsEditingAbout(true)}
                      className="p-1 text-[#54656F] dark:text-[#8696A0] hover:text-[#128C7E]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preferences & Privacy */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#54656F] dark:text-[#8696A0]">
              Preferences
            </h4>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF]">Dark Theme</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  darkMode ? 'bg-[#25D366] justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Sound Notification */}
            <div className="flex items-center justify-between p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl">
              <div className="flex items-center gap-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#128C7E]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF]">Message Sounds</span>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.soundEnabled ? 'bg-[#25D366] justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Read Receipts */}
            <div className="flex items-center justify-between p-3 bg-[#F0F2F5] dark:bg-[#111B21] rounded-xl">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-[#111B21] dark:text-[#E9EDEF]">Read Receipts</p>
                  <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">Show blue double ticks</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ readReceipts: !settings.readReceipts })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  settings.readReceipts ? 'bg-[#25D366] justify-end' : 'bg-gray-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-2">
            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full py-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-rose-200 dark:border-rose-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

