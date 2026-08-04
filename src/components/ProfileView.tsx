import React, { useState } from 'react';
import {
  User as UserIcon,
  Target,
  ChevronRight,
  Settings,
  Edit2,
  LogOut,
  ShieldCheck,
  Ruler,
  Check,
  Trash2,
  UserX,
  Mail,
} from 'lucide-react';
import { UserProfile, UnitSystem } from '../types';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { User } from 'firebase/auth';

interface ProfileViewProps {
  authUser: User;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onSignOut: () => void;
  onDeleteLoggedData: () => void;
  onDeleteAccount: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  authUser,
  userProfile,
  onUpdateProfile,
  onSignOut,
  onDeleteLoggedData,
  onDeleteAccount,
}) => {
  const [editingTargets, setEditingTargets] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const isImperial = userProfile.unitSystem === 'imperial';
  const displayWeight = userProfile.weightKg > 0
    ? isImperial
      ? `${Math.round(userProfile.weightKg * 2.20462)} lbs`
      : `${userProfile.weightKg} kg`
    : 'Not logged';

  const [calInput, setCalInput] = useState(userProfile.calorieTarget.toString());
  const [proInput, setProInput] = useState(userProfile.proteinTargetG.toString());
  const [weightInput, setWeightInput] = useState(
    userProfile.weightKg > 0
      ? isImperial
        ? Math.round(userProfile.weightKg * 2.20462).toString()
        : userProfile.weightKg.toString()
      : ''
  );

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(calInput, 10);
    const p = parseInt(proInput, 10);
    const rawWeight = parseFloat(weightInput);

    const weightInKg = !isNaN(rawWeight) && rawWeight > 0
      ? (isImperial ? rawWeight / 2.20462 : rawWeight)
      : userProfile.weightKg;

    if (!isNaN(c) && !isNaN(p) && c > 500 && p > 30) {
      onUpdateProfile({
        ...userProfile,
        calorieTarget: c,
        proteinTargetG: p,
        weightKg: Math.round(weightInKg * 10) / 10,
      });
      setEditingTargets(false);
    }
  };

  const handleUnitChange = (unit: UnitSystem) => {
    onUpdateProfile({
      ...userProfile,
      unitSystem: unit,
    });
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Account Info Header */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-600/20 shrink-0">
            {authUser.displayName ? authUser.displayName[0].toUpperCase() : authUser.email ? authUser.email[0].toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white tracking-tight truncate">
              {authUser.displayName || userProfile.name || 'Authenticated User'}
            </h1>
            <div className="flex items-center space-x-1.5 text-xs text-zinc-400 mt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{authUser.email || 'No email provided'}</span>
            </div>
            {userProfile.weightKg > 0 && (
              <span className="inline-block mt-2 text-xs font-bold px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-md">
                {displayWeight}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full py-3 bg-[#181A20] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4 text-zinc-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Target & Personal Goals Card */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Targets & Metrics</h2>
          </div>
          <button
            onClick={() => setEditingTargets(!editingTargets)}
            className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>{editingTargets ? 'Cancel' : 'Edit Targets'}</span>
          </button>
        </div>

        {editingTargets ? (
          <form onSubmit={handleSaveTargets} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  value={calInput}
                  onChange={(e) => setCalInput(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Protein Target (g)
                </label>
                <input
                  type="number"
                  value={proInput}
                  onChange={(e) => setProInput(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold block mb-1">
                Current Weight ({isImperial ? 'lbs' : 'kg'})
              </label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="e.g. 75"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 text-black font-extrabold rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Save Targets
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-semibold text-zinc-400 block">Energy</span>
              <span className="text-lg font-black text-white">
                {userProfile.calorieTarget}{' '}
                <span className="text-[10px] font-normal text-zinc-500">kcal</span>
              </span>
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-semibold text-zinc-400 block">Protein</span>
              <span className="text-lg font-black text-emerald-400">
                {userProfile.proteinTargetG}{' '}
                <span className="text-[10px] font-normal text-zinc-500">g</span>
              </span>
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5">
              <span className="text-[11px] font-semibold text-zinc-400 block">Weight</span>
              <span className="text-lg font-black text-white">
                {displayWeight}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preferences & Settings */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-5 shadow-md">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Settings className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-white">Preferences</h2>
        </div>

        {/* Unit System Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <span>Unit System</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'metric', label: 'Metric (kg, cm)', detail: 'Kilograms & centimeters' },
              { id: 'imperial', label: 'Imperial (lbs, in)', detail: 'Pounds & inches' },
            ].map((unit) => {
              const isSelected = (userProfile.unitSystem || 'metric') === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitChange(unit.id as UnitSystem)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-400 shadow-md'
                      : 'bg-[#0D0E12] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{unit.label}</span>
                    <span className="text-[10px] text-zinc-400 block">{unit.detail}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy and Data Management */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Privacy and Data</h2>
        </div>

        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center justify-between transition-colors text-zinc-300 hover:text-white"
        >
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-white block">
                Privacy Policy
              </span>
              <span className="text-[10px] text-zinc-400">
                View data security details and encrypted storage principles
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to delete all your logged food entries, body scans, weight records, and activity logs? Your account and profile settings will remain intact.'
              )
            ) {
              onDeleteLoggedData();
            }
          }}
          className="w-full p-3 rounded-xl hover:bg-red-500/10 flex items-center justify-between transition-colors text-red-400 hover:text-red-300"
        >
          <div className="flex items-center space-x-3">
            <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-red-300 block">
                Delete My Logged Data
              </span>
              <span className="text-[10px] text-red-400/80">
                Permanently deletes all food, scan, weight, and activity logs
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/50" />
        </button>

        <button
          onClick={() => {
            if (
              window.confirm(
                'Are you sure you want to permanently DELETE YOUR ACCOUNT and all associated data? This action cannot be undone.'
              )
            ) {
              onDeleteAccount();
            }
          }}
          className="w-full p-3 rounded-xl hover:bg-red-500/10 flex items-center justify-between transition-colors text-red-400 hover:text-red-300"
        >
          <div className="flex items-center space-x-3">
            <UserX className="w-4 h-4 text-red-500 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-red-300 block">
                Delete Account
              </span>
              <span className="text-[10px] text-red-400/80">
                Permanently deletes your account profile and all stored records
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/50" />
        </button>
      </div>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
};
