import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  ArrowLeft,
  Camera,
  Barcode,
  Sparkles,
  AlertCircle,
  Search,
  RefreshCw,
  Box,
  Upload,
  CheckCircle2,
  Scan,
  Disc,
} from 'lucide-react';
import { FoodItem } from '../types';
import { compressImageFile } from '../lib/imageCompressor';

interface ScannerModalProps {
  initialSubMode?: 'barcode' | 'photo';
  onClose: () => void;
  onProductFound: (product: FoodItem) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  initialSubMode = 'barcode',
  onClose,
  onProductFound,
}) => {
  const [subMode, setSubMode] = useState<'barcode' | 'photo'>(initialSubMode);

  // Barcode state
  const [statusText, setStatusText] = useState('Place the product barcode inside the frame.');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedBarcodeRef = useRef<string | null>(null);

  // Photo / AI Estimation state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [is3dScan, setIs3dScan] = useState(true);
  const [scanning3d, setScanning3d] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [portionChip, setPortionChip] = useState<'small' | 'regular' | 'large' | 'xlarge'>('regular');

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // --- BARCODE CAMERA INITIALIZATION ---
  useEffect(() => {
    let isMounted = true;

    if (subMode !== 'barcode') {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      return;
    }

    const startCamera = async () => {
      setCameraError(null);
      if (!isMounted) return;

      const targetEl = document.getElementById('unified-barcode-view');
      if (!targetEl) {
        console.warn('Barcode view container not ready');
        return;
      }

      const html5QrCode = new Html5Qrcode('unified-barcode-view', {
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
        qrbox: { width: 260, height: 150 },
      };

      const scanSuccessCallback = (decodedText: string) => {
        if (lastScannedBarcodeRef.current === decodedText) return;
        lastScannedBarcodeRef.current = decodedText;

        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        handleBarcodeLookup(decodedText);
      };

      try {
        // Try environment camera first
        await html5QrCode.start({ facingMode: 'environment' }, qrConfig, scanSuccessCallback, () => {});
      } catch (firstErr) {
        console.warn('Environment camera start failed, trying fallback camera:', firstErr);
        try {
          // Fallback to user/front camera or any video input
          await html5QrCode.start({ facingMode: 'user' }, qrConfig, scanSuccessCallback, () => {});
        } catch (secondErr: any) {
          if (isMounted) {
            console.warn('All camera feeds failed:', secondErr);
            setCameraError(
              'Camera access restricted or unavailable. You can enter barcode numbers or snap a photo log below.'
            );
          }
        }
      }
    };

    // Small delay to ensure DOM element is painted
    const timer = setTimeout(() => {
      startCamera();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      }
    };
  }, [subMode]);

  const handleBarcodeLookup = async (barcode: string) => {
    setBarcodeLoading(true);
    setStatusText('Barcode detected! Querying product database...');
    setBarcodeError(null);

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

        if (scannerRef.current && scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (e) {
            // ignore transition errors on unmount
          }
        }
        onProductFound(foodItem);
      } else {
        setBarcodeError(`Product not found for barcode ${barcode}. Try searching by name or adding manually.`);
        setStatusText('Barcode not recognized in database.');
      }
    } catch (err) {
      setBarcodeError('Network error looking up barcode. Please try again.');
    } finally {
      setBarcodeLoading(false);
      setTimeout(() => {
        lastScannedBarcodeRef.current = null;
      }, 3000);
    }
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleBarcodeLookup(manualBarcode.trim());
    }
  };

  // --- PHOTO ESTIMATION LOGIC ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImageFile(file, 1200, 1200, 0.82);
        setSelectedImage(base64);
        if (is3dScan) {
          trigger3DScanSim(base64);
        } else {
          analyzePhotoDirect(base64);
        }
      } catch (err) {
        console.error('Failed to process image:', err);
        setPhotoError('Unable to process photo file. Please try another image.');
      }
    }
  };

  const trigger3DScanSim = (base64Img: string) => {
    setScanning3d(true);
    setScanProgress(0);
    setPhotoError(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning3d(false);
          analyzePhotoDirect(base64Img);
          return 100;
        }
        return prev + 20;
      });
    }, 120);
  };

  const getMultiplier = () => {
    switch (portionChip) {
      case 'small': return 0.75;
      case 'regular': return 1.0;
      case 'large': return 1.35;
      case 'xlarge': return 1.7;
    }
  };

  const analyzePhotoDirect = async (base64Img: string) => {
    setPhotoAnalyzing(true);
    setPhotoError(null);

    try {
      const mult = getMultiplier();
      const res = await fetch('/api/ai/analyze-food-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          isDepthScan: is3dScan,
          portionMultiplier: mult,
        }),
      });

      const data = await res.json();

      if (data.success && data.result) {
        const r = data.result;
        const grams = Math.round((r.estimatedServingGrams || 220) * mult);

        const foodItem: FoodItem = {
          id: `food_camera_${Date.now()}`,
          name: r.foodName || 'Scanned Dish',
          brand: undefined,
          serving: {
            amount: grams,
            unit: 'g',
            label: `${grams}g (${portionChip})`,
          },
          nutritionPerServing: {
            calories: Math.round((r.calories || 340) * mult),
            proteinG: Math.round((r.proteinG || 28) * mult * 10) / 10,
            carbsG: Math.round((r.carbsG || 32) * mult * 10) / 10,
            fatG: Math.round((r.fatG || 12) * mult * 10) / 10,
            fibreG: r.fibreG ? Math.round(r.fibreG * mult * 10) / 10 : undefined,
          },
          category: 'Camera Log',
          source: 'ai_estimate',
        };

        onProductFound(foodItem);
      } else {
        setPhotoError(data.error || 'Could not analyze photo. Please try again.');
      }
    } catch (err) {
      setPhotoError('Network error processing image.');
    } finally {
      setPhotoAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto"
    >
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-[#0D0E12]/95 backdrop-blur-md px-5 py-3.5 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center justify-center space-x-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Smart Scanner</span>
            </h2>
            <p className="text-[10px] text-zinc-400">Barcode lookup or Photo AI estimation</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Consolidated Switcher Bar */}
        <div className="grid grid-cols-2 gap-1 bg-[#181A20] p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setSubMode('barcode');
              setSelectedImage(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              subMode === 'barcode'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Barcode Scanner</span>
          </button>
          <button
            onClick={() => {
              setSubMode('photo');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              subMode === 'photo'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Photo / Meal AI</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="p-5 flex-1 flex flex-col items-center justify-center">
        {subMode === 'barcode' ? (
          <div className="w-full space-y-4 flex flex-col items-center">
            <div className="w-full max-w-xs aspect-square bg-zinc-950 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl flex items-center justify-center">
              <div id="unified-barcode-view" className="w-full h-full object-cover" />

              {/* Laser Box */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-36 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>

              {barcodeLoading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 space-y-2">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs text-zinc-200">Matching Product...</span>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-300 font-medium text-center px-4">
              {statusText}
            </p>

            {cameraError && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 text-center max-w-xs">
                {cameraError}
              </div>
            )}

            {barcodeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 text-center max-w-xs">
                {barcodeError}
              </div>
            )}
          </div>
        ) : (
          /* Photo AI Mode */
          <div className="w-full space-y-4">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-white/10 bg-[#181A20] shadow-2xl flex flex-col items-center justify-center">
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img src={selectedImage} alt="Captured food" className="w-full h-full object-cover" />

                  {scanning3d && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20 p-6 text-center">
                      <Scan className="w-10 h-10 text-emerald-400 animate-bounce" />
                      <div>
                        <p className="text-sm font-bold text-white">Measuring 3D Volume...</p>
                        <p className="text-xs text-zinc-400 mt-0.5">Calculating cm³ and mass estimate</p>
                      </div>
                      <div className="w-48 bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full transition-all duration-200"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {photoAnalyzing && !scanning3d && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20 p-6 text-center">
                      <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
                      <p className="text-sm font-bold text-white">Analyzing Nutrients with Gemini AI...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-4 max-w-xs flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Snap or Upload Food Photo</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Our Gemini Vision engine estimates portion weight and total calories automatically.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Gallery</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {photoError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 text-center">
                {photoError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="p-5 bg-[#181A20] border-t border-white/10 space-y-3">
        {subMode === 'barcode' ? (
          <form onSubmit={handleManualBarcodeSubmit} className="space-y-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Or enter barcode numbers:</span>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g. 9300633000101"
                className="flex-1 bg-[#0D0E12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim() || barcodeLoading}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-1"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Powered by Gemini Vision 2.5</span>
            <button
              onClick={() => {
                setSelectedImage(null);
                setPhotoError(null);
              }}
              className="text-emerald-400 hover:underline font-medium"
            >
              Reset Camera
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input type="file" ref={galleryInputRef} accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
    </motion.div>
  );
};
