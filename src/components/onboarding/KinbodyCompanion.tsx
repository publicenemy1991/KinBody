import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface KinbodyCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string | React.ReactNode;
  showBubble?: boolean;
  className?: string;
  animateBlink?: boolean;
}

export const KinbodyCompanion: React.FC<KinbodyCompanionProps> = ({
  size = 'lg',
  message,
  showBubble = true,
  className = '',
  animateBlink = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!animateBlink) return;

    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800);

    return () => clearInterval(interval);
  }, [animateBlink]);

  const sizeMap = {
    sm: { container: 'w-12 h-12', svg: 'w-10 h-10' },
    md: { container: 'w-20 h-20', svg: 'w-16 h-16' },
    lg: { container: 'w-28 h-28', svg: 'w-24 h-24' },
    xl: { container: 'w-36 h-36', svg: 'w-32 h-32' },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative mb-3.5 max-w-xs bg-[#12141A] border border-white/10 rounded-2xl px-5 py-3.5 shadow-2xl text-center"
        >
          <div className="text-sm font-semibold text-white leading-snug">
            {message}
          </div>
          {/* Bubble tail pointing down */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#12141A] border-r border-b border-white/10 rotate-45" />
        </motion.div>
      )}

      {/* Floating & Breathing Blob Container */}
      <motion.div
        animate={{
          y: [0, -3, 0],
          scale: [1, 1.015, 1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${dimensions.container} flex items-center justify-center`}
      >
        {/* Soft Outer Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#16E39B]/25 blur-xl animate-pulse" />

        {/* Companion Body SVG */}
        <svg
          viewBox="0 0 120 120"
          className={`${dimensions.svg} filter drop-shadow(0 8px 20px rgba(22, 227, 155, 0.4))`}
        >
          <defs>
            <radialGradient id="companionBodyGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#7AF2C4" />
              <stop offset="40%" stopColor="#16E39B" />
              <stop offset="85%" stopColor="#05C270" />
              <stop offset="100%" stopColor="#022C22" />
            </radialGradient>

            <linearGradient id="companionHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#16E39B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Organic Blob Body Path */}
          <path
            d="M 60 12 C 85 12, 108 30, 108 58 C 108 86, 88 106, 60 106 C 32 106, 12 86, 12 58 C 12 30, 35 12, 60 12 Z"
            fill="url(#companionBodyGrad)"
          />

          {/* Top Soft Specular Highlight */}
          <path
            d="M 40 22 C 55 16, 75 18, 85 28 C 70 20, 50 20, 36 28 Z"
            fill="url(#companionHighlight)"
          />

          {/* Cute Blinking Eyes */}
          <g className="transition-transform duration-100">
            <ellipse
              cx="46"
              cy="52"
              rx="4"
              ry={isBlinking ? 0.5 : 5.5}
              fill="#022C22"
            />
            <ellipse
              cx="74"
              cy="52"
              rx="4"
              ry={isBlinking ? 0.5 : 5.5}
              fill="#022C22"
            />
            {!isBlinking && (
              <>
                {/* Eye Sparkles */}
                <circle cx="47.5" cy="50" r="1.5" fill="#FFFFFF" />
                <circle cx="75.5" cy="50" r="1.5" fill="#FFFFFF" />
              </>
            )}
          </g>

          {/* Friendly Smile */}
          <path
            d="M 52 64 Q 60 72 68 64"
            stroke="#022C22"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheeks */}
          <circle cx="38" cy="58" r="4" fill="#7AF2C4" opacity="0.5" />
          <circle cx="82" cy="58" r="4" fill="#7AF2C4" opacity="0.5" />
        </svg>
      </motion.div>
    </div>
  );
};
