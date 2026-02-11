import { useState } from 'react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function SeedUsers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSeedUsers = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Triggering seed users endpoint...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/seed-users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed users');
      }

      console.log('Seed users result:', data);
      setResult(data);
    } catch (err) {
      console.error('Seed users error:', err);
      setError(err instanceof Error ? err.message : 'Failed to seed users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)' }} className="p-6 rounded-lg shadow-md">
      <h2 style={{ color: 'var(--color-text)' }} className="text-2xl font-bold mb-4">
        Create Dummy Profiles
      </h2>
      
      <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
        Click the button below to create 25 dummy South African user profiles. 
        All profiles will have the password: <code className="bg-gray-100 px-2 py-1 rounded">Password123!</code>
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold mb-2">Success! 🎉</h3>
          <p>Created: {result.created} users</p>
          {result.errors > 0 && <p>Errors: {result.errors} (likely already existed)</p>}
          
          {result.users && result.users.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer font-semibold">View created users</summary>
              <ul className="mt-2 space-y-1">
                {result.users.map((user: any) => (
                  <li key={user.id} className="text-sm">
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <Button
        onClick={handleSeedUsers}
        disabled={loading}
        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        className="w-full py-3 text-lg font-semibold rounded-md hover:opacity-90"
      >
        {loading ? 'Creating 25 Dummy Profiles...' : 'Create 25 Dummy Profiles'}
      </Button>

      {result && result.users && (
        <div style={{ backgroundColor: 'var(--color-background)' }} className="mt-4 p-4 rounded">
          <h3 style={{ color: 'var(--color-text)' }} className="font-bold mb-2">
            Dummy User Details
          </h3>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-2">
            You can login with any of these accounts using the email and password: <strong>Password123!</strong>
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            Example accounts include: Thabo Mokwena, Zanele Dlamini, Pieter van der Merwe, Nomsa Khumalo, 
            and many more diverse South African personalities from different cities and professions.
          </p>
        </div>
      )}
    </div>
  );
}
