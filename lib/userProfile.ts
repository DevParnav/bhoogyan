import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, isConfigured } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  purposes: string[];
  purposeOther: string | null;
  interests: string[];
  interestOther: string | null;
  organization: string;
  goal: string;
  profileCompleted: boolean;
  createdAt: any;
  updatedAt: any;
}

/**
 * Retrieves the user's profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isConfigured || !db) throw new Error('Firestore is not configured.');

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

/**
 * Creates or overwrites a user profile in Firestore.
 */
export async function createUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  if (!isConfigured || !db) throw new Error('Firestore is not configured.');

  const docRef = doc(db, 'users', uid);
  const profileData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, profileData, { merge: true });
}

/**
 * Updates an existing user profile in Firestore.
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  if (!isConfigured || !db) throw new Error('Firestore is not configured.');

  const docRef = doc(db, 'users', uid);
  const profileData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, profileData);
}

/**
 * Checks if the user's profile exists and is completed.
 */
export async function checkProfileCompletion(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  return !!profile && profile.profileCompleted === true;
}
