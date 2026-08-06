import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityLogEntry } from '../types';
import { localStorageRepository } from './localStorageRepository';

export const activityRepository = {
  async getActivities(userId?: string): Promise<ActivityLogEntry[]> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.warn('Error fetching activities from Supabase:', error.message);
        } else if (data && data.length > 0) {
          const activities: ActivityLogEntry[] = data.map((row) => ({
            id: row.id,
            date: row.date,
            time: row.start_time || undefined,
            activityType: row.activity_type || 'Activity',
            durationMinutes: row.duration_minutes || undefined,
            distanceKm: row.distance_km || undefined,
            steps: row.steps || undefined,
            activeCalories: row.active_calories || undefined,
            avgHeartRate: row.average_heart_rate || undefined,
            maxHeartRate: row.maximum_heart_rate || undefined,
            pace: row.pace || undefined,
            notes: row.notes || undefined,
            screenshotUrl: row.screenshot_path || undefined,
            isConfirmed: Boolean(row.confirmed),
            loggedAt: row.created_at || new Date().toISOString(),
          }));
          localStorageRepository.saveActivities(activities);
          return activities;
        }
      } catch (err) {
        console.warn('Supabase activities fetch failed, using local repository:', err);
      }
    }

    return localStorageRepository.getActivities();
  },

  async saveActivity(activity: ActivityLogEntry, userId?: string): Promise<void> {
    const current = localStorageRepository.getActivities();
    const updated = [activity, ...current.filter((item) => item.id !== activity.id)];
    localStorageRepository.saveActivities(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          id: activity.id,
          user_id: userId,
          date: activity.date,
          start_time: activity.time || null,
          activity_type: activity.activityType,
          duration_minutes: activity.durationMinutes || null,
          distance_km: activity.distanceKm || null,
          steps: activity.steps || null,
          active_calories: activity.activeCalories || null,
          average_heart_rate: activity.avgHeartRate || null,
          maximum_heart_rate: activity.maxHeartRate || null,
          pace: activity.pace || null,
          notes: activity.notes || null,
          screenshot_path: activity.screenshotUrl || null,
          confirmed: activity.isConfirmed,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('activities').upsert(payload);
        if (error) {
          console.warn('Failed to save activity to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase activity save error:', err);
      }
    }
  },

  async deleteActivity(id: string, userId?: string): Promise<void> {
    const current = localStorageRepository.getActivities();
    const updated = current.filter((item) => item.id !== id);
    localStorageRepository.saveActivities(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('activities')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn('Failed to delete activity from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase activity delete error:', err);
      }
    }
  }
};
