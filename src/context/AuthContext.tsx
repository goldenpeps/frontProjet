'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, getUser, getToken, setUser as saveUser, setToken as saveToken, removeToken, isAuthenticated as checkAuth } from '@/services';
import { authService } from '@/services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation: vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const initAuth = async () => {
      if (checkAuth()) {
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Récupérer les infos utilisateur depuis l'API
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
            }
          } catch {
            removeToken();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message || 'Erreur de connexion' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch {
      // Erreur silencieuse
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && checkAuth(),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
