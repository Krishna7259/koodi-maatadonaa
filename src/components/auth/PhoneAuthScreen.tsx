import React, { useState } from 'react';
import { KoodiLogo } from '../common/KoodiLogo';
import { Loader2, Phone, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneAuthScreenProps {
  onOtpSent: (confirmationResult: ConfirmationResult, phoneNumber: string) => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
];

export const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({ onOtpSent }) => {
  const { setupRecaptcha, sendOtp, loginWithTestAccount } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setError('Please enter a valid phone number (at least 7 to 10 digits)');
      return;
    }

    const fullPhoneNumber = `${selectedCountry.code}${cleanNum}`;
    setLoading(true);

    try {
      let verifier: any = null;
      try {
        verifier = setupRecaptcha('recaptcha-container');
      } catch (recaptchaErr) {
        console.warn('reCAPTCHA notice:', recaptchaErr);
      }

      const confirmationResult = await sendOtp(fullPhoneNumber, verifier);
      onOtpSent(confirmationResult, fullPhoneNumber);
    } catch (err: any) {
      console.error('[Phone Auth Error]', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number format is invalid. Please check the country code and number.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment before trying again.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] dark:bg-[#111B21] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-3xl p-7 sm:p-9 shadow-lg border border-gray-100 dark:border-gray-800">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-3 hover:scale-105 transition-transform">
            <KoodiLogo size={70} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111B21] dark:text-[#E9EDEF] tracking-tight">
            Koodi Maatadona
          </h1>
          <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1.5 font-medium">
            Enter your mobile number to sign in or create an account
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#54656F] dark:text-[#AEBAC1] uppercase tracking-wider">
              Country / Region
            </label>
            <select
              value={selectedCountry.country}
              onChange={(e) => {
                const match = COUNTRY_CODES.find(c => c.country === e.target.value);
                if (match) setSelectedCountry(match);
              }}
              className="w-full px-4 py-3 bg-[#F0F2F5] dark:bg-[#111B21] border border-transparent focus:border-[#128C7E] dark:focus:border-[#25D366] rounded-xl text-sm font-medium text-[#111B21] dark:text-[#E9EDEF] outline-none transition-colors cursor-pointer"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.country + c.code} value={c.country}>
                  {c.flag} {c.country} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#54656F] dark:text-[#AEBAC1] uppercase tracking-wider">
              Phone Number
            </label>
            <div className="flex gap-2.5">
              <span className="inline-flex items-center px-4 bg-[#F0F2F5] dark:bg-[#111B21] border border-transparent rounded-xl text-sm font-semibold text-[#54656F] dark:text-[#AEBAC1] select-none shrink-0">
                {selectedCountry.code}
              </span>
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-[#F0F2F5] dark:bg-[#111B21] border border-transparent focus:border-[#128C7E] dark:focus:border-[#25D366] rounded-xl text-sm font-medium text-[#111B21] dark:text-[#E9EDEF] placeholder-[#8696A0] outline-none transition-colors"
                  autoFocus
                />
                <Phone className="w-4 h-4 text-[#8696A0] absolute right-4 top-3.5" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="w-full mt-2 py-3.5 bg-[#128C7E] hover:bg-[#075E54] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Accounts (Subtle) */}
        <div className="mt-7 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-[#8696A0] text-center mb-2.5">
            Quick Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginWithTestAccount(1)}
              className="py-2 px-3 bg-gray-50 dark:bg-[#111B21] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-[#54656F] dark:text-[#AEBAC1] hover:text-[#128C7E] dark:hover:text-[#25D366] rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Alice</span>
            </button>
            <button
              type="button"
              onClick={() => loginWithTestAccount(2)}
              className="py-2 px-3 bg-gray-50 dark:bg-[#111B21] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold text-[#54656F] dark:text-[#AEBAC1] hover:text-[#128C7E] dark:hover:text-[#25D366] rounded-lg transition-colors border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Bob</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-1 text-[11px] text-[#8696A0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#128C7E]" />
          <span>Secure Cloud Communication</span>
        </div>
      </div>
    </div>
  );
};
