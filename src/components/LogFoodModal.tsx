import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Camera,
  Mic,
  Search,
  ChevronRight,
  Clock,
  Star,
} from 'lucide-react';

interface LogFoodModalProps {
  onClose: () => void;
  onSelectOption: (
    mode: 'barcode' | 'photo' | 'voice' | 'search' | 'recent'
  ) => void;
}

export const LogFoodModal: React.FC<LogFoodModalProps> = ({
  onClose,
  onSelectOption,
}) => {
  const options = [
    {
      id: 'photo' as const,
      label: 'Scan or photograph',
      description: 'Scan product barcodes or take a photo of your meal',
      icon: Camera,
    },
    {
      id: 'voice' as const,
      label: 'Describe your meal',
      description: 'Describe naturally, e.g. "Avocado + 3 eggs, dukkah and toast"',
      icon: Mic,
    },
    {
      id: 'search' as const,
      label: 'Search foods',
      description: 'Search branded and common foods',
      icon: Search,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between sm:max-w-md sm:mx-auto"
    >
      {/* Top Bar with X */}
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#12141A] border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </motion.button>
        <div className="w-10" />
      </div>

      {/* Main Title & Subtitle */}
      <div className="px-6 text-center space-y-1.5 mb-2">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Log Food
        </h2>
        <p className="text-xs text-zinc-400 font-normal">
          Choose how you'd like to add your food.
        </p>
      </div>

      {/* Options Stack */}
      <div className="px-5 py-4 flex-1 space-y-3.5 overflow-y-auto">
        {options.map((option, idx) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectOption(option.id)}
              className="w-full bg-[#0A0C10] border border-[#1A1D26] hover:border-[#00D084]/40 p-4 rounded-2xl flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-[#0E1513] border border-[#00D084]/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#00D084]" />
                </div>
                <div className="text-left">
                  <span className="text-base font-bold text-white block">
                    {option.label}
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                    {option.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#00D084] shrink-0" />
            </motion.button>
          );
        })}

        {/* Bottom 2 Grid Cards */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectOption('search')}
            className="p-4 bg-[#0A0C10] border border-[#1A1D26] hover:border-[#00D084]/30 rounded-2xl flex items-center justify-between text-xs font-bold text-white transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <Clock className="w-4 h-4 text-[#00D084]" />
              <span>Recent Foods</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#00D084]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectOption('search')}
            className="p-4 bg-[#0A0C10] border border-[#1A1D26] hover:border-[#00D084]/30 rounded-2xl flex items-center justify-between text-xs font-bold text-white transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <Star className="w-4 h-4 text-[#00D084]" />
              <span>Favourites</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#00D084]" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
