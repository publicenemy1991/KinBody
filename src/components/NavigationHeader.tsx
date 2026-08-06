import React from 'react';
import { Bell, User } from 'lucide-react';
import { UserProfile } from '../types';
import { KinbodyLogo } from './KinbodyLogo';

interface NavigationHeaderProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  userProfile,
  onOpenProfile,
}) => {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3 bg-black">
      {/* Brand Logo Top Left */}
      <div className="flex items-center cursor-pointer" onClick={onOpenProfile}>
        <KinbodyLogo iconClassName="w-7 h-7" textSize="text-xl sm:text-2xl" />
      </div>

      {/* Actions Top Right */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onOpenProfile}
          aria-label="Notifications"
          className="w-10 h-10 rounded-full bg-[#14161C] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={onOpenProfile}
          aria-label="User Profile"
          className="w-10 h-10 rounded-full bg-[#14161C] border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          title={userProfile.name || 'Profile'}
        >
          <User className="w-4.5 h-4.5 text-emerald-400" />
        </button>
      </div>
    </header>
  );
};
