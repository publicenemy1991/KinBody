import React from 'react';

interface KinbodyIconProps {
  className?: string;
}

export const KinbodyIcon: React.FC<KinbodyIconProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="kinbodyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22E49B" />
          <stop offset="50%" stopColor="#00D084" />
          <stop offset="100%" stopColor="#05C270" />
        </linearGradient>
      </defs>
      {/* Left Vertical Bar */}
      <rect x="18" y="16" width="20" height="68" rx="10" fill="url(#kinbodyLogoGrad)" />
      {/* Upper Diagonal Bar */}
      <rect
        x="36"
        y="16"
        width="20"
        height="54"
        rx="10"
        transform="rotate(-42 36 16)"
        fill="url(#kinbodyLogoGrad)"
      />
      {/* Lower Right Sphere/Dot */}
      <circle cx="72" cy="72" r="12" fill="url(#kinbodyLogoGrad)" />
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
