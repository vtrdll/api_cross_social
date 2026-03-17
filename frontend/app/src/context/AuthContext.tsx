import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Profile } from '@/types';
import api from '@/services/api';

interface AuthContextType {
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/');
      setProfile(data);
    } catch {
      setProfile(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/token/', { username, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchProfile();
  }, [fetchProfile]);

  const register = useCallback(async (formData: Record<string, unknown>) => {
    const { data } = await api.post('/register/', formData);
    if (data.access && data.refresh) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      await fetchProfile();
    }
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      profile,
      isAuthenticated: !!profile,
      isLoading,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
