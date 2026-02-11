import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting signup with email:', email, 'name:', name);
      await signup(email, password, name);
      console.log('Signup successful, navigating to feed');
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-background)' }} className="min-h-screen flex items-center justify-center p-4">
      <div style={{ backgroundColor: 'var(--color-surface)' }} className="w-full max-w-md rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 style={{ color: 'var(--color-primary)' }} className="text-4xl font-bold mb-2">Sign Up</h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            It's quick and easy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
          />

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
            minLength={6}
            className="w-full"
          />

          <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
            By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
          </p>

          <Button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}
            className="w-full py-3 text-lg font-semibold rounded-md hover:opacity-90"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              style={{ color: 'var(--color-primary)' }}
              className="text-sm hover:underline"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}