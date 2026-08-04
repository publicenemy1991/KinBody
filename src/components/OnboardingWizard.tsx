import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Sparkles, ChevronRight, Scale, Flame } from 'lucide-react';
import { UserProfile, UserGoal, UnitSystem } from '../types';

interface OnboardingWizardProps {
  initialProfile: UserProfile;
  onSaveStepProfile: (updated: Partial<UserProfile>) => void;
  onCompleteOnboarding: (profile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onSaveStepProfile,
  onCompleteOnboarding,
}) => {
  const [step, setStep] = useState<number>(initialProfile.onboardingStep || 1);
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    unitSystem: initialProfile.unitSystem || 'metric',
  });

  const isImperial = profile.unitSystem === 'imperial';

  // State for raw display values (begin empty unless existing profile has non-zero value)
  const [nameInput, setNameInput] = useState<string>(profile.name || '');
  const [ageInput, setAgeInput] = useState<string>(profile.age > 0 ? profile.age.toString() : '');
  const [weightInput, setWeightInput] = useState<string>(
    profile.weightKg > 0
      ? isImperial
        ? Math.round(profile.weightKg * 2.20462).toString()
        : profile.weightKg.toString()
      : ''
  );
  const [heightInput, setHeightInput] = useState<string>(
    profile.heightCm > 0
      ? isImperial
        ? Math.round(profile.heightCm / 2.54).toString()
        : profile.heightCm.toString()
      : ''
  );

  const [calTargetInput, setCalTargetInput] = useState<string>(
    profile.calorieTarget > 0 ? profile.calorieTarget.toString() : ''
  );
  const [proTargetInput, setProTargetInput] = useState<string>(
    profile.proteinTargetG > 0 ? profile.proteinTargetG.toString() : ''
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const totalSteps = 3;

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    onSaveStepProfile({ ...profile, onboardingStep: nextStep });
  };

  const handleNextFromStep1 = () => {
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    setValidationError(null);
    if (!nameInput.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    const age = parseInt(ageInput);
    if (!age || age <= 0 || age > 120) {
      setValidationError('Please enter a valid age.');
      return;
    }
    const rawWeight = parseFloat(weightInput);
    if (!rawWeight || rawWeight <= 0) {
      setValidationError(`Please enter your current weight in ${isImperial ? 'lbs' : 'kg'}.`);
      return;
    }
    const rawHeight = parseFloat(heightInput);
    if (!rawHeight || rawHeight <= 0) {
      setValidationError(`Please enter your height in ${isImperial ? 'inches' : 'cm'}.`);
      return;
    }

    const weightKg = isImperial ? rawWeight / 2.20462 : rawWeight;
    const heightCm = isImperial ? rawHeight * 2.54 : rawHeight;

    const roundedWeight = Math.round(weightKg * 10) / 10;
    const roundedHeight = Math.round(heightCm);

    // Calculate baseline targets
    let bmr = 10 * roundedWeight + 6.25 * roundedHeight - 5 * age;
    if (profile.sex === 'female') bmr -= 161;
    else bmr += 5;

    const tdee = Math.round(bmr * 1.375);
    let cal = tdee;
    if (profile.goal === 'lose_fat') cal = Math.round(tdee * 0.82);
    else if (profile.goal === 'build_muscle') cal = Math.round(tdee * 1.1);

    const pro = Math.round(roundedWeight * 2.0);

    const updated = {
      ...profile,
      name: nameInput.trim(),
      age,
      weightKg: roundedWeight,
      heightCm: roundedHeight,
      calorieTarget: cal,
      proteinTargetG: pro,
    };

    setProfile(updated);
    setCalTargetInput(cal.toString());
    setProTargetInput(pro.toString());
    onSaveStepProfile({ ...updated, onboardingStep: 3 });
    goToStep(3);
  };

  const handleCompleteOnboarding = () => {
    setValidationError(null);
    const cal = parseInt(calTargetInput) || profile.calorieTarget || 2000;
    const pro = parseInt(proTargetInput) || profile.proteinTargetG || 150;

    const finalProfile: UserProfile = {
      ...profile,
      calorieTarget: cal,
      proteinTargetG: pro,
      onboardingCompleted: true,
      onboardingStep: 3,
    };

    onCompleteOnboarding(finalProfile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed inset-0 z-50 bg-[#0D0E12] text-white flex flex-col justify-between sm:max-w-md sm:mx-auto overflow-y-auto sm:border-x sm:border-white/10"
    >
      {/* Header Progress */}
      <div className="sticky top-0 z-20 bg-[#0D0E12]/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-white/10">
        {step > 1 ? (
          <button
            onClick={() => goToStep(step - 1)}
            className="w-9 h-9 rounded-full bg-[#181A20] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-zinc-400">Step {step} of {totalSteps}</span>
          <div className="flex space-x-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx + 1 <= step ? 'w-5 bg-emerald-400' : 'w-1.5 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Main Goal */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-8 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Profile Setup</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  What is your main goal?
                </h1>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Select your primary objective to calculate personalized energy and protein starting targets.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'lose_fat', label: 'Lose Fat', detail: 'Caloric deficit focused on preserving lean muscle mass' },
                  { id: 'build_muscle', label: 'Build Muscle', detail: 'Caloric surplus optimized for hypertrophy and strength' },
                  { id: 'maintain', label: 'Maintain Weight', detail: 'Maintenance energy to keep your current weight steady' },
                  { id: 'body_recomposition', label: 'Improve Performance', detail: 'Slight deficit or maintenance with high protein target' },
                ].map((opt) => {
                  const isSelected = profile.goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setProfile({ ...profile, goal: opt.id as UserGoal })}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md'
                          : 'bg-[#181A20] border-white/10 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-white">{opt.label}</span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">{opt.detail}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNextFromStep1}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 my-4 text-xs flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: About You */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-8 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  About You
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your physical metrics to establish your accurate starting baseline.
                </p>
              </div>

              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                  {validationError}
                </div>
              )}

              <div className="space-y-4">
                {/* Preferred Units */}
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1.5">
                    Unit Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'metric', label: 'Metric (kg / cm)' },
                      { id: 'imperial', label: 'Imperial (lbs / in)' },
                    ].map((u) => {
                      const isSel = profile.unitSystem === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            const newSys = u.id as UnitSystem;
                            setProfile({ ...profile, unitSystem: newSys });
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                            isSel
                              ? 'bg-emerald-500/10 border-emerald-400 text-white'
                              : 'bg-[#181A20] border-white/10 text-zinc-400'
                          }`}
                        >
                          {u.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#181A20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={ageInput}
                      onChange={(e) => setAgeInput(e.target.value)}
                      placeholder="e.g. 28"
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Sex
                    </label>
                    <select
                      value={profile.sex}
                      onChange={(e) => setProfile({ ...profile, sex: e.target.value as any })}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-emerald-400"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Height ({isImperial ? 'inches' : 'cm'})
                    </label>
                    <input
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      placeholder={isImperial ? 'e.g. 70' : 'e.g. 178'}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-semibold block mb-1">
                      Current Weight ({isImperial ? 'lbs' : 'kg'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder={isImperial ? 'e.g. 175' : 'e.g. 80'}
                      className="w-full bg-[#181A20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-400 placeholder-zinc-600 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextFromStep2}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 my-4 text-xs flex items-center justify-center space-x-2"
            >
              <span>Calculate Targets</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Step 3: Targets */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-8 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Your Daily Macro Targets
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Proposed starting targets based on your goal and body metrics. You can edit them now or adjust later.
                </p>
              </div>

              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300">
                  {validationError}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-[#181A20] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center justify-between">
                      <span>Daily Energy Target (kcal)</span>
                      <Flame className="w-4 h-4 text-orange-400" />
                    </label>
                    <input
                      type="number"
                      value={calTargetInput}
                      onChange={(e) => setCalTargetInput(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1 flex items-center justify-between">
                      <span>Daily Protein Target (grams)</span>
                      <Scale className="w-4 h-4 text-emerald-400" />
                    </label>
                    <input
                      type="number"
                      value={proTargetInput}
                      onChange={(e) => setProTargetInput(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 space-y-1">
                  <p className="font-bold">Ready for a clean start</p>
                  <p className="text-[11px] text-emerald-400/80">
                    Your profile will begin with zero food entries, zero scans, and no workout history.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 my-4 text-xs flex items-center justify-center space-x-2"
            >
              <span>Start Logging</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
