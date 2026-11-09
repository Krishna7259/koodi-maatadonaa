import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationResult, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface OtpVerificationScreenProps {
  phoneNumber: string;
  confirmationResult: ConfirmationResult;
  onBack: () => void;
  onSuccess: (user: User, hasProfile: boolean) => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  phoneNumber,
  confirmationResult,
  onBack,
  onSuccess
}) => {
  const { verifyOtp, setupRecaptcha, sendOtp } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [currentConfirmationResult, setCurrentConfirmationResult] = useState<ConfirmationResult>(confirmationResult);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digit
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-submit
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await verifyOtp(currentConfirmationResult, code);

      // Check if user already has an existing profile in Firestore
      const userDocSnap = await getDoc(doc(db, 'users', user.uid));
      const hasProfile = userDocSnap.exists() && Boolean(userDocSnap.data()?.displayName);

      onSuccess(user, hasProfile);
    } catch (err: any) {
      console.error('[OTP Verification Error]', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect verification code. Please check your SMS and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new code.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setLoading(true);

    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const newResult = await sendOtp(phoneNumber, verifier);
      setCurrentConfirmationResult(newResult);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] dark:bg-[#111B21] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#202C33] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
        
        {/* Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Verify {phoneNumber}
          </h2>
        </div>

        <p className="text-xs text-[#667781] dark:text-[#8696A0] leading-relaxed mb-6">
          Waiting to automatically detect an SMS sent to <strong className="text-gray-800 dark:text-gray-200">{phoneNumber}</strong>.
          <span onClick={onBack} className="text-[#128C7E] ml-1.5 cursor-pointer font-semibold underline">
            Wrong number?
          </span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="flex justify-between gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-gray-50 dark:bg-[#111B21] border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#128C7E] focus:bg-white dark:focus:bg-[#202C33] focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3.5 px-4 bg-[#128C7E] hover:bg-[#075E54] disabled:opacity-50 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition-all text-sm tracking-wide flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>VERIFY OTP</span>
          )}
        </button>

        {/* Resend Code Section */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          {resendTimer > 0 ? (
            <p className="text-xs text-gray-400">
              Resend SMS in <span className="font-semibold text-gray-700 dark:text-gray-300">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-xs text-[#128C7E] font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resend code now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

