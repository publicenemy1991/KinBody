import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localStorageRepository } from './localStorageRepository';

export interface UserSettingsData {
  themeId: string;
  gradientStart?: string;
  gradientEnd?: string;
  notificationsEnabled?: boolean;
}

export const settingsRepository = {
  async getSettings(userId?: string): Promise<UserSettingsData | null> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching settings from Supabase:', error.message);
        } else if (data) {
          return {
            themeId: data.theme_id || 'emerald',
            gradientStart: data.gradient_start,
            gradientEnd: data.gradient_end,
            notificationsEnabled: data.notifications_enabled,
          };
        }
      } catch (err) {
        console.warn('Supabase settings fetch error:', err);
      }
    }
    return null;
  },

  async saveSettings(settings: UserSettingsData, userId?: string): Promise<void> {
    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          user_id: userId,
          theme_id: settings.themeId,
          gradient_start: settings.gradientStart || null,
          gradient_end: settings.gradientEnd || null,
          notifications_enabled: Boolean(settings.notificationsEnabled),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });
        if (error) {
          console.warn('Failed to save settings to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase settings save error:', err);
      }
    }
  }
};
