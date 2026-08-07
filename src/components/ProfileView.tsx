import React, { useState, useRef } from 'react';
import {
  Bell,
  Upload,
  Download,
  User,
  Target,
  Ruler,
  Palette,
  ChevronRight,
  ShieldCheck,
  Trash2,
  Check,
  Edit2,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, UserGoal, UnitSystem, LoggedFoodEntry, WeightEntry, BodyScanEntry, ActivityLogEntry } from '../types';
import { KinCompanion } from './KinCompanion';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { localStorageRepository } from '../data/localStorageRepository';
import { calculateTargets } from '../lib/macroCalculator';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetOnboarding: () => void;
  onDeleteLoggedData: () => void;
  onResetAllData: () => void;
  onReloadAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onResetOnboarding,
  onDeleteLoggedData,
  onResetAllData,
  onReloadAllData,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [activeSettingsModal, setActiveSettingsModal] = useState<
    'personal' | 'targets' | 'units' | null
  >(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [confirmModalType, setConfirmModalType] = useState<
    'onboarding' | 'clearHistory' | 'resetAll' | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State for editing Targets
  const isImperial = userProfile.unitSystem === 'imperial';
  const [nameInput, setNameInput] = useState(userProfile.name || '');
  const [ageInput, setAgeInput] = useState((userProfile.age || 28).toString());
  const [goalInput, setGoalInput] = useState<UserGoal>(userProfile.goal || 'lose_fat');
  const [calInput, setCalInput] = useState(userProfile.calorieTarget.toString());
  const [proInput, setProInput] = useState(userProfile.proteinTargetG.toString());
  const [weightInput, setWeightInput] = useState(
    userProfile.weightKg > 0
      ? isImperial
        ? Math.round(userProfile.weightKg * 2.20462).toString()
        : userProfile.weightKg.toString()
      : ''
  );

  const handleGoalChange = (newGoal: UserGoal) => {
    setGoalInput(newGoal);
    const age = parseInt(ageInput) || userProfile.age || 28;
    const rawW = parseFloat(weightInput);
    const wKg = !isNaN(rawW) && rawW > 0
      ? isImperial ? rawW / 2.20462 : rawW
      : userProfile.weightKg || 75;

    const calc = calculateTargets({
      weightKg: wKg,
      heightCm: userProfile.heightCm || 175,
      age,
      sex: userProfile.sex === 'female' ? 'female' : 'male',
      goal: newGoal,
    });

    setCalInput(calc.calorieTarget.toString());
    setProInput(calc.proteinTargetG.toString());
  };

  // Export Data as JSON file
  const handleExportData = () => {
    try {
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        profile: userProfile,
        foodEntries: localStorageRepository.getFoodEntries(),
        weightEntries: localStorageRepository.getWeightEntries(),
        bodyScanEntries: localStorageRepository.getBodyScans(),
        activityLogs: localStorageRepository.getActivities(),
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const todayStr = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `kinbody_backup_${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotificationStatus('Export successful! Download started.');
      setTimeout(() => setNotificationStatus(null), 3500);
    } catch (err) {
      console.error('Export error:', err);
      setNotificationStatus('Failed to export data.');
    }
  };

  // Import Data from JSON file
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.profile) {
          localStorageRepository.saveProfile(parsed.profile);
        }
        if (Array.isArray(parsed.foodEntries)) {
          localStorage.setItem('kinbody_food_entries_v1', JSON.stringify(parsed.foodEntries));
        }
        if (Array.isArray(parsed.weightEntries)) {
          localStorage.setItem('kinbody_weight_entries_v1', JSON.stringify(parsed.weightEntries));
        }
        if (Array.isArray(parsed.bodyScanEntries)) {
          localStorage.setItem('kinbody_bodyscans_v1', JSON.stringify(parsed.bodyScanEntries));
        }
        if (Array.isArray(parsed.activityLogs)) {
          localStorage.setItem('kinbody_activities_v1', JSON.stringify(parsed.activityLogs));
        }

        onReloadAllData();
        setNotificationStatus('Data imported successfully!');
        setTimeout(() => setNotificationStatus(null), 3500);
      } catch (err) {
        console.error('Import error:', err);
        setNotificationStatus('Invalid JSON backup file.');
        setTimeout(() => setNotificationStatus(null), 3500);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfileSettings = () => {
    const age = parseInt(ageInput) || userProfile.age || 28;
    const c = parseInt(calInput) || userProfile.calorieTarget || 2000;
    const p = parseInt(proInput) || userProfile.proteinTargetG || 150;
    const rawW = parseFloat(weightInput);

    const wKg = !isNaN(rawW) && rawW > 0
      ? isImperial ? rawW / 2.20462 : rawW
      : userProfile.weightKg;

    const calc = calculateTargets({
      weightKg: wKg > 0 ? wKg : 75,
      heightCm: userProfile.heightCm || 175,
      age,
      sex: userProfile.sex === 'female' ? 'female' : 'male',
      goal: goalInput,
    });

    onUpdateProfile({
      ...userProfile,
      name: nameInput.trim() || userProfile.name,
      age,
      goal: goalInput,
      calorieTarget: c,
      proteinTargetG: p,
      carbsTargetG: calc.carbsTargetG,
      fatTargetG: calc.fatTargetG,
      weightKg: Math.round(wKg * 10) / 10,
    });

    setActiveSettingsModal(null);
    setNotificationStatus('Settings & Targets updated.');
    setTimeout(() => setNotificationStatus(null), 3000);
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-28 text-white select-none">
      {/* Top Profile Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-black tracking-tight text-white">Profile</h1>
        <button
          onClick={() => {
            setNotificationStatus('Notifications are quiet and non-intrusive.');
            setTimeout(() => setNotificationStatus(null), 3000);
          }}
          className="w-10 h-10 rounded-full bg-[#14161C] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
        >
          <Bell className="w-4.5 h-4.5" />
        </button>
      </div>

      {notificationStatus && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-300 text-center">
          {notificationStatus}
        </div>
      )}

      {/* ACCOUNT SECTION - Exact to Screen 4 */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase px-1">
          Account
        </span>
        <div className="bg-[#12141A] border border-white/10 rounded-3xl p-5 flex items-center space-x-4">
          <div className="shrink-0">
            <KinCompanion size="sm" showBubble={false} />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              You're using Kinbody locally
            </h2>
            <p className="text-xs text-zinc-400 leading-snug">
              Your data is stored on this device. You can export or import your data anytime.
            </p>
          </div>
        </div>
      </div>

      {/* DATA SECTION - Exact to Screen 4 */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase px-1">
          Data
        </span>
        <div className="bg-[#12141A] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden">
          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Export Data</span>
                <span className="text-xs text-zinc-400">
                  Download a JSON file of your Kinbody data.
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Import Data Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Import Data</span>
                <span className="text-xs text-zinc-400">
                  Import a previously exported JSON file.
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* SETTINGS SECTION - Exact to Screen 4 */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase px-1">
          Settings
        </span>
        <div className="bg-[#12141A] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden">
          {/* Personal Information */}
          <button
            onClick={() => setActiveSettingsModal(activeSettingsModal === 'personal' ? null : 'personal')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <User className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-white">Personal Information</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-zinc-600 transition-transform ${
                activeSettingsModal === 'personal' ? 'rotate-90' : ''
              }`}
            />
          </button>

          {activeSettingsModal === 'personal' && (
            <div className="p-4 space-y-3 bg-black/40">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-[#14161C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Age</label>
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  className="w-full bg-[#14161C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={handleSaveProfileSettings}
                className="w-full py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded-xl hover:bg-emerald-400 transition-colors"
              >
                Save Personal Info
              </button>
            </div>
          )}

          {/* Goals & Targets */}
          <button
            onClick={() => setActiveSettingsModal(activeSettingsModal === 'targets' ? null : 'targets')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-white">Goals & Targets</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-zinc-600 transition-transform ${
                activeSettingsModal === 'targets' ? 'rotate-90' : ''
              }`}
            />
          </button>

          {activeSettingsModal === 'targets' && (
            <div className="p-4 space-y-4 bg-black/40">
              <div>
                <label className="text-xs text-zinc-400 block mb-2 font-semibold">Primary Goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'lose_fat', label: 'Lose Fat', desc: '18% Calorie Deficit' },
                    { id: 'build_muscle', label: 'Build Muscle', desc: '10% Calorie Surplus' },
                    { id: 'maintain', label: 'Maintain', desc: 'TDEE Maintenance' },
                    { id: 'body_recomposition', label: 'Performance', desc: 'Slight 10% Deficit' },
                  ].map((g) => {
                    const isSel = goalInput === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGoalChange(g.id as UserGoal)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSel
                            ? 'bg-emerald-500/15 border-emerald-400 text-white'
                            : 'bg-[#14161C] border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold block text-white">{g.label}</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">{g.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Current Weight ({isImperial ? 'lbs' : 'kg'})</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-[#14161C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Daily Calories</label>
                  <input
                    type="number"
                    value={calInput}
                    onChange={(e) => setCalInput(e.target.value)}
                    className="w-full bg-[#14161C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-semibold">Daily Protein (g)</label>
                  <input
                    type="number"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    className="w-full bg-[#14161C] border border-white/10 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleGoalChange(goalInput)}
                  className="flex-1 py-2 bg-white/5 border border-white/10 text-zinc-300 font-semibold text-xs rounded-xl hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Calculate Targets</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfileSettings}
                  className="flex-1 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Save Targets
                </button>
              </div>
            </div>
          )}

          {/* Units */}
          <button
            onClick={() => setActiveSettingsModal(activeSettingsModal === 'units' ? null : 'units')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <Ruler className="w-5 h-5 text-zinc-400" />
              <div className="flex-1">
                <span className="text-sm font-bold text-white block">Units</span>
                <span className="text-[11px] text-zinc-500 capitalize">
                  {userProfile.unitSystem || 'metric'}
                </span>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-zinc-600 transition-transform ${
                activeSettingsModal === 'units' ? 'rotate-90' : ''
              }`}
            />
          </button>

          {activeSettingsModal === 'units' && (
            <div className="p-4 space-y-2 bg-black/40 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUpdateProfile({ ...userProfile, unitSystem: 'metric' });
                  setActiveSettingsModal(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  !isImperial
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-[#14161C] border-white/10 text-zinc-400'
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => {
                  onUpdateProfile({ ...userProfile, unitSystem: 'imperial' });
                  setActiveSettingsModal(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  isImperial
                    ? 'bg-emerald-500 text-black border-emerald-400'
                    : 'bg-[#14161C] border-white/10 text-zinc-400'
                }`}
              >
                Imperial (lbs, in)
              </button>
            </div>
          )}

          {/* Appearance */}
          <button
            onClick={() => {
              setNotificationStatus('Kinbody is crafted exclusively in Premium Darkness.');
              setTimeout(() => setNotificationStatus(null), 3000);
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <Palette className="w-5 h-5 text-zinc-400" />
              <div>
                <span className="text-sm font-bold text-white block">Appearance</span>
                <span className="text-[11px] text-zinc-500">Premium Darkness</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              setNotificationStatus('Quiet notifications active.');
              setTimeout(() => setNotificationStatus(null), 3000);
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-bold text-white">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>

          {/* Restart Onboarding */}
          <button
            onClick={() => setConfirmModalType('onboarding')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center space-x-3.5">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-sm font-bold text-white block">Reset & Restart Onboarding</span>
                <span className="text-[11px] text-zinc-400">Re-run setup wizard for name, physical metrics & goals</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* PRIVACY & DATA RESET */}
      <div className="pt-2 space-y-3">
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="w-full p-3.5 rounded-2xl bg-[#12141A] border border-white/10 flex items-center justify-between text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Privacy Policy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => setConfirmModalType('clearHistory')}
          className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Trash2 className="w-4 h-4 text-zinc-400" />
            <span>Clear Logged History Only</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => setConfirmModalType('resetAll')}
          className="w-full p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-red-400" />
            <span>Delete All Data & Reset App</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/50" />
        </button>
      </div>

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Confirmation Modal */}
      {confirmModalType && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 z-50 animate-fade-in">
          <div className="bg-[#12141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmModalType === 'resetAll'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : confirmModalType === 'onboarding'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-white/10'
                }`}
              >
                {confirmModalType === 'resetAll' && <RefreshCw className="w-5 h-5" />}
                {confirmModalType === 'onboarding' && <RotateCcw className="w-5 h-5" />}
                {confirmModalType === 'clearHistory' && <Trash2 className="w-5 h-5" />}
              </div>
              <h3 className="text-base font-extrabold text-white">
                {confirmModalType === 'resetAll' && 'Delete All Data & Reset?'}
                {confirmModalType === 'onboarding' && 'Restart Onboarding?'}
                {confirmModalType === 'clearHistory' && 'Clear History Only?'}
              </h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {confirmModalType === 'resetAll' &&
                'This will permanently delete all logged food, body scans, weight logs, and profile settings, returning you to the initial onboarding screen.'}
              {confirmModalType === 'onboarding' &&
                'This will re-launch the setup wizard so you can adjust your metrics and recalculate your daily calorie & protein goals.'}
              {confirmModalType === 'clearHistory' &&
                'This will wipe all logged food, weight entries, scans, and activity logs while preserving your profile settings.'}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmModalType(null)}
                className="flex-1 py-3 bg-[#1A1D24] hover:bg-[#222630] border border-white/10 rounded-2xl text-xs font-extrabold text-zinc-300 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const type = confirmModalType;
                  setConfirmModalType(null);
                  if (type === 'onboarding') {
                    onResetOnboarding();
                  } else if (type === 'clearHistory') {
                    onDeleteLoggedData();
                    setNotificationStatus('Logged food & activity history cleared.');
                    setTimeout(() => setNotificationStatus(null), 3000);
                  } else if (type === 'resetAll') {
                    onResetAllData();
                  }
                }}
                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-colors ${
                  confirmModalType === 'resetAll'
                    ? 'bg-red-500 hover:bg-red-400 text-black'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                }`}
              >
                {confirmModalType === 'resetAll'
                  ? 'Reset Everything'
                  : confirmModalType === 'onboarding'
                  ? 'Start Wizard'
                  : 'Clear History'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
