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
  const verticalBarPath =
    'M 28 16 C 33.5 16, 38 20.5, 38 26 L 38 74 C 38 79.5, 33.5 84, 28 84 C 22.5 84, 18 79.5, 18 74 L 18 26 C 18 20.5, 22.5 16, 28 16 Z';

  const softenedBodyPath =
    'M 34 14 C 48 14, 52 20, 52 30 L 52 70 C 52 80, 44 86, 34 86 C 20 86, 14 78, 14 68 L 14 30 C 14 20, 20 14, 34 14 Z';

  const organicBlobPath =
    'M 60 14 C 92 14, 108 32, 106 60 C 104 88, 88 106, 58 106 C 28 106, 12 88, 14 58 C 16 28, 28 14, 60 14 Z';

  let currentBodyPath = verticalBarPath;
  if (stage === 'liquify') currentBodyPath = softenedBodyPath;
  if (stage === 'character' || stage === 'complete') currentBodyPath = organicBlobPath;

  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center select-none">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[#16E39B]/35 blur-2xl animate-pulse" />

      <motion.svg
        viewBox="0 0 120 120"
        className="w-full h-full relative z-10 filter drop-shadow(0 10px 24px rgba(22, 227, 155, 0.45))"
        animate={
          stage === 'character'
            ? {
                scaleY: [1, 0.9, 1.04, 1],
                scaleX: [1, 1.06, 0.97, 1],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <defs>
          <radialGradient id="morphOrganicGrad" cx="35%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#A3FBE0" />
            <stop offset="30%" stopColor="#22EA9F" />
            <stop offset="65%" stopColor="#08C372" />
            <stop offset="90%" stopColor="#035E37" />
            <stop offset="100%" stopColor="#012C1A" />
          </radialGradient>

          <linearGradient id="morphGlossHighlight" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#7AF2C4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#16E39B" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Main Morphing Body Path */}
        <motion.path
          d={currentBodyPath}
          fill="url(#morphOrganicGrad)"
          animate={{ d: currentBodyPath }}
          transition={{
            duration: stage === 'soften' ? 0.18 : stage === 'liquify' ? 0.32 : 0.28,
            ease: [0.25, 1, 0.5, 1],
          }}
        />

        {/* 2. Upper Diagonal Pill Arm (Fades & merges inward) */}
        <motion.line
          x1="36"
          y1="49"
          x2="74"
          y2="21"
          stroke="url(#morphOrganicGrad)"
          strokeWidth="17"
          strokeLinecap="round"
          animate={{
            opacity: stage === 'soften' ? 0.8 : stage === 'liquify' ? 0.2 : 0,
            x2: stage === 'soften' ? 68 : stage === 'liquify' ? 52 : 36,
            y2: stage === 'soften' ? 28 : stage === 'liquify' ? 40 : 49,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {/* 3. Lower Diagonal Pill Leg (Fades & merges inward) */}
        <motion.line
          x1="36"
          y1="51"
          x2="74"
          y2="79"
          stroke="url(#morphOrganicGrad)"
          strokeWidth="17"
          strokeLinecap="round"
          animate={{
            opacity: stage === 'soften' ? 0.8 : stage === 'liquify' ? 0.2 : 0,
            x2: stage === 'soften' ? 68 : stage === 'liquify' ? 52 : 36,
            y2: stage === 'soften' ? 72 : stage === 'liquify' ? 60 : 51,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />

        {/* 4. Top Soft Specular Gloss Highlight */}
        <motion.path
          d="M 38 22 C 54 16, 76 18, 86 28 C 72 20, 52 20, 36 28 Z"
          fill="url(#morphGlossHighlight)"
          animate={{ opacity: stage === 'character' || stage === 'complete' ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />

        {/* 5. Facial Features (Eyes and Smile) */}
        <motion.g
          animate={{
            opacity: stage === 'character' || stage === 'complete' ? 1 : 0,
            scale: stage === 'character' || stage === 'complete' ? 1 : 0.7,
          }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          {/* Eyes */}
          <ellipse cx="45" cy="52" rx="4.2" ry="5.8" fill="#012214" />
          <ellipse cx="75" cy="52" rx="4.2" ry="5.8" fill="#012214" />
          <circle cx="46.8" cy="49.8" r="1.6" fill="#FFFFFF" />
          <circle cx="76.8" cy="49.8" r="1.6" fill="#FFFFFF" />
          <circle cx="43.5" cy="54" r="0.8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="73.5" cy="54" r="0.8" fill="#FFFFFF" opacity="0.8" />

          {/* Smile */}
          <path
            d="M 51 63 Q 60 71 69 63"
            stroke="#012214"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cheeks */}
          <circle cx="36" cy="58" r="4.5" fill="#7AF2C4" opacity="0.6" />
          <circle cx="84" cy="58" r="4.5" fill="#7AF2C4" opacity="0.6" />
        </motion.g>
      </motion.svg>
    </div>
  );
};
