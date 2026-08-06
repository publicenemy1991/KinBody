/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { profileRepository } from './data/profileRepository';
import { foodRepository } from './data/foodRepository';
import { activityRepository } from './data/activityRepository';
import { bodyRepository } from './data/bodyRepository';
import { migrationService } from './data/migrationService';
import { localStorageRepository } from './data/localStorageRepository';
import { MigrationModal } from './components/MigrationModal';
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
import { SignInModal } from './components/SignInModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { KinbodyLogo } from './components/KinbodyLogo';

function KinbodyMainApp() {
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const todayStr = getTodayString();

  // Profile & Data Collections
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [loggedEntries, setLoggedEntries] = useState<LoggedFoodEntry[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [bodyScanEntries, setBodyScanEntries] = useState<BodyScanEntry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);

  // Migration & Auth States
  const [migrationModalState, setMigrationModalState] = useState<{
    show: boolean;
    type: 'upload_local' | 'remote_exists';
  }>({ show: false, type: 'upload_local' });

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<PrimaryTab>('log');
  const [selectedLogDate, setSelectedLogDate] = useState<string>(todayStr);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEvoltUploadModal, setShowEvoltUploadModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [activeLoggingMode, setActiveLoggingMode] = useState<
    null | 'barcode' | 'photo' | 'voice' | 'search'
  >(null);

  const [selectedFoodForReview, setSelectedFoodForReview] = useState<FoodItem | null>(null);
  const [selectedLoggedEntry, setSelectedLoggedEntry] = useState<LoggedFoodEntry | null>(null);
  const [selectedNutrientDetailKey, setSelectedNutrientDetailKey] = useState<string | null>(null);

  // Load all user data (either from Supabase account or Local Storage)
  const reloadAllData = useCallback(async () => {
    const userId = user?.id;

    // Load Profile
    const profile = await profileRepository.getProfile(userId);
    if (profile) {
      setUserProfile(profile);
    }

    // Load Food Entries
    const foods = await foodRepository.getFoodEntries(userId);
    setLoggedEntries(foods);

    // Load Activities
    const activities = await activityRepository.getActivities(userId);
    setActivityLogs(activities);

    // Load Weight Entries
    const weights = await bodyRepository.getWeightEntries(userId);
    setWeightEntries(weights);

    // Load Body Scans
    const scans = await bodyRepository.getBodyScans(userId);
    setBodyScanEntries(scans);
  }, [user]);

  useEffect(() => {
    reloadAllData();
  }, [reloadAllData]);

  // Check migration status whenever user signs in
  useEffect(() => {
    if (!user) return;

    migrationService.checkMigrationStatus(user.id).then((status) => {
      if (status.hasLocalData && !status.alreadyMigrated) {
        if (status.hasRemoteData) {
          setMigrationModalState({ show: true, type: 'remote_exists' });
        } else {
          setMigrationModalState({ show: true, type: 'upload_local' });
        }
      }
    });
  }, [user]);

  // Handler: Save Step Progress during Onboarding Wizard
  const handleSaveStepProfile = async (partialProfile: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...partialProfile };
    setUserProfile(updated);
    await profileRepository.saveProfile(updated, user?.id);
  };

  // Handler: Complete Onboarding
  const handleCompleteOnboarding = async (finalProfile: UserProfile) => {
    const completedProfile = { ...finalProfile, onboardingCompleted: true };
    setUserProfile(completedProfile);
    await profileRepository.saveProfile(completedProfile, user?.id);
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

    await foodRepository.saveFoodEntry(newEntry, user?.id);
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
      await foodRepository.saveFoodEntry(entry, user?.id);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setLoggedEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedLoggedEntry?.id === id) {
      setSelectedLoggedEntry(null);
    }
    await foodRepository.deleteFoodEntry(id, user?.id);
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
    await foodRepository.saveFoodEntry(updated, user?.id);
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
    await foodRepository.saveFoodEntry(updated, user?.id);
  };

  // Activity Handlers
  const handleAddActivity = async (entryData: Omit<ActivityLogEntry, 'id' | 'loggedAt'>) => {
    const newEntry: ActivityLogEntry = {
      ...entryData,
      id: `act_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newEntry, ...prev]);
    await activityRepository.saveActivity(newEntry, user?.id);
  };

  const handleUpdateActivity = async (id: string, updatedPartial: Partial<ActivityLogEntry>) => {
    const existing = activityLogs.find((a) => a.id === id);
    if (!existing) return;

    const updated = { ...existing, ...updatedPartial };
    setActivityLogs((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    await activityRepository.saveActivity(updated, user?.id);
  };

  const handleDeleteActivity = async (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    await activityRepository.deleteActivity(id, user?.id);
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

    await bodyRepository.saveWeightEntry(newWeight, user?.id);
    await profileRepository.saveProfile(updatedProfile, user?.id);
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

    await bodyRepository.saveWeightEntry(updated, user?.id);
    await profileRepository.saveProfile(updatedProfile, user?.id);
  };

  const handleDeleteWeight = async (id: string) => {
    setWeightEntries((prev) => prev.filter((w) => w.id !== id));
    await bodyRepository.deleteWeightEntry(id, user?.id);
  };

  const handleSaveEvoltScan = async (scanData: Omit<BodyScanEntry, 'id' | 'loggedAt'>) => {
    const newScan: BodyScanEntry = {
      ...scanData,
      id: `bs_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };

    setBodyScanEntries((prev) => [newScan, ...prev]);
    await bodyRepository.saveBodyScan(newScan, user?.id);

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
    await profileRepository.saveProfile(updatedProfile, user?.id);

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
      await bodyRepository.saveWeightEntry(linkedWeight, user?.id);
    }
  };

  const handleEditScan = async (updatedScan: BodyScanEntry) => {
    setBodyScanEntries((prev) =>
      prev.map((s) => (s.id === updatedScan.id ? updatedScan : s))
    );
    await bodyRepository.saveBodyScan(updatedScan, user?.id);

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
      await profileRepository.saveProfile(updatedProfile, user?.id);
    }
  };

  const handleDeleteScan = async (id: string) => {
    setBodyScanEntries((prev) => prev.filter((s) => s.id !== id));
    await bodyRepository.deleteBodyScan(id, user?.id);
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    const completedProfile = { ...updated, onboardingCompleted: true };
    setUserProfile(completedProfile);
    await profileRepository.saveProfile(completedProfile, user?.id);

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
      await bodyRepository.saveWeightEntry(weightEntry, user?.id);
    }
  };

  const handleDeleteLoggedData = async () => {
    localStorageRepository.clearAllLocalData();
    setLoggedEntries([]);
    setWeightEntries([]);
    setBodyScanEntries([]);
    setActivityLogs([]);
  };

  const handleDeleteAccount = async () => {
    localStorageRepository.clearAllLocalData();
    setLoggedEntries([]);
    setWeightEntries([]);
    setBodyScanEntries([]);
    setActivityLogs([]);
    await signOut();
  };

  // State 1: Boot / Session Restore Loading Screen with Kinbody Logo
  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-6 space-y-4">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <KinbodyLogo className="w-12 h-12 text-emerald-400 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Loading Kinbody…</p>
      </div>
    );
  }

  // State 2: Show Onboarding Wizard if Onboarding Incomplete
  if (!userProfile.onboardingCompleted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <OnboardingWizard
          initialProfile={userProfile}
          onSaveStepProfile={handleSaveStepProfile}
          onCompleteOnboarding={handleCompleteOnboarding}
        />
      </div>
    );
  }

  // State 3: Main Application Dashboard
  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300 font-sans">
      <div className="max-w-xl mx-auto min-h-screen bg-black flex flex-col relative border-x border-white/10 shadow-2xl overflow-x-hidden">
        {/* Navigation Header */}
        <NavigationHeader
          userProfile={userProfile}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenSignIn={() => setShowSignInModal(true)}
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
                transition={{ duration: 0.22, ease: 'easeOut' }}
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
                transition={{ duration: 0.22, ease: 'easeOut' }}
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
                transition={{ duration: 0.22, ease: 'easeOut' }}
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
                transition={{ duration: 0.22, ease: 'easeOut' }}
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
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ProfileView
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onSignOut={signOut}
                  onDeleteLoggedData={handleDeleteLoggedData}
                  onDeleteAccount={handleDeleteAccount}
                  onMigrationComplete={reloadAllData}
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

        {/* Account / Sign In Modal */}
        {showSignInModal && (
          <SignInModal
            onClose={() => setShowSignInModal(false)}
            onSuccessSignIn={() => setShowSignInModal(false)}
          />
        )}

        {/* Migration Modal */}
        {migrationModalState.show && user && (
          <MigrationModal
            userId={user.id}
            type={migrationModalState.type}
            onClose={() => setMigrationModalState({ show: false, type: 'upload_local' })}
            onSuccess={() => {
              setMigrationModalState({ show: false, type: 'upload_local' });
              reloadAllData();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <KinbodyMainApp />
    </AuthProvider>
  );
}
