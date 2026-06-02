
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../api/client';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_MOCK_CENTERS = [
  {
    nrc_id: 'NRC-07',
    name: 'Raipur Civil Hospital NRC Center #07',
    district: 'Raipur',
    address: 'Civil Hospital Road, Devendra Nagar, Raipur, CG',
    phone: '0771-4091223',
    total_beds: 20,
    occupied_beds: 17,
    staff_count: 8,
    latitude: 21.2514,
    longitude: 81.6296,
  },
  {
    nrc_id: 'NRC-12',
    name: 'Durg District Hospital NRC',
    district: 'Durg',
    address: 'District Hospital Campus, G.E. Road, Durg, CG',
    phone: '0788-2210433',
    total_beds: 15,
    occupied_beds: 9,
    staff_count: 6,
    latitude: 21.1904,
    longitude: 81.2849,
  },
  {
    nrc_id: 'NRC-03',
    name: 'Bastar Maharani Hospital NRC',
    district: 'Bastar',
    address: 'Maharani Hospital, Jagdalpur, Bastar, CG',
    phone: '07782-222340',
    total_beds: 25,
    occupied_beds: 22,
    staff_count: 12,
    latitude: 19.0734,
    longitude: 82.0223,
  },
  {
    nrc_id: 'NRC-09',
    name: 'Bilaspur CIMS NRC Center',
    district: 'Bilaspur',
    address: 'CIMS Hospital Campus, Sadar Bazar, Bilaspur, CG',
    phone: '07752-232145',
    total_beds: 20,
    occupied_beds: 11,
    staff_count: 9,
    latitude: 22.0790,
    longitude: 82.1399,
  },
  {
    nrc_id: 'NRC-22',
    name: 'Rajnandgaon District Hospital NRC',
    district: 'Rajnandgaon',
    address: 'Civil Lines, Rajnandgaon, CG',
    phone: '07744-224050',
    total_beds: 15,
    occupied_beds: 7,
    staff_count: 6,
    latitude: 21.0963,
    longitude: 81.0319,
  },
];

const getStoredCenters = async () => {
  const data = await AsyncStorage.getItem('cachedNRCCenters');
  if (data) return JSON.parse(data);
  await AsyncStorage.setItem('cachedNRCCenters', JSON.stringify(INITIAL_MOCK_CENTERS));
  return INITIAL_MOCK_CENTERS;
};

export const nrcService = {
  // Get all NRC centers (from API)
  getAllCenters: async (district?: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.get('/api/nrc/centers', {
      params: district && district !== 'All Districts' ? { district } : {},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.centers;
  },

  // Get specific NRC center (from API)
  getCenter: async (nrcId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.get(`/api/nrc/centers/${nrcId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: response.data };
  },

  // Get NRC occupancy (from API)
  getOccupancy: async (nrcId: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.get(`/api/nrc/centers/${nrcId}/occupancy`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Find nearest NRC with beds (from API)
  getNearestNRC: async (latitude: number, longitude: number) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.get('/api/nrc/nearest', {
      params: { latitude, longitude },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { data: response.data };
  },

  // Admit child to NRC (from API)
  admitChild: async (admissionData: any) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.post(
      '/api/nrc/admit',
      {
        child_id: admissionData.child_id,
        nrc_id: admissionData.nrc_id,
        treatment_notes: admissionData.treatment_notes || 'Referred for treatment',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Update admission status (from API)
  updateAdmission: async (admissionId: string, updateData: any) => {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await client.put(
      `/api/nrc/admissions/${admissionId}`,
      {
        status: updateData.status,
        recovery_percentage: updateData.recovery_percentage,
        treatment_notes: updateData.treatment_notes,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Cache NRC centers (mock)
  cacheCenters: async (centers: any) => {
    await AsyncStorage.setItem('cachedNRCCenters', JSON.stringify(centers));
  },

  // Get cached centers (mock)
  getCachedCenters: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const response = await client.get('/api/nrc/centers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.centers;
    } catch {
      return getStoredCenters();
    }
  },
};
