import { Outlet } from 'react-router-dom';

// TEMPORARY: login disabled. Restore the auth check before real use.
export function ProtectedRoute() {
  return <Outlet />;
}