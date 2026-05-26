<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Request OTP (mock)
  requestOTP: async (phone: string) => {
    await delay(800);
    if (!phone || phone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }
    return { success: true, message: 'OTP sent successfully' };
  },

  // Verify OTP and get tokens (mock)
  verifyOTP: async (phone: string, code: string) => {
    await delay(1000);
    if (code !== '1234') {
      throw new Error('Invalid OTP. Use 1234 for testing.');
    }
    const data = {
      access_token: 'mock-access-token-xyz123',
      refresh_token: 'mock-refresh-token-xyz123',
      user: {
        phone,
        name: 'Chhattisgarh Officer',
        role: 'Supervisor',
        district: 'Raipur',
      },
    };
    await AsyncStorage.setItem('accessToken', data.access_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token);
    await AsyncStorage.setItem('userPhone', phone);
    return data;
  },

  // Get current user (mock)
  getCurrentUser: async () => {
    await delay(500);
    const phone = await AsyncStorage.getItem('userPhone') || '9876543210';
    return {
      data: {
        phone,
        name: 'Chhattisgarh Officer',
        role: 'Supervisor',
        district: 'Raipur',
        anganwadi_code: 'AW-492001',
      },
    };
  },

  // Logout (mock)
  logout: async () => {
    await delay(400);
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userPhone');
  },

<<<<<<< HEAD
  // Check if logged in (mock)
=======
  // Check if logged in
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },
};
