import api from './api';

export const analyticsService = {
  // Get dashboard
  getDashboard: () =>
    api.get('/analytics/dashboard'),

  // Get district analytics
  getDistrictAnalytics: (district: string) =>
    api.get(`/analytics/district/${district}`),

  // Get state analytics (admin only)
  getStateAnalytics: () =>
    api.get('/analytics/state'),

  // Get NRC performance
  getNRCPerformance: (nrcId: string) =>
    api.get(`/analytics/nrc/${nrcId}/performance`),

  // Cache dashboard
  cacheDashboard: async (data: any) => {
    const storage = require('@react-native-async-storage/async-storage').default;
    await storage.setItem('cachedDashboard', JSON.stringify(data));
    await storage.setItem('dashboardCacheTime', new Date().toISOString());
  },

  // Get cached dashboard
  getCachedDashboard: async () => {
    const storage = require('@react-native-async-storage/async-storage').default;
    const cached = await storage.getItem('cachedDashboard');
    return cached ? JSON.parse(cached) : null;
  },
};
