import React, { useState } from 'react';
import { PhoneAuthScreen } from './PhoneAuthScreen';
import { OtpVerificationScreen } from './OtpVerificationScreen';
import { ProfileSetupScreen } from './ProfileSetupScreen';
import { ConfirmationResult, User } from 'firebase/auth';

type AuthStep = 'phone' | 'otp' | 'profile_setup';

export const AuthContainer: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleOtpSent = (confResult: ConfirmationResult, phone: string) => {
    setConfirmationResult(confResult);
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOtpVerified = (user: User, hasProfile: boolean) => {
    if (hasProfile) {
      // User already has profile -> Auth state automatically transitions to dashboard
    } else {
      setStep('profile_setup');
    }
  };

  if (step === 'phone') {
    return (
      <PhoneAuthScreen
        onOtpSent={handleOtpSent}
      />
    );
  }

  if (step === 'otp' && confirmationResult) {
    return (
      <OtpVerificationScreen
        phoneNumber={phoneNumber}
        confirmationResult={confirmationResult}
        onBack={() => setStep('phone')}
        onSuccess={handleOtpVerified}
      />
    );
  }

  if (step === 'profile_setup') {
    return (
      <ProfileSetupScreen
        onComplete={() => {
          // Profile created, state automatically transitions to main app
        }}
      />
    );
  }

  return (
    <PhoneAuthScreen
      onOtpSent={handleOtpSent}
    />
  );
};
