import React from 'react';
import { Bell, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationHeaderProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenSignIn: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  userProfile,
  onOpenProfile,
  onOpenSignIn,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  const isLoggedIn = Boolean(userProfile.onboardingCompleted && userProfile.name);
  const initial = userProfile.name ? userProfile.name[0].toUpperCase() : 'U';

  return (
    <header className="flex items-center justify-between px-6 pt-7 pb-4">
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onOpenProfile}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:scale-105 transition-transform shrink-0"
          title="View Profile"
        >
          {initial}
        </button>
        <div>
          <p className="text-zinc-400 text-xs font-medium tracking-wide uppercase">
            {getGreeting()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {userProfile.name || 'Friend'}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {isLoggedIn ? (
          <button
            onClick={onOpenProfile}
            className="px-4 py-2.5 rounded-2xl bg-[#121212] border border-emerald-500/30 flex items-center space-x-2 text-xs font-bold text-white hover:bg-emerald-500/10 transition-all shadow-sm"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Profile</span>
          </button>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold flex items-center space-x-2 text-xs transition-all shadow-md shadow-emerald-600/20"
          >
            <User className="w-4 h-4 text-black" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={onOpenProfile}
          aria-label="Notifications"
          className="w-10 h-10 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};

