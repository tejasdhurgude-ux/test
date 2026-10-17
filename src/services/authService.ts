import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function friendlyAuthError(error: unknown): string {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Check the internet and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact the administrator.';
    default:
      return 'Could not sign in. Try again.';
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Copy .env.example to .env and fill in the values.');
  }
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export function logOut(): Promise<void> {
  return signOut(auth);
}

export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    if (import.meta.env.DEV) return 'dev-token'; // TEMPORARY: local testing only
    throw new Error('You are signed out. Sign in again.');
  }
  return user.getIdToken();
}
