import {
  UserProfile,
  LoggedFoodEntry,
  ActivityLogEntry,
  WeightEntry,
  BodyScanEntry,
} from '../types';

const KEYS = {
  PROFILE: 'kinbody_user_profile',
  FOOD: 'kinbody_food_entries',
  ACTIVITIES: 'kinbody_activities',
  WEIGHT: 'kinbody_weight_entries',
  SCANS: 'kinbody_body_scans',
  SETTINGS: 'kinbody_settings',
};

export const localStorageRepository = {
  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(KEYS.PROFILE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to save profile to localStorage:', err);
    }
  },

  getFoodEntries(): LoggedFoodEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.FOOD);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveFoodEntries(entries: LoggedFoodEntry[]): void {
    try {
      localStorage.setItem(KEYS.FOOD, JSON.stringify(entries));
    } catch (err) {
      console.warn('Failed to save food entries to localStorage:', err);
    }
  },

  getActivities(): ActivityLogEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.ACTIVITIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveActivities(activities: ActivityLogEntry[]): void {
    try {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (err) {
      console.warn('Failed to save activities to localStorage:', err);
    }
  },

  getWeightEntries(): WeightEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.WEIGHT);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveWeightEntries(entries: WeightEntry[]): void {
    try {
      localStorage.setItem(KEYS.WEIGHT, JSON.stringify(entries));
    } catch (err) {
      console.warn('Failed to save weight entries to localStorage:', err);
    }
  },

  getBodyScans(): BodyScanEntry[] {
    try {
      const raw = localStorage.getItem(KEYS.SCANS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveBodyScans(scans: BodyScanEntry[]): void {
    try {
      localStorage.setItem(KEYS.SCANS, JSON.stringify(scans));
    } catch (err) {
      console.warn('Failed to save body scans to localStorage:', err);
    }
  },

  hasMigrated(userId: string): boolean {
    return localStorage.getItem(`kinbody_migrated_${userId}`) === 'true';
  },

  setMigrated(userId: string): void {
    localStorage.setItem(`kinbody_migrated_${userId}`, 'true');
  },

  clearAllLocalData(): void {
    try {
      localStorage.removeItem(KEYS.PROFILE);
      localStorage.removeItem(KEYS.FOOD);
      localStorage.removeItem(KEYS.ACTIVITIES);
      localStorage.removeItem(KEYS.WEIGHT);
      localStorage.removeItem(KEYS.SCANS);
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear local storage:', e);
    }
  }
};
