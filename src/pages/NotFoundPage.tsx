import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="login">
      <div className="card login__card">
        <h1 className="login__title">Page not found</h1>
        <p className="muted">That address doesn’t exist in the billing system.</p>
        <Link className="btn btn--primary" to="/">Go to billing</Link>
      </div>
    </main>
  );
}
