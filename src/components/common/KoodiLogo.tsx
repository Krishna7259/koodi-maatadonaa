import React from 'react';

interface KoodiLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const KoodiLogo: React.FC<KoodiLogoProps> = ({ 
  size = 48, 
  showText = false, 
  textColor = 'text-white',
  className = '' 
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#128C7E" />
            <stop offset="100%" stopColor="#075E54" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#128C7E" />
          </linearGradient>
        </defs>

        {/* Circular Background */}
        <circle cx="50" cy="50" r="46" fill="url(#bubbleGrad)" />

        {/* Primary Speech Bubble */}
        <path 
          d="M 32 30 C 22 30 18 38 18 50 C 18 64 28 70 40 70 C 44 70 47 69 50 67 L 58 74 L 56 64 C 64 59 66 50 66 45 C 66 35 58 30 45 30 Z" 
          fill="#FFFFFF" 
          opacity="0.96" 
        />

        {/* Secondary Overlapping Speech Bubble */}
        <path 
          d="M 52 38 C 62 38 72 43 72 54 C 72 61 68 67 60 70 L 62 78 L 54 73 C 50 74 47 74 45 74 C 54 68 58 60 58 52 C 58 45 55 40 52 38 Z" 
          fill="url(#accentGrad)" 
        />

        {/* Sound/Voice Waves Inside Bubble */}
        <path d="M 29 46 Q 35 42 42 46 T 55 46" fill="none" stroke="#075E54" strokeWidth="3" strokeLinecap="round" />
        <path d="M 32 54 Q 38 50 45 54 T 52 54" fill="none" stroke="#128C7E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="38" r="2.5" fill="#25D366" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-xl leading-tight ${textColor}`}>
            Koodi Maatadona
          </span>
          <span className="text-xs opacity-80 font-medium text-emerald-200">
            Secure Cloud Messaging & Calling
          </span>
        </div>
      )}
    </div>
  );
};

