import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { friendlyAuthError, signIn } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

export function LoginPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <p className="page-status" role="status">Checking your session…</p>;
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(isFirebaseConfigured ? friendlyAuthError(err) : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <form className="card login__card" onSubmit={handleSubmit}>
        <span className="header__logo" aria-hidden="true">S</span>
        <h1 className="login__title">Sahyadri Billing</h1>
        <p className="muted">Staff sign in. Accounts are created by the administrator.</p>
        <div className="field">
          <label htmlFor="email" className="field__label">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </div>
        <div className="field">
          <label htmlFor="password" className="field__label">Password</label>
          <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </div>
        {error && <p className="alert alert--error" role="alert">{error}</p>}
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
