import React from 'react';
import { motion } from 'motion/react';

interface KinbodyLogoProps {
  className?: string;
  animateBreathing?: boolean;
}

export const KinbodyLogoIcon: React.FC<{ className?: string }> = ({
  className = 'w-16 h-16',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="kinbodyLogoGradOnboarding" x1="0%" y1="0%" x2="100%" y2="100%">
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
        stroke="url(#kinbodyLogoGradOnboarding)"
        strokeWidth="17"
        strokeLinecap="round"
      />
      {/* 2. Upper Diagonal Pill Arm */}
      <line
        x1="36"
        y1="49"
        x2="74"
        y2="21"
        stroke="url(#kinbodyLogoGradOnboarding)"
        strokeWidth="17"
        strokeLinecap="round"
      />
      {/* 3. Lower Diagonal Pill Leg */}
      <line
        x1="36"
        y1="51"
        x2="74"
        y2="79"
        stroke="url(#kinbodyLogoGradOnboarding)"
        strokeWidth="17"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const KinbodyLogo: React.FC<KinbodyLogoProps> = ({
  className = 'w-20 h-20',
  animateBreathing = true,
}) => {
  return (
    <motion.div
      animate={
        animateBreathing
          ? {
              scale: [1, 1.025, 1],
            }
          : { scale: 1 }
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Soft Ambient Radial Glow */}
      <div className="absolute inset-0 bg-[#16E39B]/25 rounded-full blur-xl animate-pulse" />

      <KinbodyLogoIcon className="w-full h-full relative z-10 filter drop-shadow(0 6px 16px rgba(22,227,155,0.4))" />
    </motion.div>
  );
};
