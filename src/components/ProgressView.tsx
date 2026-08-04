import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Sparkles,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Calendar,
  Activity,
  Info,
} from 'lucide-react';
import { UserProfile, WeightEntry, BodyScanEntry, ActivityLogEntry } from '../types';

interface ProgressViewProps {
  userProfile: UserProfile;
  weightEntries: WeightEntry[];
  bodyScanEntries: BodyScanEntry[];
  activityLogs?: ActivityLogEntry[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProfile,
  weightEntries,
  bodyScanEntries,
  activityLogs = [],
}) => {
  const isImperial = userProfile.unitSystem === 'imperial';
  const distUnit = isImperial ? 'mi' : 'km';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Helper to convert kg to display unit
  const formatWeight = (valKg: number) => {
    const val = isImperial ? valKg * 2.20462 : valKg;
    return Math.round(val * 10) / 10;
  };

  // Combine weight entries from logged history and body scans
  const combinedWeightMap = new Map<string, { id: string; date: string; weightKg: number; notes?: string }>();

  // Add weight entries
  weightEntries.forEach((w) => {
    combinedWeightMap.set(w.date, {
      id: w.id,
      date: w.date,
      weightKg: w.weightKg,
      notes: w.note,
    });
  });

  // Add scan weights if missing for that date
  bodyScanEntries.forEach((scan) => {
    if (scan.weightKg !== undefined && !combinedWeightMap.has(scan.date)) {
      combinedWeightMap.set(scan.date, {
        id: scan.id,
        date: scan.date,
        weightKg: scan.weightKg,
        notes: scan.title || 'Evolt 360 Scan',
      });
    }
  });

  // Sort weight entries by date ascending
  const sortedWeights = Array.from(combinedWeightMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Selected node index for interactive graph detail
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(
    sortedWeights.length > 0 ? sortedWeights.length - 1 : null
  );

  // Sort body scans by date ascending
  const sortedScans = [...bodyScanEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Weight calculations
  const firstWeightKg = sortedWeights.length > 0 ? sortedWeights[0].weightKg : userProfile.weightKg;
  const latestWeightKg = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weightKg : userProfile.weightKg;
  const weightDiffKg = (latestWeightKg && firstWeightKg) ? Math.round((latestWeightKg - firstWeightKg) * 10) / 10 : 0;
  const displayWeightDiff = formatWeight(Math.abs(weightDiffKg));

  // Body fat calculations
  const scansWithBf = sortedScans.filter((s) => s.bodyFatPercent !== undefined);
  const firstBf = scansWithBf.length > 0 ? scansWithBf[0].bodyFatPercent : userProfile.bodyFatPercent;
  const latestBf = scansWithBf.length > 0 ? scansWithBf[scansWithBf.length - 1].bodyFatPercent : userProfile.bodyFatPercent;
  const bfDiff = (latestBf !== undefined && firstBf !== undefined) ? Math.round((latestBf - firstBf) * 10) / 10 : 0;

  // Muscle calculations
  const scansWithMuscle = sortedScans.filter((s) => s.skeletalMuscleKg !== undefined);
  const firstMuscle = scansWithMuscle.length > 0 ? scansWithMuscle[0].skeletalMuscleKg : userProfile.muscleMassKg;
  const latestMuscle = scansWithMuscle.length > 0 ? scansWithMuscle[scansWithMuscle.length - 1].skeletalMuscleKg : userProfile.muscleMassKg;
  const muscleDiff = (latestMuscle !== undefined && firstMuscle !== undefined) ? Math.round((latestMuscle - firstMuscle) * 10) / 10 : 0;

  const hasWeightData = sortedWeights.length >= 1;
  const hasScanData = sortedScans.length >= 2;

  // Activity progress calculations
  const confirmedActivities = activityLogs.filter((a) => a.isConfirmed);
  const totalActiveCalories = confirmedActivities.reduce((sum, a) => sum + (a.activeCalories || 0), 0);
  const totalActiveMinutes = confirmedActivities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
  const totalActiveDistance = confirmedActivities.reduce((sum, a) => sum + (a.distanceKm || 0), 0);
  const activeDaysCount = new Set(confirmedActivities.map((a) => a.date)).size;
  const hasActivityData = confirmedActivities.length > 0;

  // Graph Calculations for SVG Line & Nodes
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 30;
  const paddingBottom = 40;

  const weightsList = sortedWeights.map((w) => formatWeight(w.weightKg));
  const minWeightVal = Math.min(...weightsList);
  const maxWeightVal = Math.max(...weightsList);

  // Buffer for graph scaling
  const yBuffer = maxWeightVal === minWeightVal ? 2 : Math.max(1, (maxWeightVal - minWeightVal) * 0.2);
  const yMin = Math.max(0, minWeightVal - yBuffer);
  const yMax = maxWeightVal + yBuffer;
  const yRange = yMax - yMin || 1;

  const graphPoints = sortedWeights.map((w, idx) => {
    const val = formatWeight(w.weightKg);
    const x = sortedWeights.length === 1
      ? svgWidth / 2
      : paddingLeft + (idx / (sortedWeights.length - 1)) * (svgWidth - paddingLeft - paddingRight);
    const y = paddingTop + ((yMax - val) / yRange) * (svgHeight - paddingTop - paddingBottom);

    // Delta from previous
    const prevVal = idx > 0 ? formatWeight(sortedWeights[idx - 1].weightKg) : null;
    const delta = prevVal !== null ? Math.round((val - prevVal) * 10) / 10 : null;

    return {
      x,
      y,
      val,
      rawKg: w.weightKg,
      date: w.date,
      notes: w.notes,
      delta,
      original: w,
    };
  });

  // Construct SVG Path String for Trend Line
  const linePathD = graphPoints.length > 0
    ? graphPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
    : '';

  // Area Path String under line
  const areaPathD = graphPoints.length > 0
    ? `${linePathD} L ${graphPoints[graphPoints.length - 1].x} ${svgHeight - paddingBottom} L ${graphPoints[0].x} ${svgHeight - paddingBottom} Z`
    : '';

  // Y-axis grid ticks (3 horizontal levels)
  const yTicks = [
    { label: `${Math.round(yMax * 10) / 10}`, y: paddingTop },
    { label: `${Math.round(((yMax + yMin) / 2) * 10) / 10}`, y: (paddingTop + (svgHeight - paddingBottom)) / 2 },
    { label: `${Math.round(yMin * 10) / 10}`, y: svgHeight - paddingBottom },
  ];

  // Active selected node detail
  const activeNode = selectedNodeIdx !== null && graphPoints[selectedNodeIdx]
    ? graphPoints[selectedNodeIdx]
    : graphPoints[graphPoints.length - 1];

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <span>Long-Term Progress</span>
        </h1>
        <p className="text-xs font-semibold text-zinc-400 mt-0.5">
          Body composition trends derived purely from verified user data
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-1 shadow-md">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
            Weight Change
          </span>
          <p className="text-xl font-black text-white">
            {weightDiffKg > 0 ? `+${displayWeightDiff}` : weightDiffKg < 0 ? `-${displayWeightDiff}` : `0`} <span className="text-xs font-normal text-zinc-400">{weightUnit}</span>
          </p>
          <p className="text-[10px] text-zinc-500 font-medium">
            {sortedWeights.length > 0 ? `${sortedWeights.length} weigh-ins` : '1 record'}
          </p>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-1 shadow-md">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
            Body Fat Delta
          </span>
          <p className="text-xl font-black text-amber-400">
            {latestBf !== undefined ? `${bfDiff > 0 ? `+${bfDiff}` : bfDiff}%` : '—'}
          </p>
          <p className="text-[10px] text-zinc-500 font-medium">
            {scansWithBf.length > 0 ? `${scansWithBf.length} scans` : 'No scan data'}
          </p>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 space-y-1 shadow-md">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
            Muscle Mass Delta
          </span>
          <p className="text-xl font-black text-emerald-400">
            {latestMuscle !== undefined ? `${muscleDiff > 0 ? `+${muscleDiff}` : muscleDiff} kg` : '—'}
          </p>
          <p className="text-[10px] text-zinc-500 font-medium">
            {scansWithMuscle.length > 0 ? `${scansWithMuscle.length} scans` : 'No scan data'}
          </p>
        </div>
      </div>

      {/* Interactive SVG Weight Trend Chart with Nodes */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4.5 h-4.5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Weight Trend & Data Nodes</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {sortedWeights.length} nodes
            </span>
          </div>
        </div>

        {!hasWeightData ? (
          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl text-center space-y-2">
            <BarChart2 className="w-6 h-6 text-zinc-500 mx-auto" />
            <p className="text-xs font-bold text-white">No weight data available</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Add a weigh-in to view your interactive body weight graph and trend line.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* SVG Line Graph Container */}
            <div className="relative w-full bg-[#0A0A0A] border border-white/5 rounded-xl p-2 sm:p-4">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none overflow-visible">
                <defs>
                  {/* Gradient Area Fill under trend line */}
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Node Glow Filter */}
                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Background Grid Reference Lines */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={paddingLeft - 5}
                      y1={tick.y}
                      x2={svgWidth - paddingRight + 5}
                      y2={tick.y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={tick.y + 3}
                      fill="#71717a"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="end"
                    >
                      {tick.label}
                    </text>
                  </g>
                ))}

                {/* Translucent Area Fill below line */}
                {graphPoints.length > 1 && (
                  <path d={areaPathD} fill="url(#weightGradient)" />
                )}

                {/* Connecting Trend Line */}
                {graphPoints.length > 1 && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Individual Data Point Nodes */}
                {graphPoints.map((pt, idx) => {
                  const isSelected = selectedNodeIdx === idx;

                  return (
                    <g
                      key={pt.original.id || idx}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNodeIdx(idx)}
                    >
                      {/* Outer Pulse Halo Ring when Selected */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="12"
                          fill="rgba(16, 185, 129, 0.25)"
                          stroke="rgba(16, 185, 129, 0.5)"
                          strokeWidth="1.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Node Outer Circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? '6.5' : '5'}
                        fill="#0A0A0A"
                        stroke={isSelected ? '#34d399' : '#10b981'}
                        strokeWidth={isSelected ? '3' : '2.5'}
                        className="transition-all duration-200 group-hover:r-7"
                      />

                      {/* Node Center Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? '3.5' : '2.5'}
                        fill={isSelected ? '#ffffff' : '#10b981'}
                      />

                      {/* Node Value Label above Point */}
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        fill={isSelected ? '#34d399' : '#a1a1aa'}
                        fontSize="10"
                        fontWeight={isSelected ? '900' : '700'}
                        textAnchor="middle"
                        className="transition-all"
                      >
                        {pt.val}
                      </text>

                      {/* X-Axis Date Label below Point */}
                      <text
                        x={pt.x}
                        y={svgHeight - 12}
                        fill={isSelected ? '#ffffff' : '#71717a'}
                        fontSize="9"
                        fontWeight={isSelected ? '800' : '500'}
                        textAnchor="middle"
                      >
                        {pt.date.slice(5)}
                      </text>

                      {/* Invisible Larger Touch/Click Target Target */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="18"
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Information Card */}
            {activeNode && (
              <div className="bg-[#0A0A0A] border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-white">
                        {activeNode.val} {weightUnit}
                      </span>
                      {activeNode.delta !== null && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            activeNode.delta < 0
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : activeNode.delta > 0
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              : 'bg-zinc-800 border-white/10 text-zinc-400'
                          }`}
                        >
                          {activeNode.delta > 0 ? `+${activeNode.delta}` : activeNode.delta} {weightUnit}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium block">
                      Weigh-in on {activeNode.date} {activeNode.notes ? `• ${activeNode.notes}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                    Data Node #{selectedNodeIdx !== null ? selectedNodeIdx + 1 : 1}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Tap nodes to inspect
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body Scan Progress / Empty State */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Evolt 360 Scan Comparison</h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold">
            {sortedScans.length} scans uploaded
          </span>
        </div>

        {!hasScanData ? (
          <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl text-center space-y-2">
            <Sparkles className="w-6 h-6 text-amber-400/60 mx-auto" />
            <p className="text-xs font-bold text-white">Upload multiple body scans to view comparison</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Uploading your Evolt 360 scans over time will unlock precise muscle mass and fat percentage change comparison charts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-300 font-medium">
              Comparing initial scan ({sortedScans[0].date}) to latest scan ({sortedScans[sortedScans.length - 1].date}):
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-400 block font-semibold">Body Fat Change</span>
                <span className="text-lg font-black text-amber-400">
                  {bfDiff > 0 ? `+${bfDiff}%` : `${bfDiff}%`}
                </span>
              </div>
              <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-zinc-400 block font-semibold">Skeletal Muscle Change</span>
                <span className="text-lg font-black text-emerald-400">
                  {muscleDiff > 0 ? `+${muscleDiff} kg` : `${muscleDiff} kg`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Progress Trends */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Activity Progress</h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold">
            {confirmedActivities.length} activities logged
          </span>
        </div>

        {!hasActivityData ? (
          <div className="p-5 bg-[#0A0A0A] border border-white/5 rounded-2xl text-center space-y-1.5">
            <Activity className="w-6 h-6 text-zinc-500 mx-auto" />
            <p className="text-xs font-bold text-white">No activity data logged yet</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
              Only display trends when enough real data exists. Log workouts or walks in the Activity tab to view active day trends.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-semibold">Active Days</span>
              <span className="text-base font-black text-white">{activeDaysCount} days</span>
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-semibold">Calories Burned</span>
              <span className="text-base font-black text-amber-400">{Math.round(totalActiveCalories)} kcal</span>
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-semibold">Time Active</span>
              <span className="text-base font-black text-emerald-400">{totalActiveMinutes} min</span>
            </div>
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 space-y-0.5">
              <span className="text-[10px] text-zinc-400 block font-semibold">Distance</span>
              <span className="text-base font-black text-emerald-400">
                {Math.round(totalActiveDistance * 10) / 10} {distUnit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target Consistency Card */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-bold text-white">Nutritional Target Benchmarks</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] font-semibold text-zinc-400 block">Calorie Target</span>
            <span className="text-base font-black text-white">{userProfile.calorieTarget} kcal/day</span>
          </div>
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] font-semibold text-zinc-400 block">Protein Target</span>
            <span className="text-base font-black text-emerald-400">{userProfile.proteinTargetG} g/day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
