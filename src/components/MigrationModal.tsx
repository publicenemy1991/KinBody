import React, { useState } from 'react';
import { Cloud, HardDrive, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { migrationService } from '../data/migrationService';

interface MigrationModalProps {
  userId: string;
  type: 'upload_local' | 'remote_exists';
  onClose: () => void;
  onSuccess: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({
  userId,
  type,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveToAccount = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    const success = await migrationService.executeMigrationToSupabase(userId);
    setIsProcessing(false);

    if (success) {
      onSuccess();
    } else {
      setErrorMsg('Your data is still safe on this device. We couldn’t back it up right now.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">
              {type === 'upload_local'
                ? 'Save your existing Kinbody data?'
                : 'Kinbody data already exists for this account'}
            </h3>
            <p className="text-xs text-zinc-400">Account & Cloud Backup</p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {type === 'upload_local'
            ? 'You already have meals, activity or body information stored on this device. Would you like to upload it to your Kinbody account now?'
            : 'We found existing meal, activity, or body records in your cloud account. You can use your account data or keep managing device data.'}
        </p>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2.5 pt-2">
          {type === 'upload_local' ? (
            <>
              <button
                onClick={handleSaveToAccount}
                disabled={isProcessing}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Account…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save to Account</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
              >
                Keep on Device
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onSuccess}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                Use Account Data
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold rounded-xl transition-colors"
              >
                Review Local Data
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
