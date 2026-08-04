import React from 'react';
import { motion } from 'motion/react';
import {
  X,
  Camera,
  Barcode,
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
      label: 'Camera Scanner',
      description: 'Scan product barcodes or photo meal estimations',
      icon: Camera,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'voice' as const,
      label: 'Describe Meal',
      description: 'Describe naturally e.g. "Avocado + 3 eggs dukkah and toast"',
      icon: Mic,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'search' as const,
      label: 'Search Food Database',
      description: 'Search branded and common foods',
      icon: Search,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto"
    >
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </motion.button>
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Fast Food Logging
        </span>
        <div className="w-10" />
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          How would you like to log food?
        </h2>
      </div>

      {/* Options List */}
      <div className="px-6 py-4 flex-1 space-y-3.5 overflow-y-auto">
        {options.map((option, idx) => {
          const Icon = option.icon;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.015, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectOption(option.id)}
              className="w-full bg-[#181A20] border border-white/10 hover:border-white/20 p-4 rounded-2xl flex items-center justify-between transition-colors group hover:bg-white/[0.02]"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center ${option.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-base font-semibold text-white">
                    {option.label}
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </motion.button>
          );
        })}

        {/* Quick Recent & Favourite Foods trigger */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectOption('search')}
            className="p-3.5 bg-[#181A20] border border-white/10 rounded-xl flex items-center space-x-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.02]"
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Foods</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectOption('search')}
            className="p-3.5 bg-[#181A20] border border-white/10 rounded-xl flex items-center space-x-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.02]"
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Favourites</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

