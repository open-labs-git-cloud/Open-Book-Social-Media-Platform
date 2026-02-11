import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, token: string) => {
    try {
      console.log('Fetching user profile for userId:', userId);
      console.log('Using access token (first 20 chars):', token.substring(0, 20) + '...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('User profile fetched successfully:', data.user);
        setUser(data.user);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch user profile:', response.status, errorData);
        console.error('This may be a token validation issue on the server');
        
        // TEMPORARY WORKAROUND: Use data from KV store or create a basic profile
        console.warn('[WORKAROUND] Bypassing server auth, creating local user profile');
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            avatar: null
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      
      // TEMPORARY WORKAROUND: Use basic auth data
      console.warn('[WORKAROUND] Using fallback auth data');
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(token);
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            avatar: null
          });
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const refreshUser = async () => {
    if (accessToken && user) {
      await fetchUserProfile(user.id, accessToken);
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token && session?.user) {
        setAccessToken(session.access_token);
        await fetchUserProfile(session.user.id, session.access_token);
      }
      
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[Login] Starting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Login] Login error:', error.message);
      throw new Error(error.message);
    }

    console.log('[Login] Login successful');
    console.log('[Login] User ID:', data.user?.id);
    console.log('[Login] Session exists:', !!data.session);
    console.log('[Login] Access token length:', data.session?.access_token?.length);

    if (data.session && data.user) {
      setAccessToken(data.session.access_token);
      console.log('[Login] Token set, fetching user profile...');
      await fetchUserProfile(data.user.id, data.session.access_token);
    } else {
      console.error('[Login] No session or user data returned');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-7c20c7e0/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // Auto login after signup
    await login(email, password);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}