import { UserProfile } from '../types';
import { localStorageRepository } from './localStorageRepository';
import { getUserProfile, saveUserProfile } from '../lib/firestoreService';

export const profileRepository = {
  async getProfile(userId?: string): Promise<UserProfile | null> {
    if (userId) {
      try {
        const remoteProfile = await getUserProfile(userId);
        if (remoteProfile) {
          localStorageRepository.saveProfile(remoteProfile);
          return remoteProfile;
        }
      } catch (err) {
        console.warn('Firestore fetch failed, using local cache:', err);
      }
    }

    return localStorageRepository.getProfile();
  },

  async saveProfile(profile: UserProfile, userId?: string): Promise<void> {
    localStorageRepository.saveProfile(profile);

    if (userId) {
      try {
        await saveUserProfile(userId, profile);
      } catch (err) {
        console.warn('Firestore profile save error:', err);
      }
    }
  }
};

