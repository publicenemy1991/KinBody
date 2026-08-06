import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  User as UserIcon,
  Ruler,
  Scale,
  ChevronRight,
  ArrowDown,
  Check,
  Flame,
} from 'lucide-react';
import { UserProfile, UserGoal, UnitSystem } from '../types';
import { KinCompanion } from './KinCompanion';
import { OnboardingIntro } from './onboarding/OnboardingIntro';

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
  const [step, setStep] = useState<number>(initialProfile.onboardingStep || 0);
  const [profile, setProfile] = useState<UserProfile>({
    ...initialProfile,
    unitSystem: initialProfile.unitSystem || 'metric',
  });

  const isImperial = profile.unitSystem === 'imperial';

  // Raw State Inputs
  const initialNameParts = (profile.name || '').trim().split(' ');
  const [nameInput, setNameInput] = useState<string>(profile.name || '');
  const [ageInput, setAgeInput] = useState<string>(profile.age > 0 ? profile.age.toString() : '');
  const [sexInput, setSexInput] = useState<'male' | 'female' | 'other'>(profile.sex || 'male');
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
    profile.calorieTarget > 0 ? profile.calorieTarget.toString() : '2000'
  );
  const [proTargetInput, setProTargetInput] = useState<string>(
    profile.proteinTargetG > 0 ? profile.proteinTargetG.toString() : '150'
  );

  // Active editing row in Step 2 basics screen
  const [activeEditingBasics, setActiveEditingBasics] = useState<
    'age' | 'sex' | 'height' | 'weight' | null
  >(null);

  const [validationError, setValidationError] = useState<string | null>(null);

  const firstName = nameInput.trim().split(' ')[0] || 'Andrew';

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    onSaveStepProfile({ ...profile, onboardingStep: nextStep });
  };

  const handleNextFromStep1 = () => {
    setValidationError(null);
    if (!nameInput.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    const updated = { ...profile, name: nameInput.trim() };
    setProfile(updated);
    goToStep(2);
  };

  const handleNextFromStep2 = () => {
    setValidationError(null);
    const age = parseInt(ageInput) || 28;
    const rawWeight = parseFloat(weightInput) || 75;
    const rawHeight = parseFloat(heightInput) || 178;

    const weightKg = isImperial ? rawWeight / 2.20462 : rawWeight;
    const heightCm = isImperial ? rawHeight * 2.54 : rawHeight;

    const roundedWeight = Math.round(weightKg * 10) / 10;
    const roundedHeight = Math.round(heightCm);

    // BMR & Target Calculation
    let bmr = 10 * roundedWeight + 6.25 * roundedHeight - 5 * age;
    if (sexInput === 'female') bmr -= 161;
    else bmr += 5;

    const tdee = Math.round(bmr * 1.375);
    let cal = tdee;
    if (profile.goal === 'lose_fat') cal = Math.round(tdee * 0.82);
    else if (profile.goal === 'build_muscle') cal = Math.round(tdee * 1.1);

    const pro = Math.round(roundedWeight * 2.0);

    const updated: UserProfile = {
      ...profile,
      name: nameInput.trim() || 'User',
      age,
      sex: sexInput,
      weightKg: roundedWeight,
      heightCm: roundedHeight,
      calorieTarget: cal,
      proteinTargetG: pro,
    };

    setProfile(updated);
    setCalTargetInput(cal.toString());
    setProTargetInput(pro.toString());
    goToStep(3);
  };

  const handleComplete = () => {
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
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between max-w-md mx-auto overflow-y-auto select-none">
      {/* Top Header Bar for Steps 1, 2, 3 */}
      {step > 0 && (
        <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5">
          <button
            onClick={() => goToStep(step - 1)}
            className="w-9 h-9 rounded-full bg-[#12141A] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-medium text-zinc-500 font-mono">
            Step {step} of 3
          </span>

          <div className="w-9" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 0 & 1: Particle intro -> Logo -> Logo-to-Companion Morph -> Name Input */}
        {(step === 0 || step === 1) && (
          <OnboardingIntro
            key="intro"
            nameValue={nameInput}
            onNameChange={(val) => {
              setNameInput(val);
              setValidationError(null);
            }}
            onNext={handleNextFromStep1}
            validationError={validationError}
          />
        )}

        {/* STEP 2: Basics Selection Rows (Matching Screen 3) */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-6 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-6 pt-2">
              {/* Kin Companion Blob */}
              <KinCompanion
                size="md"
                message={
                  <span>
                    Nice to meet you, <span className="text-emerald-400 font-bold">{firstName}! 💚</span><br />
                    Let's set you up.
                  </span>
                }
              />

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Let's get some basics set up.
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  We'll tailor Kinbody to you.
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center justify-between p-1.5 bg-[#12141A] border border-white/10 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, unitSystem: 'metric' })}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    !isImperial
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Metric (kg / cm)
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, unitSystem: 'imperial' })}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    isImperial
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Imperial (lbs / in)
                </button>
              </div>

              {/* Interactive Row Cards matching Screen 3 */}
              <div className="space-y-3">
                {/* Row 1: Age */}
                <div className="bg-[#12141A] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() =>
                      setActiveEditingBasics(activeEditingBasics === 'age' ? null : 'age')
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Age</span>
                        <span className="text-xs text-zinc-400">
                          {ageInput ? `${ageInput} years` : 'Not set'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        activeEditingBasics === 'age' ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {activeEditingBasics === 'age' && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <input
                        type="number"
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        placeholder="e.g. 28"
                        autoFocus
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Row 2: Sex */}
                <div className="bg-[#12141A] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() =>
                      setActiveEditingBasics(activeEditingBasics === 'sex' ? null : 'sex')
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Sex</span>
                        <span className="text-xs text-zinc-400 capitalize">
                          {sexInput || 'Not set'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        activeEditingBasics === 'sex' ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {activeEditingBasics === 'sex' && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 grid grid-cols-3 gap-2">
                      {(['male', 'female', 'other'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSexInput(s)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                            sexInput === s
                              ? 'bg-emerald-500 text-black border-emerald-400'
                              : 'bg-black border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Row 3: Height */}
                <div className="bg-[#12141A] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() =>
                      setActiveEditingBasics(activeEditingBasics === 'height' ? null : 'height')
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                        <Ruler className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Height</span>
                        <span className="text-xs text-zinc-400">
                          {heightInput
                            ? `${heightInput} ${isImperial ? 'in' : 'cm'}`
                            : 'Not set'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        activeEditingBasics === 'height' ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {activeEditingBasics === 'height' && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <input
                        type="number"
                        value={heightInput}
                        onChange={(e) => setHeightInput(e.target.value)}
                        placeholder={isImperial ? 'e.g. 70' : 'e.g. 178'}
                        autoFocus
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>

                {/* Row 4: Weight */}
                <div className="bg-[#12141A] border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() =>
                      setActiveEditingBasics(activeEditingBasics === 'weight' ? null : 'weight')
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Weight</span>
                        <span className="text-xs text-zinc-400">
                          {weightInput
                            ? `${weightInput} ${isImperial ? 'lbs' : 'kg'}`
                            : 'Not set'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-zinc-500 transition-transform ${
                        activeEditingBasics === 'weight' ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {activeEditingBasics === 'weight' && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                      <input
                        type="number"
                        step="0.1"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        placeholder={isImperial ? 'e.g. 165' : 'e.g. 75'}
                        autoFocus
                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Button & Pagination Dots */}
            <div className="space-y-6 pb-6 pt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNextFromStep2}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </motion.button>

              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Goals & Targets Setup */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 py-6 flex-1 flex flex-col justify-between"
          >
            <div className="space-y-6 pt-2">
              <KinCompanion
                size="md"
                message={<span>All set up! Let's choose your main health goal.</span>}
              />

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Your Primary Goal
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Select an objective to fine-tune your energy and protein targets.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'lose_fat', label: 'Lose Fat', detail: 'Deficit focused on preserving lean muscle' },
                  { id: 'build_muscle', label: 'Build Muscle', detail: 'Surplus optimized for muscle growth' },
                  { id: 'maintain', label: 'Maintain Weight', detail: 'Maintenance energy to keep weight steady' },
                  { id: 'body_recomposition', label: 'Improve Performance', detail: 'Slight deficit with high protein focus' },
                ].map((opt) => {
                  const isSelected = profile.goal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, goal: opt.id as UserGoal })}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-400 text-white'
                          : 'bg-[#12141A] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-white">{opt.label}</span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">{opt.detail}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Target Preview */}
              <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-zinc-400 block">Calculated Targets</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={calTargetInput}
                      onChange={(e) => setCalTargetInput(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-base font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={proTargetInput}
                      onChange={(e) => setProTargetInput(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-emerald-400 text-base font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-6 pt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-full transition-all text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Start Logging</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
