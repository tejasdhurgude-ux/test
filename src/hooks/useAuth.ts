import type { User } from 'firebase/auth';
import type { AuthContextValue } from '../context/AuthContext';

// TEMPORARY MOCK: always "signed in". Restore the real hook before real use.
const mockUser = { email: 'staff@sahyadri.local' } as User;

export function useAuth(): AuthContextValue {
  return { user: mockUser, loading: false };
}