import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { ArrowLeft, Camera, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { FoodItem } from '../types';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onProductFound: (product: FoodItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onProductFound,
}) => {
  const [statusText, setStatusText] = useState('Place the barcode inside the frame.');
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedBarcodeRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      setCameraError(null);
      if (!isMounted) return;

      const targetEl = document.getElementById('barcode-reader-view');
      if (!targetEl) {
        console.warn('Barcode container element not ready');
        return;
      }

      const html5QrCode = new Html5Qrcode('barcode-reader-view', {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
      });
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 10,
        qrbox: { width: 260, height: 160 },
      };

      const scanSuccessCallback = (decodedText: string) => {
        if (lastScannedBarcodeRef.current === decodedText) return;
        lastScannedBarcodeRef.current = decodedText;

        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        handleBarcodeDetected(decodedText);
      };

      try {
        await html5QrCode.start({ facingMode: 'environment' }, qrConfig, scanSuccessCallback, () => {});
      } catch (firstErr) {
        console.warn('Environment camera start failed, trying fallback camera:', firstErr);
        try {
          await html5QrCode.start({ facingMode: 'user' }, qrConfig, scanSuccessCallback, () => {});
        } catch (secondErr: any) {
          if (isMounted) {
            console.warn('All camera feeds failed:', secondErr);
            setCameraError(
              'Unable to access camera feed. You can enter the barcode numbers directly below.'
            );
          }
        }
      }
    };

    const timer = setTimeout(() => {
      startCamera();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    setLoading(true);
    setStatusText('Barcode detected! Looking up product database...');
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/products/barcode/${encodeURIComponent(barcode)}`);
      const data = await res.json();

      if (data.found && data.product) {
        const p = data.product;
        let detectedBrand = p.brand || p.brands || p.brand_owner;
        if (!detectedBrand && p.name && p.name.toLowerCase().includes('rokeby')) {
          detectedBrand = 'Rokeby Farms';
        }

        const foodItem: FoodItem = {
          id: p.id || `prd_${Date.now()}`,
          name: p.name,
          brand: detectedBrand,
          barcode: p.barcode,
          serving: p.serving || { amount: 100, unit: 'g', label: '1 serving' },
          nutritionPerServing: p.nutritionPerServing || {
            calories: 150,
            proteinG: 12,
            carbsG: 10,
            fatG: 4,
          },
          nutritionPer100g: p.nutritionPer100g,
          category: 'Packaged Food',
          source: p.source?.provider === 'open_food_facts' ? 'open_food_facts' : 'aus_database',
        };

        // Stop camera and pass product back for user serving review
        if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        onProductFound(foodItem);
      } else {
        setErrorMessage(`Product not found for barcode ${barcode}. Try searching by name or adding manually.`);
        setStatusText('This product isn’t in our database yet.');
      }
    } catch (err) {
      setErrorMessage('Network error looking up barcode. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        lastScannedBarcodeRef.current = null;
      }, 3000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeDetected(manualBarcode.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto"
    >
      {/* Top Header */}
      <div className="bg-[#0D0E12]/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-white tracking-tight">
          Scan Barcode
        </h2>
        <div className="w-10" />
      </div>

      {/* Main Camera Viewport Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-xs aspect-square bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
          <div id="barcode-reader-view" className="w-full h-full object-cover" />

          {/* Target Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-36 border-2 border-indigo-400/80 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 space-y-2">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <span className="text-xs text-zinc-300">Fetching Product...</span>
            </div>
          )}
        </div>

        {/* Status Text */}
        <p className="text-sm text-zinc-300 font-medium text-center mt-4 px-6">
          {statusText}
        </p>

        {cameraError && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-center space-x-2 max-w-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 text-center max-w-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Bottom Manual Barcode Form */}
      <div className="p-5 bg-[#181A20] border-t border-white/10 space-y-3">
        <p className="text-xs text-zinc-400 font-medium">
          Having trouble? Enter barcode digits:
        </p>
        <form onSubmit={handleManualSubmit} className="flex space-x-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="e.g. 9310055001122"
            className="flex-1 bg-[#0D0E12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!manualBarcode.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
};
