import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // Get all NRC centers (mock)
  getAllCenters: async (district?: string) => {
    await delay(900);
    const list = await getStoredCenters();
    if (district && district !== 'All Districts') {
      return list.filter((c: any) => c.district.toLowerCase() === district.toLowerCase());
    }
    return list;
  },

  // Get specific NRC center (mock)
  getCenter: async (nrcId: string) => {
    await delay(500);
    const list = await getStoredCenters();
    const center = list.find((c: any) => c.nrc_id === nrcId);
    if (!center) throw new Error('NRC Center not found');
    return { data: center };
  },

  // Get NRC occupancy (mock)
  getOccupancy: async (nrcId: string) => {
    await delay(400);
    const list = await getStoredCenters();
    const center = list.find((c: any) => c.nrc_id === nrcId);
    if (!center) throw new Error('NRC Center not found');
    return {
      nrc_id: nrcId,
      total_beds: center.total_beds,
      occupied_beds: center.occupied_beds,
      occupancy_percentage: Math.round((center.occupied_beds / center.total_beds) * 100),
    };
  },

  // Find nearest NRC with beds (mock)
  getNearestNRC: async (latitude: number, longitude: number) => {
    await delay(800);
    const list = await getStoredCenters();
    // Return first center that has space
    const available = list.find((c: any) => c.occupied_beds < c.total_beds);
    return { data: available || list[0] };
  },

  // Admit child to NRC (mock)
  admitChild: async (admissionData: any) => {
    await delay(1200);
    const list = await getStoredCenters();
    const updated = list.map((c: any) => {
      if (c.nrc_id === admissionData.nrc_id) {
        return { ...c, occupied_beds: Math.min(c.total_beds, c.occupied_beds + 1) };
      }
      return c;
    });
    await AsyncStorage.setItem('cachedNRCCenters', JSON.stringify(updated));
    
    // Also update the child assigned NRC in cachedChildren
    const childrenStr = await AsyncStorage.getItem('cachedChildren');
    if (childrenStr) {
      const children = JSON.parse(childrenStr);
      const childCenter = list.find((c: any) => c.nrc_id === admissionData.nrc_id);
      const updatedChildren = children.map((ch: any) => {
        if (ch.child_id === admissionData.child_id) {
          return { ...ch, nrc_assigned: childCenter ? childCenter.name : 'Assigned' };
        }
        return ch;
      });
      await AsyncStorage.setItem('cachedChildren', JSON.stringify(updatedChildren));
    }

    return { success: true, message: 'Child admitted successfully' };
  },

  // Update admission status (mock)
  updateAdmission: async (admissionId: string, updateData: any) => {
    await delay(800);
    return { success: true, message: 'Admission status updated' };
  },

  // Cache NRC centers (mock)
  cacheCenters: async (centers: any) => {
    await AsyncStorage.setItem('cachedNRCCenters', JSON.stringify(centers));
  },

  // Get cached centers (mock)
  getCachedCenters: async () => {
    return getStoredCenters();
  },
};
