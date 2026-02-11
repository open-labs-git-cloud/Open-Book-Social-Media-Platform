import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';

export function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen flex items-center justify-center">
        <div style={{ color: 'var(--color-primary)' }} className="text-2xl font-semibold">
          Loading OpenBook...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen">
      <Navbar />
      <Outlet />
    </div>
  );
}
