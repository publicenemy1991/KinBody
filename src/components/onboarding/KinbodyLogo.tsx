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
          <stop offset="0%" stopColor="#7AF2C4" />
          <stop offset="40%" stopColor="#16E39B" />
          <stop offset="100%" stopColor="#05C270" />
        </linearGradient>
      </defs>
      {/* Left Vertical Bar */}
      <rect
        x="18"
        y="16"
        width="20"
        height="68"
        rx="10"
        fill="url(#kinbodyLogoGradOnboarding)"
      />
      {/* Upper Diagonal Bar */}
      <rect
        x="36"
        y="16"
        width="20"
        height="54"
        rx="10"
        transform="rotate(-42 36 16)"
        fill="url(#kinbodyLogoGradOnboarding)"
      />
      {/* Lower Right Sphere/Dot */}
      <circle cx="72" cy="72" r="12" fill="url(#kinbodyLogoGradOnboarding)" />
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
