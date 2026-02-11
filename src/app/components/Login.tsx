import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with email:', email);
      await login(email, password);
      console.log('Login successful, navigating to feed');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen flex items-center justify-center p-4">
      <div style={{ backgroundColor: 'var(--color-surface)' }} className="w-full max-w-md rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 style={{ color: 'var(--color-primary)' }} className="text-5xl font-bold mb-2">OpenBook</h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            Connect with friends and the world around you on OpenBook.
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs mt-2">
            💡 New here? Create an account below to get started!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />

          <Button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            className="w-full py-3 text-lg font-semibold rounded-md hover:opacity-90"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <div className="text-center">
            <Link
              to="/signup"
              style={{ color: 'var(--color-primary)' }}
              className="text-sm hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <hr style={{ borderColor: 'var(--color-border)' }} className="my-4" />

          <div className="text-center">
            <Link to="/signup">
              <Button
                type="button"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
                className="px-6 py-3 text-lg font-semibold rounded-md hover:opacity-90"
              >
                Create New Account
              </Button>
            </Link>
          </div>
        </form>

        <div style={{ color: 'var(--color-text-secondary)' }} className="text-center mt-8 text-xs">
          <p>Building data sovereignty for South Africa 🇿🇦</p>
        </div>
      </div>
    </div>
  );
}