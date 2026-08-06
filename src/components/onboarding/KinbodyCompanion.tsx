import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface KinbodyCompanionProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string | React.ReactNode;
  showBubble?: boolean;
  className?: string;
  animateBlink?: boolean;
  align?: 'center' | 'bottom-right';
}

export const KinbodyCompanion: React.FC<KinbodyCompanionProps> = ({
  size = 'lg',
  message,
  showBubble = true,
  className = '',
  animateBlink = true,
  align = 'bottom-right',
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
    sm: { container: 'w-14 h-14', svg: 'w-12 h-12' },
    md: { container: 'w-22 h-22', svg: 'w-18 h-18' },
    lg: { container: 'w-28 h-28', svg: 'w-24 h-24' },
    xl: { container: 'w-36 h-36', svg: 'w-32 h-32' },
  };

  const dimensions = sizeMap[size];

  const containerAlignment =
    align === 'bottom-right'
      ? 'flex flex-col items-end justify-end'
      : 'flex flex-col items-center justify-center';

  return (
    <div className={`${containerAlignment} select-none ${className}`}>
      {/* Speech Bubble */}
      {showBubble && message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`relative mb-3 max-w-xs bg-[#12141A] border border-white/12 rounded-2xl px-5 py-3.5 shadow-2xl ${
            align === 'bottom-right' ? 'text-right mr-2' : 'text-center'
          }`}
        >
          <div className="text-sm font-semibold text-white leading-snug">
            {message}
          </div>
          {/* Bubble tail pointing down towards the blob */}
          <div
            className={`absolute -bottom-1.5 w-3 h-3 bg-[#12141A] border-r border-b border-white/12 rotate-45 ${
              align === 'bottom-right' ? 'right-8' : 'left-1/2 -translate-x-1/2'
            }`}
          />
        </motion.div>
      )}

      {/* Floating & Breathing Organic Blob Character Container */}
      <motion.div
        animate={{
          y: [0, -4, 0],
          scale: [1, 1.02, 1],
          rotate: [0, -1, 1, 0],
        }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${dimensions.container} flex items-center justify-center`}
      >
        {/* Soft Outer Organic Emerald Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-[#16E39B]/30 blur-xl animate-pulse" />

        {/* Companion Blob SVG */}
        <svg
          viewBox="0 0 120 120"
          className={`${dimensions.svg} filter drop-shadow(0 10px 24px rgba(22, 227, 155, 0.45))` }
        >
          <defs>
            {/* Rich 3D Organic Liquid Gradient */}
            <radialGradient id="companionOrganicGrad" cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#A3FBE0" />
              <stop offset="30%" stopColor="#22EA9F" />
              <stop offset="65%" stopColor="#08C372" />
              <stop offset="90%" stopColor="#035E37" />
              <stop offset="100%" stopColor="#012C1A" />
            </radialGradient>

            {/* Specular Liquid Gloss Highlight */}
            <linearGradient id="companionGlossHighlight" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#7AF2C4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#16E39B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Organic Asymmetrical Squishy Blob Body */}
          <path
            d="M 60 14 C 92 14, 108 32, 106 60 C 104 88, 88 106, 58 106 C 28 106, 12 88, 14 58 C 16 28, 28 14, 60 14 Z"
            fill="url(#companionOrganicGrad)"
          />

          {/* Glossy Top Curved Specular Highlight */}
          <path
            d="M 38 22 C 54 16, 76 18, 86 28 C 72 20, 52 20, 36 28 Z"
            fill="url(#companionGlossHighlight)"
          />

          {/* Expressive Friendly Eyes */}
          <g className="transition-transform duration-100">
            <ellipse
              cx="45"
              cy="52"
              rx="4.2"
              ry={isBlinking ? 0.6 : 5.8}
              fill="#012214"
            />
            <ellipse
              cx="75"
              cy="52"
              rx="4.2"
              ry={isBlinking ? 0.6 : 5.8}
              fill="#012214"
            />
            {!isBlinking && (
              <>
                {/* Dual Eye Sparkles */}
                <circle cx="46.8" cy="49.8" r="1.6" fill="#FFFFFF" />
                <circle cx="76.8" cy="49.8" r="1.6" fill="#FFFFFF" />
                <circle cx="43.5" cy="54" r="0.8" fill="#FFFFFF" opacity="0.8" />
                <circle cx="73.5" cy="54" r="0.8" fill="#FFFFFF" opacity="0.8" />
              </>
            )}
          </g>

          {/* Friendly Smile */}
          <path
            d="M 51 63 Q 60 71 69 63"
            stroke="#012214"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Warm Glowing Mint Blush Cheeks */}
          <circle cx="36" cy="58" r="4.5" fill="#7AF2C4" opacity="0.6" />
          <circle cx="84" cy="58" r="4.5" fill="#7AF2C4" opacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
};
