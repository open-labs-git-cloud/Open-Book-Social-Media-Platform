import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileManager from './ProfileManager';
import { Button } from './ui/button';

export function AccountSettings() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Account settings</h1>

      <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{user?.name}</div>
            <div className="text-sm text-[var(--color-text-secondary)]">{user?.email}</div>
          </div>
          <div>
            <Button variant="ghost" onClick={logout}>Log out</Button>
          </div>
        </div>
      </div>

      <ProfileManager />
    </div>
  );
}

export default AccountSettings;
