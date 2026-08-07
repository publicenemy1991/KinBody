import React from 'react';

interface KinbodyIconProps {
  className?: string;
  variant?: 'gradient' | 'mono-dark' | 'mono-light';
  showBackground?: boolean;
}

export const KinbodyIcon: React.FC<KinbodyIconProps> = ({
  className = 'w-8 h-8',
  variant = 'gradient',
  showBackground = false,
}) => {
  const strokeColor =
    variant === 'mono-dark'
      ? '#000000'
      : variant === 'mono-light'
      ? '#FFFFFF'
      : 'url(#kinbodyLogoGrad)';

  const nodeColor =
    variant === 'mono-dark'
      ? '#000000'
      : variant === 'mono-light'
      ? '#FFFFFF'
      : '#7CFFD8';

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Background Radial Ambient Glow */}
        <radialGradient id="kinbodyBgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#16E39B" stopOpacity="0.3" />
          <stop offset="70%" stopColor="#16E39B" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#060C0A" stopOpacity="0" />
        </radialGradient>

        {/* Glowing Line Gradient */}
        <linearGradient id="kinbodyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60FFCA" />
          <stop offset="40%" stopColor="#16E39B" />
          <stop offset="80%" stopColor="#02B36B" />
          <stop offset="100%" stopColor="#00824C" />
        </linearGradient>

        {/* Neon Glow Filter */}
        <filter id="kinbodyNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Optional Background Frame */}
      {showBackground && (
        <>
          <rect width="100" height="100" rx="22" fill="#060C0A" />
          <rect width="100" height="100" rx="22" fill="url(#kinbodyBgGlow)" />
          <rect width="98" height="98" x="1" y="1" rx="21" stroke="#16E39B" strokeOpacity="0.25" strokeWidth="1.5" />
        </>
      )}

      {/* Bio-Topology Geometric K Mesh */}
      <g filter={variant === 'gradient' ? 'url(#kinbodyNeonGlow)' : undefined}>
        {/* Main K Skeleton Lines */}
        <line x1="26" y1="22" x2="26" y2="78" stroke={strokeColor} strokeWidth="9" strokeLinecap="round" />
        <line x1="26" y1="50" x2="74" y2="22" stroke={strokeColor} strokeWidth="9" strokeLinecap="round" />
        <line x1="26" y1="50" x2="74" y2="78" stroke={strokeColor} strokeWidth="9" strokeLinecap="round" />

        {/* Interconnecting Bio-Mesh Network Links */}
        <line x1="26" y1="22" x2="50" y2="36" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="50" y1="36" x2="74" y2="22" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="50" y1="36" x2="26" y2="50" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.65" strokeLinecap="round" />

        <line x1="26" y1="78" x2="50" y2="64" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="50" y1="64" x2="74" y2="78" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.75" strokeLinecap="round" />
        <line x1="50" y1="64" x2="26" y2="50" stroke={strokeColor} strokeWidth="3.5" strokeOpacity="0.65" strokeLinecap="round" />

        {/* Glowing Vertex Nodes */}
        <circle cx="26" cy="22" r="5.5" fill={nodeColor} />
        <circle cx="26" cy="50" r="6" fill="#FFFFFF" />
        <circle cx="26" cy="78" r="5.5" fill={nodeColor} />

        <circle cx="50" cy="36" r="4" fill="#60FFCA" />
        <circle cx="50" cy="64" r="4" fill="#60FFCA" />

        <circle cx="74" cy="22" r="5.5" fill="#16E39B" />
        <circle cx="74" cy="78" r="5.5" fill="#16E39B" />
      </g>
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
