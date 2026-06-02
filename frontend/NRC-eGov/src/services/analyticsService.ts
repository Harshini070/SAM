import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../api/client';

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return { Authorization: `Bearer ${token}` };
};

export const analyticsService = {
  /** GET /api/analytics/dashboard — live data with local-cache fallback */
  getDashboard: async () => {
    try {
      const headers = await getAuthHeader();
      const response = await client.get('/api/analytics/dashboard', { headers });
      const data = response.data;
      // Cache for offline use
      await AsyncStorage.setItem('cachedDashboard', JSON.stringify(data));
      return data;
    } catch (err: any) {
      // Offline fallback
      const cached = await AsyncStorage.getItem('cachedDashboard');
      if (cached) return JSON.parse(cached);

      // Last-resort: read from children cache
      let totalChildrenCount = 0;
      let samCount = 0;
      let mamCount = 0;
      let healthyCount = 0;
      let totalBeds = 0;
      let occupiedBeds = 0;
      let activeCenters = 0;

      try {
        const cachedChildren = await AsyncStorage.getItem('cachedChildren');
        if (cachedChildren) {
          const children = JSON.parse(cachedChildren);
          totalChildrenCount = children.length;
          samCount = children.filter((c: any) => c.health_status?.toLowerCase() === 'sam').length;
          mamCount = children.filter((c: any) => c.health_status?.toLowerCase() === 'mam').length;
          healthyCount = children.filter((c: any) => c.health_status?.toLowerCase() === 'healthy').length;
        }
        const cachedCenters = await AsyncStorage.getItem('cachedNRCCenters');
        if (cachedCenters) {
          const centers = JSON.parse(cachedCenters);
          activeCenters = centers.length;
          totalBeds = centers.reduce((s: number, c: any) => s + (c.total_beds || 0), 0);
          occupiedBeds = centers.reduce((s: number, c: any) => s + (c.occupied_beds || 0), 0);
        }
      } catch (e) {
        console.warn('Error reading local cache for analytics:', e);
      }

      return {
        total_children: totalChildrenCount,
        sam_children: samCount,
        mam_children: mamCount,
        healthy_children: healthyCount,
        pending_followups: samCount + mamCount,
        active_nrc_centers: activeCenters,
        total_beds: totalBeds,
        occupied_beds: occupiedBeds,
        nrc_occupancy: occupiedBeds,
        nrc_total_beds: totalBeds,
        nrc_occupancy_pct: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        recovery_percentage: 0,
        total_funds: 0,
        funds_utilized: 0,
        high_risk_children: samCount,
      };
    }
  },

  /** GET /api/analytics/state — state-level district breakdown */
  getStateAnalytics: async () => {
    try {
      const headers = await getAuthHeader();
      const response = await client.get('/api/analytics/state', { headers });
      const data = response.data;
      await AsyncStorage.setItem('cachedStateAnalytics', JSON.stringify(data));
      return data;
    } catch (err: any) {
      const cached = await AsyncStorage.getItem('cachedStateAnalytics');
      if (cached) return JSON.parse(cached);
      return { total_districts: 0, district_stats: [] };
    }
  },

  /** GET /api/analytics/district/:district */
  getDistrictAnalytics: async (district: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await client.get(`/api/analytics/district/${district}`, { headers });
      return response.data;
    } catch (err: any) {
      return { district, sam_cases: 0, mam_cases: 0, nrc_occupancy: 0, funds_utilized_pct: 0 };
    }
  },

  /** GET /api/analytics/nrc/:nrcId/performance */
  getNRCPerformance: async (nrcId: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await client.get(`/api/analytics/nrc/${nrcId}/performance`, { headers });
      return response.data;
    } catch (err: any) {
      return {
        nrc_id: nrcId,
        monthly_admissions: [0, 0, 0, 0, 0, 0],
        monthly_recoveries: [0, 0, 0, 0, 0, 0],
        average_stay_days: 0,
        dropout_rate_pct: 0,
      };
    }
  },

  cacheDashboard: async (data: any) => {
    await AsyncStorage.setItem('cachedDashboard', JSON.stringify(data));
  },

  getCachedDashboard: async () => {
    const cached = await AsyncStorage.getItem('cachedDashboard');
    return cached ? JSON.parse(cached) : null;
  },
};
