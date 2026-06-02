import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../api/client';

export const parentService = {
  // Update parent profile name and district
  updateProfile: async (name: string, district: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.put(
      '/api/auth/profile',
      { name, district },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Fetch recent alerts for parent
  getMyAlerts: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.get(
      '/api/alerts/my-alerts',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.alerts || [];
  },

  // Mark alert as read
  markAlertAsRead: async (alertId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.put(
      `/api/alerts/${alertId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Mark all alerts as read
  markAllAlertsAsRead: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.put(
      '/api/alerts/read-all',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Delete/Clear all alerts
  clearAllAlerts: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.delete(
      '/api/alerts/clear-all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Delete a single alert
  deleteAlert: async (alertId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.delete(
      `/api/alerts/${alertId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
