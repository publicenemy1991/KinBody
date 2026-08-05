import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, Database, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-lg bg-[#181A20] border border-white/10 rounded-2xl shadow-2xl p-6 text-white overflow-hidden max-h-[85vh] flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Privacy Policy & Data Protection
                  </h2>
                  <p className="text-[11px] text-zinc-400">Your health data remains private & secure</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="py-4 space-y-4 overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-200">
                  <strong>Privacy First:</strong> kinbody is built to prioritize user sovereignty. All your meal logs, weight entries, and scan details are owned completely by you.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-1.5 bg-[#0D0E12] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>1. Local Device Storage</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Your daily food logs, nutrient totals, weight entries, and body scan measurements are stored locally on your device inside secure browser memory (<code className="text-indigo-300 font-mono">localStorage</code>).
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-1.5 bg-[#0D0E12] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>2. Optional Cloud Synchronization</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  If you sign in with your Google Account, your data is securely backed up to your personal cloud profile. We do not inspect, sell, or monetize your individual health logs.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-1.5 bg-[#0D0E12] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>3. Camera, Photo & Voice Scans</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Barcode scanning, photo food logs, and AI voice logging process images and speech transcripts in real time strictly to parse ingredients and macro values. Camera streams and raw voice recordings are never retained or saved on external servers.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-1.5 bg-[#0D0E12] p-3.5 rounded-xl border border-white/5">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>4. Complete Data Control & Erasure</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  You can reset your profile, re-run onboarding, or erase all stored entries at any time directly from the Preferences & Settings tab or by clearing your browser cache.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md"
              >
                I Understand & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
