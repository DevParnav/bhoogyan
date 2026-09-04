import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  signOut,
  AuthError
} from 'firebase/auth';
import { auth, isConfigured } from './firebase';

export const logoutUser = async () => {
  if (!isConfigured || !auth) {
    throw new Error('auth/missing-configuration');
  }
  return await signOut(auth);
};

export function getFriendlyErrorMessage(error: any): string {
  if (!error || !error.code) return 'An unexpected error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export const loginWithEmail = async (email: string, password: string) => {
  if (!isConfigured || !auth) {
    throw new Error('auth/missing-configuration');
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  if (!isConfigured || !auth) {
    throw new Error('auth/missing-configuration');
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const resetPassword = async (email: string) => {
  if (!isConfigured || !auth) {
    throw new Error('auth/missing-configuration');
  }
  return await sendPasswordResetEmail(auth, email);
};

export const signUp = async (email: string, password: string) => {
  if (!isConfigured || !auth) {
    throw new Error('auth/missing-configuration');
  }
  return await createUserWithEmailAndPassword(auth, email, password);
};
