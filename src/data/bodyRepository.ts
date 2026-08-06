import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WeightEntry, BodyScanEntry } from '../types';
import { localStorageRepository } from './localStorageRepository';

export const bodyRepository = {
  // --- WEIGHT ENTRIES ---
  async getWeightEntries(userId?: string): Promise<WeightEntry[]> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.warn('Error fetching weight entries from Supabase:', error.message);
        } else if (data && data.length > 0) {
          const weights: WeightEntry[] = data.map((row) => ({
            id: row.id,
            date: row.date,
            weightKg: row.weight_kg,
          }));
          localStorageRepository.saveWeightEntries(weights);
          return weights;
        }
      } catch (err) {
        console.warn('Supabase weight fetch failed, using local repository:', err);
      }
    }

    return localStorageRepository.getWeightEntries();
  },

  async saveWeightEntry(entry: WeightEntry, userId?: string): Promise<void> {
    const current = localStorageRepository.getWeightEntries();
    const updated = [entry, ...current.filter((item) => item.id !== entry.id)];
    localStorageRepository.saveWeightEntries(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          id: entry.id,
          user_id: userId,
          date: entry.date,
          weight_kg: entry.weightKg,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('weight_entries').upsert(payload);
        if (error) {
          console.warn('Failed to save weight entry to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase weight save error:', err);
      }
    }
  },

  async deleteWeightEntry(id: string, userId?: string): Promise<void> {
    const current = localStorageRepository.getWeightEntries();
    const updated = current.filter((item) => item.id !== id);
    localStorageRepository.saveWeightEntries(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('weight_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn('Failed to delete weight entry from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase weight delete error:', err);
      }
    }
  },

  // --- BODY SCANS ---
  async getBodyScans(userId?: string): Promise<BodyScanEntry[]> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('body_scans')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.warn('Error fetching body scans from Supabase:', error.message);
        } else if (data && data.length > 0) {
          const scans: BodyScanEntry[] = data.map((row) => ({
            id: row.id,
            date: row.date,
            title: 'Body Scan',
            weightKg: row.weight_kg || undefined,
            bodyFatPercent: row.body_fat_percent || undefined,
            skeletalMuscleKg: row.skeletal_muscle_kg || undefined,
            leanMassKg: row.lean_mass_kg || undefined,
            fatMassKg: row.fat_mass_kg || undefined,
            visceralFatRating: row.visceral_fat_rating || undefined,
            scanImageUrl: row.image_path || undefined,
            loggedAt: row.created_at || new Date().toISOString(),
          }));
          localStorageRepository.saveBodyScans(scans);
          return scans;
        }
      } catch (err) {
        console.warn('Supabase body scans fetch failed, using local repository:', err);
      }
    }

    return localStorageRepository.getBodyScans();
  },

  async saveBodyScan(scan: BodyScanEntry, userId?: string): Promise<void> {
    const current = localStorageRepository.getBodyScans();
    const updated = [scan, ...current.filter((item) => item.id !== scan.id)];
    localStorageRepository.saveBodyScans(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          id: scan.id,
          user_id: userId,
          date: scan.date,
          weight_kg: scan.weightKg || null,
          body_fat_percent: scan.bodyFatPercent || null,
          skeletal_muscle_kg: scan.skeletalMuscleKg || null,
          lean_mass_kg: scan.leanMassKg || null,
          fat_mass_kg: scan.fatMassKg || null,
          visceral_fat_rating: scan.visceralFatRating || null,
          image_path: scan.scanImageUrl || null,
          confirmed: true,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('body_scans').upsert(payload);
        if (error) {
          console.warn('Failed to save body scan to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase body scan save error:', err);
      }
    }
  },

  async deleteBodyScan(id: string, userId?: string): Promise<void> {
    const current = localStorageRepository.getBodyScans();
    const updated = current.filter((item) => item.id !== id);
    localStorageRepository.saveBodyScans(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('body_scans')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn('Failed to delete body scan from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase body scan delete error:', err);
      }
    }
  }
};
