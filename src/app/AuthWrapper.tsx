'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: any;
  loading: boolean;
  userLogin: (email: string, otp: string) => Promise<boolean>;
  userLogout: () => Promise<void>;
  login: (email: string) => Promise<boolean>;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Send OTP to email
  const login = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return !!data.success;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and login
  const userLogin = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (err) {
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const userLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {}
    setUser(null);
    setLoading(false);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    userLogin,
    userLogout,
    login,
    setEmail,
    setPassword,
    email,
    password,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
