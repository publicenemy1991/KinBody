import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { localStorageRepository } from './localStorageRepository';

export const profileRepository = {
  async getProfile(userId?: string): Promise<UserProfile | null> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching profile from Supabase:', error.message);
        } else if (data) {
          const profile: UserProfile = {
            name: data.name || '',
            age: data.age || 0,
            sex: data.sex || 'male',
            heightCm: data.height_cm || 0,
            weightKg: data.current_weight_kg || 0,
            unitSystem: data.unit_system || 'metric',
            colorTheme: data.theme_id || 'emerald',
            activityLevel: 'some_walking',
            workoutsPerWeek: '3-4',
            goal: data.goal || 'body_recomposition',
            trainingExperience: 'some',
            trainingDaysPerWeek: 4,
            workoutDurationMins: 45,
            equipment: 'full_gym',
            dietaryPreferences: [],
            allergies: [],
            calorieTarget: data.calorie_target || 2200,
            proteinTargetG: data.protein_target_g || 160,
            carbsTargetG: 220,
            fatTargetG: 65,
            selectedProgramId: 'upper_lower_4day',
            onboardingCompleted: Boolean(data.onboarding_completed),
          };
          localStorageRepository.saveProfile(profile);
          return profile;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local cache:', err);
      }
    }

    return localStorageRepository.getProfile();
  },

  async saveProfile(profile: UserProfile, userId?: string): Promise<void> {
    localStorageRepository.saveProfile(profile);

    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          user_id: userId,
          name: profile.name,
          goal: profile.goal,
          age: profile.age,
          sex: profile.sex,
          height_cm: profile.heightCm,
          current_weight_kg: profile.weightKg,
          calorie_target: profile.calorieTarget,
          protein_target_g: profile.proteinTargetG,
          unit_system: profile.unitSystem || 'metric',
          theme_id: profile.colorTheme || 'emerald',
          onboarding_completed: profile.onboardingCompleted,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) {
          console.warn('Failed to save profile to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase profile save error:', err);
      }
    }
  }
};
