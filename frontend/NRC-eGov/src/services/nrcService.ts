import api from './api';

export const nrcService = {
  // Get all NRC centers
  getAllCenters: (district?: string) => {
    const params = district ? `?district=${district}` : '';
    return api.get(`/nrc/centers${params}`);
  },

  // Get specific NRC center
  getCenter: (nrcId: string) =>
    api.get(`/nrc/centers/${nrcId}`),

  // Get NRC occupancy
  getOccupancy: (nrcId: string) =>
    api.get(`/nrc/centers/${nrcId}/occupancy`),

  // Find nearest NRC with beds
  getNearestNRC: (latitude: number, longitude: number) =>
    api.get(`/nrc/nearest?latitude=${latitude}&longitude=${longitude}`),

  // Admit child to NRC
  admitChild: (admissionData: any) =>
    api.post('/nrc/admit', admissionData),

  // Update admission status
  updateAdmission: (admissionId: string, updateData: any) =>
    api.put(`/nrc/admissions/${admissionId}`, updateData),

  // Cache NRC centers
  cacheCenters: async (centers: any) => {
    const storage = require('@react-native-async-storage/async-storage').default;
    await storage.setItem('cachedNRCCenters', JSON.stringify(centers));
  },

  // Get cached centers
  getCachedCenters: async () => {
    const storage = require('@react-native-async-storage/async-storage').default;
    const cached = await storage.getItem('cachedNRCCenters');
    return cached ? JSON.parse(cached) : [];
  },
};
