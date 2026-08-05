import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Activity, Scale, TrendingUp, User } from 'lucide-react';
import { PrimaryTab } from '../types';

interface BottomNavBarProps {
  activeTab: PrimaryTab;
  onTabChange: (tab: PrimaryTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'log' as PrimaryTab, label: 'Log', icon: Utensils },
    { id: 'activity' as PrimaryTab, label: 'Activity', icon: Activity },
    { id: 'body' as PrimaryTab, label: 'Body', icon: Scale },
    { id: 'progress' as PrimaryTab, label: 'Progress', icon: TrendingUp },
    { id: 'profile' as PrimaryTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 max-w-xl mx-auto">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.92 }}
              className={`relative flex flex-col items-center py-1.5 px-2.5 rounded-2xl transition-colors duration-200 ${
                isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl shadow-lg shadow-emerald-500/10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#00D084]' : 'text-zinc-500'}`} />
                </motion.div>
                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-[#00D084] font-semibold' : 'text-zinc-500 font-normal'}`}>
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};


