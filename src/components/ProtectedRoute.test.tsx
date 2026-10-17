import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth');
const mockedUseAuth = vi.mocked(useAuth);

function renderRoutes() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<p>Billing page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is checked', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true });
    renderRoutes();
    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
  });
  it('redirects signed-out users to login', () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false });
    renderRoutes();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
  it('renders the page for signed-in staff', () => {
    mockedUseAuth.mockReturnValue({ user: { email: 'staff@example.com' } as never, loading: false });
    renderRoutes();
    expect(screen.getByText('Billing page')).toBeInTheDocument();
  });
});
