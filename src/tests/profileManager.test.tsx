import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileManager from '../app/components/ProfileManager';

// Mock useAuth to provide user and accessToken
vi.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Test User' }, accessToken: 'test-token' }),
}));

describe('ProfileManager', () => {
  beforeEach(() => {
    // reset fetch mock
    globalThis.fetch = vi.fn();
  });

  it('creates a profile and lists it', async () => {
    // Mock GET profiles (initial: none)
    (globalThis.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ profiles: [] }) }));

    // Mock POST create profile
    const createdProfile = { profile: { id: 'p1', userId: 'user-1', displayName: 'New Profile', bio: '', visibility: 'public' } };
    (globalThis.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(createdProfile) }));

    render(<ProfileManager />);

    // Wait for initial fetch
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());

    // Enter display name and create profile
    const input = screen.getByPlaceholderText('Display name');
    fireEvent.change(input, { target: { value: 'New Profile' } });

    const createBtn = screen.getByText('Create profile');
    fireEvent.click(createBtn);

    // Wait for POST to be called
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));

    // Expect the new profile to appear in the list
    await waitFor(() => expect(screen.getByText('New Profile')).toBeInTheDocument());
  });

  it('deletes a profile', async () => {
    // Mock GET profiles (one existing)
    const existing = { profiles: [{ id: 'p1', userId: 'user-1', displayName: 'ToDelete', bio: '' }] };
    (globalThis.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve(existing) }));

    // Mock DELETE
    (globalThis.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) }));

    render(<ProfileManager />);

    await waitFor(() => expect(screen.getByText('ToDelete')).toBeInTheDocument());

    const deleteBtn = screen.getByText('Delete');
    // confirm dialog mock
    vi.stubGlobal('confirm', () => true);
    fireEvent.click(deleteBtn);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));

    // After deletion, the item should not be in the document
    await waitFor(() => expect(screen.queryByText('ToDelete')).not.toBeInTheDocument());
  });
});
