import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile,
  WeightEntry,
  BodyScanEntry,
  ActivityLogEntry,
  LoggedFoodEntry,
} from '../types';

export const DEFAULT_EMPTY_PROFILE: UserProfile = {
  name: '',
  age: 0,
  sex: 'male',
  heightCm: 0,
  weightKg: 0,
  unitSystem: 'metric',
  colorTheme: 'emerald',
  activityLevel: 'some_walking',
  workoutsPerWeek: '3-4',
  goal: 'body_recomposition',
  trainingExperience: 'some',
  trainingDaysPerWeek: 4,
  workoutDurationMins: 45,
  equipment: 'full_gym',
  dietaryPreferences: [],
  allergies: [],
  calorieTarget: 2200,
  proteinTargetG: 160,
  carbsTargetG: 220,
  fatTargetG: 65,
  selectedProgramId: 'upper_lower_4day',
  onboardingCompleted: false,
};

// --- PROFILE ---
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, 'users', userId);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return { ...DEFAULT_EMPTY_PROFILE, ...snap.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const profileRef = doc(db, 'users', userId);
  await setDoc(profileRef, { ...profile, userId, updatedAt: new Date().toISOString() }, { merge: true });
}

// --- WEIGHT ENTRIES ---
export function subscribeWeightEntries(
  userId: string,
  onData: (entries: WeightEntry[]) => void
): () => void {
  const colRef = collection(db, 'users', userId, 'weightEntries');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: WeightEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as WeightEntry);
      });
      // Sort descending by date
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      console.error('Error listening to weight entries:', err);
      onData([]);
    }
  );
}

export async function saveWeightEntry(userId: string, entry: Omit<WeightEntry, 'id'> & { id?: string }): Promise<string> {
  if (entry.id) {
    const docRef = doc(db, 'users', userId, 'weightEntries', entry.id);
    await setDoc(docRef, entry, { merge: true });
    return entry.id;
  } else {
    const colRef = collection(db, 'users', userId, 'weightEntries');
    const newDoc = await addDoc(colRef, entry);
    return newDoc.id;
  }
}

export async function deleteWeightEntry(userId: string, id: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'weightEntries', id);
  await deleteDoc(docRef);
}

// --- BODY SCANS ---
export function subscribeBodyScans(
  userId: string,
  onData: (entries: BodyScanEntry[]) => void
): () => void {
  const colRef = collection(db, 'users', userId, 'bodyScanEntries');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: BodyScanEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as BodyScanEntry);
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      console.error('Error listening to body scans:', err);
      onData([]);
    }
  );
}

export async function saveBodyScan(userId: string, scan: Omit<BodyScanEntry, 'id'> & { id?: string }): Promise<string> {
  if (scan.id) {
    const docRef = doc(db, 'users', userId, 'bodyScanEntries', scan.id);
    await setDoc(docRef, scan, { merge: true });
    return scan.id;
  } else {
    const colRef = collection(db, 'users', userId, 'bodyScanEntries');
    const newDoc = await addDoc(colRef, scan);
    return newDoc.id;
  }
}

export async function deleteBodyScan(userId: string, id: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'bodyScanEntries', id);
  await deleteDoc(docRef);
}

// --- ACTIVITY LOGS ---
export function subscribeActivityLogs(
  userId: string,
  onData: (entries: ActivityLogEntry[]) => void
): () => void {
  const colRef = collection(db, 'users', userId, 'activityLogs');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ActivityLogEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ActivityLogEntry);
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      console.error('Error listening to activity logs:', err);
      onData([]);
    }
  );
}

export async function saveActivityLog(userId: string, act: Omit<ActivityLogEntry, 'id'> & { id?: string }): Promise<string> {
  if (act.id) {
    const docRef = doc(db, 'users', userId, 'activityLogs', act.id);
    await setDoc(docRef, act, { merge: true });
    return act.id;
  } else {
    const colRef = collection(db, 'users', userId, 'activityLogs');
    const newDoc = await addDoc(colRef, act);
    return newDoc.id;
  }
}

export async function deleteActivityLog(userId: string, id: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'activityLogs', id);
  await deleteDoc(docRef);
}

// --- FOOD ENTRIES ---
export function subscribeFoodEntries(
  userId: string,
  onData: (entries: LoggedFoodEntry[]) => void
): () => void {
  const colRef = collection(db, 'users', userId, 'foodEntries');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: LoggedFoodEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as LoggedFoodEntry);
      });
      items.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
      onData(items);
    },
    (err) => {
      console.error('Error listening to food entries:', err);
      onData([]);
    }
  );
}

export async function saveFoodEntry(userId: string, entry: Omit<LoggedFoodEntry, 'id'> & { id?: string }): Promise<string> {
  if (entry.id) {
    const docRef = doc(db, 'users', userId, 'foodEntries', entry.id);
    await setDoc(docRef, entry, { merge: true });
    return entry.id;
  } else {
    const colRef = collection(db, 'users', userId, 'foodEntries');
    const newDoc = await addDoc(colRef, entry);
    return newDoc.id;
  }
}

export async function deleteFoodEntry(userId: string, id: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'foodEntries', id);
  await deleteDoc(docRef);
}

// --- DELETE ALL LOGGED DATA FOR USER ---
export async function deleteAllLoggedData(userId: string): Promise<void> {
  const collectionsToDelete = ['weightEntries', 'bodyScanEntries', 'activityLogs', 'foodEntries'];
  for (const colName of collectionsToDelete) {
    const colRef = collection(db, 'users', userId, colName);
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
}

// --- DELETE USER ACCOUNT & DATA ---
export async function deleteUserAccountAndAllData(userId: string): Promise<void> {
  await deleteAllLoggedData(userId);
  const userDocRef = doc(db, 'users', userId);
  await deleteDoc(userDocRef);
}
