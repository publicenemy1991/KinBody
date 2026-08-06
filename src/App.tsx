/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { profileRepository } from './data/profileRepository';
import { foodRepository } from './data/foodRepository';
import { activityRepository } from './data/activityRepository';
import { bodyRepository } from './data/bodyRepository';
import { localStorageRepository } from './data/localStorageRepository';
import {
  PrimaryTab,
  UserProfile,
  LoggedFoodEntry,
  FoodItem,
  MealType,
  WeightEntry,
  BodyScanEntry,
  ActivityLogEntry,
} from './types';
import { INITIAL_USER_PROFILE } from './data/mockData';
import { getTodayString } from './utils/dateUtils';
import { NavigationHeader } from './components/NavigationHeader';
import { BottomNavBar } from './components/BottomNavBar';
import { FoodHomeView } from './components/FoodHomeView';
import { ActivityView } from './components/ActivityView';
import { BodyView } from './components/BodyView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { EvoltUploadModal } from './components/EvoltUploadModal';
import { LogFoodModal } from './components/LogFoodModal';
import { ScannerModal } from './components/ScannerModal';
import { VoiceLogModal } from './components/VoiceLogModal';
import { FoodSearchModal } from './components/FoodSearchModal';
import { FoodDetailView } from './components/FoodDetailView';
import { LoggedFoodDetailModal } from './components/LoggedFoodDetailModal';
import { NutrientDetailModal } from './components/NutrientDetailModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { KinbodyLogo } from './components/KinbodyLogo';
import { KinbodyBioTopology } from './components/KinbodyBioTopology';

