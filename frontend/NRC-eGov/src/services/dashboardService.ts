// Mock dashboard service providing metrics and hotspot data.

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const dashboardService = {
  fetchDistrictMetrics: async (districtId?: string) => {
    await delay(600);
    return {
      samPercent: 78,
      recoveryRate: 64,
      fundUtilization: 52,
      nrcOccupancy: 71,
      admissionsLastMonth: 124,
      dischargesLastMonth: 98,
    };
  },

  fetchStateMetrics: async () => {
    await delay(700);
    return {
      samPercent: 74,
      recoveryRate: 61,
      avgFundUtilization: 59,
      nrcOccupancy: 68,
    };
  },

  fetchHotspots: async (districtId?: string) => {
    await delay(400);
    return [
      { name: 'Ward 12 - North', cases: 18 },
      { name: 'Village A', cases: 12 },
      { name: 'Sector 5', cases: 9 },
    ];
  },

  fetchFundBreakdown: async () => {
    await delay(500);
    return {
      planned: 1200000,
      spent: 624000,
      categories: [
        { name: 'Nutrition Kits', spent: 280000 },
        { name: 'Training & Travel', spent: 90000 },
        { name: 'Medical Supplies', spent: 154000 },
        { name: 'Infrastructure', spent: 100000 },
      ],
    };
  },
};
