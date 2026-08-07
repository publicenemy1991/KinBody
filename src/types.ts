export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type PrimaryTab = 'log' | 'activity' | 'body' | 'progress' | 'profile';

export interface ActivityLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "7:35 AM"
  activityType: string; // e.g. "Morning Walk"
  durationMinutes?: number;
  distanceKm?: number;
  steps?: number;
  activeCalories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  pace?: string;
  speedKmh?: number;
  notes?: string;
  screenshotUrl?: string;
  isConfirmed: boolean;
  loggedAt: string; // ISO string
}

export type UserGoal =
  | 'body_recomposition'
  | 'lose_fat'
  | 'build_muscle'
  | 'maintain'
  | 'awareness';

export type ActivityLevel =
  | 'mostly_seated'
  | 'some_walking'
  | 'frequently_active'
  | 'physically_demanding';

export type TrainingExperience = 'new' | 'some' | 'regular' | 'advanced';

export type EquipmentAccess =
  | 'full_gym'
  | 'basic_gym'
  | 'home_gym'
  | 'dumbbells'
  | 'bodyweight';

export interface NutritionInfo {
  calories: number;
  energyKj?: number;
  energyUnit?: 'kcal' | 'kJ';
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG?: number;
  sugarG?: number;
  fibreG?: number;
  sodiumMg?: number;
  epaMg?: number;
  dhaMg?: number;
  magnesiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  potassiumMg?: number;
  vitDMg?: number;
  vitCMg?: number;
  zincMg?: number;
}

export interface ServingInfo {
  amount: number;
  unit: string;
  label?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  serving: ServingInfo;
  nutritionPerServing: NutritionInfo;
  nutritionPer100g?: NutritionInfo;
  category?: string;
  source?: 'open_food_facts' | 'aus_database' | 'custom' | 'ai_estimate';
  isFavourite?: boolean;
}

export interface LoggedFoodEntry {
  id: string;
  mealType: MealType;
  foodItem: FoodItem;
  servings: number;
  loggedAt: string; // ISO string
  date: string; // YYYY-MM-DD
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: LoggedFoodEntry[];
}

export interface LoggedWorkoutEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  muscleFocus: string;
  durationMins: number;
  exercisesCompleted: number;
  loggedAt: string;
  source?: 'manual' | 'garmin' | 'strava' | 'apple_health';
}

export interface LoggedActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'steps' | 'walk' | 'run' | 'workout' | 'body_scan' | 'health_update';
  title: string;
  detail: string;
  source?: 'garmin' | 'samsung_health' | 'strava' | 'apple_health' | 'evolt' | 'manual';
  loggedAt: string;
  value?: string | number;
}

export interface BodyScanEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  weightKg?: number;
  bodyFatPercent?: number;
  skeletalMuscleKg?: number;
  leanMassKg?: number;
  fatMassKg?: number;
  visceralFatRating?: number;
  scanImageUrl?: string;
  source?: 'evolt' | 'inbody' | 'manual';
  loggedAt: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export type ColorTheme = 'emerald' | 'cream' | 'bw_monotone';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  unitSystem?: UnitSystem;
  colorTheme?: ColorTheme;
  activityLevel: ActivityLevel;
  workoutsPerWeek: string;
  goal: UserGoal;
  trainingExperience: TrainingExperience;
  trainingDaysPerWeek: number;
  workoutDurationMins: number;
  equipment: EquipmentAccess;
  dietaryPreferences: string[];
  allergies: string[];
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  skeletalMuscleKg?: number;
  leanMassKg?: number;
  fatMassKg?: number;
  visceralFatRating?: number;
  selectedProgramId: string;
  onboardingCompleted: boolean;
  onboardingStep?: number;
}

export interface NutrientDetail {
  key: string;
  name: string;
  dailyTargetText: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  statusLabel: 'Good' | 'Optimal' | 'Low' | 'Below Target';
  description: string;
  whyItMatters: string;
  evidenceStrengthStars: number; // 1-5
  topSourcesToday: Array<{ foodName: string; amountText: string }>;
  evidenceNotes: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  anatomicalGroup: 'back' | 'chest' | 'quads' | 'hamstrings' | 'delts' | 'biceps' | 'triceps' | 'core';
  sets: ExerciseSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  programId: string;
  name: string;
  muscleFocus: string;
  exercises: Exercise[];
  estimatedDurationMins: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  tagline: string;
  description: string;
  daysPerWeek: number;
  splitType: string;
  highlights: string[];
}


