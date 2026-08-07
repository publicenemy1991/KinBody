import { UserGoal } from '../types';

interface TargetCalculationParams {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  goal: UserGoal;
}

export interface TargetCalculationResult {
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

export function calculateTargets({
  weightKg,
  heightCm,
  age,
  sex,
  goal,
}: TargetCalculationParams): TargetCalculationResult {
  const safeWeight = weightKg > 0 ? weightKg : 75;
  const safeHeight = heightCm > 0 ? heightCm : 175;
  const safeAge = age > 0 ? age : 28;

  // Mifflin-St Jeor BMR
  let bmr = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
  if (sex === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  // Activity Multiplier (~1.375 for light-moderate training)
  const tdee = Math.round(bmr * 1.375);

  let calorieTarget = tdee;
  let proteinPerKg = 2.0;

  switch (goal) {
    case 'lose_fat':
      // 18% Calorie Deficit for weight loss
      calorieTarget = Math.round(tdee * 0.82);
      // Higher protein (2.2g/kg) to protect lean muscle mass during fat loss
      proteinPerKg = 2.2;
      break;

    case 'build_muscle':
      // 10% Calorie Surplus for muscle gain
      calorieTarget = Math.round(tdee * 1.10);
      proteinPerKg = 2.0;
      break;

    case 'maintain':
      calorieTarget = tdee;
      proteinPerKg = 1.8;
      break;

    case 'body_recomposition':
    default:
      // Slight 10% deficit with high protein
      calorieTarget = Math.round(tdee * 0.90);
      proteinPerKg = 2.1;
      break;
  }

  const proteinTargetG = Math.round(safeWeight * proteinPerKg);

  // Balanced Carbs & Fats remaining
  // Fat: 25% of calories
  const fatCalories = calorieTarget * 0.25;
  const fatTargetG = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const proteinCalories = proteinTargetG * 4;
  const carbCalories = Math.max(calorieTarget - proteinCalories - fatCalories, calorieTarget * 0.25);
  const carbsTargetG = Math.round(carbCalories / 4);

  return {
    calorieTarget: Math.max(calorieTarget, 1200),
    proteinTargetG: Math.max(proteinTargetG, 80),
    carbsTargetG: Math.max(carbsTargetG, 100),
    fatTargetG: Math.max(fatTargetG, 35),
  };
}
