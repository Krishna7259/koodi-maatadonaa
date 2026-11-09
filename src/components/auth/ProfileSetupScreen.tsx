import React, { useState } from 'react';
import { Camera, User, Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
  const { createOrUpdateProfile, userProfile, currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [about, setAbout] = useState(userProfile?.about || 'Hey there! I am using Koodi Maatadona.');
  const [selectedPhoto, setSelectedPhoto] = useState(userProfile?.photoURL || DEFAULT_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOrUpdateProfile({
        displayName: displayName.trim(),
        about: about.trim(),
        photoURL: selectedPhoto,
      });
      onComplete();
    } catch (err: any) {
      console.error('[Profile setup error]', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] dark:bg-[#111B21] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Profile Info
          </h2>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
            Please provide your name and an optional profile photo.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <img
                src={selectedPhoto}
                alt="Selected Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#128C7E] shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            <span className="text-xs font-semibold text-gray-500">Choose an Avatar:</span>
            <div className="flex gap-2 justify-center flex-wrap">
              {DEFAULT_AVATARS.map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedPhoto(url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    selectedPhoto === url ? 'border-[#25D366] scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar option ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Type your name here
            </label>
            <input
              type="text"
              placeholder="e.g. Krishna Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full py-2.5 px-3 bg-gray-50 dark:bg-[#111B21] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#128C7E]"
            />
          </div>

          {/* About Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              About
            </label>
            <input
              type="text"
              placeholder="Hey there! I am using Koodi Maatadona."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50 dark:bg-[#111B21] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#128C7E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full py-3.5 px-4 bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-50 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all text-sm tracking-wide flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>START MESSAGING</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

