
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
  verifyOTP: async (
    phone: string,
    code: string,
    role: string = 'Parent'
  ) => {
    await delay(1000);
    if (code !== '1234') {
      throw new Error('Invalid OTP. Use 1234 for testing.');
    }
    const data = {
      access_token: 'mock-access-token-xyz123',
      refresh_token: 'mock-refresh-token-xyz123',
      user: {
        phone,
        name: 'Test User',
        role: role,
        district: 'Raipur',
      },
    };
    await AsyncStorage.setItem('accessToken', data.access_token);
    await AsyncStorage.setItem('refreshToken', data.refresh_token);
    await AsyncStorage.setItem('userPhone', phone);
    await AsyncStorage.setItem('selectedRole', role);
    return data;
  },

  // Get current user (mock)
  getCurrentUser: async () => {
    await delay(500);
    const phone = await AsyncStorage.getItem('userPhone') || '9876543210';
    return {
      data: {
        phone,
        name: 'Test User',
        role: await AsyncStorage.getItem('selectedRole') || 'Parent',
        district: 'Raipur',
        anganwadi_code: 'AW-492001',
      },
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
