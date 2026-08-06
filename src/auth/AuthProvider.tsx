import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, signInWithGoogle as supabaseSignInWithGoogle, signOutSupabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  authStatus: AuthStatus;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  authStatus: 'loading',
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatUser = (supaUser: SupabaseUser | null): AuthUser | null => {
    if (!supaUser) return null;
    return {
      id: supaUser.id,
      email: supaUser.email,
      name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split('@')[0] || 'Kinbody User',
      avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
    };
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setUser(formatUser(session?.user || null));
        setIsLoading(false);
      }
    }).catch((err) => {
      console.warn('Error fetching Supabase session:', err);
      if (isMounted) setIsLoading(false);
    });

    // Listen to changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setUser(formatUser(session?.user || null));
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }
    await supabaseSignInWithGoogle();
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await signOutSupabase();
    }
    setSession(null);
    setUser(null);
  };

  const authStatus: AuthStatus = isLoading
    ? 'loading'
    : user
    ? 'signed-in'
    : 'signed-out';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        authStatus,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
