import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Minus, Check, Flame, ShieldAlert } from 'lucide-react';
import { FoodItem, MealType } from '../types';

interface FoodDetailViewProps {
  foodItem: FoodItem;
  defaultMealType?: MealType;
  onClose: () => void;
  onConfirmAdd: (
    item: FoodItem,
    servings: number,
    mealType: MealType
  ) => void;
}

export const FoodDetailView: React.FC<FoodDetailViewProps> = ({
  foodItem,
  defaultMealType = 'lunch',
  onClose,
  onConfirmAdd,
}) => {
  const [servings, setServings] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMealType);

  const cal = Math.round((foodItem.nutritionPerServing.calories || 0) * servings);
  const pro = Math.round((foodItem.nutritionPerServing.proteinG || 0) * servings * 10) / 10;
  const carb = Math.round((foodItem.nutritionPerServing.carbsG || 0) * servings * 10) / 10;
  const fat = Math.round((foodItem.nutritionPerServing.fatG || 0) * servings * 10) / 10;
  const fibre = foodItem.nutritionPerServing.fibreG
    ? Math.round(foodItem.nutritionPerServing.fibreG * servings * 10) / 10
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D0E12]/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-white tracking-tight">
          Review Serving
        </h2>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="px-5 py-6 space-y-6 flex-1">
        {/* Item Title & Brand */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              {foodItem.brand &&
                !['voice input', 'camera log', '3d depth scan', 'photo log', 'custom entry', 'custom', 'ai estimate'].includes(
                  foodItem.brand.toLowerCase()
                ) && (
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2.5 py-0.5 rounded-lg mb-1.5 shadow-sm">
                    {foodItem.brand}
                  </span>
                )}
              <h1 className="text-xl font-bold text-white tracking-tight">
                {foodItem.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {foodItem.serving.amount} {foodItem.serving.unit} base serving
              </p>
            </div>
            {foodItem.barcode && (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 border border-white/10 text-zinc-400 rounded-md">
                EAN: {foodItem.barcode}
              </span>
            )}
          </div>

          {/* Quick Primary Macro Highlights */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/5 text-center">
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-400 block">Calories</span>
              <span className="text-base font-bold text-white">{cal}</span>
            </div>
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
              <span className="text-xs text-indigo-400 block font-medium">Protein</span>
              <span className="text-base font-bold text-indigo-300">{pro}g</span>
            </div>
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-400 block">Carbs</span>
              <span className="text-base font-bold text-white">{carb}g</span>
            </div>
            <div className="bg-[#0D0E12] p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-zinc-400 block">Fat</span>
              <span className="text-base font-bold text-white">{fat}g</span>
            </div>
          </div>
        </div>

        {/* Serving Adjustment */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
            Number of Servings
          </label>
          <div className="flex items-center justify-between bg-[#0D0E12] border border-white/10 rounded-xl p-2">
            <button
              onClick={() => setServings(Math.max(0.25, Math.round((servings - 0.25) * 100) / 100))}
              className="w-10 h-10 rounded-lg bg-[#181A20] text-zinc-300 hover:text-white flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{servings}</span>
              <span className="text-xs text-zinc-400 block">
                ({Math.round(foodItem.serving.amount * servings)}{' '}
                {foodItem.serving.unit})
              </span>
            </div>
            <button
              onClick={() => setServings(Math.round((servings + 0.25) * 100) / 100)}
              className="w-10 h-10 rounded-lg bg-[#181A20] text-zinc-300 hover:text-white flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meal Category Select */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block px-1">
            Assign to Meal
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMeal(m)}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                  selectedMeal === m
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-[#181A20] border-white/10 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Micronutrients Breakdown */}
        {(() => {
          const n = foodItem.nutritionPerServing;
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
              name: 'Omega-3',
              val: (n.epaMg || n.dhaMg)
                ? Math.round(((n.epaMg || 0) + (n.dhaMg || 0)) * servings)
                : undefined,
              unit: 'mg',
              icon: '🐟',
              color: 'text-teal-300',
            },
            { name: 'Fiber', val: fibre, unit: 'g', icon: '🥬', color: 'text-emerald-400' },
          ].filter((m) => m.val !== undefined && m.val > 0);

          if (microList.length === 0) return null;

          return (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block px-1">
                  Micronutrients
                </span>
                <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                  {microList.length} Nutrients
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {microList.map((m) => (
                  <div key={m.name} className="bg-[#181A20] border border-white/10 rounded-xl p-2.5 flex items-center space-x-2.5">
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-medium">{m.name}</span>
                      <span className={`text-xs font-extrabold ${m.color}`}>{m.val} {m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Primary Action Button */}
      <div className="p-5 bg-[#181A20] border-t border-white/10">
        <button
          onClick={() => onConfirmAdd(foodItem, servings, selectedMeal)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>Add to Food Log</span>
        </button>
      </div>
    </motion.div>
  );
};
