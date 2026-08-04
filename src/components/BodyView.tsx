import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Plus,
  Calendar,
  Edit3,
  Trash2,
  FileText,
  ChevronRight,
  TrendingUp,
  Check,
  X,
  Eye,
} from 'lucide-react';
import { BodyScanEntry, WeightEntry } from '../types';

interface BodyViewProps {
  currentWeightKg?: number;
  weightHistory: WeightEntry[];
  bodyScanEntries: BodyScanEntry[];
  onAddWeight: (weightKg: number, note?: string, date?: string) => void;
  onEditWeight: (id: string, weightKg: number) => void;
  onDeleteWeight: (id: string) => void;
  onOpenUploadModal: () => void;
  onEditScan: (updatedScan: BodyScanEntry) => void;
  onDeleteScan: (id: string) => void;
}

export const BodyView: React.FC<BodyViewProps> = ({
  currentWeightKg,
  weightHistory,
  bodyScanEntries,
  onAddWeight,
  onEditWeight,
  onDeleteWeight,
  onOpenUploadModal,
  onEditScan,
  onDeleteScan,
}) => {
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState(currentWeightKg?.toString() || '80');
  const [weightDateInput, setWeightDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [weightNoteInput, setWeightNoteInput] = useState('');

  // Editing existing weight
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [editWeightVal, setEditWeightVal] = useState<string>('');

  // Scan Lightbox Modal
  const [viewingScan, setViewingScan] = useState<BodyScanEntry | null>(null);
  const [editingScan, setEditingScan] = useState<BodyScanEntry | null>(null);

  // Derive latest scan for metrics
  const latestScan = bodyScanEntries.length > 0
    ? [...bodyScanEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const hasBodyData = weightHistory.length > 0 || bodyScanEntries.length > 0;

  const handleSaveNewWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 20) {
      onAddWeight(w, weightNoteInput, weightDateInput);
      setShowWeightModal(false);
      setWeightNoteInput('');
    }
  };

  const handleInlineWeightSave = (id: string) => {
    const w = parseFloat(editWeightVal);
    if (!isNaN(w) && w > 20) {
      onEditWeight(id, w);
    }
    setEditingWeightId(null);
  };

  return (
    <div className="px-5 py-6 space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Body Composition</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-0.5">
            Weight history and Evolt 360 scan metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setWeightInput(currentWeightKg?.toString() || '80');
              setShowWeightModal(true);
            }}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Weight</span>
          </button>
          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload Scan</span>
          </button>
        </div>
      </div>

      {/* Main Content or Global Empty State */}
      {!hasBodyData ? (
        <div className="bg-[#181A20] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-xl my-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h2 className="text-lg font-bold text-white">No body data yet</h2>
            <p className="text-xs text-zinc-400">
              Add your first weight or upload an Evolt body scan to start tracking your progress.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowWeightModal(true)}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
            >
              Add Weight
            </button>
            <button
              onClick={onOpenUploadModal}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Upload Evolt Scan</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Current Body Metrics Summary */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Current Composition Metrics
              </span>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                Single Source of Truth
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Weight Card - Always show if exists */}
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block">Current Weight</span>
                <span className="text-2xl font-black text-white">
                  {currentWeightKg ?? '--'} <span className="text-xs text-zinc-500 font-normal">kg</span>
                </span>
                <span className="text-[10px] text-zinc-500 block">Single source across app</span>
              </div>

              {/* Only display metrics that actually exist */}
              {latestScan?.bodyFatPercent !== undefined && (
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Body Fat %</span>
                  <span className="text-2xl font-black text-amber-400">
                    {latestScan.bodyFatPercent}%
                  </span>
                  <span className="text-[10px] text-zinc-500 block">From latest scan</span>
                </div>
              )}

              {latestScan?.skeletalMuscleKg !== undefined && (
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Skeletal Muscle</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {latestScan.skeletalMuscleKg} <span className="text-xs text-zinc-500 font-normal">kg</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Extracted metric</span>
                </div>
              )}

              {latestScan?.leanMassKg !== undefined && (
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Lean Mass</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {latestScan.leanMassKg} <span className="text-xs text-zinc-500 font-normal">kg</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Extracted metric</span>
                </div>
              )}

              {latestScan?.fatMassKg !== undefined && (
                <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Fat Mass</span>
                  <span className="text-2xl font-black text-rose-400">
                    {latestScan.fatMassKg} <span className="text-xs text-zinc-500 font-normal">kg</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Extracted metric</span>
                </div>
              )}

              {latestScan?.visceralFatRating !== undefined && (
                <div className="bg-[#0D0E12] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold block">Visceral Fat</span>
                  <span className="text-2xl font-black text-purple-400">
                    {latestScan.visceralFatRating} <span className="text-xs text-zinc-500 font-normal">Rating</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Visceral health rating</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Evolt Scans Section */}
          <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Uploaded Evolt Scans</h2>
              </div>
              <button
                onClick={onOpenUploadModal}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Scan</span>
              </button>
            </div>

            {bodyScanEntries.length === 0 ? (
              <div className="p-6 bg-[#0D0E12] border border-white/5 rounded-2xl text-center space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">No body scans uploaded yet.</p>
                <button
                  onClick={onOpenUploadModal}
                  className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-600/30 transition-all inline-flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upload your first scan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bodyScanEntries.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 bg-[#0D0E12] border border-white/5 hover:border-white/10 rounded-xl space-y-3 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        {scan.scanImageUrl ? (
                          <div
                            onClick={() => setViewingScan(scan)}
                            className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-white/10 cursor-pointer shrink-0 relative group"
                          >
                            <img src={scan.scanImageUrl} alt="Scan" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                            360
                          </div>
                        )}
                        <div>
                          <h3 className="text-xs font-bold text-white">{scan.title}</h3>
                          <p className="text-[10px] text-zinc-400">{scan.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {scan.scanImageUrl && (
                          <button
                            onClick={() => setViewingScan(scan)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Scan</span>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingScan(scan)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          title="Edit scan values"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteScan(scan.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete scan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Extracted Scan Metrics Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
                      {scan.weightKg !== undefined && (
                        <div className="bg-[#181A20] px-2.5 py-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-400 block font-semibold">Weight</span>
                          <span className="text-xs font-bold text-white">{scan.weightKg} kg</span>
                        </div>
                      )}
                      {scan.bodyFatPercent !== undefined && (
                        <div className="bg-[#181A20] px-2.5 py-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-400 block font-semibold">Body Fat</span>
                          <span className="text-xs font-bold text-amber-400">{scan.bodyFatPercent}%</span>
                        </div>
                      )}
                      {scan.skeletalMuscleKg !== undefined && (
                        <div className="bg-[#181A20] px-2.5 py-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-400 block font-semibold">Muscle</span>
                          <span className="text-xs font-bold text-indigo-400">{scan.skeletalMuscleKg} kg</span>
                        </div>
                      )}
                      {scan.leanMassKg !== undefined && (
                        <div className="bg-[#181A20] px-2.5 py-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-400 block font-semibold">Lean Mass</span>
                          <span className="text-xs font-bold text-emerald-400">{scan.leanMassKg} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight History Section */}
          <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Weight History</h2>
              </div>
              <button
                onClick={() => {
                  setWeightInput(currentWeightKg?.toString() || '80');
                  setShowWeightModal(true);
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Weight</span>
              </button>
            </div>

            {weightHistory.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">No weight history logged yet.</p>
            ) : (
              <div className="space-y-2">
                {weightHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-[#0D0E12] border border-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300 font-bold text-xs">
                        {entry.weightKg}
                      </div>
                      <div>
                        {editingWeightId === entry.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.1"
                              value={editWeightVal}
                              onChange={(e) => setEditWeightVal(e.target.value)}
                              className="w-20 bg-[#181A20] border border-indigo-500 rounded px-2 py-0.5 text-xs text-white font-bold"
                            />
                            <button
                              onClick={() => handleInlineWeightSave(entry.id)}
                              className="p-1 bg-indigo-600 text-white rounded text-xs"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-white block">
                            {entry.weightKg} kg
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">
                          {entry.date} {entry.note ? `· ${entry.note}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingWeightId(entry.id);
                          setEditWeightVal(entry.weightKg.toString());
                        }}
                        className="p-1.5 text-zinc-400 hover:text-white"
                        title="Edit weight"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteWeight(entry.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181A20] border border-white/10 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white">Log Weight Entry</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewWeight} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3.5 py-2.5 text-base text-white font-bold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={weightDateInput}
                  onChange={(e) => setWeightDateInput(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasting weight"
                  value={weightNoteInput}
                  onChange={(e) => setWeightNoteInput(e.target.value)}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Scan Modal */}
      {editingScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181A20] border border-white/10 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white">Edit Scan Values</h3>
              <button
                onClick={() => setEditingScan(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingScan.weightKg ?? ''}
                  onChange={(e) => setEditingScan({ ...editingScan, weightKg: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Body Fat (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingScan.bodyFatPercent ?? ''}
                  onChange={(e) => setEditingScan({ ...editingScan, bodyFatPercent: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Skeletal Muscle (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingScan.skeletalMuscleKg ?? ''}
                  onChange={(e) => setEditingScan({ ...editingScan, skeletalMuscleKg: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-indigo-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold block mb-1">Lean Mass (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingScan.leanMassKg ?? ''}
                  onChange={(e) => setEditingScan({ ...editingScan, leanMassKg: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-[#0D0E12] border border-white/10 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setEditingScan(null)}
                className="flex-1 py-2.5 bg-white/5 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEditScan(editingScan);
                  setEditingScan(null);
                }}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Scan Image Lightbox */}
      {viewingScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#181A20] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#121418]">
              <div>
                <h3 className="text-sm font-bold text-white">{viewingScan.title}</h3>
                <p className="text-[11px] text-zinc-400">{viewingScan.date}</p>
              </div>
              <button
                onClick={() => setViewingScan(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-black">
              {viewingScan.scanImageUrl ? (
                <img
                  src={viewingScan.scanImageUrl}
                  alt={viewingScan.title}
                  className="max-h-[60vh] object-contain rounded-xl border border-white/10"
                />
              ) : (
                <p className="text-xs text-zinc-500">No original image saved for this scan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
