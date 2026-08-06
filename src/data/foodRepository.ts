import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LoggedFoodEntry } from '../types';
import { localStorageRepository } from './localStorageRepository';

export const foodRepository = {
  async getFoodEntries(userId?: string): Promise<LoggedFoodEntry[]> {
    if (userId && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.warn('Error fetching food entries from Supabase:', error.message);
        } else if (data && data.length > 0) {
          const entries: LoggedFoodEntry[] = data.map((row) => ({
            id: row.id,
            date: row.date,
            mealType: row.meal_type || 'lunch',
            servings: 1,
            loggedAt: row.created_at || new Date().toISOString(),
            foodItem: {
              id: `food_${row.id}`,
              name: row.name || 'Food Item',
              serving: {
                amount: row.quantity || 100,
                unit: row.unit || 'g',
                label: `${row.quantity || 100}${row.unit || 'g'}`,
              },
              nutritionPerServing: {
                calories: Number(row.calories || 0),
                proteinG: Number(row.protein_g || 0),
                carbsG: Number(row.carbs_g || 0),
                fatG: Number(row.fat_g || 0),
                fibreG: Number(row.fibre_g || 0),
              },
              source: row.entry_method || 'custom',
            },
          }));
          localStorageRepository.saveFoodEntries(entries);
          return entries;
        }
      } catch (err) {
        console.warn('Supabase food fetch failed, using local repository:', err);
      }
    }

    return localStorageRepository.getFoodEntries();
  },

  async saveFoodEntry(entry: LoggedFoodEntry, userId?: string): Promise<void> {
    const current = localStorageRepository.getFoodEntries();
    const updated = [entry, ...current.filter((item) => item.id !== entry.id)];
    localStorageRepository.saveFoodEntries(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const payload = {
          id: entry.id,
          user_id: userId,
          date: entry.date,
          meal_type: entry.mealType,
          name: entry.foodItem.name,
          quantity: entry.servings * (entry.foodItem.serving?.amount || 1),
          unit: entry.foodItem.serving?.unit || 'g',
          calories: Math.round(entry.foodItem.nutritionPerServing.calories * entry.servings),
          protein_g: Math.round((entry.foodItem.nutritionPerServing.proteinG * entry.servings) * 10) / 10,
          carbs_g: Math.round((entry.foodItem.nutritionPerServing.carbsG * entry.servings) * 10) / 10,
          fat_g: Math.round((entry.foodItem.nutritionPerServing.fatG * entry.servings) * 10) / 10,
          fibre_g: Math.round(((entry.foodItem.nutritionPerServing.fibreG || 0) * entry.servings) * 10) / 10,
          entry_method: entry.foodItem.source || 'manual',
          confirmed: true,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('food_entries').upsert(payload);
        if (error) {
          console.warn('Failed to save food entry to Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase food save error:', err);
      }
    }
  },

  async deleteFoodEntry(id: string, userId?: string): Promise<void> {
    const current = localStorageRepository.getFoodEntries();
    const updated = current.filter((item) => item.id !== id);
    localStorageRepository.saveFoodEntries(updated);

    if (userId && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('food_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) {
          console.warn('Failed to delete food entry from Supabase:', error.message);
        }
      } catch (err) {
        console.warn('Supabase food delete error:', err);
      }
    }
  }
};
