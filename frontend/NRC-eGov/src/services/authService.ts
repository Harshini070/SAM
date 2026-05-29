import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../api/client';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Request OTP (mock)
  requestOTP: async (phone: string) => {
    const response = await client.post(
      '/api/auth/parent/request-otp',
      {
        phone,
      }
    );

    return response.data;
  },

  // Verify OTP and get tokens (mock)
  verifyOTP: async (
    phone: string,
    code: string,
    role: string = 'Parent'
  ) => {

    const response = await client.post(
      '/api/auth/parent/verify-otp',
      {
        phone,
        code,
      }
    );

    const data = response.data;

    await AsyncStorage.setItem(
      'accessToken',
      data.access_token
    );

    await AsyncStorage.setItem(
      'refreshToken',
      data.refresh_token
    );

    await AsyncStorage.setItem(
      'userPhone',
      phone
    );

    await AsyncStorage.setItem(
      'selectedRole',
      role
    );

    return data;
  },

  // Get current user (mock)
  getCurrentUser: async () => {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await client.get(
      '/api/auth/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      data: response.data,
    };
  },

  // Logout (mock)
  logout: async () => {
    await delay(400);
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userPhone');
  },


  // Check if logged in (mock)
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },
};
