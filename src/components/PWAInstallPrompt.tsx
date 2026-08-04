import React, { useState, useEffect } from 'react';
import { Download, Smartphone, WifiOff, X, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Detect online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect if already running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Chrome, Android, Edge, Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  if (isOffline) {
    return (
      <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Displaying cached Recomp data.</span>
        </div>
        <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">Offline Mode</span>
      </div>
    );
  }

  // If already installed or dismissed, don't show floating banner
  if (isInstalled || isDismissed) return null;

  // Show banner if deferredPrompt is available or if on iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Floating Install App Banner */}
      <div className="fixed bottom-20 inset-x-4 max-w-md mx-auto z-40 bg-[#121212] border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl flex items-center justify-between space-x-3 transition-all animate-in slide-in-from-bottom-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              Install Recomp App
              <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium leading-tight mt-0.5">
              Add to your Home Screen for fast, offline access & app-like speed.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-extrabold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center relative shadow-2xl">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
              <Share className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-zinc-400">
                Follow these simple steps in Safari to add Recomp to your Home Screen:
              </p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-4 text-left space-y-3 text-xs text-zinc-300">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share button</strong> (the square icon with an arrow pointing up) in Safari.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Scroll down and select <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  Tap <strong className="text-white">Add</strong> in the top right corner.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-emerald-500 text-black font-extrabold text-xs py-3 rounded-xl hover:bg-emerald-400 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
