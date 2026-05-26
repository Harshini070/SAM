import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const phone = await AsyncStorage.getItem('userPhone');
      if (token && phone) {
        setIsLoggedIn(true);
        setUserPhone(phone);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, code: string) => {
    try {
      await authService.verifyOTP(phone, code);
      setIsLoggedIn(true);
      setUserPhone(phone);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      setUserPhone(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, userPhone, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
