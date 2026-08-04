import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Upload,
  Activity,
  Trash2,
  Edit2,
  Clock,
  Flame,
  Heart,
  Navigation,
  Footprints,
  FileText,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ActivityLogEntry, UserProfile } from '../types';
import {
  getTodayString,
  getLocalDateString,
  formatDateDisplay,
  offsetDateString,
} from '../utils/dateUtils';
import { compressBase64Image } from '../utils/imageUtils';

interface ActivityViewProps {
  userProfile: UserProfile;
  activityLogs: ActivityLogEntry[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onAddActivity: (entry: Omit<ActivityLogEntry, 'id' | 'loggedAt'>) => void;
  onUpdateActivity: (id: string, updated: Partial<ActivityLogEntry>) => void;
  onDeleteActivity: (id: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  userProfile,
  activityLogs,
  selectedDate = getTodayString(),
  onDateChange,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  // Modal states
  const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<ActivityLogEntry | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityLogEntry | null>(null);
  const [isParsingScreenshot, setIsParsingScreenshot] = useState(false);

  // Draft activity form state (for confirmation / manual / editing)
  const [draftActivity, setDraftActivity] = useState<Partial<ActivityLogEntry>>({
    activityType: 'Morning Walk',
    time: '7:35 AM',
    durationMinutes: 42,
    distanceKm: 3.8,
    activeCalories: 286,
    avgHeartRate: 118,
    maxHeartRate: 142,
    pace: '11:03 /km',
    steps: undefined,
    notes: '',
    screenshotUrl: undefined,
    isConfirmed: false,
  });

  // Swipe gesture & directional state (matches FoodHomeView)
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [swipeDirection, setSwipeDirection] = useState<number>(1);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dateInfo = formatDateDisplay(selectedDate);
  const isImperial = userProfile.unitSystem === 'imperial';
  const distUnit = isImperial ? 'mi' : 'km';

  const prevDateStr = offsetDateString(selectedDate, -1);
  const nextDateStr = offsetDateString(selectedDate, 1);
  const prevDateInfo = formatDateDisplay(prevDateStr);
  const nextDateInfo = formatDateDisplay(nextDateStr);

  const handlePrevDay = () => {
    setSwipeDirection(-1);
    onDateChange?.(prevDateStr);
  };

  const handleNextDay = () => {
    setSwipeDirection(1);
    onDateChange?.(nextDateStr);
  };

  const SWIPE_THRESHOLD_PX = 40;
  const FLICK_VELOCITY_PX_MS = 0.18;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
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
    }
  };

