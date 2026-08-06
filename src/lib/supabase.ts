import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function getSanitizedSupabaseUrl(input: string): string {
  let urlStr = input.trim();
  if (!urlStr) return 'https://placeholder.supabase.co';
  
  // If user entered e.g. "myproject.supabase.co", prepend "https://"
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = `https://${urlStr}`;
  }

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch (_) {
    // If URL parsing fails, return safe placeholder
  }

  return 'https://placeholder.supabase.co';
}

const safeUrl = getSanitizedSupabaseUrl(rawUrl);
const safeKey = rawKey || 'placeholder';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  safeUrl !== 'https://placeholder.supabase.co' &&
  rawKey &&
  rawKey !== 'placeholder'
);

export const supabase = createClient(safeUrl, safeKey);

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Please set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }
  } catch (err: any) {
    const message = err?.message || '';
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('ENOTFOUND')) {
      throw new Error(`Unable to connect to Supabase at ${safeUrl}. Please ensure your Supabase project is active (not Paused) in the Supabase Dashboard, and check that VITE_SUPABASE_URL is correct.`);
    }
    throw err;
  }
}

export async function signOutSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

