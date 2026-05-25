import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const childService = {
  // Register new child
  registerChild: (childData: any) =>
    api.post('/children/register', childData),

  // Screen child and predict status
  screenChild: (screeningData: any) =>
    api.post('/children/screen', screeningData),

  // Get child by ID
  getChild: (childId: string) =>
    api.get(`/children/${childId}`),

  // Get all children for mother
  getChildrenByMother: async () => {
    try {
      const phone = await AsyncStorage.getItem('userPhone');
      if (!phone) throw new Error('No user phone found');
      return api.get(`/children/by-mother/${phone}`);
    } catch (error) {
      throw error;
    }
  },

  // Get children by district
  getChildrenByDistrict: (district: string, skip: number = 0, limit: number = 50) =>
    api.get(`/children/by-district/${district}?skip=${skip}&limit=${limit}`),

  // Get high-risk children (SAM cases)
  getHighRiskChildren: (limit: number = 20) =>
    api.get(`/children/high-risk/list?limit=${limit}`),

  // Get pending followups
  getPendingFollowups: (limit: number = 20) =>
    api.get(`/children/pending-followups/list?limit=${limit}`),

  // Cache children locally
  cacheChildren: async (children: any) => {
    await AsyncStorage.setItem('cachedChildren', JSON.stringify(children));
  },

  // Get cached children
  getCachedChildren: async () => {
    const cached = await AsyncStorage.getItem('cachedChildren');
    return cached ? JSON.parse(cached) : [];
  },
};
