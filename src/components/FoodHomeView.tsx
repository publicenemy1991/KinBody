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
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<MealType | null>(null);
  const [activeMoveEntryId, setActiveMoveEntryId] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe gesture & directional state
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<number>(1); // 1 = forward (next day), -1 = backward (prev day)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const hasTriggeredThresholdHapticRef = useRef<boolean>(false);

  const dateInfo = formatDateDisplay(selectedDate);
  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

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

  // Drag Threshold Configuration (40px distance or quick flick velocity)
  const SWIPE_THRESHOLD_PX = 40;
  const FLICK_VELOCITY_PX_MS = 0.18;

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
    if (isSwiping && touchStartRef.current) {
      const deltaX = swipeOffset;
      const duration = Math.max(1, Date.now() - touchStartRef.current.time);
      const velocity = Math.abs(deltaX) / duration;

      const isFlick = velocity >= FLICK_VELOCITY_PX_MS && Math.abs(deltaX) > 15;
      const isDistance = Math.abs(deltaX) >= SWIPE_THRESHOLD_PX;

      if (isFlick || isDistance) {
        if (typeof window !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([10, 15]);
          } catch (e) {}
        }

        if (deltaX > 0) {
          handlePrevDay();
        } else {
          handleNextDay();
        }
      }
    }
    touchStartRef.current = null;
    isMouseDownRef.current = false;
    setIsSwiping(false);
    setSwipeOffset(0);
    hasTriggeredThresholdHapticRef.current = false;
  };

  // Mouse drag support for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasTriggeredThresholdHapticRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;

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

  // Calculate consumed macros for selectedDate
  const totalCalories = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
    0
  );
  const totalProtein = dayFoodEntries.reduce(
    (sum, e) => sum + (e.foodItem.nutritionPerServing.proteinG || 0) * e.servings,
    0
  );

  const calTarget = userProfile.calorieTarget || 2350;
  const proTarget = userProfile.proteinTargetG || 180;

  const calRemaining = Math.max(0, calTarget - Math.round(totalCalories));
  const proRemaining = Math.max(0, Math.round(proTarget - totalProtein));

  const proPct = Math.min(100, Math.round((totalProtein / proTarget) * 100));
  const calPct = Math.min(100, Math.round((totalCalories / calTarget) * 100));

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

  // Helper to compute day page metrics for any target date
  const getDayPageData = (targetDate: string) => {
    const dInfo = formatDateDisplay(targetDate);
    const entries = loggedEntries.filter((e) => {
      const entryDate = e.date || getLocalDateString(new Date(e.loggedAt));
      return entryDate === targetDate;
    });

    const cals = entries.reduce(
      (sum, e) => sum + (e.foodItem.nutritionPerServing.calories || 0) * e.servings,
      0
    );
    const pro = entries.reduce(
      (sum, e) => sum + (e.foodItem.nutritionPerServing.proteinG || 0) * e.servings,
      0
    );

    const calRem = Math.max(0, calTarget - Math.round(cals));
    const proRem = Math.max(0, Math.round(proTarget - pro));

    return { dInfo, entries, cals, pro, calRem, proRem };
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className="pb-28 px-5 pt-2 relative select-none min-h-[85vh] overflow-x-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Date Banner Header */}
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
            <label className="cursor-pointer p-1 rounded-lg hover:bg-white/10 text-emerald-400 transition-colors">
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
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
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

      {/* Edge Gesture Navigation Overlay */}
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

              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {Math.abs(swipeOffset) >= SWIPE_THRESHOLD_PX ? '✓ Release to switch' : 'Release or flick'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Day Page Content */}
      <div className="space-y-5 relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDate}
            initial={{
              opacity: 0,
              x: swipeDirection > 0 ? 40 : -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: swipeDirection > 0 ? -40 : 40,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 32,
              mass: 0.8,
            }}
            className="space-y-5"
          >

      {/* Calories & Protein Summaries Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Calories Card */}
        <motion.div
          onClick={() => onOpenNutrientDetail('calories')}
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-4 hover:border-emerald-500/50 transition-colors cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between aspect-[1.15/1]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Calories
              </span>
            </div>
            <span className="text-[10px] font-black text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              {calPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                {Math.round(totalCalories).toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400 font-bold ml-1">kcal</span>
              <p className="text-[10px] text-zinc-400">of {calTarget} kcal</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" className="stroke-zinc-800" strokeWidth="3.5" fill="none" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-emerald-400"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  initial={{ strokeDashoffset: 88 }}
                  animate={{ strokeDashoffset: 88 - (calPct * 88) / 100 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
            <span className="text-zinc-400 font-medium">Remaining</span>
            <span className="text-emerald-400 font-bold">{calRemaining} kcal</span>
          </div>
        </motion.div>

        {/* Protein Card */}
        <motion.div
          onClick={() => onOpenNutrientDetail('protein')}
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#121212] border border-white/10 rounded-3xl p-4 hover:border-emerald-500/50 transition-colors cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between aspect-[1.15/1]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Flame className="w-3.5 h-3.5 fill-emerald-400/20" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Protein
              </span>
            </div>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {proPct}%
            </span>
          </div>

          <div className="flex items-baseline justify-between my-2">
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                {Math.round(totalProtein)}
              </span>
              <span className="text-xs text-emerald-400 font-bold ml-1">g</span>
              <p className="text-[10px] text-zinc-400">of {proTarget} g</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" className="stroke-zinc-800" strokeWidth="3.5" fill="none" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-emerald-400"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  initial={{ strokeDashoffset: 88 }}
                  animate={{ strokeDashoffset: 88 - (proPct * 88) / 100 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
            <span className="text-zinc-400 font-medium">Remaining</span>
            <span className="text-emerald-400 font-bold">{proRemaining} g</span>
          </div>
        </motion.div>
      </div>

      {/* Daily Energy Summary (Food - Activity) */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-white tracking-tight">
            Daily Energy Summary
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            Food logged minus activity
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">Food</span>
            <span className="text-sm font-black text-white">
              {Math.round(totalCalories).toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-500 block font-medium">kcal</span>
          </div>

          <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] font-semibold text-zinc-400 block mb-0.5">Activity</span>
            <span className="text-sm font-black text-amber-400">
              {activityCaloriesToday.toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-500 block font-medium">kcal</span>
          </div>

          <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[10px] font-semibold text-emerald-400 block mb-0.5">Difference</span>
            <span className="text-sm font-black text-white">
              {Math.round(totalCalories - activityCaloriesToday).toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-500 block font-medium">kcal</span>
          </div>
        </div>
      </div>

      {/* Prominent Log Food Main Action Button */}
      <motion.div
        onClick={onOpenLogModal}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black p-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center shrink-0 text-black">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <span className="text-base font-extrabold block text-black">Log Food</span>
            <span className="text-[11px] text-black/80 font-semibold">
              Add meal, scan, or describe
            </span>
          </div>
        </div>
      </motion.div>

      {/* Meals Grouped Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Meals
            </h2>
            <span className="text-xs font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {dayFoodEntries.length} logged
            </span>
          </div>
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
                className={`bg-[#121212] border transition-all duration-200 rounded-2xl p-4 space-y-3 shadow-sm ${
                  isDropTarget
                    ? 'border-2 border-dashed border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 scale-[1.01]'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl ${cat.bgColor} flex items-center justify-center ${cat.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {cat.label}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {cat.defaultTime} · {catEntries.length} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {catCal > 0 ? (
                      <span className="text-xs font-black text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        {Math.round(catCal)} <span className="text-[10px] font-normal text-zinc-400">kcal</span>
                      </span>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenLogModal}
                        className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Entry List */}
                {catEntries.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {catEntries.map((entry) => {
                        const isBeingDragged = draggedEntryId === entry.id;
                        const isMoveMenuOpen = activeMoveEntryId === entry.id;

                        return (
                          <motion.div
                            key={entry.id}
                            layout
                            draggable={true}
                            onDragStart={(e) => {
                              // @ts-ignore
                              e.dataTransfer.setData('text/plain', entry.id);
                              setDraggedEntryId(entry.id);
                              // @ts-ignore
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggedEntryId(null);
                              setDragOverCategory(null);
                            }}
                            onTouchStart={() => {
                              longPressTimerRef.current = setTimeout(() => {
                                setActiveMoveEntryId(entry.id);
                              }, 350);
                            }}
                            onTouchEnd={() => {
                              if (longPressTimerRef.current) {
                                clearTimeout(longPressTimerRef.current);
                              }
                            }}
                            onTouchMove={() => {
                              if (longPressTimerRef.current) {
                                clearTimeout(longPressTimerRef.current);
                              }
                            }}
                            onClick={() => {
                              if (!isMoveMenuOpen) {
                                onSelectEntry?.(entry);
                              }
                            }}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`flex flex-col p-3 bg-[#0D0E12] border rounded-xl group transition-all cursor-pointer ${
                              isBeingDragged
                                ? 'border-indigo-500 opacity-50 bg-indigo-950/30 scale-95'
                                : 'border-white/5 hover:border-indigo-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMoveEntryId(isMoveMenuOpen ? null : entry.id);
                                  }}
                                  className="p-1 rounded text-zinc-500 hover:text-indigo-300 hover:bg-white/5 transition-colors cursor-grab shrink-0"
                                  title="Drag or tap to move meal"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    {entry.foodItem.brand &&
                                      !['voice input', 'camera log', '3d depth scan', 'photo log', 'custom entry', 'custom', 'ai estimate'].includes(
                                        entry.foodItem.brand.toLowerCase()
                                      ) && (
                                        <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                                          {entry.foodItem.brand}
                                        </span>
                                      )}
                                    <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                      {entry.foodItem.name}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 flex items-center space-x-2">
                                    <span>
                                      {entry.servings !== 1 ? `${entry.servings}x ` : ''}
                                      {entry.foodItem.serving.amount}{' '}
                                      {entry.foodItem.serving.unit}
                                    </span>
                                    <span>·</span>
                                    <span className="text-emerald-400 font-semibold">
                                      {Math.round(
                                        (entry.foodItem.nutritionPerServing.proteinG || 0) * entry.servings
                                      )}
                                      g protein
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs font-extrabold text-white">
                                  {Math.round(
                                    (entry.foodItem.nutritionPerServing.calories || 0) * entry.servings
                                  )}
                                  <span className="text-[10px] text-zinc-400 font-normal ml-0.5">kcal</span>
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.85 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEntry(entry.id);
                                  }}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  aria-label="Delete entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>

                            {/* Quick Move Selector Pill on Hold / Tap */}
                            {isMoveMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between space-x-2 overflow-x-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] font-extrabold text-indigo-300 uppercase shrink-0 flex items-center space-x-1">
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span>Move to:</span>
                                </span>
                                <div className="flex items-center space-x-1">
                                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map((m) => (
                                    <button
                                      key={m}
                                      disabled={entry.mealType === m}
                                      onClick={() => {
                                        onUpdateEntryMealType?.(entry.id, m);
                                        setActiveMoveEntryId(null);
                                      }}
                                      className={`px-2 py-1 text-[10px] font-extrabold rounded-md capitalize transition-all ${
                                        entry.mealType === m
                                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                          : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600 hover:text-white'
                                      }`}
                                    >
                                      {m}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic py-0.5">
                    No foods logged for {cat.label.toLowerCase()} yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
  </div>
  </div>
);
};
