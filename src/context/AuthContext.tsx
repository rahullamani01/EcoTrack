import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  requestActivation: (prn: string) => Promise<{
    success: boolean;
    error?: string;
    maskedEmail?: string;
    department?: string;
    fullName?: string;
    evaluatorNotice?: string;
  }>;
  verifyActivation: (
    prn: string,
    code: string,
    password: string,
    residenceHall?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  addPoints: (points: number) => void;
  incrementChallenges: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecotrack_auth_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session with backend server on startup
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('ecotrack_auth_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setToken(savedToken);
        } else {
          // Token invalid on server; fail safe
          setUser(null);
          setToken(null);
          localStorage.removeItem('ecotrack_auth_token');
        }
      } else {
        // Unauthenticated or expired session
        setUser(null);
        setToken(null);
        localStorage.removeItem('ecotrack_auth_token');
      }
    } catch (err) {
      console.warn('[Auth] Server unavailable or network error during session validation:', err);
      // Fail safely: never grant access when backend validation fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Genuine server-side authentication
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials. Please verify your PRN/Email and password.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ecotrack_auth_token', data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Unable to connect to the authentication server. Please check your network connection and retry.',
      };
    }
  };

  // Student activation request (Validates PRN against official SGU roster)
  const requestActivation = async (prn: string) => {
    try {
      const res = await fetch('/api/auth/activate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to request activation code.' };
      }

      return {
        success: true,
        maskedEmail: data.maskedEmail,
        department: data.department,
        fullName: data.fullName,
        evaluatorNotice: data.evaluatorNotice,
      };
    } catch (err) {
      return {
        success: false,
        error: 'Network error communicating with SGU roster server. Please retry.',
      };
    }
  };

  // Student activation verify (Enforces single-use verification code & password hashing)
  const verifyActivation = async (
    prn: string,
    code: string,
    password: string,
    residenceHall?: string
  ) => {
    try {
      const res = await fetch('/api/auth/activate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn, code, password, residenceHall }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('ecotrack_auth_token', data.token);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Network error completing activation. Please retry.',
      };
    }
  };

  // Logout invalidates session on server and clears client token
  const logout = async () => {
    const currentToken = token || localStorage.getItem('ecotrack_auth_token');
    if (currentToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentToken}` },
        });
      } catch {
        // ignore network error on logout
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecotrack_auth_token');
  };

  const addPoints = (pts: number) => {
    setUser((prev) => (prev ? { ...prev, points: prev.points + pts } : prev));
  };

  const incrementChallenges = () => {
    setUser((prev) =>
      prev ? { ...prev, completedChallengesCount: prev.completedChallengesCount + 1 } : prev
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        requestActivation,
        verifyActivation,
        logout,
        refreshUser,
        addPoints,
        incrementChallenges,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
