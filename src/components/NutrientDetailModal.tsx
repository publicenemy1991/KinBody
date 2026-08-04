import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Plus, Check, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { LoggedFoodEntry } from '../types';
import { NUTRIENT_EVIDENCE_MAP } from '../data/mockData';

interface NutrientDetailModalProps {
  nutrientKey: string;
  loggedEntries: LoggedFoodEntry[];
  proteinTargetG: number;
  calorieTarget?: number;
  onClose: () => void;
}

const ALL_NUTRIENT_TABS = [
  { key: 'calories', label: 'Calories', icon: '🎯', unit: 'kcal' },
  { key: 'protein', label: 'Protein', icon: '🥩', unit: 'g' },
  { key: 'omega3', label: 'Omega-3', icon: '🐟', unit: 'mg' },
  { key: 'vit_d', label: 'Vitamin D3', icon: '☀️', unit: 'IU' },
  { key: 'vit_c', label: 'Vitamin C', icon: '🍋', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', icon: '⚡', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', icon: '🛡️', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', icon: '🥛', unit: 'mg' },
  { key: 'fibre', label: 'Fiber', icon: '🥬', unit: 'g' },
];

export const NutrientDetailModal: React.FC<NutrientDetailModalProps> = ({
  nutrientKey,
  loggedEntries,
  proteinTargetG,
  calorieTarget = 2100,
  onClose,
}) => {
  const [activeKey, setActiveKey] = useState<string>(nutrientKey.toLowerCase());
  const [supplementLogged, setSupplementLogged] = useState(false);
  const [aiEvidence, setAiEvidence] = useState<{
    whyItMatters?: string;
    evidenceStars?: number;
    evidenceSummary?: string;
  } | null>(null);

  const defaultData = NUTRIENT_EVIDENCE_MAP[activeKey] || {
    key: activeKey,
    name: activeKey.toUpperCase(),
    dailyTargetText: 'Target Active',
    currentValue: 0,
    targetValue: 100,
    unit: 'mg',
    statusLabel: 'Good' as const,
    description: 'Essential nutrient for body recomposition and overall metabolic balance.',
    whyItMatters:
      'Supports cellular repair, metabolic efficiency, and tissue preservation.',
    evidenceStrengthStars: 5,
    topSourcesToday: [],
    evidenceNotes: 'Key meta-analyses confirm its essential role in metabolic health.',
  };

  // Calculate actual total from today's logged entries for the active nutrient
  let calculatedCurrent = 0;
  const sourcesFromToday: Array<{ foodName: string; amountText: string; val: number }> = [];

  loggedEntries.forEach((entry) => {
    const servings = entry.servings || 1;
    const item = entry.foodItem;
    let amt = 0;

    const k = activeKey.toLowerCase();
    if (k === 'calories' || k === 'energy' || k === 'kcal') {
      amt = (item.nutritionPerServing.calories || 0) * servings;
    } else if (k === 'protein') {
      amt = (item.nutritionPerServing.proteinG || 0) * servings;
    } else if (k === 'omega3' || k === 'epa' || k === 'dha') {
      amt = ((item.nutritionPerServing.epaMg || 0) + (item.nutritionPerServing.dhaMg || 0)) * servings;
    } else if (k === 'vit_d' || k === 'vitamin_d') {
      amt = (item.nutritionPerServing.vitDMg || 0) * servings;
    } else if (k === 'vit_c' || k === 'vitamin_c') {
      amt = (item.nutritionPerServing.vitCMg || 0) * servings;
    } else if (k === 'magnesium') {
      amt = (item.nutritionPerServing.magnesiumMg || 0) * servings;
    } else if (k === 'zinc') {
      amt = (item.nutritionPerServing.zincMg || 0) * servings;
    } else if (k === 'calcium') {
      amt = (item.nutritionPerServing.calciumMg || 0) * servings;
    } else if (k === 'fibre' || k === 'fiber') {
      amt = (item.nutritionPerServing.fibreG || 0) * servings;
    }

    if (amt > 0) {
      calculatedCurrent += amt;
      sourcesFromToday.push({
        foodName: `${item.name} (${servings > 1 ? `${servings}x` : `${item.serving.amount}${item.serving.unit}`})`,
        amountText: `${Math.round(amt)} ${defaultData.unit}`,
        val: amt,
      });
    }
  });

  const targetVal =
    activeKey === 'calories'
      ? calorieTarget
      : activeKey === 'protein'
      ? proteinTargetG
      : defaultData.targetValue;

  // Add extra if supplement toggle clicked
  let extraSupplementAmt = 0;
  if (supplementLogged) {
    if (activeKey === 'omega3' || activeKey === 'epa' || activeKey === 'dha') extraSupplementAmt = 1000;
    else if (activeKey === 'vit_d') extraSupplementAmt = 1000;
    else if (activeKey === 'vit_c') extraSupplementAmt = 500;
    else if (activeKey === 'magnesium') extraSupplementAmt = 200;
    else if (activeKey === 'zinc') extraSupplementAmt = 10;
  }

  const finalCurrent = Math.round(calculatedCurrent + extraSupplementAmt);
  const pct = Math.min(100, Math.round((finalCurrent / targetVal) * 100));

  const finalSources =
    sourcesFromToday.length > 0
      ? sourcesFromToday
      : supplementLogged
      ? [{ foodName: 'Logged Supplement Dose', amountText: `${extraSupplementAmt} ${defaultData.unit}`, val: extraSupplementAmt }]
      : defaultData.topSourcesToday.map((s) => ({
          foodName: s.foodName,
          amountText: s.amountText,
          val: 0,
        }));

  // Fetch AI evidence breakdown when switching active nutrient
  useEffect(() => {
    fetch('/api/ai/nutrient-evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nutrientName: defaultData.name }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.result) {
          setAiEvidence(data.result);
        }
      })
      .catch(() => {});
  }, [activeKey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col overflow-y-auto sm:max-w-md sm:mx-auto"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[#0D0E12]/95 backdrop-blur-md px-5 py-4 border-b border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center justify-center space-x-1.5">
              <span>{defaultData.name}</span>
            </h2>
            <p className="text-[11px] text-indigo-400 font-semibold tracking-wide">
              Huberman & Science Targets
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Horizontal Nutrient Pill Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {ALL_NUTRIENT_TABS.map((tab) => {
            const isSelected = activeKey === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveKey(tab.key);
                  setSupplementLogged(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'bg-[#181A20] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5 pb-20">
        {/* Main Status Visual */}
        <div className="bg-[#181A20] border border-white/10 rounded-3xl p-6 text-center flex flex-col items-center relative overflow-hidden shadow-lg">
          <div className="flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-extrabold">
              {defaultData.dailyTargetText}
            </span>
          </div>

          {/* Radial Ring / Value display */}
          <div className="relative w-44 h-44 flex items-center justify-center my-3">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-zinc-800"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray="263.8"
                strokeDashoffset={263.8 - (263.8 * Math.min(100, pct)) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {finalCurrent.toLocaleString()}
                <span className="text-base font-bold text-zinc-400 ml-1">
                  {defaultData.unit}
                </span>
              </span>
              <span className="text-xs text-indigo-400 font-extrabold mt-0.5">
                {pct}% achieved
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">
                Target: {targetVal.toLocaleString()} {defaultData.unit}
              </span>
            </div>
          </div>

          <div
            className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              pct >= 100
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : pct >= 60
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}
          >
            {pct >= 100 ? '✅ Target Achieved' : pct >= 60 ? '⚡ Good Progress' : '🎯 Below Target'}
          </div>
        </div>

        {/* Huberman Target Comparison Card */}
        <div className="bg-gradient-to-br from-[#181A20] to-[#12141A] border border-indigo-500/20 rounded-2xl p-4.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Scientific Baseline</span>
            </span>
            <span className="text-[10px] font-extrabold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-zinc-300">
              Protocol Benchmark
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            {defaultData.dailyTargetText}
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {defaultData.description}
          </p>
        </div>

        {/* Today's Logged Sources */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Today's Sources
            </h3>
            <span className="text-[11px] font-semibold text-zinc-400">
              {finalSources.length} item{finalSources.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-[#181A20] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
            {finalSources.length > 0 ? (
              finalSources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-sm text-zinc-200 font-bold">
                      {source.foodName}
                    </span>
                  </div>
                  <span className="text-sm text-indigo-300 font-mono font-bold">
                    {source.amountText}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-zinc-400 font-medium">
                No food logged today containing {defaultData.name} yet.
              </div>
            )}
          </div>
        </div>

        {/* Evidence & Why it Matters */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            <span>Why is {defaultData.name} important?</span>
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {aiEvidence?.whyItMatters || defaultData.whyItMatters}
          </p>

          {defaultData.evidenceNotes && (
            <p className="text-[11px] text-zinc-400 italic bg-white/5 p-3 rounded-xl border border-white/5">
              "{defaultData.evidenceNotes}"
            </p>
          )}

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold">
              Evidence Rating
            </span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (aiEvidence?.evidenceStars || defaultData.evidenceStrengthStars)
                      ? 'text-indigo-400 fill-indigo-400'
                      : 'text-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Supplement Log Quick Add */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white font-bold">Quick Log Supplement Dose</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Record supplement intake for {defaultData.name}
            </p>
          </div>
          <button
            onClick={() => setSupplementLogged(!supplementLogged)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              supplementLogged
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
            }`}
          >
            {supplementLogged ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Log Dose</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