  const handleTouchEnd = () => {
    if (isSwiping && touchStartRef.current) {
      const deltaX = swipeOffset;
      const duration = Math.max(1, Date.now() - touchStartRef.current.time);
      const velocity = Math.abs(deltaX) / duration;

      if (velocity >= FLICK_VELOCITY_PX_MS || Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
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
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) {
      setIsSwiping(true);
      setSwipeOffset(deltaX);
    }
  };

  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange?.(e.target.value);
    }
  };

  // Filter activities for selected date
  const dayActivities = activityLogs.filter((a) => a.date === selectedDate);

  // Daily totals calculation
  const totalCalories = dayActivities.reduce((sum, a) => sum + (a.activeCalories || 0), 0);
  const totalMinutes = dayActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const totalDistance = dayActivities.reduce((sum, a) => sum + (a.distanceKm || 0), 0);

  // File Upload & Screenshot Recognition Handler
  const handleScreenshotUpload = async (file: File) => {
    setIsParsingScreenshot(true);
    setShowAddOptionsModal(false);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawBase64 = e.target?.result as string;
        const compressedBase64 = await compressBase64Image(rawBase64, 700, 0.6);

        try {
          const res = await fetch('/api/ai/parse-workout-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: rawBase64,
              mimeType: file.type || 'image/jpeg',
            }),
          });
          const data = await res.json();

          if (data.success && data.result) {
            const parsed = data.result;
            setDraftActivity({
              activityType: parsed.activityType || 'Workout',
              time: parsed.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              durationMinutes: parsed.durationMinutes ?? undefined,
              distanceKm: parsed.distanceKm ?? undefined,
              steps: parsed.steps ?? undefined,
              activeCalories: parsed.activeCalories ?? undefined,
              avgHeartRate: parsed.avgHeartRate ?? undefined,
              maxHeartRate: parsed.maxHeartRate ?? undefined,
              pace: parsed.pace || undefined,
              notes: parsed.notes || '',
              screenshotUrl: compressedBase64,
              isConfirmed: false,
            });
          } else {
            // Fallback default
            setDraftActivity({
              activityType: 'Outdoor Walk',
              time: '8:00 AM',
              durationMinutes: 30,
              activeCalories: 150,
              screenshotUrl: compressedBase64,
              isConfirmed: false,
            });
          }
        } catch (err) {
          console.warn('Screenshot parsing request error:', err);
          setDraftActivity({
            activityType: 'Activity',
            time: '8:00 AM',
            screenshotUrl: compressedBase64,
            isConfirmed: false,
          });
        } finally {
          setIsParsingScreenshot(false);
          setShowConfirmModal(true);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading failed:', err);
      setIsParsingScreenshot(false);
    }
  };

  const handleConfirmSave = () => {
    if (!draftActivity.activityType) return;

    if (editingActivity) {
      onUpdateActivity(editingActivity.id, {
        ...draftActivity,
        date: selectedDate,
        isConfirmed: true,
      });
      setEditingActivity(null);
    } else {
      onAddActivity({
        date: selectedDate,
        time: draftActivity.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        activityType: draftActivity.activityType || 'Workout',
        durationMinutes: draftActivity.durationMinutes,
        distanceKm: draftActivity.distanceKm,
        steps: draftActivity.steps,
        activeCalories: draftActivity.activeCalories,
        avgHeartRate: draftActivity.avgHeartRate,
        maxHeartRate: draftActivity.maxHeartRate,
        pace: draftActivity.pace,
        notes: draftActivity.notes,
        screenshotUrl: draftActivity.screenshotUrl,
        isConfirmed: true,
      });
    }

    setShowConfirmModal(false);
    setShowManualModal(false);
  };

  const openManualAdd = () => {
    setEditingActivity(null);
    setDraftActivity({
      activityType: 'Walk',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: 30,
      activeCalories: 150,
      distanceKm: undefined,
      avgHeartRate: undefined,
      maxHeartRate: undefined,
      pace: undefined,
      steps: undefined,
      notes: '',
      screenshotUrl: undefined,
      isConfirmed: false,
    });
    setShowAddOptionsModal(false);
    setShowConfirmModal(true);
  };

  const openEditActivity = (activity: ActivityLogEntry) => {
    setSelectedActivityDetail(null);
    setEditingActivity(activity);
    setDraftActivity({ ...activity });
    setShowConfirmModal(true);
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
      {/* Hidden File Input for Screenshot Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleScreenshotUpload(e.target.files[0]);
          }
        }}
      />

      {/* Date Banner Header (Identical to Log Screen) */}
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
              · Swipe left or right
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

      {/* Swipe Overlay Indicator */}
      <AnimatePresence>
        {isSwiping && Math.abs(swipeOffset) > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed md:absolute top-0 bottom-0 z-50 pointer-events-none flex flex-col justify-center px-4 transition-all ${
              swipeOffset > 0
                ? 'left-0 bg-gradient-to-r from-emerald-600/90 via-emerald-500/40 to-transparent border-r border-emerald-400/40 items-start text-left rounded-r-3xl'
                : 'right-0 bg-gradient-to-l from-emerald-600/90 via-emerald-500/40 to-transparent border-l border-emerald-400/40 items-end text-right rounded-l-3xl'
            }`}
          >
            <span className="text-xs font-black text-white">
              {swipeOffset > 0 ? prevDateInfo.title : nextDateInfo.title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsing Loader */}
      <AnimatePresence>
        {isParsingScreenshot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-5 bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-teal-600/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 animate-spin">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Reading Workout Screenshot...</h3>
              <p className="text-[11px] text-zinc-400">Extracting visible metrics for your confirmation</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Animated Container */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, x: swipeDirection > 0 ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: swipeDirection > 0 ? -40 : 40 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
          className="space-y-5"
        >
          {/* Daily Summary OR Empty State */}
          {dayActivities.length > 0 ? (
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white tracking-tight flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Activity Today</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {dayActivities.length} recorded
                </span>
              </div>

              {/* Display bullet points strictly for values that actually exist */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-200 pt-1">
                {totalCalories > 0 && (
                  <span className="flex items-center space-x-1">
                    <span className="text-amber-400">•</span>
                    <span>{Math.round(totalCalories)} active kcal</span>
                  </span>
                )}
                {totalMinutes > 0 && (
                  <span className="flex items-center space-x-1">
                    <span className="text-emerald-400">•</span>
                    <span>{totalMinutes} min</span>
                  </span>
                )}
                {totalDistance > 0 && (
                  <span className="flex items-center space-x-1">
                    <span className="text-emerald-400">•</span>
                    <span>{Math.round(totalDistance * 10) / 10} {distUnit}</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">No activity recorded today.</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Upload a screenshot or add an activity manually.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-sm mx-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload Screenshot</span>
                </button>

                <button
                  onClick={openManualAdd}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Row when activity exists */}
          {dayActivities.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-3 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Screenshot</span>
              </button>

              <button
                onClick={openManualAdd}
                className="flex-1 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          )}

          {/* Activity Timeline */}
          {dayActivities.length > 0 && (
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 px-1">
                Timeline
              </h3>

              <div className="space-y-2.5">
                {dayActivities.map((act) => (
                  <motion.div
                    key={act.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedActivityDetail(act)}
                    className="bg-[#181A20] border border-white/10 rounded-2xl p-4 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{act.activityType}</h4>
                          {act.time && (
                            <span className="text-[10px] text-zinc-400 font-medium block">
                              {act.time}
                            </span>
                          )}
                        </div>
                      </div>

                      {act.activeCalories && (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          {act.activeCalories} <span className="text-[10px] font-normal text-zinc-400">kcal</span>
                        </span>
                      )}
                    </div>

                    {/* Timeline Inline Metrics (Only visible ones) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-[11px] font-semibold text-zinc-300">
                      {act.durationMinutes && (
                        <span className="bg-[#0D0E12] px-2 py-0.5 rounded-md border border-white/5 text-zinc-300">
                          {act.durationMinutes} min
                        </span>
                      )}
                      {act.distanceKm && (
                        <span className="bg-[#0D0E12] px-2 py-0.5 rounded-md border border-white/5 text-zinc-300">
                          {act.distanceKm} {distUnit}
                        </span>
                      )}
                      {act.avgHeartRate && (
                        <span className="bg-[#0D0E12] px-2 py-0.5 rounded-md border border-white/5 text-red-400 flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-400 fill-red-400/20" />
                          <span>{act.avgHeartRate} bpm</span>
                        </span>
                      )}
                      {act.pace && (
                        <span className="bg-[#0D0E12] px-2 py-0.5 rounded-md border border-white/5 text-zinc-400">
                          {act.pace}
                        </span>
                      )}
                      {act.steps && (
                        <span className="bg-[#0D0E12] px-2 py-0.5 rounded-md border border-white/5 text-amber-300">
                          {act.steps.toLocaleString()} steps
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CONFIRMATION / EDIT MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#181A20] border border-white/10 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {editingActivity ? 'Edit Activity' : 'Confirm Activity'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Activity Type */}
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Activity Name / Type *</label>
                  <input
                    type="text"
                    value={draftActivity.activityType || ''}
                    onChange={(e) => setDraftActivity({ ...draftActivity, activityType: e.target.value })}
                    placeholder="e.g. Morning Walk, Outdoor Run, Cycling"
                    className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Time & Duration */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Time</label>
                    <input
                      type="text"
                      value={draftActivity.time || ''}
                      onChange={(e) => setDraftActivity({ ...draftActivity, time: e.target.value })}
                      placeholder="e.g. 7:35 AM"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={draftActivity.durationMinutes ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          durationMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="e.g. 42"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Distance & Active Calories */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Distance ({distUnit})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draftActivity.distanceKm ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          distanceKm: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 3.8"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Active Calories (kcal)</label>
                    <input
                      type="number"
                      value={draftActivity.activeCalories ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          activeCalories: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="e.g. 286"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Heart Rate Avg & Max */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Average HR (bpm)</label>
                    <input
                      type="number"
                      value={draftActivity.avgHeartRate ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          avgHeartRate: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="e.g. 118"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Maximum HR (bpm)</label>
                    <input
                      type="number"
                      value={draftActivity.maxHeartRate ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          maxHeartRate: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="e.g. 142"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Pace & Steps */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Pace</label>
                    <input
                      type="text"
                      value={draftActivity.pace || ''}
                      onChange={(e) => setDraftActivity({ ...draftActivity, pace: e.target.value })}
                      placeholder="e.g. 11:03 /km"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Steps</label>
                    <input
                      type="number"
                      value={draftActivity.steps ?? ''}
                      onChange={(e) =>
                        setDraftActivity({
                          ...draftActivity,
                          steps: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        })
                      }
                      placeholder="Optional"
                      className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Notes</label>
                  <input
                    type="text"
                    value={draftActivity.notes || ''}
                    onChange={(e) => setDraftActivity({ ...draftActivity, notes: e.target.value })}
                    placeholder="Optional details or context"
                    className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Original Screenshot Preview if available */}
                {draftActivity.screenshotUrl && (
                  <div className="pt-2">
                    <label className="text-zinc-400 font-semibold block mb-1">Original Screenshot</label>
                    <div className="max-h-36 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={draftActivity.screenshotUrl}
                        alt="Screenshot preview"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Confirm Activity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVITY DETAILS MODAL */}
      <AnimatePresence>
        {selectedActivityDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181A20] border border-white/10 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {selectedActivityDetail.activityType}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {selectedActivityDetail.date} {selectedActivityDetail.time ? `· ${selectedActivityDetail.time}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivityDetail(null)}
                  className="p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {selectedActivityDetail.durationMinutes && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Duration</span>
                    <span className="text-sm font-bold text-white">
                      {selectedActivityDetail.durationMinutes} min
                    </span>
                  </div>
                )}
                {selectedActivityDetail.distanceKm && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Distance</span>
                    <span className="text-sm font-bold text-white">
                      {selectedActivityDetail.distanceKm} {distUnit}
                    </span>
                  </div>
                )}
                {selectedActivityDetail.activeCalories && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Active Calories</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {selectedActivityDetail.activeCalories} kcal
                    </span>
                  </div>
                )}
                {selectedActivityDetail.avgHeartRate && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Average Heart Rate</span>
                    <span className="text-sm font-bold text-red-400">
                      {selectedActivityDetail.avgHeartRate} bpm
                    </span>
                  </div>
                )}
                {selectedActivityDetail.maxHeartRate && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Maximum Heart Rate</span>
                    <span className="text-sm font-bold text-red-400">
                      {selectedActivityDetail.maxHeartRate} bpm
                    </span>
                  </div>
                )}
                {selectedActivityDetail.pace && (
                  <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-400 block font-semibold">Pace</span>
                    <span className="text-sm font-bold text-white">
                      {selectedActivityDetail.pace}
                    </span>
                  </div>
                )}
              </div>

              {selectedActivityDetail.notes && (
                <div className="bg-[#0D0E12] p-3 rounded-xl border border-white/5 text-xs">
                  <span className="text-[10px] text-zinc-400 block font-semibold mb-0.5">Notes</span>
                  <p className="text-zinc-200">{selectedActivityDetail.notes}</p>
                </div>
              )}

              {selectedActivityDetail.screenshotUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 font-semibold block">Original Screenshot</span>
                  <div className="max-h-48 rounded-xl overflow-hidden border border-white/10">
                    <img
                      src={selectedActivityDetail.screenshotUrl}
                      alt="Original workout screenshot"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => openEditActivity(selectedActivityDetail)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteActivity(selectedActivityDetail.id);
                    setSelectedActivityDetail(null);
                  }}
                  className="py-3 px-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
