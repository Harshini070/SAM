
import AsyncStorage from '@react-native-async-storage/async-storage';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_MOCK_CHILDREN = [
  {
    child_id: 'C-8012',
    name: 'Aarav Mandavi',
    dob: '12/04/2023',
    gender: 'Male',
    mother_name: 'Savitri Mandavi',
    mother_phone: '9876543210',
    village: 'Geedam',
    district: 'Bastar',
    weight: 7.2,
    height: 71,
    muac: 112, // < 115 is SAM
    health_status: 'SAM',
    last_screening_date: '2026-05-10',
    nrc_assigned: 'Raipur NRC Center #07',
    growth_history: [
      { date: '2026-02-10', weight: 8.5, height: 70, muac: 120, status: 'MAM' },
      { date: '2026-03-10', weight: 8.1, height: 70.5, muac: 118, status: 'MAM' },
      { date: '2026-04-10', weight: 7.6, height: 71, muac: 114, status: 'SAM' },
      { date: '2026-05-10', weight: 7.2, height: 71, muac: 112, status: 'SAM' },
    ],
  },
  {
    child_id: 'C-4091',
    name: 'Pooja Netam',
    dob: '05/09/2024',
    gender: 'Female',
    mother_name: 'Radha Netam',
    mother_phone: '9876543210',
    village: 'Tokapal',
    district: 'Bastar',
    weight: 6.4,
    height: 64,
    muac: 114,
    health_status: 'SAM',
    last_screening_date: '2026-05-12',
    nrc_assigned: 'Not assigned',
    growth_history: [
      { date: '2026-04-12', weight: 6.8, height: 63, muac: 117, status: 'MAM' },
      { date: '2026-05-12', weight: 6.4, height: 64, muac: 114, status: 'SAM' },
    ],
  },
  {
    child_id: 'C-3902',
    name: 'Aditya Kashyap',
    dob: '22/01/2023',
    gender: 'Male',
    mother_name: 'Meena Kashyap',
    mother_phone: '9876543210',
    village: 'Kurud',
    district: 'Raipur',
    weight: 9.4,
    height: 82,
    muac: 124,
    health_status: 'MAM',
    last_screening_date: '2026-05-15',
    nrc_assigned: 'Raipur NRC Center #07',
    growth_history: [
      { date: '2026-03-15', weight: 9.0, height: 81, muac: 121, status: 'MAM' },
      { date: '2026-04-15', weight: 9.2, height: 81.5, muac: 122, status: 'MAM' },
      { date: '2026-05-15', weight: 9.4, height: 82, muac: 124, status: 'MAM' },
    ],
  },
  {
    child_id: 'C-1049',
    name: 'Riya Sahu',
    dob: '30/11/2023',
    gender: 'Female',
    mother_name: 'Kiran Sahu',
    mother_phone: '9988776655',
    village: 'Abhanpur',
    district: 'Raipur',
    weight: 10.8,
    height: 84,
    muac: 135,
    health_status: 'Healthy',
    last_screening_date: '2026-05-18',
    nrc_assigned: 'Not assigned',
    growth_history: [
      { date: '2026-03-18', weight: 10.2, height: 83, muac: 132, status: 'Healthy' },
      { date: '2026-04-18', weight: 10.5, height: 83.5, muac: 133, status: 'Healthy' },
      { date: '2026-05-18', weight: 10.8, height: 84, muac: 135, status: 'Healthy' },
    ],
  },
];

const getStoredChildren = async () => {
  const data = await AsyncStorage.getItem('cachedChildren');
  if (data) return JSON.parse(data);
  await AsyncStorage.setItem('cachedChildren', JSON.stringify(INITIAL_MOCK_CHILDREN));
  return INITIAL_MOCK_CHILDREN;
};

export const childService = {
  // Register new child (mock)
  registerChild: async (childData: any) => {
    await delay(1200);
    const list = await getStoredChildren();
    
    // Auto-predict status if missing
    let status = childData.healthStatus || 'Healthy';
    const muacVal = parseFloat(childData.muac);
    if (!isNaN(muacVal)) {
      if (muacVal < 115) status = 'SAM';
      else if (muacVal < 125) status = 'MAM';
      else status = 'Healthy';
    }

    const newChild = {
      child_id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
      name: childData.childName,
      dob: childData.dob,
      gender: childData.gender,
      mother_name: childData.motherName,
      mother_phone: childData.mobile || '9876543210',
      village: childData.village || 'N/A',
      district: childData.district || 'Raipur',
      weight: parseFloat(childData.weight) || 0,
      height: parseFloat(childData.height) || 0,
      muac: muacVal || 0,
      health_status: status,
      last_screening_date: new Date().toISOString().split('T')[0],
      nrc_assigned: 'Not assigned',
      growth_history: [
        {
          date: new Date().toISOString().split('T')[0],
          weight: parseFloat(childData.weight) || 0,
          height: parseFloat(childData.height) || 0,
          muac: muacVal || 0,
          status: status,
        }
      ],
    };

    const updated = [newChild, ...list];
    await AsyncStorage.setItem('cachedChildren', JSON.stringify(updated));
    return newChild;
  },

  // Screen child and predict status (mock)
  screenChild: async (screeningData: any) => {
    await delay(800);
    const { muac, weight, height } = screeningData;
    let predictedStatus = 'Healthy';
    if (muac < 115) predictedStatus = 'SAM';
    else if (muac < 125) predictedStatus = 'MAM';

    return {
      predicted_status: predictedStatus,
      confidence: 0.94,
      recommendation: predictedStatus === 'SAM' 
        ? 'High Risk: Referral to nearest Nutrition Rehabilitation Centre (NRC) recommended immediately.' 
        : predictedStatus === 'MAM'
        ? 'Moderate Risk: Provide supplementary nutrition at Anganwadi and review in 15 days.'
        : 'Normal: Continue standard growth monitoring at Anganwadi center.',
    };
  },

  // Get child by ID (mock)
  getChild: async (childId: string) => {
    await delay(500);
    const list = await getStoredChildren();
    const child = list.find((c: any) => c.child_id === childId);
    if (!child) throw new Error('Child not found');
    return { data: child };
  },

  // Get all children for logged-in mother / officer (mock)
  getChildrenByMother: async () => {
    await delay(1000);
    return getStoredChildren();
  },

  // Get children by district (mock)
  getChildrenByDistrict: async (district: string) => {
    await delay(800);
    const list = await getStoredChildren();
    return list.filter((c: any) => c.district.toLowerCase() === district.toLowerCase());
  },

  // Get high-risk children (SAM cases) (mock)
  getHighRiskChildren: async () => {
    await delay(800);
    const list = await getStoredChildren();
    return list.filter((c: any) => c.health_status === 'SAM');
  },

  // Get pending followups (mock)
  getPendingFollowups: async () => {
    await delay(600);
    const list = await getStoredChildren();
    // Return children with status SAM/MAM who are not assigned to an NRC or need home visit
    return list.filter((c: any) => c.health_status === 'SAM' || c.health_status === 'MAM');
  },

  // Cache children locally (mock)
  cacheChildren: async (children: any) => {
    await AsyncStorage.setItem('cachedChildren', JSON.stringify(children));
  },


  // Get cached children (mock)
  getCachedChildren: async () => {
    return getStoredChildren();
  },
};
