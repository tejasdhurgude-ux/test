import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth } from '../services/authService';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// DEV ONLY: set VITE_SKIP_AUTH=true in .env to bypass login while running `npm run dev`.
// import.meta.env.DEV is false in production builds, so this can never skip auth when deployed.
const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';
const DEV_USER = { email: 'dev@local (auth skipped)' } as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(SKIP_AUTH ? DEV_USER : null);
  const [loading, setLoading] = useState(!SKIP_AUTH);

  useEffect(
    () =>
      SKIP_AUTH ? undefined : subscribeToAuth((next) => {
        setUser(next);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
