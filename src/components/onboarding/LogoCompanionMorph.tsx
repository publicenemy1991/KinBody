import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface LogoCompanionMorphProps {
  onMorphComplete: () => void;
  isReducedMotion?: boolean;
}

export const LogoCompanionMorph: React.FC<LogoCompanionMorphProps> = ({
  onMorphComplete,
  isReducedMotion = false,
}) => {
  const [stage, setStage] = useState<'soften' | 'liquify' | 'character' | 'complete'>('soften');

  useEffect(() => {
    if (isReducedMotion) {
      onMorphComplete();
      return;
    }

    // Stage A: Soften (180ms)
    const t1 = setTimeout(() => {
      setStage('liquify');
    }, 180);

    // Stage B: Liquify (180ms + 320ms = 500ms)
    const t2 = setTimeout(() => {
      setStage('character');
    }, 500);

    // Stage C: Character forms (500ms + 280ms = 780ms)
    const t3 = setTimeout(() => {
      setStage('complete');
      onMorphComplete();
    }, 780);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isReducedMotion, onMorphComplete]);

  if (isReducedMotion) return null;

  // Path definitions for morphing
  // 1. Main body path morphing from vertical bar to companion blob shape
  const verticalBarPath =
    'M 28 16 C 33.5 16, 38 20.5, 38 26 L 38 74 C 38 79.5, 33.5 84, 28 84 C 22.5 84, 18 79.5, 18 74 L 18 26 C 18 20.5, 22.5 16, 28 16 Z';

  const softenedBodyPath =
    'M 34 14 C 48 14, 52 20, 52 30 L 52 70 C 52 80, 44 86, 34 86 C 20 86, 14 78, 14 68 L 14 30 C 14 20, 20 14, 34 14 Z';

  const blobBodyPath =
    'M 60 12 C 85 12, 108 30, 108 58 C 108 86, 88 106, 60 106 C 32 106, 12 86, 12 58 C 12 30, 35 12, 60 12 Z';

  let currentBodyPath = verticalBarPath;
  if (stage === 'liquify') currentBodyPath = softenedBodyPath;
  if (stage === 'character' || stage === 'complete') currentBodyPath = blobBodyPath;

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center select-none">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[#16E39B]/30 blur-2xl animate-pulse" />

      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full relative z-10 filter drop-shadow(0 8px 20px rgba(22, 227, 155, 0.45))"
        animate={
          stage === 'character'
            ? {
                scaleY: [1, 0.92, 1.03, 1],
                scaleX: [1, 1.05, 0.98, 1],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <defs>
          <radialGradient id="morphGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#7AF2C4" />
            <stop offset="40%" stopColor="#16E39B" />
            <stop offset="85%" stopColor="#05C270" />
            <stop offset="100%" stopColor="#022C22" />
          </radialGradient>

          <linearGradient id="morphHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#16E39B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Main Morphing Body Path */}
        <motion.path
          d={currentBodyPath}
          fill="url(#morphGrad)"
          animate={{ d: currentBodyPath }}
          transition={{
            duration: stage === 'soften' ? 0.18 : stage === 'liquify' ? 0.32 : 0.28,
            ease: [0.25, 1, 0.5, 1],
          }}
        />

        {/* 2. Diagonal Bar (Fades/Merges into main body during Stage A & B) */}
        <motion.rect
          x="42"
          y="20"
          width="18"
          height="50"
          rx="9"
          transform="rotate(-42 42 20)"
          fill="url(#morphGrad)"
          animate={{
            opacity: stage === 'soften' ? 0.8 : stage === 'liquify' ? 0.2 : 0,
            scale: stage === 'soften' ? 0.9 : 0.6,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {/* 3. Dot Circle (Moves inward to merge into lower body) */}
        <motion.circle
          cx={stage === 'soften' ? 76 : stage === 'liquify' ? 68 : 60}
          cy={stage === 'soften' ? 76 : stage === 'liquify' ? 70 : 60}
          r={stage === 'soften' ? 11 : stage === 'liquify' ? 6 : 0}
          fill="url(#morphGrad)"
          animate={{
            cx: stage === 'soften' ? 76 : stage === 'liquify' ? 68 : 60,
            cy: stage === 'soften' ? 76 : stage === 'liquify' ? 70 : 60,
            r: stage === 'soften' ? 11 : stage === 'liquify' ? 6 : 0,
            opacity: stage === 'character' ? 0 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {/* 4. Top Soft Specular Highlight (Fades in during character stage) */}
        <motion.path
          d="M 40 22 C 55 16, 75 18, 85 28 C 70 20, 50 20, 36 28 Z"
          fill="url(#morphHighlight)"
          animate={{ opacity: stage === 'character' || stage === 'complete' ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />

        {/* 5. Face Features (Eyes and Smile) - Fade in only in Stage C */}
        <motion.g
          animate={{
            opacity: stage === 'character' || stage === 'complete' ? 1 : 0,
            scale: stage === 'character' || stage === 'complete' ? 1 : 0.7,
          }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          {/* Eyes */}
          <ellipse cx="46" cy="52" rx="4" ry="5.5" fill="#022C22" />
          <ellipse cx="74" cy="52" rx="4" ry="5.5" fill="#022C22" />
          <circle cx="47.5" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="75.5" cy="50" r="1.5" fill="#FFFFFF" />

          {/* Smile */}
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
        </motion.g>
      </motion.svg>
    </div>
  );
};
