import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User as UserIcon } from 'lucide-react';
import { KinbodyParticleIntro } from './KinbodyParticleIntro';
import { KinbodyLogo } from './KinbodyLogo';
import { KinbodyCompanion } from './KinbodyCompanion';
import { LogoCompanionMorph } from './LogoCompanionMorph';

export type IntroStage =
  | 'particles'
  | 'logo-forming'
  | 'ready'
  | 'morphing'
  | 'name-entry';

interface OnboardingIntroProps {
  nameValue: string;
  onNameChange: (val: string) => void;
  onNext: () => void;
  validationError?: string | null;
}

export const OnboardingIntro: React.FC<OnboardingIntroProps> = ({
  nameValue,
  onNameChange,
  onNext,
  validationError,
}) => {
  const [stage, setStage] = useState<IntroStage>('particles');
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Detect reduced motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setStage('ready');
    }

    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsReducedMotion(true);
        setStage('ready');
      }
    };

    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  // When stage reaches name-entry, automatically focus the name input
  useEffect(() => {
    if (stage === 'name-entry') {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleGetStartedPress = () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);

    if (isReducedMotion) {
      setStage('name-entry');
      return;
    }

    setStage('morphing');
  };

  const handleMorphComplete = () => {
    setStage('name-entry');
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none px-6 py-8">
      {/* Top Status Time Mock */}
      <div className="w-full flex justify-between items-center text-zinc-600 text-xs font-mono">
        <span>9:41</span>
      </div>

      {/* Main Center Area */}
      <div className="my-auto py-4 flex flex-col items-center justify-center space-y-6 w-full max-w-sm mx-auto">
        {/* Stage 1: Particles Orb */}
        {stage === 'particles' && (
          <KinbodyParticleIntro
            onComplete={() => setStage('ready')}
            isReducedMotion={isReducedMotion}
          />
        )}

        {/* Stage 2: Ready Opening Screen */}
        {stage === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center space-y-6 w-full"
          >
            {/* Kinbody Logo */}
            <KinbodyLogo className="w-24 h-24 sm:w-28 sm:h-28" animateBreathing />

            {/* Wordmark & Tagline */}
            <motion.div
              animate={{ opacity: isButtonDisabled ? 0 : 1, y: isButtonDisabled ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  kinbody
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <h1 className="text-xl font-extrabold text-white tracking-wide">
                  Track. Understand. Evolve.
                </h1>
                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  Your meals, body and activity.<br />All in one place.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Morphing */}
        {stage === 'morphing' && (
          <div className="flex flex-col items-center justify-center my-auto">
            <LogoCompanionMorph
              onMorphComplete={handleMorphComplete}
              isReducedMotion={isReducedMotion}
            />
          </div>
        )}

        {/* Stage 4: Name Entry */}
        {stage === 'name-entry' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full space-y-6 pt-2"
          >
            {/* Companion Guide with Speech Bubble */}
            <KinbodyCompanion
              size="lg"
              message={
                <span>
                  Hi there! 👋<br />
                  What should I call you?
                </span>
              }
            />

            {/* Name Input Form */}
            <div className="space-y-4 pt-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  What should I call you?
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  This helps personalise your experience.
                </p>
              </div>

              {validationError && (
                <div className="text-xs text-red-400 font-medium">
                  {validationError}
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nameValue}
                  onChange={(e) => onNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onNext();
                    }
                  }}
                  placeholder="Your name"
                  className="w-full bg-[#12141A] border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white text-base focus:outline-none focus:border-[#16E39B] placeholder-zinc-600 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls / Buttons */}
      <div className="w-full space-y-6 pb-4 max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          {(stage === 'ready' || stage === 'particles' || stage === 'morphing') && (
            <motion.div
              key="ready-controls"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <button
                disabled={isButtonDisabled || stage === 'particles'}
                onClick={handleGetStartedPress}
                className={`w-full font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#16E39B]/20 ${
                  isButtonDisabled || stage === 'particles'
                    ? 'bg-emerald-500/50 text-black/60 cursor-not-allowed'
                    : 'bg-[#16E39B] hover:bg-[#16E39B]/90 text-black active:scale-[0.98]'
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* 3 Pagination Dots */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#16E39B]" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </motion.div>
          )}

          {stage === 'name-entry' && (
            <motion.div
              key="name-controls"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <button
                onClick={onNext}
                className="w-full bg-[#16E39B] hover:bg-[#16E39B]/90 text-black font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#16E39B]/20 active:scale-[0.98]"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* 3 Pagination Dots (Step 1 active) */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-[#16E39B]" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
