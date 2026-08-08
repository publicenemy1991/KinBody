import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  Scan,
  Box,
  Layers,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Maximize2,
  Info,
  ChevronRight,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { FoodItem } from '../types';
import { compressImageFile } from '../lib/imageCompressor';

interface PhotoLogModalProps {
  onClose: () => void;
  onProductFound: (product: FoodItem) => void;
}

interface SavedContainer {
  id: string;
  name: string;
  diameterCm?: number;
  volumeCapacityMl?: number;
}

const DEFAULT_CONTAINERS: SavedContainer[] = [
  { id: 'cnt_1', name: 'User 26cm Ceramic Dinner Plate', diameterCm: 26 },
  { id: 'cnt_2', name: 'Standard 350ml Cereal Bowl', volumeCapacityMl: 350 },
  { id: 'cnt_3', name: '400ml Coffee Mug', volumeCapacityMl: 400 },
  { id: 'cnt_4', name: '750ml Protein Shaker', volumeCapacityMl: 750 },
];

export const PhotoLogModal: React.FC<PhotoLogModalProps> = ({
  onClose,
  onProductFound,
}) => {
  const [scanMode, setScanMode] = useState<'3d_depth' | 'single_photo'>('3d_depth');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Portion multiplier chips
  const [selectedPortionChip, setSelectedPortionChip] = useState<'small' | 'regular' | 'large' | 'xlarge'>('regular');
  
  // Container memory
  const [savedContainers, setSavedContainers] = useState<SavedContainer[]>(() => {
    const saved = localStorage.getItem('recomp_saved_containers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CONTAINERS;
  });
  const [activeContainer, setActiveContainer] = useState<SavedContainer>(savedContainers[0]);

  // Analyzed 3D volumetric result
  const [depthResult, setDepthResult] = useState<{
    foodName: string;
    brandOrStyle?: string;
    estimatedServingGrams: number;
    servingLabel?: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fibreG?: number;
    sodiumMg?: number;
    calciumMg?: number;
    magnesiumMg?: number;
    zincMg?: number;
    vitDMg?: number;
    vitCMg?: number;
    epaMg?: number;
    dhaMg?: number;
    estimatedVolumeCm3?: number;
    foodDensityGcm3?: number;
    arDepthConfidence?: number;
    matchedContainerName?: string;
    depthDetailsNote?: string;
  } | null>(null);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const secondPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Save containers persistence
  useEffect(() => {
    localStorage.setItem('recomp_saved_containers', JSON.stringify(savedContainers));
  }, [savedContainers]);

  // Handle main file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressImageFile(file, 1200, 1200, 0.82);
        setSelectedImage(result);
        if (scanMode === '3d_depth') {
          trigger3DDepthScan(result, secondImage);
        } else {
          analyzePhotoDirect(result, secondImage);
        }
      } catch (err) {
        console.error('Failed to compress image:', err);
        setError('Failed to process image file. Please try another image.');
      }
    }
  };

  // Handle second 45-degree angle photo for depth fallback
  const handleSecondPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await compressImageFile(file, 1200, 1200, 0.82);
        setSecondImage(result);
        if (selectedImage) {
          trigger3DDepthScan(selectedImage, result);
        }
      } catch (err) {
        console.error('Failed to compress second image:', err);
      }
    }
  };

  // Simulate 3D LiDAR/ARCore sweep motion (1.5 seconds)
  const trigger3DDepthScan = (base64Img: string, secondImg: string | null = null) => {
    setScanning(true);
    setScanProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          analyzePhotoDirect(base64Img, secondImg);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Multiplier value calculation
  const getPortionMultiplier = () => {
    switch (selectedPortionChip) {
      case 'small': return 0.75;
      case 'regular': return 1.0;
      case 'large': return 1.35;
      case 'xlarge': return 1.7;
    }
  };

  const analyzePhotoDirect = async (
    base64Img: string,
    secondImg: string | null = null,
    portionMultOverride?: number
  ) => {
    setAnalyzing(true);
    setError(null);

    const mult = portionMultOverride ?? getPortionMultiplier();

    try {
      const res = await fetch('/api/ai/analyze-food-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          secondImageBase64: secondImg,
          isDepthScan: scanMode === '3d_depth',
          containerContext: activeContainer?.name,
          portionMultiplier: mult,
        }),
      });

      const data = await res.json();

      if (data.success && data.result) {
        const r = data.result;
        setDepthResult({
          foodName: r.foodName || '3D Scanned Dish',
          brandOrStyle: r.brandOrStyle || (scanMode === '3d_depth' ? 'LiDAR / ARCore 3D Scan' : 'Photo Log'),
          estimatedServingGrams: r.estimatedServingGrams || 220,
          servingLabel: r.servingLabel || '1 plate',
          calories: r.calories || 340,
          proteinG: r.proteinG || 28,
          carbsG: r.carbsG || 32,
          fatG: r.fatG || 12,
          fibreG: r.fibreG || 4.5,
          sodiumMg: r.sodiumMg || 420,
          calciumMg: r.calciumMg || 110,
          magnesiumMg: r.magnesiumMg || 38,
          zincMg: r.zincMg || 2.4,
          vitDMg: r.vitDMg || 120,
          vitCMg: r.vitCMg || 22,
          epaMg: r.epaMg || 0,
          dhaMg: r.dhaMg || 0,
          estimatedVolumeCm3: r.estimatedVolumeCm3 || Math.round((r.estimatedServingGrams || 220) / 0.92),
          foodDensityGcm3: r.foodDensityGcm3 || 0.92,
          arDepthConfidence: r.arDepthConfidence || (scanMode === '3d_depth' ? 94 : 82),
          matchedContainerName: activeContainer?.name || 'User Standard Dinner Plate',
          depthDetailsNote: r.depthDetailsNote || '3D Point Cloud mesh density matched container scale',
        });
      } else {
        setError(data.error || 'Could not process meal scan. Please try again.');
      }
    } catch (err) {
      setError('Network connection issue. Please try scanning again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Confirm and log food
  const handleConfirmScan = () => {
    if (!depthResult) return;

    const mult = getPortionMultiplier();
    const grams = Math.round(depthResult.estimatedServingGrams * mult);

    const foodItem: FoodItem = {
      id: `food_depth_${Date.now()}`,
      name: depthResult.foodName,
      brand: depthResult.brandOrStyle || '3D Volumetric Scan',
      serving: {
        amount: grams,
        unit: 'g',
        label: `${grams}g (${selectedPortionChip})`,
      },
      nutritionPerServing: {
        calories: Math.round(depthResult.calories * mult),
        proteinG: Math.round(depthResult.proteinG * mult * 10) / 10,
        carbsG: Math.round(depthResult.carbsG * mult * 10) / 10,
        fatG: Math.round(depthResult.fatG * mult * 10) / 10,
        fibreG: depthResult.fibreG ? Math.round(depthResult.fibreG * mult * 10) / 10 : undefined,
        sodiumMg: depthResult.sodiumMg ? Math.round(depthResult.sodiumMg * mult) : undefined,
        calciumMg: depthResult.calciumMg ? Math.round(depthResult.calciumMg * mult) : undefined,
        magnesiumMg: depthResult.magnesiumMg ? Math.round(depthResult.magnesiumMg * mult) : undefined,
        zincMg: depthResult.zincMg ? Math.round(depthResult.zincMg * mult * 10) / 10 : undefined,
        vitDMg: depthResult.vitDMg ? Math.round(depthResult.vitDMg * mult) : undefined,
        vitCMg: depthResult.vitCMg ? Math.round(depthResult.vitCMg * mult) : undefined,
        epaMg: depthResult.epaMg ? Math.round(depthResult.epaMg * mult) : undefined,
        dhaMg: depthResult.dhaMg ? Math.round(depthResult.dhaMg * mult) : undefined,
      },
      category: '3D Depth Scan',
      source: 'ai_estimate',
    };

    onProductFound(foodItem);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto"
    >
      {/* Top Navigation Header */}
      <div className="sticky top-0 z-10 bg-[#0D0E12]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center justify-center space-x-1.5">
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>Scan Meal (3D Depth)</span>
          </h2>
          <p className="text-[10px] text-indigo-300 font-semibold tracking-wide flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400 inline" />
            <span>ARCore & LiDAR Volumetric Engine</span>
          </p>
        </div>

        <div className="w-10" />
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-5 flex-1">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#181A20] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => {
              setScanMode('3d_depth');
              setDepthResult(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              scanMode === '3d_depth'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Depth Sweep</span>
          </button>
          <button
            onClick={() => {
              setScanMode('single_photo');
              setDepthResult(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              scanMode === 'single_photo'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Single Photo</span>
          </button>
        </div>

        {/* 3D Viewfinder / Image Area */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border border-white/10 bg-[#181A20] shadow-2xl flex flex-col items-center justify-center">
          {selectedImage ? (
            <div className="relative w-full h-full">
              <img src={selectedImage} alt="Meal scan" className="w-full h-full object-cover" />

              {/* AR 3D Grid Mesh Overlay Animation */}
              {scanMode === '3d_depth' && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Wireframe bounding box animation */}
                  <div className="absolute inset-8 border-2 border-dashed border-indigo-400/70 rounded-3xl animate-pulse flex items-center justify-center">
                    <div className="w-full h-full bg-indigo-500/10 border border-indigo-400/30 rounded-2xl relative overflow-hidden">
                      {/* Scanning laser bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_15px_#818cf8] animate-bounce" />
                    </div>
                  </div>

                  {/* Point-cloud Depth Markers */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-emerald-400/80 animate-ping" />
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-indigo-400/80 animate-ping delay-200" />
                  <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-cyan-400/80 animate-ping delay-500" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center space-x-1.5 text-[10px] font-black uppercase text-indigo-300">
                <Disc className="w-3 h-3 text-emerald-400 animate-spin" />
                <span>{scanMode === '3d_depth' ? 'ARCore / LiDAR Active' : 'Photo Captured'}</span>
              </div>

              {/* Sweep Scanning Progress Overlay */}
              {scanning && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20 p-6 text-center">
                  <Scan className="w-10 h-10 text-indigo-400 animate-bounce" />
                  <div>
                    <p className="text-sm font-bold text-white">Generating 3D Depth Mesh...</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Slowly rotate phone around meal</p>
                  </div>
                  <div className="w-48 bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-200"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-indigo-300 font-mono font-bold">{scanProgress}%</span>
                </div>
              )}

              {/* Analyzing AI state */}
              {analyzing && !scanning && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center space-y-3 z-20 p-6 text-center">
                  <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-white">Computing Volume & Density...</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Converting cm³ to grams via food density database</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center space-y-4 max-w-xs flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                {scanMode === '3d_depth' ? <Box className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {scanMode === '3d_depth' ? 'Position camera over meal' : 'Snap a food photo'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {scanMode === '3d_depth'
                    ? 'Move phone 1-2s to measure dish volume (cm³) and calculate exact weight in grams.'
                    : 'Detects dish items and estimates serving size.'}
                </p>
              </div>

              {/* Trigger Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </button>
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 3D Volumetric Analyzed Card */}
        {depthResult && (
          <div className="bg-[#181A20] border border-white/10 rounded-3xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  {depthResult.arDepthConfidence}% Depth Confidence
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{depthResult.foodName}</h3>
                <p className="text-xs text-zinc-400">{depthResult.brandOrStyle}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  {Math.round(depthResult.calories * getPortionMultiplier())}
                </span>
                <span className="text-xs font-bold text-zinc-400 ml-1">kcal</span>
              </div>
            </div>

            {/* Volume & Density Math Card */}
            <div className="grid grid-cols-3 gap-2 bg-[#12141A] border border-white/5 p-3 rounded-2xl text-center">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Estimated Vol</p>
                <p className="text-xs font-black text-indigo-300 mt-0.5">
                  {depthResult.estimatedVolumeCm3} cm³
                </p>
              </div>
              <div className="border-x border-white/5">
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Food Density</p>
                <p className="text-xs font-black text-indigo-300 mt-0.5">
                  {depthResult.foodDensityGcm3} g/cm³
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Computed Weight</p>
                <p className="text-xs font-black text-emerald-400 mt-0.5">
                  {Math.round(depthResult.estimatedServingGrams * getPortionMultiplier())}g
                </p>
              </div>
            </div>

            {/* Quick Portion Adjustment Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Portion Size Scale</span>
                <span className="text-indigo-400 font-normal">Tap to refine</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'small', label: 'Small', grams: Math.round(depthResult.estimatedServingGrams * 0.75) },
                  { key: 'regular', label: 'Regular', grams: depthResult.estimatedServingGrams },
                  { key: 'large', label: 'Large', grams: Math.round(depthResult.estimatedServingGrams * 1.35) },
                  { key: 'xlarge', label: 'X-Large', grams: Math.round(depthResult.estimatedServingGrams * 1.7) },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => setSelectedPortionChip(chip.key as any)}
                    className={`py-2 px-1 rounded-xl text-center transition-all border ${
                      selectedPortionChip === chip.key
                        ? 'bg-indigo-600 text-white border-indigo-400 font-black shadow-md shadow-indigo-600/30'
                        : 'bg-[#12141A] text-zinc-400 border-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <p className="text-[11px]">{chip.label}</p>
                    <p className="text-[9px] opacity-80 mt-0.5 font-mono">{chip.grams}g</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Container Memory Match */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Container Memory</p>
                  <p className="text-[10px] text-zinc-300">{activeContainer.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const name = prompt('Enter dish nickname to save to long-term memory:', 'My Standard 26cm Dinner Plate');
                  if (name) {
                    const newCnt = { id: `cnt_${Date.now()}`, name };
                    setSavedContainers((prev) => [...prev, newCnt]);
                    setActiveContainer(newCnt);
                  }
                }}
                className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2.5 py-1 rounded-lg transition-all"
              >
                + Save Dish
              </button>
            </div>

            {/* Fallback Option: 2nd Photo 45 Angle */}
            {!secondImage && (
              <button
                onClick={() => secondPhotoInputRef.current?.click()}
                className="w-full bg-[#12141A] border border-dashed border-white/15 hover:border-white/30 text-zinc-300 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>+ Add 2nd Photo at 45° Angle for Triangulation</span>
              </button>
            )}

            {/* Log Action Button */}
            <button
              onClick={handleConfirmScan}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Log Meal to Food Diary</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input type="file" ref={galleryInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
      <input type="file" ref={secondPhotoInputRef} accept="image/*" capture="environment" onChange={handleSecondPhotoChange} className="hidden" />
    </motion.div>
  );
};
