import { localStorageRepository } from './localStorageRepository';
import { profileRepository } from './profileRepository';
import { foodRepository } from './foodRepository';
import { activityRepository } from './activityRepository';
import { bodyRepository } from './bodyRepository';
import { settingsRepository } from './settingsRepository';

export interface MigrationStatus {
  hasLocalData: boolean;
  hasRemoteData: boolean;
  alreadyMigrated: boolean;
}

export const migrationService = {
  hasLocalData(): boolean {
    const profile = localStorageRepository.getProfile();
    const foods = localStorageRepository.getFoodEntries();
    const activities = localStorageRepository.getActivities();
    const weights = localStorageRepository.getWeightEntries();
    const scans = localStorageRepository.getBodyScans();

    const profileHasData = Boolean(profile && (profile.onboardingCompleted || profile.weightKg > 0));
    return profileHasData || foods.length > 0 || activities.length > 0 || weights.length > 0 || scans.length > 0;
  },

  async checkMigrationStatus(userId: string): Promise<MigrationStatus> {
    const alreadyMigrated = localStorageRepository.hasMigrated(userId);
    const hasLocal = this.hasLocalData();

    // Check if remote data exists
    const remoteFoods = await foodRepository.getFoodEntries(userId);
    const remoteActivities = await activityRepository.getActivities(userId);
    const remoteWeights = await bodyRepository.getWeightEntries(userId);
    const remoteProfile = await profileRepository.getProfile(userId);

    const hasRemoteData = Boolean(
      (remoteProfile && remoteProfile.onboardingCompleted) ||
      remoteFoods.length > 0 ||
      remoteActivities.length > 0 ||
      remoteWeights.length > 0
    );

    return {
      hasLocalData: hasLocal,
      hasRemoteData,
      alreadyMigrated,
    };
  },

  async executeMigrationToSupabase(userId: string): Promise<boolean> {
    try {
      const profile = localStorageRepository.getProfile();
      if (profile) {
        await profileRepository.saveProfile(profile, userId);
      }

      const foods = localStorageRepository.getFoodEntries();
      for (const entry of foods) {
        await foodRepository.saveFoodEntry(entry, userId);
      }

      const activities = localStorageRepository.getActivities();
      for (const act of activities) {
        await activityRepository.saveActivity(act, userId);
      }

      const weights = localStorageRepository.getWeightEntries();
      for (const w of weights) {
        await bodyRepository.saveWeightEntry(w, userId);
      }

      const scans = localStorageRepository.getBodyScans();
      for (const s of scans) {
        await bodyRepository.saveBodyScan(s, userId);
      }

      localStorageRepository.setMigrated(userId);
      return true;
    } catch (err) {
      console.warn('Migration to Supabase failed:', err);
      return false;
    }
  }
};
