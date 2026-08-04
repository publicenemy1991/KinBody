import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, Check, Flame, Sparkles, Shield, Tag } from 'lucide-react';
import { LoggedFoodEntry, MealType } from '../types';

interface LoggedFoodDetailModalProps {
  entry: LoggedFoodEntry;
  onClose: () => void;
  onDeleteEntry: (id: string) => void;
  onUpdateServings?: (id: string, newServings: number) => void;
  onUpdateMealType?: (id: string, newMealType: MealType) => void;
}

export const LoggedFoodDetailModal: React.FC<LoggedFoodDetailModalProps> = ({
  entry,
  onClose,
  onDeleteEntry,
  onUpdateServings,
  onUpdateMealType,
}) => {
  const [servings, setServings] = useState(entry.servings);

  const { foodItem, mealType } = entry;
  const n = foodItem.nutritionPerServing;

  const cal = Math.round((n.calories || 0) * servings);
  const pro = Math.round((n.proteinG || 0) * servings * 10) / 10;
  const carb = Math.round((n.carbsG || 0) * servings * 10) / 10;
  const fat = Math.round((n.fatG || 0) * servings * 10) / 10;
  const fibre = n.fibreG ? Math.round(n.fibreG * servings * 10) / 10 : undefined;

  // Micronutrients scaled to current servings
  const microList = [
    { name: 'Calcium', val: n.calciumMg ? Math.round(n.calciumMg * servings) : undefined, unit: 'mg', icon: '🦴', color: 'text-amber-300' },
    { name: 'Iron', val: n.ironMg ? Math.round(n.ironMg * servings * 10) / 10 : undefined, unit: 'mg', icon: '🩸', color: 'text-red-400' },
    { name: 'Magnesium', val: n.magnesiumMg ? Math.round(n.magnesiumMg * servings) : undefined, unit: 'mg', icon: '⚡', color: 'text-purple-400' },
    { name: 'Zinc', val: n.zincMg ? Math.round(n.zincMg * servings * 10) / 10 : undefined, unit: 'mg', icon: '🛡️', color: 'text-blue-400' },
    { name: 'Potassium', val: n.potassiumMg ? Math.round(n.potassiumMg * servings) : undefined, unit: 'mg', icon: '🍌', color: 'text-yellow-400' },
    { name: 'Sodium', val: n.sodiumMg ? Math.round(n.sodiumMg * servings) : undefined, unit: 'mg', icon: '🧂', color: 'text-zinc-300' },
    { name: 'Vitamin D', val: n.vitDMg ? Math.round(n.vitDMg * servings) : undefined, unit: 'IU', icon: '☀️', color: 'text-amber-400' },
    { name: 'Vitamin C', val: n.vitCMg ? Math.round(n.vitCMg * servings) : undefined, unit: 'mg', icon: '🍋', color: 'text-yellow-300' },
    {
      name: 'Omega-3 (EPA/DHA)',
      val: (n.epaMg || n.dhaMg)
        ? Math.round(((n.epaMg || 0) + (n.dhaMg || 0)) * servings)
        : undefined,
      unit: 'mg',
      icon: '🐟',
      color: 'text-teal-300',
    },
    { name: 'Dietary Fiber', val: fibre, unit: 'g', icon: '🥬', color: 'text-emerald-400' },
  ].filter((m) => m.val !== undefined && m.val > 0);

  const handleServingsChange = (newVal: number) => {
    const clamped = Math.max(0.25, Math.round(newVal * 100) / 100);
    setServings(clamped);
    if (onUpdateServings) {
      onUpdateServings(entry.id, clamped);
    }
  };

  const mealTypeLabel: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snack',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D0E12]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-white tracking-tight">
          Logged Item Details
        </h2>
        <button
          onClick={() => {
            onDeleteEntry(entry.id);
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
          title="Delete logged food"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-5 py-6 space-y-6 flex-1">
        {/* Title, Brand, Category Header */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg">
              {mealTypeLabel[mealType]}
            </span>
            {foodItem.brand &&
              !['voice input', 'camera log', '3d depth scan', 'photo log', 'custom entry', 'custom', 'ai estimate'].includes(
                foodItem.brand.toLowerCase()
              ) && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  {foodItem.brand}
                </span>
              )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {foodItem.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Base serving: {foodItem.serving.amount} {foodItem.serving.unit} {foodItem.serving.label ? `(${foodItem.serving.label})` : ''}
            </p>
          </div>

          {/* Primary Macros */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5 text-center">
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-medium uppercase">Calories</span>
              <span className="text-base font-black text-white">{cal}</span>
              <span className="text-[9px] text-zinc-500 block">kcal</span>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block font-bold uppercase">Protein</span>
              <span className="text-base font-black text-emerald-300">{pro}g</span>
              <span className="text-[9px] text-emerald-400/70 block">macro</span>
            </div>
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-medium uppercase">Carbs</span>
              <span className="text-base font-black text-white">{carb}g</span>
              <span className="text-[9px] text-zinc-500 block">macro</span>
            </div>
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-medium uppercase">Fat</span>
              <span className="text-base font-black text-white">{fat}g</span>
              <span className="text-[9px] text-zinc-500 block">macro</span>
            </div>
          </div>
        </div>

        {/* Meal Category Switcher */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block">
            Meal Category
          </label>
          <div className="grid grid-cols-4 gap-1.5 bg-[#0D0E12] p-1.5 rounded-xl border border-white/5">
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((m) => (
              <button
                key={m}
                onClick={() => onUpdateMealType && onUpdateMealType(entry.id, m)}
                className={`py-2 px-1 text-[11px] font-extrabold rounded-lg capitalize transition-all ${
                  mealType === m
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Servings Modifier */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-4 space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block">
            Logged Serving Size
          </label>
          <div className="flex items-center justify-between bg-[#0D0E12] border border-white/10 rounded-xl p-2">
            <button
              onClick={() => handleServingsChange(servings - 0.25)}
              className="w-10 h-10 rounded-lg bg-[#181A20] border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-white">{servings}x</span>
              <span className="text-[11px] text-zinc-400 block">
                ({Math.round(foodItem.serving.amount * servings)} {foodItem.serving.unit})
              </span>
            </div>
            <button
              onClick={() => handleServingsChange(servings + 0.25)}
              className="w-10 h-10 rounded-lg bg-[#181A20] border border-white/5 text-zinc-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Micronutrients Breakdown Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Micronutrient Profile</span>
            </h3>
            <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              {microList.length} Nutrients
            </span>
          </div>

          {microList.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {microList.map((m) => (
                <div
                  key={m.name}
                  className="bg-[#181A20] border border-white/10 rounded-xl p-3 flex items-center space-x-3"
                >
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-semibold">
                      {m.name}
                    </span>
                    <span className={`text-sm font-extrabold ${m.color}`}>
                      {m.val} {m.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#181A20] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs text-zinc-400">
                Standard macronutrients (Protein, Carbs, Fat) logged for this item.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Done / Close Button */}
      <div className="p-5 bg-[#181A20] border-t border-white/10">
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Done</span>
        </button>
      </div>
    </motion.div>
  );
};
