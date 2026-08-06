import { supabase, isSupabaseConfigured } from './supabase';

export async function uploadActivityScreenshot(
  userId: string,
  activityId: string,
  file: File | Blob
): Promise<string | null> {
  if (!userId || !isSupabaseConfigured) return null;
  try {
    const filePath = `${userId}/${activityId}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('activity-screenshots')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Failed uploading activity screenshot to Supabase Storage:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('activity-screenshots')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Activity screenshot upload error:', err);
    return null;
  }
}

export async function uploadBodyScanImage(
  userId: string,
  scanId: string,
  file: File | Blob
): Promise<string | null> {
  if (!userId || !isSupabaseConfigured) return null;
  try {
    const filePath = `${userId}/${scanId}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('body-scans')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('Failed uploading body scan image to Supabase Storage:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('body-scans')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.warn('Body scan image upload error:', err);
    return null;
  }
}
