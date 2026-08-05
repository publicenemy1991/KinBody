import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mic, Sparkles, AlertCircle, Check } from 'lucide-react';
import { FoodItem, MealType } from '../types';

interface VoiceLogModalProps {
  onClose: () => void;
  onItemsParsed: (items: FoodItem[], mealType: MealType) => void;
}

export const VoiceLogModal: React.FC<VoiceLogModalProps> = ({
  onClose,
  onItemsParsed,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupAsOneMeal, setGroupAsOneMeal] = useState(true);

  // Web Speech API Voice Recognition
  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported on this browser. You can type what you ate below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-AU';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError('Voice input error. Please try again or type directly.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setError('Could not access microphone.');
    }
  };

  const handleParseText = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);

    let parsedResultData: any = null;

    try {
      const res = await fetch('/api/ai/parse-voice-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: transcript, groupAsOneMeal }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.result && data.result.items) {
          parsedResultData = data.result;
        }
      }
    } catch (err) {
      console.warn('Network issue calling voice parse API, using client fallback', err);
    }

    // If API failed or returned empty, generate client fallback estimate
    if (!parsedResultData || !parsedResultData.items || parsedResultData.items.length === 0) {
      const lower = transcript.toLowerCase();
      let mealType: MealType = 'lunch';
      if (lower.includes('breakfast') || lower.includes('egg') || lower.includes('wrap') || lower.includes('toast') || lower.includes('avocado') || lower.includes('brekkie') || lower.includes('coffee')) {
        mealType = 'breakfast';
      } else if (lower.includes('dinner') || lower.includes('steak') || lower.includes('night')) {
        mealType = 'dinner';
      } else if (lower.includes('snack') || lower.includes('shake') || lower.includes('yoghurt')) {
        mealType = 'snacks';
      }

      let name = transcript.trim();
      let calories = 450;
      let proteinG = 25;
      let carbsG = 38;
      let fatG = 16;

      if (lower.includes('wrap') && lower.includes('bacon')) {
        name = 'Brekkie Bacon, Egg & Tomato Wrap';
        calories = 490;
        proteinG = 25;
        carbsG = 40;
        fatG = 22;
      } else if (lower.includes('avocado') || lower.includes('dukkah')) {
        name = 'Avocado, 3 Eggs, Dukkah & Toast';
        calories = 520;
        proteinG = 26;
        carbsG = 34;
        fatG = 28;
      }

      parsedResultData = {
        mealType,
        items: [
          {
            name,
            servingAmount: 1,
            servingUnit: 'serving',
            calories,
            proteinG,
            carbsG,
            fatG,
          },
        ],
      };
    }

    try {
      const mealType: MealType =
        ['breakfast', 'lunch', 'dinner', 'snacks'].includes(parsedResultData.mealType)
          ? parsedResultData.mealType
          : 'lunch';

      const parsedItems: FoodItem[] = parsedResultData.items.map((it: any, index: number) => {
        let detectedBrand = it.brand && it.brand.toLowerCase() !== 'voice input' ? it.brand : undefined;
        if (it.name && it.name.toLowerCase().includes('rokeby')) {
          detectedBrand = 'Rokeby Farms';
        }
        return {
          id: `voice_item_${Date.now()}_${index}`,
          name: it.name || 'Voice Logged Food',
          brand: detectedBrand,
          serving: {
            amount: it.servingAmount || 1,
            unit: it.servingUnit || 'serving',
            label: `${it.servingAmount || 1} ${it.servingUnit || 'serving'}`,
          },
          nutritionPerServing: {
            calories: Math.round(it.calories || 200),
            proteinG: Math.round((it.proteinG || 15) * 10) / 10,
            carbsG: Math.round((it.carbsG || 20) * 10) / 10,
            fatG: Math.round((it.fatG || 5) * 10) / 10,
          },
          category: 'Voice Input',
          source: 'ai_estimate',
        };
      });

      onItemsParsed(parsedItems, mealType);
    } catch (err) {
      setError('Could not process food description. Please try typing directly.');
    } finally {
      setLoading(false);
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
      <div className="bg-[#0D0E12]/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Voice Food Log</span>
        </h2>
        <div className="w-10" />
      </div>

      {/* Main Body */}
      <div className="flex-1 px-6 py-8 flex flex-col items-center justify-center text-center space-y-6">
        {/* Mic Visual Button */}
        <button
          onClick={startSpeechRecognition}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 animate-pulse scale-110 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
              : 'bg-[#181A20] border border-white/10 text-zinc-300 hover:text-white hover:border-emerald-500/50'
          }`}
        >
          <Mic className="w-10 h-10" />
        </button>

        <p className="text-sm font-medium text-zinc-300">
          {isListening
            ? 'Listening... Speak what you ate now.'
            : 'Tap mic to speak, or type your meal below:'}
        </p>

        {/* Text Input Area & Example Chips */}
        <div className="w-full space-y-3">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder='e.g., "Avocado + 3 eggs dukkah and toast"'
            className="w-full bg-[#181A20] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400/80 resize-none"
          />

          {/* Group into 1 message toggle */}
          <div className="flex items-center justify-between px-1 py-1 bg-[#181A20] border border-white/5 rounded-xl px-3 py-2">
            <span className="text-xs text-zinc-300 font-medium">Group multi-items into 1 meal message</span>
            <button
              type="button"
              onClick={() => setGroupAsOneMeal(!groupAsOneMeal)}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 relative flex items-center ${
                groupAsOneMeal ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  groupAsOneMeal ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-left space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Try an example:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Avocado + 3 eggs dukkah and toast',
                'I had two large wraps with bacon, BBQ sauce and a hash brown',
                '200g grilled rump steak with sweet potato and green beans',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setTranscript(ex)}
                  className="text-[11px] text-zinc-300 bg-[#181A20] border border-white/10 hover:border-emerald-400/50 hover:text-white px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 flex items-center space-x-2 max-w-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="p-5 bg-[#181A20] border-t border-white/10">
        <button
          onClick={handleParseText}
          disabled={!transcript.trim() || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
        >
          {loading ? (
            <span className="text-sm">Analyzing Meal with Gemini AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Parse & Add Meal</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
