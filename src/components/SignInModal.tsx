import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, LogIn, Sparkles, AlertCircle, Loader2, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { KinbodyLogo } from './KinbodyLogo';
import { auth } from '../lib/firebase';

interface SignInModalProps {
  onClose?: () => void;
  isStandaloneScreen?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  onClose,
  isStandaloneScreen = false,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage('Password reset link sent! Check your inbox and Spam/Junk folder for instructions.');
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many reset requests. Please wait a few minutes before trying again.');
      } else {
        setError(err?.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!firstName.trim()) {
          setError('Please enter your first name.');
          setLoading(false);
          return;
        }
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
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
          {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
        </span>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 flex-1 space-y-6 flex flex-col justify-center">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start mb-2">
            <KinbodyLogo iconClassName="w-6 h-6" textSize="text-lg" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isForgotPassword
              ? 'Reset your password'
              : isSignUp
              ? 'Create your account'
              : 'Welcome back'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isForgotPassword
              ? 'Enter your email address and we will send you a password reset link.'
              : 'Sign in with email & password to access your macro logs, body composition scans, and activity records.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs text-zinc-400 hover:text-white font-medium inline-flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Morgan"
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-400 block">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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
        )}

        {!isForgotPassword && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

