import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, LogIn, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface SignInModalProps {
  onClose?: () => void;
  isStandaloneScreen?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  onClose,
  isStandaloneScreen = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google popup auth error:', err);
      const code = err?.code;
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        // Fallback to redirect if popups are blocked by iframe/browser settings
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: any) {
          setError(
            'Google Sign-In popup was blocked by browser/iframe settings. You can sign in using Email & Password below.'
          );
        }
      } else if (code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setError(
          `Domain "${domain}" is not authorized for Google OAuth in Firebase Console. Please add it to Firebase Console -> Authentication -> Settings -> Authorized Domains, or create an account with Email & Password below.`
        );
      } else if (code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists.');
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid email address or password.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Authentication failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: isStandaloneScreen ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto ${
        isStandaloneScreen ? '' : 'sm:border-x sm:border-white/10'
      }`}
    >
      {/* Top Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
        {onClose ? (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </span>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 flex-1 space-y-6 flex flex-col justify-center">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recomp Nutrition Account</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-zinc-400">
            Sign in to access your macro logs, body composition scans, and activity records.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Option */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-zinc-100 active:scale-[0.99] text-zinc-900 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-3 shadow-md border border-zinc-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span className="text-sm">Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
            or email
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
