import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User as UserIcon } from 'lucide-react';
import { KinbodyParticleIntro } from './KinbodyParticleIntro';
import { KinbodyCompanion } from './KinbodyCompanion';

export type IntroStage = 'particles' | 'ready' | 'name-entry';

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

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Detect reduced motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setStage('ready');
    }
  }, []);

  // When stage reaches name-entry, automatically focus the name input
  useEffect(() => {
    if (stage === 'name-entry') {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleGetStartedPress = () => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setStage('name-entry');
  };

  return (
    <div className="relative w-full h-full min-h-[100dvh] bg-black text-white flex flex-col justify-between overflow-y-auto select-none px-5 sm:px-8 py-5 sm:py-6">
      {/* Top Status Bar Mock */}
      <div className="w-full flex justify-between items-center text-zinc-500 text-xs font-mono pt-1">
        <span>9:41</span>
        <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-bold">Kinbody 3D</span>
      </div>

      {/* Main Container */}
      <div className="my-auto py-2 flex flex-col justify-center w-full max-w-md mx-auto min-h-[440px]">
        {/* Stage 1: Particle Intro Orb */}
        {stage === 'particles' && (
          <div className="flex items-center justify-center">
            <KinbodyParticleIntro
              onComplete={() => setStage('ready')}
            />
          </div>
        )}

        {/* Stage 2: Ready Opening Screen */}
        {stage === 'ready' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            <div className="flex justify-center transition-all transform hover:scale-105">
              <KinbodyCompanion
                size="lg"
                showBubble={true}
                message={
                  <span>
                    Welcome to <span className="text-emerald-400 font-bold">Kinbody</span> 👋
                  </span>
                }
                align="center"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="flex items-center space-x-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  kinbody
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
                  Track. Understand. Evolve.
                </h1>
                <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                  Your 3D companion for nutrition,<br />body metrics, and activity tracking.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Stage 3: Name Entry (Matching Reference Screenshot Exactly) */}
        {stage === 'name-entry' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full flex flex-col justify-between space-y-6 pt-2"
          >
            {/* Title & Subtitle Matching Screenshot */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                What should<br />I call <span className="text-[#16E39B]">you?</span>
              </h2>
              <p className="text-sm text-zinc-400 font-normal">
                This helps personalise your experience.
              </p>

              {validationError && (
                <div className="text-xs text-red-400 font-medium">
                  {validationError}
                </div>
              )}

              {/* Styled Input Field with Green Border Accent */}
              <div className="relative pt-2">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 pt-2">
                  <UserIcon className="w-5 h-5 stroke-[1.75]" />
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
                  className="w-full bg-[#0A100D]/80 border-2 border-[#16E39B]/70 rounded-2xl pl-12 pr-4 py-4 text-white text-base focus:outline-none focus:border-[#16E39B] focus:ring-2 focus:ring-[#16E39B]/30 placeholder-zinc-500 transition-all shadow-lg shadow-[#16E39B]/5"
                />
              </div>
            </div>

            {/* Ake Placed in Bottom-Right Corner as seen in screenshot */}
            <div className="w-full flex justify-end pt-4 pr-1">
              <div className="relative flex flex-col items-end">
                <KinbodyCompanion
                  size="md"
                  align="bottom-right"
                  alignBubble="right"
                  showBubble={true}
                  message={
                    <div className="text-right">
                      <div>Hi there! 👋</div>
                      <div className="text-xs text-zinc-300 font-normal mt-0.5">What should I call you?</div>
                    </div>
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls / Action Buttons */}
      <div className="w-full space-y-4 pb-2 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {(stage === 'ready' || stage === 'particles') && (
            <motion.div
              key="ready-controls"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <button
                disabled={isButtonDisabled || stage === 'particles'}
                onClick={handleGetStartedPress}
                className={`w-full font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#16E39B]/20 min-h-[50px] ${
                  isButtonDisabled || stage === 'particles'
                    ? 'bg-emerald-500/50 text-black/60 cursor-not-allowed'
                    : 'bg-[#16E39B] hover:bg-[#16E39B]/90 text-black active:scale-[0.98]'
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#16E39B]" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </motion.div>
          )}

          {stage === 'name-entry' && (
            <motion.div
              key="name-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <button
                onClick={onNext}
                className="w-full bg-[#16E39B] hover:bg-[#16E39B]/90 text-black font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#16E39B]/20 active:scale-[0.98] min-h-[50px]"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#16E39B]" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
