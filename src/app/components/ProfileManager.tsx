import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string | null;
  visibility?: 'public' | 'private';
  createdAt?: string;
}

export function ProfileManager() {
  const { user, accessToken } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // create form
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<'public'|'private'>('public');

  useEffect(() => {
    fetchProfiles();
  }, [user, accessToken]);

  const fetchProfiles = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/make-server-7c20c7e0/profiles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profiles');
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error('fetchProfiles error', err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`/make-server-7c20c7e0/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ displayName, bio, visibility }),
      });
      if (!res.ok) throw new Error('Create failed');
      const data = await res.json();
      setProfiles(prev => [data.profile, ...prev]);
      setDisplayName(''); setBio(''); setVisibility('public');
    } catch (err) {
      console.error('createProfile error', err);
      alert('Failed to create profile');
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`/make-server-7c20c7e0/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setProfiles(prev => prev.map(p => p.id === id ? data.profile : p));
    } catch (err) {
      console.error('updateProfile error', err);
      alert('Failed to update profile');
    }
  };

  const deleteProfile = async (id: string) => {
    if (!accessToken) return;
    if (!confirm('Delete this profile? This is irreversible.')) return;
    try {
      const res = await fetch(`/make-server-7c20c7e0/profiles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('deleteProfile error', err);
      alert('Failed to delete profile');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} className="p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Profiles</h2>

      {/* Create */}
      <div className="mb-4">
        <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mb-2" />
        <Textarea placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mb-2" />
        <div className="flex items-center space-x-2 mb-2">
          <label className="text-sm text-[var(--color-text-secondary)]">Visibility:</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="rounded-md border px-2 py-1">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <Button onClick={createProfile} size="sm">Create profile</Button>
      </div>

      <div>
        {loading ? <div>Loading profiles...</div> : (
          profiles.length === 0 ? <div className="text-sm text-[var(--color-text-secondary)]">No profiles yet.</div> : (
            <ul className="space-y-3">
              {profiles.map(p => (
                <li key={p.id} className="p-2 border rounded-md" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{p.displayName}</div>
                      <div className="text-sm text-[var(--color-text-secondary)]">{p.bio}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => updateProfile(p.id, { displayName: p.displayName + ' (edited)' })}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProfile(p.id)}>Delete</Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}

export default ProfileManager;
