import React from 'react';

interface KinbodyIconProps {
  className?: string;
  variant?: 'gradient' | 'mono-dark' | 'mono-light';
}

export const KinbodyIcon: React.FC<KinbodyIconProps> = ({
  className = 'w-8 h-8',
  variant = 'gradient',
}) => {
  const fillColor =
    variant === 'mono-dark'
      ? '#000000'
      : variant === 'mono-light'
      ? '#FFFFFF'
      : 'url(#kinbodyLogoGrad)';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="kinbodyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#41F8B5" />
          <stop offset="40%" stopColor="#16E39B" />
          <stop offset="85%" stopColor="#02B36B" />
          <stop offset="100%" stopColor="#00824C" />
        </linearGradient>
      </defs>
      {/* 1. Left Vertical Pill Stem */}
      <line
        x1="26"
        y1="20"
        x2="26"
        y2="80"
        stroke={fillColor}
        strokeWidth="17"
        strokeLinecap="round"
      />
      {/* 2. Upper Diagonal Pill Arm */}
      <line
        x1="36"
        y1="49"
        x2="74"
        y2="21"
        stroke={fillColor}
        strokeWidth="17"
        strokeLinecap="round"
      />
      {/* 3. Lower Diagonal Pill Leg */}
      <line
        x1="36"
        y1="51"
        x2="74"
        y2="79"
        stroke={fillColor}
        strokeWidth="17"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface KinbodyLogoProps {
  iconClassName?: string;
  textSize?: string;
  showTagline?: boolean;
}

export const KinbodyLogo: React.FC<KinbodyLogoProps> = ({
  iconClassName = 'w-8 h-8',
  textSize = 'text-2xl',
  showTagline = false,
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      <div className="flex items-center space-x-2.5">
        <KinbodyIcon className={iconClassName} />
        <span className={`font-extrabold tracking-tight text-white font-sans ${textSize}`}>
          kinbody
        </span>
      </div>
      {showTagline && (
        <div className="text-center mt-7 space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-wide">
            Track. Understand. Evolve.
          </h2>
          <p className="text-sm text-zinc-400 font-normal leading-relaxed">
            Your meals, body and activity.<br />All in one place.
          </p>
        </div>
      )}
    </div>
  );
};
