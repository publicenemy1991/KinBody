import React, { useState } from 'react';
import { Cloud, ShieldCheck, LogOut, CheckCircle2, HardDrive, RefreshCw } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { migrationService } from '../data/migrationService';

interface AccountBackupCardProps {
  onMigrationComplete?: () => void;
}

export const AccountBackupCard: React.FC<AccountBackupCardProps> = ({ onMigrationComplete }) => {
  const { user, signInWithGoogle, signOut, authStatus } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [migrationType, setMigrationType] = useState<'upload_local' | 'remote_exists' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      const msg = err?.message || 'We couldn’t sign you in with Google. Please check your Supabase setup or Google OAuth settings.';
      setErrorMsg(msg);
      setIsSigningIn(false);
    }
  };

  const handleExecuteMigration = async () => {
    if (!user) return;
    setIsMigrating(true);
    setErrorMsg(null);
    const success = await migrationService.executeMigrationToSupabase(user.id);
    setIsMigrating(false);
    if (success) {
      setShowMigrationPrompt(false);
      onMigrationComplete?.();
    } else {
      setErrorMsg('Your data is still safe on this device. We couldn’t back it up right now.');
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Account & Backup</h2>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300">
          {user ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Saved to your Kinbody account</span>
            </>
          ) : (
            <>
              <HardDrive className="w-3 h-3 text-zinc-400" />
              <span>Stored on this device</span>
            </>
          )}
        </div>
      </div>

      {user ? (
        /* Signed In View */
        <div className="space-y-4 pt-1">
          <div className="flex items-center space-x-3.5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Profile'}
                className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/20 shrink-0">
                {user.name ? user.name[0].toUpperCase() : 'K'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-white truncate">{user.name}</h3>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              <p className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline shrink-0" />
                <span>Your Kinbody data is backed up.</span>
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="w-full py-2.5 bg-[#181A20] hover:bg-white/5 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        /* Signed Out View */
        <div className="space-y-3 pt-1">
          <p className="text-xs text-zinc-300">
            Your Kinbody data is currently stored on this device.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSigningIn ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
            Sign in to back up your data and restore it on another device.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
