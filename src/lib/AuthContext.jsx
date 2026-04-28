import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ceramicaCleopatra, setToken } from '@/api/ceramicaCleopatraClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,         setUser]         = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('cc_token');
    if (!token) { setIsLoading(false); return; }
    try {
      const { user: u, subscription: s } = await ceramicaCleopatra.auth.me();
      setUser(u);
      setSubscription(s);
    } catch {
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const login = async (email, password) => {
    const data = await ceramicaCleopatra.auth.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    setSubscription(data.subscription);
    return data;
  };

  const register = async (formData) => {
    const data = await ceramicaCleopatra.auth.register(formData);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSubscription(null);
    window.location.href = '/';
  };

  const isAuthenticated       = !!user;
  const isAdmin               = user?.role === 'admin';
  const isLoadingAuth         = isLoading;
  const isLoadingPublicSettings = false;
  const authError             = null;

  return (
    <AuthContext.Provider value={{
      user, subscription, isAuthenticated, isAdmin,
      isLoadingAuth, isLoadingPublicSettings, authError,
      login, register, logout, loadMe,
      navigateToLogin: () => { window.location.href = '/Login'; },
      checkAppState: loadMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
