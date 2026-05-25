import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Request OTP
  requestOTP: (phone: string) =>
    api.post('/auth/parent/request-otp', { phone }),

  // Verify OTP and get tokens
  verifyOTP: async (phone: string, code: string) => {
    const response = await api.post('/auth/parent/verify-otp', { phone, code });
    if (response.data.access_token) {
      await AsyncStorage.setItem('accessToken', response.data.access_token);
      await AsyncStorage.setItem('refreshToken', response.data.refresh_token);
      await AsyncStorage.setItem('userPhone', phone);
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userPhone');
  },

  // Check if logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },
};
