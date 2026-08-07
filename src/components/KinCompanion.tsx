import React, { memo } from 'react';
import { motion } from 'motion/react';
import { KinbodyIcon } from './KinbodyLogo';

interface KinCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  message?: string | React.ReactNode;
  submessage?: string;
  className?: string;
  showBubble?: boolean;
  interactive?: boolean;
  autoWave?: boolean;
  align?: 'center' | 'bottom-right';
  alignBubble?: 'center' | 'left' | 'right';
  enableMotionBlur?: boolean;
}

export const KinCompanion: React.FC<KinCompanionProps> = memo(({
  size = 'md',
  message,
  submessage,
  className = '',
  showBubble = true,
  align = 'center',
  alignBubble = 'center',
}) => {
  // Size styling mappings
  const iconSizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-18 h-18',
    full: 'w-14 h-14',
  };

  const containerSizeMap = {
    sm: 'w-11 h-11 rounded-xl p-2',
    md: 'w-16 h-16 rounded-2xl p-2.5',
    lg: 'w-22 h-22 rounded-3xl p-3.5',
    xl: 'w-28 h-28 rounded-3xl p-4',
    full: 'w-22 h-22 rounded-3xl p-3.5',
  };

  const glowSizeMap = {
    sm: 'w-12 h-12 -inset-1 blur-md opacity-60',
    md: 'w-20 h-20 -inset-2 blur-xl opacity-70',
    lg: 'w-28 h-28 -inset-3 blur-2xl opacity-75',
    xl: 'w-34 h-34 -inset-4 blur-2xl opacity-80',
    full: 'w-28 h-28 -inset-3 blur-2xl opacity-75',
  };

  const iconClass = iconSizeMap[size] || iconSizeMap.md;
  const containerClass = containerSizeMap[size] || containerSizeMap.md;
  const glowClass = glowSizeMap[size] || glowSizeMap.md;

  const bubbleTailAlignment = {
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-6',
    right: 'right-6',
  }[alignBubble];

  return (
    <div
      className={`relative flex flex-col select-none ${
        align === 'bottom-right' ? 'items-end' : 'items-center'
      } ${className}`}
    >
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative mb-3 max-w-xs bg-[#0F1613]/95 border border-[#16E39B]/25 rounded-2xl px-4 py-3 shadow-2xl text-center backdrop-blur-md z-20"
        >
          <div className="text-sm font-semibold text-white leading-snug">
            {message}
          </div>
          {submessage && (
            <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {submessage}
            </div>
          )}
          {/* Speech Bubble Tail */}
          <div
            className={`absolute -bottom-1.5 ${bubbleTailAlignment} w-3 h-3 bg-[#0F1613] border-r border-b border-[#16E39B]/25 rotate-45`}
          />
        </motion.div>
      )}

      {/* Glowing Logo Container with Subtle Floating Animation */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative group cursor-pointer flex items-center justify-center gpu-accelerated"
      >
        {/* Subtle Ambient Glow Effect Behind Logo */}
        <div
          className={`absolute rounded-full bg-gradient-to-tr from-[#16E39B]/40 via-[#41F8B5]/30 to-[#00824C]/20 transition-all duration-500 group-hover:scale-110 ${glowClass}`}
        />

        {/* Soft Radial Ambient Spotlight */}
        <div className="absolute inset-0 rounded-full bg-[#16E39B]/10 blur-md" />

        {/* Logo Card Frame */}
        <div
          className={`relative flex items-center justify-center bg-[#07110C]/90 border border-[#16E39B]/35 shadow-xl shadow-[#16E39B]/10 backdrop-blur-md transition-all duration-300 group-hover:border-[#16E39B]/60 group-hover:shadow-[#16E39B]/25 ${containerClass}`}
        >
          <KinbodyIcon className={iconClass} variant="gradient" />
        </div>
      </motion.div>
    </div>
  );
});

KinCompanion.displayName = 'KinCompanion';


