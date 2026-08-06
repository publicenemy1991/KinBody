import React from 'react';
import { motion } from 'motion/react';

interface KinCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string | React.ReactNode;
  submessage?: string;
  className?: string;
  showBubble?: boolean;
}

export const KinCompanion: React.FC<KinCompanionProps> = ({
  size = 'md',
  message,
  submessage,
  className = '',
  showBubble = true,
}) => {
  const sizeMap = {
    sm: { container: 'w-12 h-12', blob: 'w-10 h-10', eyes: 'w-1 h-1.5', mouth: 'w-2 h-1' },
    md: { container: 'w-20 h-20', blob: 'w-16 h-16', eyes: 'w-1.5 h-2.5', mouth: 'w-3 h-1.5' },
    lg: { container: 'w-28 h-28', blob: 'w-24 h-24', eyes: 'w-2 h-3.5', mouth: 'w-4 h-2' },
    xl: { container: 'w-36 h-36', blob: 'w-32 h-32', eyes: 'w-2.5 h-4', mouth: 'w-5 h-2.5' },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble (if message provided) */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-3 max-w-xs bg-[#14161C] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-center"
        >
          <div className="text-sm font-medium text-white leading-snug">
            {message}
          </div>
          {submessage && (
            <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {submessage}
            </div>
          )}
          {/* Subtle bubble tail pointing down */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#14161C] border-r border-b border-white/10 rotate-45" />
        </motion.div>
      )}

      {/* Kin the Blob Container with floating and breathing animation */}
      <motion.div
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${dimensions.container} flex items-center justify-center`}
      >
        {/* Soft Outer Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-xl animate-pulse" />

        {/* Blob Body SVG */}
        <svg
          viewBox="0 0 120 120"
          className={`${dimensions.blob} filter drop-shadow(0 8px 16px rgba(16, 185, 129, 0.3))`}
        >
          <defs>
            <radialGradient id="kinBodyGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="85%" stopColor="#047857" />
              <stop offset="100%" stopColor="#022C22" />
            </radialGradient>
            <linearGradient id="kinHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Organic Rounded Blob Shape */}
          <path
            d="M 60 12 C 85 12, 108 30, 108 58 C 108 86, 88 106, 60 106 C 32 106, 12 86, 12 58 C 12 30, 35 12, 60 12 Z"
            fill="url(#kinBodyGrad)"
          />

          {/* Top Soft Specular Highlight */}
          <path
            d="M 40 22 C 55 16, 75 18, 85 28 C 70 20, 50 20, 36 28 Z"
            fill="url(#kinHighlight)"
          />

          {/* Cute Eyes */}
          <ellipse cx="46" cy="52" rx="4" ry="5.5" fill="#022C22" />
          <ellipse cx="74" cy="52" rx="4" ry="5.5" fill="#022C22" />
          {/* Eye Sparkles */}
          <circle cx="47.5" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="75.5" cy="50" r="1.5" fill="#FFFFFF" />

          {/* Friendly Smile */}
          <path
            d="M 52 64 Q 60 72 68 64"
            stroke="#022C22"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheeks */}
          <circle cx="38" cy="58" r="4" fill="#34D399" opacity="0.4" />
          <circle cx="82" cy="58" r="4" fill="#34D399" opacity="0.4" />
        </svg>
      </motion.div>
    </div>
  );
};
