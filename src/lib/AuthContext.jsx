import React, { createContext, useState, useContext } from 'react';
import { ceramicaCleopatra } from '@/api/ceramicaCleopatraClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user]                       = useState(null);
  const [isAuthenticated]            = useState(false);
  const [isLoadingAuth]              = useState(false);
  const [isLoadingPublicSettings]    = useState(false);
  const [authError]                  = useState(null);

  const logout = () => {
    try { ceramicaCleopatra.auth.logout(); } catch {}
  };

  const navigateToLogin   = () => {};
  const checkAppState     = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
