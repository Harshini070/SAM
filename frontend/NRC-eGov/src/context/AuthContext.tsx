import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type User = {
  phone: string;
  name?: string;
  role?: string | null;
};

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  login: (phone: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
} | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // fetch current user from service (mock or API)
        const res = await authService.getCurrentUser();

        console.log("USER DATA =", res.data);

        setUser(res.data || null);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, code: string) => {
    try {
      const data = await authService.verifyOTP(phone, code);

      console.log("LOGIN DATA =", data);
      // verifyOTP stores tokens; set user from returned payload when available
      const u = data.user || (await authService.getCurrentUser()).data;

      console.log("USER OBJECT =", u);

      setUser(u);

      setIsLoggedIn(true);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getCurrentUser();
      setUser(res.data || null);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
