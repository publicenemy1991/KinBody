import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Edit2,
  Eye,
  Trash2,
} from 'lucide-react';
import { BodyScanEntry } from '../types';

interface EvoltUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScan: (scan: Omit<BodyScanEntry, 'id' | 'loggedAt'>) => void;
}

export const EvoltUploadModal: React.FC<EvoltUploadModalProps> = ({
  isOpen,
  onClose,
  onSaveScan,
}) => {
  const [step, setStep] = useState<'upload' | 'analysing' | 'review'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('Evolt 360 Scan');
  const [scanDate, setScanDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState<string>('80.0');
  const [bodyFatPercent, setBodyFatPercent] = useState<string>('18.0');
  const [skeletalMuscleKg, setSkeletalMuscleKg] = useState<string>('36.5');
  const [leanMassKg, setLeanMassKg] = useState<string>('65.6');
  const [fatMassKg, setFatMassKg] = useState<string>('14.4');
  const [visceralFatRating, setVisceralFatRating] = useState<string>('6');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setStep('analysing');
      setIsAnalyzing(true);

      try {
        const res = await fetch('/api/ai/parse-evolt-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            const r = data.result;
            if (r.title) setTitle(r.title);
            if (r.weightKg) setWeightKg(r.weightKg.toString());
            if (r.bodyFatPercent) setBodyFatPercent(r.bodyFatPercent.toString());
            if (r.skeletalMuscleKg) setSkeletalMuscleKg(r.skeletalMuscleKg.toString());
            if (r.leanMassKg) setLeanMassKg(r.leanMassKg.toString());
            if (r.fatMassKg) setFatMassKg(r.fatMassKg.toString());
            if (r.visceralFatRating) setVisceralFatRating(r.visceralFatRating.toString());
          }
        }
      } catch (err) {
        console.error('Failed to parse scan image:', err);
      } finally {
        setIsAnalyzing(false);
        setStep('review');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    const bf = parseFloat(bodyFatPercent);
    const sm = parseFloat(skeletalMuscleKg);
    const lm = parseFloat(leanMassKg);
    const fm = parseFloat(fatMassKg);
    const vf = parseInt(visceralFatRating, 10);

    onSaveScan({
      date: scanDate,
      title: title || 'Evolt 360 Scan',
      weightKg: !isNaN(w) ? w : undefined,
      bodyFatPercent: !isNaN(bf) ? bf : undefined,
      skeletalMuscleKg: !isNaN(sm) ? sm : undefined,
      leanMassKg: !isNaN(lm) ? lm : undefined,
      fatMassKg: !isNaN(fm) ? fm : undefined,
      visceralFatRating: !isNaN(vf) ? vf : undefined,
      scanImageUrl: imagePreview || undefined,
      source: 'evolt',
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep('upload');
    setImagePreview(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#181A20] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121418]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Evolt Scan</h2>
              <p className="text-[11px] text-zinc-400">
                {step === 'upload' && 'Select scan photo or printout'}
                {step === 'analysing' && 'AI extracting body composition metrics...'}
                {step === 'review' && 'Review and edit extracted values'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-8 text-center bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer space-y-3 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Drop or select Evolt 360 scan image
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports Evolt printouts, PDF screenshots, and camera photos
                  </p>
                </div>
                <span className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                  Choose Scan File
                </span>
              </div>

              <div className="p-4 bg-[#0D0E12] border border-white/5 rounded-2xl text-xs text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-200">✨ Automatic AI Extraction</p>
                <p>
                  Values for Weight, Body Fat %, Skeletal Muscle, Lean Mass, and Fat Mass will be automatically extracted for your review.
                </p>
              </div>
            </div>
          )}

          {step === 'analysing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-300 absolute inset-0 m-auto" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Analysing Body Scan...</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Extracting weight, muscle mass, body fat %, and visceral fat rating
                </p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <form onSubmit={handleConfirmSave} className="space-y-4">
              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-36 bg-black flex items-center justify-center group">
                  <img
                    src={imagePreview}
                    alt="Uploaded Scan"
                    className="object-cover w-full h-36"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-bold bg-black/60 px-3 py-1 rounded-full">
                      Original Scan Retained
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Scan Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Scan Date
                  </label>
                  <input
                    type="date"
                    value={scanDate}
                    onChange={(e) => setScanDate(e.target.value)}
                    className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-[#0D0E12] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white">Extracted Metrics</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">
                    Every field is editable
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Body Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-black focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Body Fat (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyFatPercent}
                      onChange={(e) => setBodyFatPercent(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-amber-400 font-black focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Skeletal Muscle (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={skeletalMuscleKg}
                      onChange={(e) => setSkeletalMuscleKg(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-indigo-400 font-black focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Lean Mass (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={leanMassKg}
                      onChange={(e) => setLeanMassKg(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-emerald-400 font-black focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Fat Mass (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatMassKg}
                      onChange={(e) => setFatMassKg(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-rose-400 font-black focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-semibold block mb-0.5">
                      Visceral Fat Rating
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={visceralFatRating}
                      onChange={(e) => setVisceralFatRating(e.target.value)}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-2 text-sm text-purple-400 font-black focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Upload Different Scan
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save Scan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
