"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getAuthKey, loginWithKey, clearAuth } from '@/app/lib/keys';

interface AuthContextType {
  isLoggedIn: boolean;
  key: string | null;
  isLoading: boolean;
  login: (key: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    key: string | null;
    isLoading: boolean;
  }>({
    isLoggedIn: false,
    key: null,
    isLoading: true, // Start loading
  });

  // Check auth only once on mount
  useEffect(() => {
    // Small timeout to allow the page to render first (prevents flash)
    const timer = setTimeout(() => {
      const loggedIn = isAuthenticated();
      const key = getAuthKey();
      setAuthState({
        isLoggedIn: loggedIn,
        key: key,
        isLoading: false,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = useCallback((key: string): { success: boolean; message: string } => {
    const result = loginWithKey(key);
    
    if (result.success) {
      setAuthState({
        isLoggedIn: true,
        key: key.trim(),
        isLoading: false,
      });
    }
    
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthState({
      isLoggedIn: false,
      key: null,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
