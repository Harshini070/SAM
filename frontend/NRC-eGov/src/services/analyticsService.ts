import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  // Get dashboard statistics dynamically from local storage if available
  getDashboard: async () => {
    await delay(1000);
    
    // Fetch current counts from child records
    let totalChildrenCount = 4;
    let samCount = 2;
    let mamCount = 1;
    let healthyCount = 1;
    
    try {
      const cached = await AsyncStorage.getItem('cachedChildren');
      if (cached) {
        const children = JSON.parse(cached);
        totalChildrenCount = children.length;
        samCount = children.filter((c: any) => c.health_status?.toUpperCase() === 'SAM').length;
        mamCount = children.filter((c: any) => c.health_status?.toUpperCase() === 'MAM').length;
        healthyCount = children.filter((c: any) => c.health_status?.toUpperCase() === 'HEALTHY' || c.health_status?.toUpperCase() === 'NORMAL').length;
      }
    } catch (e) {
      console.warn('Error reading cached children in analytics:', e);
    }

    // Fetch current beds from NRC records
    let totalBeds = 90;
    let occupiedBeds = 66;
    let activeCenters = 5;
    try {
      const cachedCenters = await AsyncStorage.getItem('cachedNRCCenters');
      if (cachedCenters) {
        const centers = JSON.parse(cachedCenters);
        activeCenters = centers.length;
        totalBeds = centers.reduce((sum: number, c: any) => sum + c.total_beds, 0);
        occupiedBeds = centers.reduce((sum: number, c: any) => sum + c.occupied_beds, 0);
      }
    } catch (e) {
      console.warn('Error reading cached centers in analytics:', e);
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
      nrc_occupancy_pct: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      recovery_rate: 76.5,
      total_funds: 240, // in Lakhs
      spent_funds: 184, // in Lakhs
      district_stats: [
        { name: 'Raipur', amount: 84, percentage: 84 },
        { name: 'Durg', amount: 52, percentage: 76 },
        { name: 'Bastar', amount: 38, percentage: 68 },
        { name: 'Bilaspur', amount: 24, percentage: 48 },
      ],
    };
  },

  // Get district analytics
  getDistrictAnalytics: async (district: string) => {
    await delay(700);
    return {
      district: district,
      sam_cases: district === 'Bastar' ? 12 : 5,
      mam_cases: district === 'Bastar' ? 18 : 8,
      nrc_occupancy: district === 'Bastar' ? 88 : 64,
      funds_utilized_pct: district === 'Bastar' ? 82 : 71,
    };
  },

  // Get state analytics (admin only)
  getStateAnalytics: async () => {
    await delay(900);
    return {
      total_districts: 33,
      total_nrcs: 142,
      active_sam_registries: 12480,
      admitted_nrc_cases: 1980,
      recovery_rate: 74.2,
      funds_available: 24000000,
    };
  },

  // Get NRC performance
  getNRCPerformance: async (nrcId: string) => {
    await delay(600);
    return {
      nrc_id: nrcId,
      monthly_admissions: [24, 28, 30, 25, 22, 29],
      monthly_recoveries: [18, 22, 24, 21, 19, 23],
      average_stay_days: 17.5,
      dropout_rate_pct: 3.2,
    };
  },

  // Cache dashboard (mock)
  cacheDashboard: async (data: any) => {
    await AsyncStorage.setItem('cachedDashboard', JSON.stringify(data));
  },

  // Get cached dashboard (mock)
  getCachedDashboard: async () => {
    const cached = await AsyncStorage.getItem('cachedDashboard');
    return cached ? JSON.parse(cached) : null;
  },
};