export default function App() {
  const todayStr = getTodayString();

  // Profile & Local Data Collections
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [loggedEntries, setLoggedEntries] = useState<LoggedFoodEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [bodyScanEntries, setBodyScanEntries] = useState<BodyScanEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<PrimaryTab>('log');
  const [selectedLogDate, setSelectedLogDate] = useState<string>(todayStr);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEvoltUploadModal, setShowEvoltUploadModal] = useState(false);
  const [activeLoggingMode, setActiveLoggingMode] = useState<
    null | 'barcode' | 'photo' | 'voice' | 'search'
  >(null);

  const [selectedFoodForReview, setSelectedFoodForReview] = useState<FoodItem | null>(null);
  const [selectedLoggedEntry, setSelectedLoggedEntry] = useState<LoggedFoodEntry | null>(null);
  const [selectedNutrientDetailKey, setSelectedNutrientDetailKey] = useState<string | null>(null);

  // Load all user data from local storage
  const reloadAllData = useCallback(async () => {
    // Load Profile
    const profile = await profileRepository.getProfile();
    if (profile) {
      setUserProfile(profile);
    } else {
      setUserProfile(INITIAL_USER_PROFILE);
    }

    // Load Food Entries
    const foods = await foodRepository.getFoodEntries();
    setLoggedEntries(foods);

    // Load Activities
    const activities = await activityRepository.getActivities();
    setActivityLogs(activities);

    // Load Weight Entries
    const weights = await bodyRepository.getWeightEntries();
    setWeightEntries(weights);

    // Load Body Scans
    const scans = await bodyRepository.getBodyScans();
    setBodyScanEntries(scans);

    setIsInitializing(false);
  }, []);

  useEffect(() => {
    reloadAllData();
  }, [reloadAllData]);

  // Handler: Save Step Progress during Onboarding Wizard
  const handleSaveStepProfile = async (partialProfile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...partialProfile };
    setUserProfile(updated);
    await profileRepository.saveProfile(updated);
  };

  // Handler: Complete Onboarding
  const handleCompleteOnboarding = async (finalProfile: UserProfile) => {
    const completedProfile = { ...finalProfile, onboardingCompleted: true };
    setUserProfile(completedProfile);
    await profileRepository.saveProfile(completedProfile);
    setActiveTab('log');
  };

  // Food Handlers
  const handleAddFoodEntry = async (
    foodItem: FoodItem,
    servings: number,
    mealType: MealType
  ) => {
    const newEntry: LoggedFoodEntry = {
      id: `entry_${Date.now()}`,
      mealType,
      foodItem,
      servings,
      loggedAt: new Date().toISOString(),
      date: selectedLogDate || todayStr,
    };

    setLoggedEntries((prev) => [newEntry, ...prev]);
    setSelectedFoodForReview(null);
    setActiveLoggingMode(null);
    setShowLogModal(false);

    await foodRepository.saveFoodEntry(newEntry);
  };

  const handleVoiceItemsParsed = async (items: FoodItem[], mealType: MealType) => {
    const newEntries: LoggedFoodEntry[] = items.map((it, idx) => ({
      id: `entry_v_${Date.now()}_${idx}`,
      mealType,
      foodItem: it,
      servings: 1,
      loggedAt: new Date().toISOString(),
      date: selectedLogDate || todayStr,
    }));

    setLoggedEntries((prev) => [...newEntries, ...prev]);
    setActiveLoggingMode(null);
    setShowLogModal(false);

    for (const entry of newEntries) {
      await foodRepository.saveFoodEntry(entry);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setLoggedEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedLoggedEntry?.id === id) {
      setSelectedLoggedEntry(null);
    }
    await foodRepository.deleteFoodEntry(id);
  };

  const handleUpdateEntryServings = async (id: string, newServings: number) => {
    const existing = loggedEntries.find((e) => e.id === id);
    if (!existing) return;

    const updated = { ...existing, servings: newServings };
    setLoggedEntries((prev) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
    if (selectedLoggedEntry?.id === id) {
      setSelectedLoggedEntry(updated);
    }
    await foodRepository.saveFoodEntry(updated);
  };

  const handleUpdateEntryMealType = async (id: string, newMealType: MealType) => {
    const existing = loggedEntries.find((e) => e.id === id);
    if (!existing) return;

    const updated = { ...existing, mealType: newMealType };
    setLoggedEntries((prev) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
    if (selectedLoggedEntry?.id === id) {
      setSelectedLoggedEntry(updated);
    }
    await foodRepository.saveFoodEntry(updated);
  };

  // Activity Handlers
  const handleAddActivity = async (entryData: Omit<ActivityLogEntry, 'id' | 'loggedAt'>) => {
    const newEntry: ActivityLogEntry = {
      ...entryData,
      id: `act_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newEntry, ...prev]);
    await activityRepository.saveActivity(newEntry);
  };

  const handleUpdateActivity = async (id: string, updatedPartial: Partial<ActivityLogEntry>) => {
    const existing = activityLogs.find((a) => a.id === id);
    if (!existing) return;

    const updated = { ...existing, ...updatedPartial };
    setActivityLogs((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    await activityRepository.saveActivity(updated);
  };

  const handleDeleteActivity = async (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    await activityRepository.deleteActivity(id);
  };

  const activityCaloriesToday = activityLogs
    .filter((a) => a.date === selectedLogDate && a.isConfirmed)
    .reduce((sum, a) => sum + (a.activeCalories || 0), 0);

  // Weight & Body Scan Handlers
  const handleAddWeight = async (weightKg: number, note?: string, date?: string) => {
    const entryDate = date || selectedLogDate || todayStr;
    const newWeight: WeightEntry = {
      id: `wt_${Date.now()}`,
      date: entryDate,
      weightKg,
      note: note || 'Scale weigh-in',
    };
    setWeightEntries((prev) => [
      newWeight,
      ...prev.filter((w) => w.date !== entryDate),
    ]);

    const updatedProfile = { ...userProfile, weightKg };
    setUserProfile(updatedProfile);

    await bodyRepository.saveWeightEntry(newWeight);
    await profileRepository.saveProfile(updatedProfile);
  };

  const handleEditWeight = async (id: string, weightKg: number) => {
    const existing = weightEntries.find((w) => w.id === id);
    if (!existing) return;

    const updated = { ...existing, weightKg };
    setWeightEntries((prev) =>
      prev.map((w) => (w.id === id ? updated : w))
    );
    const updatedProfile = { ...userProfile, weightKg };
    setUserProfile(updatedProfile);

    await bodyRepository.saveWeightEntry(updated);
    await profileRepository.saveProfile(updatedProfile);
  };

  const handleDeleteWeight = async (id: string) => {
    setWeightEntries((prev) => prev.filter((w) => w.id !== id));
    await bodyRepository.deleteWeightEntry(id);
  };

  const handleSaveEvoltScan = async (scanData: Omit<BodyScanEntry, 'id' | 'loggedAt'>) => {
    const newScan: BodyScanEntry = {
      ...scanData,
      id: `bs_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };

    setBodyScanEntries((prev) => [newScan, ...prev]);
    await bodyRepository.saveBodyScan(newScan);

    const updatedProfile = {
      ...userProfile,
      weightKg: scanData.weightKg ?? userProfile.weightKg,
      bodyFatPercent: scanData.bodyFatPercent ?? userProfile.bodyFatPercent,
      muscleMassKg: scanData.skeletalMuscleKg ?? userProfile.muscleMassKg,
      skeletalMuscleKg: scanData.skeletalMuscleKg ?? userProfile.skeletalMuscleKg,
      leanMassKg: scanData.leanMassKg ?? userProfile.leanMassKg,
      fatMassKg: scanData.fatMassKg ?? userProfile.fatMassKg,
      visceralFatRating: scanData.visceralFatRating ?? userProfile.visceralFatRating,
    };
    setUserProfile(updatedProfile);
    await profileRepository.saveProfile(updatedProfile);

    if (scanData.weightKg) {
      const linkedWeight: WeightEntry = {
        id: `wt_${Date.now()}`,
        date: scanData.date,
        weightKg: scanData.weightKg,
        note: 'From Evolt 360 scan',
      };
      setWeightEntries((prev) => [
        linkedWeight,
        ...prev.filter((w) => w.date !== scanData.date),
      ]);
      await bodyRepository.saveWeightEntry(linkedWeight);
    }
  };

  const handleEditScan = async (updatedScan: BodyScanEntry) => {
    setBodyScanEntries((prev) =>
      prev.map((s) => (s.id === updatedScan.id ? updatedScan : s))
    );
    await bodyRepository.saveBodyScan(updatedScan);

    if (updatedScan.weightKg) {
      const updatedProfile = {
        ...userProfile,
        weightKg: updatedScan.weightKg ?? userProfile.weightKg,
        bodyFatPercent: updatedScan.bodyFatPercent ?? userProfile.bodyFatPercent,
        muscleMassKg: updatedScan.skeletalMuscleKg ?? userProfile.muscleMassKg,
        skeletalMuscleKg: updatedScan.skeletalMuscleKg ?? userProfile.skeletalMuscleKg,
        leanMassKg: updatedScan.leanMassKg ?? userProfile.leanMassKg,
        fatMassKg: updatedScan.fatMassKg ?? userProfile.fatMassKg,
        visceralFatRating: updatedScan.visceralFatRating ?? userProfile.visceralFatRating,
      };
      setUserProfile(updatedProfile);
      await profileRepository.saveProfile(updatedProfile);
    }
  };

  const handleDeleteScan = async (id: string) => {
    setBodyScanEntries((prev) => prev.filter((s) => s.id !== id));
    await bodyRepository.deleteBodyScan(id);
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    const completedProfile = { ...updated, onboardingCompleted: true };
    setUserProfile(completedProfile);
    await profileRepository.saveProfile(completedProfile);

    if (updated.weightKg) {
      const entryDate = selectedLogDate || todayStr;
      const weightEntry: WeightEntry = {
        id: `wt_${Date.now()}`,
        date: entryDate,
        weightKg: updated.weightKg,
        note: 'Updated from Profile',
      };
      setWeightEntries((prev) => [
        weightEntry,
        ...prev.filter((w) => w.date !== entryDate),
      ]);
      await bodyRepository.saveWeightEntry(weightEntry);
    }
  };

  const handleDeleteLoggedData = async () => {
    localStorageRepository.saveFoodEntries([]);
    localStorageRepository.saveWeightEntries([]);
    localStorageRepository.saveBodyScans([]);
    localStorageRepository.saveActivities([]);
    setLoggedEntries([]);
    setWeightEntries([]);
    setBodyScanEntries([]);
    setActivityLogs([]);
  };

  const handleResetOnboarding = async () => {
    const updated: UserProfile = {
      ...userProfile,
      onboardingCompleted: false,
      onboardingStep: 0,
    };
    setUserProfile(updated);
    await profileRepository.saveProfile(updated);
  };

  const handleResetAllData = async () => {
    localStorageRepository.clearAllLocalData();
    const cleanProfile: UserProfile = {
      ...INITIAL_USER_PROFILE,
      onboardingCompleted: false,
      onboardingStep: 0,
    };
    setUserProfile(cleanProfile);
    await profileRepository.saveProfile(cleanProfile);
    setLoggedEntries([]);
    setWeightEntries([]);
    setBodyScanEntries([]);
    setActivityLogs([]);
    setActiveTab('log');
  };

  // Initializing Splash Screen
  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 space-y-4">
        <KinbodyLogo className="w-12 h-12 text-emerald-400 animate-pulse" />
        <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Loading Kinbody…</p>
      </div>
    );
  }

  // Show Onboarding Wizard if Onboarding Incomplete
  if (!userProfile.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <OnboardingWizard
          key={`onboarding_wizard_${userProfile.onboardingStep || 0}_${userProfile.onboardingCompleted ? '1' : '0'}`}
          initialProfile={userProfile}
          onSaveStepProfile={handleSaveStepProfile}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      </div>
    );
  }

  // Main Application Dashboard
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-xl mx-auto min-h-screen bg-black flex flex-col relative border-x border-white/10 shadow-2xl overflow-x-hidden">
        {/* Bio-Organic Topographic Background Canvas */}
        <KinbodyBioTopology />

        {/* Navigation Header */}
        <NavigationHeader
          userProfile={userProfile}
          onOpenProfile={() => setActiveTab('profile')}
        />

        {/* Tab Views */}
        <main className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'log' && (
              <motion.div
                key="tab-log"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <FoodHomeView
                  userProfile={userProfile}
                  loggedEntries={loggedEntries}
                  selectedDate={selectedLogDate}
                  onDateChange={setSelectedLogDate}
                  activityCaloriesToday={activityCaloriesToday}
                  onOpenLogModal={() => setShowLogModal(true)}
                  onOpenVoiceLog={() => setActiveLoggingMode('voice')}
                  onOpenNutrientDetail={(key) => setSelectedNutrientDetailKey(key)}
                  onDeleteEntry={handleDeleteEntry}
                  onSelectEntry={(entry) => setSelectedLoggedEntry(entry)}
                  onUpdateEntryMealType={handleUpdateEntryMealType}
                />
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="tab-activity"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ActivityView
                  userProfile={userProfile}
                  activityLogs={activityLogs}
                  selectedDate={selectedLogDate}
                  onDateChange={setSelectedLogDate}
                  onAddActivity={handleAddActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onDeleteActivity={handleDeleteActivity}
                />
              </motion.div>
            )}

            {activeTab === 'body' && (
              <motion.div
                key="tab-body"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <BodyView
                  currentWeightKg={userProfile.weightKg}
                  weightHistory={weightEntries}
                  bodyScanEntries={bodyScanEntries}
                  onAddWeight={handleAddWeight}
                  onEditWeight={handleEditWeight}
                  onDeleteWeight={handleDeleteWeight}
                  onOpenUploadModal={() => setShowEvoltUploadModal(true)}
                  onEditScan={handleEditScan}
                  onDeleteScan={handleDeleteScan}
                />
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div
                key="tab-progress"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProgressView
                  userProfile={userProfile}
                  weightEntries={weightEntries}
                  bodyScanEntries={bodyScanEntries}
                  activityLogs={activityLogs}
                />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ProfileView
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onResetOnboarding={handleResetOnboarding}
                  onDeleteLoggedData={handleDeleteLoggedData}
                  onResetAllData={handleResetAllData}
                  onReloadAllData={reloadAllData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Evolt Upload Modal */}
        <EvoltUploadModal
          isOpen={showEvoltUploadModal}
          onClose={() => setShowEvoltUploadModal(false)}
          onSaveScan={handleSaveEvoltScan}
        />

        {/* Fast Log Food Sheet Modal */}
        {showLogModal && !activeLoggingMode && (
          <LogFoodModal
            onClose={() => setShowLogModal(false)}
            onSelectOption={(mode) => {
              if (mode === 'recent') {
                setActiveLoggingMode('search');
              } else {
                setActiveLoggingMode(mode);
              }
            }}
          />
        )}

        {/* Consolidated Smart Scanner Modal */}
        {(activeLoggingMode === 'barcode' || activeLoggingMode === 'photo') && (
          <ScannerModal
            initialSubMode={activeLoggingMode === 'barcode' ? 'barcode' : 'photo'}
            onClose={() => setActiveLoggingMode(null)}
            onProductFound={(prod) => {
              setSelectedFoodForReview(prod);
              setActiveLoggingMode(null);
            }}
          />
        )}

        {/* Voice Log Modal */}
        {activeLoggingMode === 'voice' && (
          <VoiceLogModal
            onClose={() => setActiveLoggingMode(null)}
            onItemsParsed={handleVoiceItemsParsed}
          />
        )}

        {/* Search Modal */}
        {activeLoggingMode === 'search' && (
          <FoodSearchModal
            onClose={() => setActiveLoggingMode(null)}
            onSelectFood={(prod) => {
              setSelectedFoodForReview(prod);
              setActiveLoggingMode(null);
            }}
          />
        )}

        {/* Food Detail / Serving Review Modal */}
        {selectedFoodForReview && (
          <FoodDetailView
            foodItem={selectedFoodForReview}
            onClose={() => setSelectedFoodForReview(null)}
            onConfirmAdd={handleAddFoodEntry}
          />
        )}

        {/* Logged Item Micronutrient & Detail Modal */}
        {selectedLoggedEntry && (
          <LoggedFoodDetailModal
            entry={selectedLoggedEntry}
            onClose={() => setSelectedLoggedEntry(null)}
            onDeleteEntry={handleDeleteEntry}
            onUpdateServings={handleUpdateEntryServings}
            onUpdateMealType={handleUpdateEntryMealType}
          />
        )}

        {/* Progressive Disclosure Nutrient Detail Modal */}
        {selectedNutrientDetailKey && (
          <NutrientDetailModal
            nutrientKey={selectedNutrientDetailKey}
            loggedEntries={loggedEntries}
            proteinTargetG={userProfile.proteinTargetG}
            calorieTarget={userProfile.calorieTarget}
            onClose={() => setSelectedNutrientDetailKey(null)}
          />
        )}

        {/* PWA Offline & Install Prompt Handler */}
        <PWAInstallPrompt />
      </div>
    </div>
  );
}
