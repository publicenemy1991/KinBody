import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Sparkles,
  Flame,
  Target,
  Scan,
  Barcode,
  GripVertical,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  Utensils,
  Mic,
  Camera,
  PieChart,
  Activity,
  Dumbbell,
  Wheat,
  Droplet,
  ShieldCheck,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import {
  LoggedFoodEntry,
  MealType,
  UserProfile,
} from '../types';
import {
  getTodayString,
  getLocalDateString,
  formatDateDisplay,
  offsetDateString,
} from '../utils/dateUtils';

interface FoodHomeViewProps {
  userProfile: UserProfile;
  loggedEntries: LoggedFoodEntry[];
  activityCaloriesToday?: number;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onOpenLogModal: () => void;
  onOpenVoiceLog?: () => void;
  onOpenNutrientDetail: (nutrientKey: string) => void;
  onDeleteEntry: (id: string) => void;
  onSelectEntry?: (entry: LoggedFoodEntry) => void;
  onUpdateEntryMealType?: (id: string, newMealType: MealType) => void;
}

export const FoodHomeView: React.FC<FoodHomeViewProps> = ({
  userProfile,
  loggedEntries,
  activityCaloriesToday = 0,
  selectedDate = getTodayString(),
  onDateChange,
  onOpenLogModal,
  onOpenVoiceLog,
  onOpenNutrientDetail,
  onDeleteEntry,
  onSelectEntry,
  onUpdateEntryMealType,
}) => {
  // Navigation Tabs: 'log' vs 'nutrition'
  const [mainSubTab, setMainSubTab] = useState<'log' | 'nutrition'>('log');
  // Nutrition Sub-Tabs: 'calories' | 'nutrients' | 'macros'
  const [nutritionTab, setNutritionTab] = useState<'calories' | 'nutrients' | 'macros'>('calories');
  // Selected Nutrient for Nutrients Tab Sources View
  const [activeNutrientKey, setActiveNutrientKey] = useState<string | null>(null);

  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<MealType | null>(null);
  const [activeMoveEntryId, setActiveMoveEntryId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture & directional state
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<number>(1); // 1 = forward (next day), -1 = backward (prev day)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasTriggeredThresholdHapticRef = useRef<boolean>(false);

  const dateInfo = formatDateDisplay(selectedDate);
  const todayStr = getTodayString();

  const prevDateStr = offsetDateString(selectedDate, -1);
  const nextDateStr = offsetDateString(selectedDate, 1);
  const prevDateInfo = formatDateDisplay(prevDateStr);
  const nextDateInfo = formatDateDisplay(nextDateStr);

  const handlePrevDay = () => {
    setSwipeDirection(-1);
    const prev = offsetDateString(selectedDate, -1);
    onDateChange?.(prev);
  };

  const handleNextDay = () => {
    setSwipeDirection(1);
    const next = offsetDateString(selectedDate, 1);
    onDateChange?.(next);
  };

  // Drag Threshold Configuration
  const SWIPE_THRESHOLD_PX = 40;

  // Touch & Mouse Edge Gesture Navigation Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      hasTriggeredThresholdHapticRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartRef.current.x;
    const deltaY = currentY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) {
      setIsSwiping(true);
      setSwipeOffset(deltaX);

      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && !hasTriggeredThresholdHapticRef.current) {
        hasTriggeredThresholdHapticRef.current = true;
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(8);
          } catch (e) {}
        }
      } else if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX * 0.7) {
        hasTriggeredThresholdHapticRef.current = false;
      }
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping) {
      if (swipeOffset <= -SWIPE_THRESHOLD_PX) {
        handleNextDay();
      } else if (swipeOffset >= SWIPE_THRESHOLD_PX) {
        handlePrevDay();
      }
    }
    setIsSwiping(false);
    setSwipeOffset(0);
    touchStartRef.current = null;
  };

  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange?.(e.target.value);
    }
  };

  // Filter food entries strictly for selectedDate
  const dayFoodEntries = loggedEntries.filter((e) => {
    const entryDate = e.date || getLocalDateString(new Date(e.loggedAt));
    return entryDate === selectedDate;
  });

  // Calculate consumed macros & nutrients for selectedDate (100% Real Data)
  const totalCalories = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );
  const totalProtein = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.proteinG || 0) * e.servings,
    0
  );
  const totalFat = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.fatG || 0) * e.servings,
    0
  );
  const totalCarbs = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.carbsG || 0) * e.servings,
    0
  );
  const totalFibre = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.fibreG || 0) * e.servings,
    0
  );
  const totalSaturatedFat = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.saturatedFatG || 0) * e.servings,
    0
  );
  const totalSugar = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.sugarG || 0) * e.servings,
    0
  );
  const totalSodium = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.sodiumMg || 0) * e.servings,
    0
  );
  const totalVitD = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.vitDMg || 0) * e.servings,
    0
  );
  const totalMagnesium = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.magnesiumMg || 0) * e.servings,
    0
  );
  const totalIron = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.ironMg || 0) * e.servings,
    0
  );
  const totalCalcium = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.calciumMg || 0) * e.servings,
    0
  );
  const totalPotassium = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.potassiumMg || 0) * e.servings,
    0
  );
  const totalOmega3 = dayFoodEntries.reduce(
    (sum, e) =>
      sum +
      ((e.foodItem.nutritionPerServing.epaMg || 0) +
        (e.foodItem.nutritionPerServing.dhaMg || 0)) *
        e.servings,
    0
  );

  const calTarget = userProfile.calorieTarget || 2259;
  const proTarget = userProfile.proteinTargetG || 160;
  const carbsTarget = userProfile.carbsTargetG || 240;
  const fatTarget = userProfile.fatTargetG || 70;
  const fibreTarget = 30;

  const calRemaining = Math.max(0, calTarget - Math.round(totalCalories));
  const proRemaining = Math.max(0, Math.round(proTarget - totalProtein));
  const carbsRemaining = Math.max(0, Math.round(carbsTarget - totalCarbs));
  const fatRemaining = Math.max(0, Math.round(fatTarget - totalFat));
  const fibreRemaining = Math.max(0, Math.round(fibreTarget - totalFibre));

  const proPct = Math.min(100, Math.round((totalProtein / proTarget) * 100));
  const calPct = Math.min(100, Math.round((totalCalories / calTarget) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / fatTarget) * 100));
  const fibrePct = Math.min(100, Math.round((totalFibre / fibreTarget) * 100));

  // Calories by meal calculations
  const breakfastEntries = dayFoodEntries.filter((e) => e.mealType === 'breakfast');
  const lunchEntries = dayFoodEntries.filter((e) => e.mealType === 'lunch');
  const dinnerEntries = dayFoodEntries.filter((e) => e.mealType === 'dinner');
  const snackEntries = dayFoodEntries.filter(
    (e) => e.mealType === 'snacks' || e.mealType === 'pre_workout' || e.mealType === 'post_workout'
  );

  const calsBreakfast = breakfastEntries.reduce(
    (s, e) => s + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );
  const calsLunch = lunchEntries.reduce(
    (s, e) => s + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );
  const calsDinner = dinnerEntries.reduce(
    (s, e) => s + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );
  const calsSnack = snackEntries.reduce(
    (s, e) => s + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );

  const bfastCal = Math.round(calsBreakfast);
  const lunchCal = Math.round(calsLunch);
  const dinnerCal = Math.round(calsDinner);
  const snackCal = Math.round(calsSnack);
  const displayTotalCals = Math.round(totalCalories);
  const displayActivityCals = activityCaloriesToday || 0;
  const displayNetCals = displayTotalCals - displayActivityCals;

  const totalCalBreakdown = bfastCal + lunchCal + dinnerCal + snackCal;
  const bfastPct = totalCalBreakdown > 0 ? Math.round((bfastCal / totalCalBreakdown) * 100) : 0;
  const lunchPct = totalCalBreakdown > 0 ? Math.round((lunchCal / totalCalBreakdown) * 100) : 0;
  const dinnerPct = totalCalBreakdown > 0 ? Math.round((dinnerCal / totalCalBreakdown) * 100) : 0;
  const snackPct = totalCalBreakdown > 0 ? Math.max(0, 100 - bfastPct - lunchPct - dinnerPct) : 0;

  // Macro distribution for Macros Tab (100% Real Data)
  const proteinCals = totalProtein * 4;
  const fatCals = totalFat * 9;
  const carbsCals = totalCarbs * 4;
  const totalMacroCals = proteinCals + fatCals + carbsCals;

  const macroCarbsPct = totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0;
  const macroFatPct = totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0;
  const macroProteinPct = totalMacroCals > 0 ? Math.max(0, 100 - macroCarbsPct - macroFatPct) : 0;

  // Ranked foods highest in calories for Calories Tab
  const foodsHighestInCalories = [...dayFoodEntries].sort((a, b) => {
    const calsA = (a.foodItem.nutritionPerServing.calories || 0) * a.servings;
    const calsB = (b.foodItem.nutritionPerServing.calories || 0) * b.servings;
    return calsB - calsA;
  });

  // Ranked foods highest in protein for Nutrients/Macros Tab
  const foodsHighestInProtein = [...dayFoodEntries].sort((a, b) => {
    const proA = (a.foodItem.nutritionPerServing.proteinG || 0) * a.servings;
    const proB = (b.foodItem.nutritionPerServing.proteinG || 0) * b.servings;
    return proB - proA;
  });

  const mealCategories: Array<{
    type: MealType;
    label: string;
    icon: any;
    color: string;
    bgColor: string;
    defaultTime: string;
  }> = [
    { type: 'breakfast', label: 'Breakfast', icon: Sun, color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20', defaultTime: '8:15 AM' },
    { type: 'lunch', label: 'Lunch', icon: Sunset, color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', defaultTime: '12:45 PM' },
    { type: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/20', defaultTime: '7:10 PM' },
    { type: 'snacks', label: 'Snacks', icon: Coffee, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20', defaultTime: '2:30 PM' },
  ];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="pb-28 px-4 sm:px-5 pt-2 relative select-none min-h-[85vh] overflow-x-hidden"
    >
      {/* 1. TOP PRIMARY TOGGLE: LOG vs NUTRITION */}
      <div className="flex items-center justify-center space-x-10 border-b border-white/10 pb-2.5 mb-4">
        <button
          onClick={() => setMainSubTab('log')}
          className={`relative pb-2 text-base font-extrabold transition-all ${
            mainSubTab === 'log' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Log
          {mainSubTab === 'log' && (
            <motion.div
              layoutId="primaryTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16E39B] rounded-full shadow-[0_0_8px_#16E39B]"
            />
          )}
        </button>

        <button
          onClick={() => setMainSubTab('nutrition')}
          className={`relative pb-2 text-base font-extrabold transition-all ${
            mainSubTab === 'nutrition' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Nutrition
          {mainSubTab === 'nutrition' && (
            <motion.div
              layoutId="primaryTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16E39B] rounded-full shadow-[0_0_8px_#16E39B]"
            />
          )}
        </button>
      </div>

      {/* 2. NUTRITION SUB-HEADER & SUB-TABS (When Nutrition Mode is Active) */}
      {mainSubTab === 'nutrition' && (
        <div className="space-y-3 mb-4">
          <div className="text-center">
            <h1 className="text-xl font-black text-white tracking-tight">Nutrition</h1>
          </div>

          <div className="flex items-center justify-center space-x-8 border-b border-white/10 pb-2">
            <button
              onClick={() => {
                setNutritionTab('calories');
                setActiveNutrientKey(null);
              }}
              className={`relative pb-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                nutritionTab === 'calories' ? 'text-[#16E39B]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Calories
              {nutritionTab === 'calories' && (
                <motion.div
                  layoutId="nutritionSubTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16E39B] rounded-full"
                />
              )}
            </button>

            <button
              onClick={() => setNutritionTab('nutrients')}
              className={`relative pb-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                nutritionTab === 'nutrients' ? 'text-[#16E39B]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Nutrients
              {nutritionTab === 'nutrients' && (
                <motion.div
                  layoutId="nutritionSubTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16E39B] rounded-full"
                />
              )}
            </button>

            <button
              onClick={() => {
                setNutritionTab('macros');
                setActiveNutrientKey(null);
              }}
              className={`relative pb-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                nutritionTab === 'macros' ? 'text-[#16E39B]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Macros
              {nutritionTab === 'macros' && (
                <motion.div
                  layoutId="nutritionSubTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#16E39B] rounded-full"
                />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. DATE BANNER HEADER */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-3 shadow-md flex items-center justify-between relative mb-5 z-20">
        <button
          onClick={handlePrevDay}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95 shrink-0"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center relative group flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-white tracking-tight">
              {dateInfo.title}
            </h2>
            <label className="cursor-pointer p-1 rounded-lg hover:bg-white/10 text-[#16E39B] transition-colors">
              <CalendarIcon className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={handleCustomDateSelect}
                className="sr-only"
              />
            </label>
          </div>

          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                dateInfo.isToday
                  ? 'bg-[#16E39B]/20 border-[#16E39B]/40 text-[#16E39B]'
                  : 'bg-zinc-800 border-white/10 text-zinc-400'
              }`}
            >
              {dateInfo.subtitle}
            </span>
            <span className="text-[10px] font-semibold text-zinc-400">
              · Swipe left or right to switch day
            </span>
          </div>
        </div>

        <button
          onClick={handleNextDay}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95 shrink-0"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Swipe Gesture Edge Overlay */}
      <AnimatePresence>
        {isSwiping && Math.abs(swipeOffset) > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            style={{
              width: `${Math.min(45, (Math.abs(swipeOffset) / SWIPE_THRESHOLD_PX) * 40 + 10)}%`,
            }}
            className={`fixed md:absolute top-0 bottom-0 z-50 pointer-events-none flex flex-col justify-center px-4 md:px-6 transition-all duration-75 ease-out ${
              swipeOffset > 0
                ? 'left-0 bg-gradient-to-r from-emerald-600/90 via-emerald-500/40 to-transparent border-r border-emerald-400/40 items-start text-left rounded-r-3xl'
                : 'right-0 bg-gradient-to-l from-emerald-600/90 via-emerald-500/40 to-transparent border-l border-emerald-400/40 items-end text-right rounded-l-3xl'
            }`}
          >
            <div
              className={`flex flex-col space-y-1 ${
                swipeOffset > 0 ? 'items-start pl-1 sm:pl-2' : 'items-end pr-1 sm:pr-2'
              }`}
            >
              <div className="flex items-center space-x-1 text-white">
                {swipeOffset > 0 ? (
                  <>
                    <ChevronLeft className="w-6 h-6 text-emerald-300 shrink-0" />
                    <span className="text-sm font-black tracking-tight text-white whitespace-nowrap">
                      {prevDateInfo.subtitle === 'Yesterday' ? 'Yesterday' : prevDateInfo.title}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-black tracking-tight text-white whitespace-nowrap">
                      {nextDateInfo.subtitle === 'Tomorrow' ? 'Tomorrow' : nextDateInfo.title}
                    </span>
                    <ChevronRight className="w-6 h-6 text-emerald-300 shrink-0" />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CONTENT SECTIONS ACCORDING TO ACTIVE SUB-TAB */}
      <AnimatePresence mode="wait" initial={false}>
        {mainSubTab === 'log' ? (
          /* ==================== VIEW 1: LOG TAB ==================== */
          <motion.div
            key={`log_${selectedDate}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Macro Summary Grid - Calories & Protein only */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Calories Card */}
              <motion.div
                onClick={() => {
                  setMainSubTab('nutrition');
                  setNutritionTab('calories');
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#121212] border border-white/10 rounded-2xl p-3.5 hover:border-[#16E39B]/50 transition-colors cursor-pointer shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-orange-400/20" />
                    </div>
                    <span className="text-xs font-extrabold text-white">Calories</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 block">
                    <strong className="text-white font-black text-sm">{Math.round(totalCalories).toLocaleString()}</strong> / {calTarget.toLocaleString()} kcal
                  </span>
                  <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-[#16E39B] rounded-full transition-all duration-500"
                      style={{ width: `${calPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium pt-0.5">
                    <span>{calPct}%</span>
                    <span className="text-[#16E39B] font-bold">{calRemaining.toLocaleString()} left</span>
                  </div>
                </div>
              </motion.div>

              {/* Protein Card */}
              <motion.div
                onClick={() => {
                  setMainSubTab('nutrition');
                  setNutritionTab('nutrients');
                  setActiveNutrientKey('protein');
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#121212] border border-white/10 rounded-2xl p-3.5 hover:border-[#16E39B]/50 transition-colors cursor-pointer shadow-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-6 h-6 rounded-lg bg-[#16E39B]/10 border border-[#16E39B]/20 flex items-center justify-center text-[#16E39B]">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-extrabold text-white">Protein</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 block">
                    <strong className="text-white font-black text-sm">{Math.round(totalProtein)} g</strong> / {proTarget} g
                  </span>
                  <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16E39B] rounded-full transition-all duration-500"
                      style={{ width: `${proPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium pt-0.5">
                    <span>{proPct}%</span>
                    <span className="text-[#16E39B] font-bold">{proRemaining} g left</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Prominent Log Food Action Button */}
            <motion.div
              onClick={onOpenLogModal}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden rounded-2xl border border-[#16E39B]/35 bg-gradient-to-r from-[#03291B] via-[#021F14] to-[#01140C] p-4 transition-all shadow-xl shadow-[#16E39B]/10 cursor-pointer flex items-center justify-between my-2"
            >
              <div className="relative z-10 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#083827] border border-[#16E39B]/40 flex items-center justify-center shrink-0 text-[#16E39B] shadow-inner">
                  <Plus className="w-5 h-5 stroke-[2.8]" />
                </div>
                <div>
                  <span className="text-sm font-extrabold block text-white tracking-tight">
                    Log Food
                  </span>
                  <span className="text-[11px] text-[#A2F2D5] font-medium">
                    Add meal, scan barcode, photo or voice
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Meals Grouped Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white tracking-tight uppercase">
                  Meals Logged
                </h2>
                <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  {dayFoodEntries.length} items
                </span>
              </div>

              <div className="space-y-3">
                {mealCategories.map((cat) => {
                  const Icon = cat.icon;
                  const catEntries = dayFoodEntries.filter((e) => e.mealType === cat.type);
                  const catCal = catEntries.reduce(
                    (sum, e) => sum + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
                    0
                  );
                  const isDropTarget = dragOverCategory === cat.type;

                  return (
                    <div
                      key={cat.type}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverCategory !== cat.type) {
                          setDragOverCategory(cat.type);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverCategory(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const entryId = e.dataTransfer.getData('text/plain') || draggedEntryId;
                        if (entryId && onUpdateEntryMealType) {
                          onUpdateEntryMealType(entryId, cat.type);
                        }
                        setDraggedEntryId(null);
                        setDragOverCategory(null);
                      }}
                      className={`bg-[#121212] border transition-all duration-200 rounded-2xl p-3.5 space-y-2.5 shadow-sm ${
                        isDropTarget
                          ? 'border-2 border-dashed border-[#16E39B] bg-[#16E39B]/10 shadow-lg scale-[1.01]'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg ${cat.bgColor} flex items-center justify-center ${cat.color} shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-white">
                              {cat.label}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {catCal > 0 ? (
                            <span className="text-xs font-black text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                              {Math.round(catCal)} <span className="text-[10px] font-normal text-zinc-400">kcal</span>
                            </span>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={onOpenLogModal}
                              className="text-[11px] font-extrabold text-[#16E39B] hover:text-[#16E39B]/80 bg-[#16E39B]/10 border border-[#16E39B]/20 px-2.5 py-0.5 rounded-lg flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Entry List */}
                      {catEntries.length > 0 ? (
                        <div className="space-y-1.5">
                          {catEntries.map((entry) => (
                            <div
                              key={entry.id}
                              onClick={() => onSelectEntry?.(entry)}
                              className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-white block">
                                  {entry.foodItem.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 block font-medium">
                                  {entry.servings} serving ({entry.foodItem.serving?.label || '100g'})
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-[#16E39B]">
                                  {Math.round(entry.foodItem.nutritionPerServing.calories * entry.servings)} kcal
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEntry(entry.id);
                                  }}
                                  className="text-zinc-500 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500 italic py-1">
                          No items logged for {cat.label.toLowerCase()} yet.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ==================== VIEW 2: NUTRITION TAB ==================== */
          <motion.div
            key={`nutrition_${nutritionTab}_${selectedDate}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
          >
            {/* ----------------- SUB-TAB 1: CALORIES ----------------- */}
            {nutritionTab === 'calories' && (
              <div className="space-y-4">
                {/* Calories by meal Pie/Donut Chart */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    Calories by meal
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-4">
                    {/* Donut Visual */}
                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" className="stroke-zinc-800/80" strokeWidth="10" fill="none" />
                        
                        {/* Breakfast Arc (Orange #F97316) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-orange-500"
                          strokeWidth="10"
                          strokeDasharray={`${(bfastPct / 100) * 238.76} 238.76`}
                          strokeDashoffset="0"
                          fill="none"
                        />
                        {/* Lunch Arc (Green #10B981) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-emerald-500"
                          strokeWidth="10"
                          strokeDasharray={`${(lunchPct / 100) * 238.76} 238.76`}
                          strokeDashoffset={`-${(bfastPct / 100) * 238.76}`}
                          fill="none"
                        />
                        {/* Dinner Arc (Blue #3B82F6) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-blue-500"
                          strokeWidth="10"
                          strokeDasharray={`${(dinnerPct / 100) * 238.76} 238.76`}
                          strokeDashoffset={`-${((bfastPct + lunchPct) / 100) * 238.76}`}
                          fill="none"
                        />
                        {/* Snacks Arc (Purple #8B5CF6) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-purple-500"
                          strokeWidth="10"
                          strokeDasharray={`${(snackPct / 100) * 238.76} 238.76`}
                          strokeDashoffset={`-${((bfastPct + lunchPct + dinnerPct) / 100) * 238.76}`}
                          fill="none"
                        />
                      </svg>

                      {/* Donut Center */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-white tracking-tight">
                          {displayTotalCals.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">
                          kcal
                        </span>
                      </div>
                    </div>

                    {/* Meal Legend List */}
                    <div className="space-y-2.5 w-full sm:w-auto shrink-0">
                      <div className="flex items-center justify-between space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="font-bold text-white">Breakfast</span>
                        </div>
                        <span className="font-black text-zinc-300">{bfastCal} kcal ({bfastPct}%)</span>
                      </div>

                      <div className="flex items-center justify-between space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="font-bold text-white">Lunch</span>
                        </div>
                        <span className="font-black text-zinc-300">{lunchCal} kcal ({lunchPct}%)</span>
                      </div>

                      <div className="flex items-center justify-between space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="font-bold text-white">Dinner</span>
                        </div>
                        <span className="font-black text-zinc-300">{dinnerCal} kcal ({dinnerPct}%)</span>
                      </div>

                      <div className="flex items-center justify-between space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className="font-bold text-white">Snacks</span>
                        </div>
                        <span className="font-black text-zinc-300">{snackCal} kcal ({snackPct}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calorie Summary Data Rows */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400 font-medium">Food consumed</span>
                    <span className="font-black text-white">{displayTotalCals.toLocaleString()} kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400 font-medium">Activity recorded</span>
                    <span className="font-black text-amber-400">{displayActivityCals.toLocaleString()} kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400 font-medium">Food less activity</span>
                    <span className="font-black text-white">{displayNetCals.toLocaleString()} kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400 font-medium">Daily target</span>
                    <span className="font-black text-white">{calTarget.toLocaleString()} kcal</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 font-bold">
                    <span className="text-zinc-300">Remaining</span>
                    <span className="font-black text-[#16E39B] text-sm">
                      {Math.max(0, calTarget - displayNetCals).toLocaleString()} kcal
                    </span>
                  </div>
                </div>

                {/* Foods Highest in Calories Section */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-4.5 shadow-xl space-y-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Foods highest in calories
                  </h3>

                  <div className="divide-y divide-white/5">
                    {foodsHighestInCalories.length > 0 ? (
                      foodsHighestInCalories.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => onSelectEntry?.(e)}
                          className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer rounded-xl px-1"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                              <Flame className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white">{e.foodItem.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-zinc-300">
                              {Math.round(e.foodItem.nutritionPerServing.calories * e.servings)} kcal
                            </span>
                            <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-3 text-center">
                        No food logged for this date.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- SUB-TAB 2: NUTRIENTS ----------------- */}
            {nutritionTab === 'nutrients' && (
              <div className="space-y-4">
                {activeNutrientKey ? (
                  /* Single Nutrient Source Breakdown View */
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                    <button
                      onClick={() => setActiveNutrientKey(null)}
                      className="text-xs font-bold text-[#16E39B] hover:underline flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to all nutrients</span>
                    </button>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h2 className="text-lg font-black text-white capitalize">{activeNutrientKey}</h2>
                        <span className="text-xs text-zinc-400">
                          {Math.round(activeNutrientKey === 'protein' ? totalProtein : totalCarbs)} g of {proTarget} g
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#16E39B] bg-[#16E39B]/10 px-3 py-1 rounded-full border border-[#16E39B]/20">
                        {proPct}% of goal
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                        {activeNutrientKey} sources
                      </h3>

                      <div className="divide-y divide-white/5">
                        {foodsHighestInProtein.length > 0 ? (
                          foodsHighestInProtein.map((e) => (
                            <div key={e.id} className="py-2.5 flex items-center justify-between px-1">
                              <span className="text-xs font-bold text-white">{e.foodItem.name}</span>
                              <span className="text-xs font-black text-[#16E39B]">
                                {Math.round((e.foodItem.nutritionPerServing.proteinG || 0) * e.servings)} g
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 italic py-3 text-center">
                            No food logged for this date.
                          </p>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-500 italic pt-2">
                        Sources are calculated from your logged foods today.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Full Nutrients Table View (100% Real Calculated Values) */
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-4.5 shadow-xl space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            <th className="py-2 px-2">Nutrient</th>
                            <th className="py-2 px-2 text-right">Total</th>
                            <th className="py-2 px-2 text-right">Goal</th>
                            <th className="py-2 px-2 text-right">Left</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium text-zinc-300">
                          {/* Protein */}
                          <tr
                            onClick={() => setActiveNutrientKey('protein')}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-2 font-bold text-white flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-[#16E39B]" />
                              <span>Protein</span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalProtein)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">{proTarget} g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-[#16E39B]">{proRemaining} g</td>
                          </tr>

                          {/* Carbohydrates */}
                          <tr
                            onClick={() => setActiveNutrientKey('carbohydrates')}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-2 font-bold text-white flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              <span>Carbohydrates</span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalCarbs)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">{carbsTarget} g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-cyan-400">{carbsRemaining} g</td>
                          </tr>

                          {/* Fibre */}
                          <tr
                            onClick={() => setActiveNutrientKey('fibre')}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-2 font-bold text-white flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-400" />
                              <span>Fibre</span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalFibre)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">30 g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-yellow-400">{fibreRemaining} g</td>
                          </tr>

                          {/* Fat */}
                          <tr
                            onClick={() => setActiveNutrientKey('fat')}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            <td className="py-2.5 px-2 font-bold text-white flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400" />
                              <span>Fat</span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalFat)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">70 g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-purple-400">{fatRemaining} g</td>
                          </tr>

                          {/* Saturated Fat */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Saturated Fat</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalSaturatedFat)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">22 g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-zinc-300">{Math.max(0, 22 - Math.round(totalSaturatedFat))} g</td>
                          </tr>

                          {/* Sugar */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Sugar</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalSugar)} g</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">50 g</td>
                            <td className="py-2.5 px-2 text-right font-bold text-zinc-300">{Math.max(0, 50 - Math.round(totalSugar))} g</td>
                          </tr>

                          {/* Sodium */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Sodium</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalSodium).toLocaleString()} mg</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">2,300 mg</td>
                            <td className="py-2.5 px-2 text-right font-bold text-zinc-300">{Math.max(0, 2300 - Math.round(totalSodium)).toLocaleString()} mg</td>
                          </tr>

                          {/* Potassium */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Potassium</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalPotassium).toLocaleString()} mg</td>
                            <td className="py-2.5 px-2 text-right text-zinc-500">--</td>
                            <td className="py-2.5 px-2 text-right text-zinc-500">--</td>
                          </tr>

                          {/* Calcium */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Calcium</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalCalcium).toLocaleString()} mg</td>
                            <td className="py-2.5 px-2 text-right text-zinc-500">--</td>
                            <td className="py-2.5 px-2 text-right text-zinc-500">--</td>
                          </tr>

                          {/* Iron */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-2 text-zinc-300">Iron</td>
                            <td className="py-2.5 px-2 text-right font-bold text-white">{Math.round(totalIron * 10) / 10} mg</td>
                            <td className="py-2.5 px-2 text-right text-zinc-400">18 mg</td>
                            <td className="py-2.5 px-2 text-right font-bold text-zinc-300">{Math.max(0, Math.round((18 - totalIron) * 10) / 10)} mg</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------- SUB-TAB 3: MACROS ----------------- */}
            {nutritionTab === 'macros' && (
              <div className="space-y-4">
                {/* Macro breakdown Donut Visual */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    Macro breakdown
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-4">
                    {/* Donut Chart */}
                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" className="stroke-zinc-800/80" strokeWidth="11" fill="none" />
                        
                        {/* Carbs Arc (Cyan #3B82F6) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-cyan-400"
                          strokeWidth="11"
                          strokeDasharray={`${(macroCarbsPct / 100) * 238.76} 238.76`}
                          strokeDashoffset="0"
                          fill="none"
                        />
                        {/* Fat Arc (Purple #8B5CF6) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-purple-500"
                          strokeWidth="11"
                          strokeDasharray={`${(macroFatPct / 100) * 238.76} 238.76`}
                          strokeDashoffset={`-${(macroCarbsPct / 100) * 238.76}`}
                          fill="none"
                        />
                        {/* Protein Arc (Coral/Red #F43F5E) */}
                        <circle
                          cx="50" cy="50" r="38"
                          className="stroke-rose-500"
                          strokeWidth="11"
                          strokeDasharray={`${(macroProteinPct / 100) * 238.76} 238.76`}
                          strokeDashoffset={`-${((macroCarbsPct + macroFatPct) / 100) * 238.76}`}
                          fill="none"
                        />
                      </svg>
                    </div>

                    {/* Macro Legend */}
                    <div className="space-y-3 w-full sm:w-auto shrink-0 text-xs">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          <span className="font-bold text-white">Carbohydrates ({Math.round(totalCarbs)}g)</span>
                        </div>
                        <span className="font-black text-cyan-400">{macroCarbsPct}%</span>
                      </div>

                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className="font-bold text-white">Fat ({Math.round(totalFat)}g)</span>
                        </div>
                        <span className="font-black text-purple-400">{macroFatPct}%</span>
                      </div>

                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span className="font-bold text-white">Protein ({Math.round(totalProtein)}g)</span>
                        </div>
                        <span className="font-black text-rose-400">{macroProteinPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total vs Goal Table */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10 text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                    <span>Macro</span>
                    <div className="space-x-8">
                      <span>Total</span>
                      <span>Goal</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="font-bold text-white">Carbohydrates</span>
                    <div className="space-x-8 font-black">
                      <span className="text-cyan-400">{macroCarbsPct}%</span>
                      <span className="text-zinc-400">45%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="font-bold text-white">Fat</span>
                    <div className="space-x-8 font-black">
                      <span className="text-purple-400">{macroFatPct}%</span>
                      <span className="text-zinc-400">30%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 pt-2">
                    <span className="font-bold text-white">Protein</span>
                    <div className="space-x-8 font-black">
                      <span className="text-rose-400">{macroProteinPct}%</span>
                      <span className="text-zinc-400">25%</span>
                    </div>
                  </div>
                </div>

                {/* Foods Highest in Protein */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-4.5 shadow-xl space-y-3">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Foods highest in protein
                  </h3>

                  <div className="divide-y divide-white/5">
                    {foodsHighestInProtein.length > 0 ? (
                      foodsHighestInProtein.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => onSelectEntry?.(e)}
                          className="py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer rounded-xl px-1"
                        >
                          <span className="text-xs font-bold text-white">{e.foodItem.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-[#16E39B]">
                              {Math.round((e.foodItem.nutritionPerServing.proteinG || 0) * e.servings)} g
                            </span>
                            <ChevronRightIcon className="w-4 h-4 text-zinc-500" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-3 text-center">
                        No food logged for this date.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
