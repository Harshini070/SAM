/**
 * Mock data for District-level Dashboard and Admin Views
 * Contains district statistics, fund allocation, and performance metrics
 */

export interface DistrictStat {
  name: string;
  totalChildren: number;
  samCases: number;
  mamCases: number;
  recoveryRate: number;
  nrcOccupancy: number;
  fundAllocated: number;
  fundUtilized: number;
}

export interface FundBreakdown {
  category: string;
  amount: number;
  percentage: number;
  status: 'On Track' | 'Under Utilized' | 'Over Budget';
}

export interface PerformanceMetric {
  district: string;
  metric: string;
  target: number;
  achieved: number;
  variance: number;
  trend: 'Up' | 'Down' | 'Stable';
}

export const districtStats: DistrictStat[] = [
  {
    name: 'Raipur',
    totalChildren: 1240,
    samCases: 185,
    mamCases: 348,
    recoveryRate: 76.5,
    nrcOccupancy: 82,
    fundAllocated: 4500000,
    fundUtilized: 3680000,
  },
  {
    name: 'Bilaspur',
    totalChildren: 890,
    samCases: 124,
    mamCases: 267,
    recoveryRate: 72.3,
    nrcOccupancy: 68,
    fundAllocated: 3200000,
    fundUtilized: 2480000,
  },
  {
    name: 'Durg',
    totalChildren: 1050,
    samCases: 156,
    mamCases: 315,
    recoveryRate: 78.2,
    nrcOccupancy: 75,
    fundAllocated: 3800000,
    fundUtilized: 3120000,
  },
  {
    name: 'Rajnandgaon',
    totalChildren: 620,
    samCases: 92,
    mamCases: 186,
    recoveryRate: 71.8,
    nrcOccupancy: 65,
    fundAllocated: 2200000,
    fundUtilized: 1760000,
  },
  {
    name: 'Jagdalpur',
    totalChildren: 780,
    samCases: 115,
    mamCases: 234,
    recoveryRate: 74.1,
    nrcOccupancy: 70,
    fundAllocated: 2800000,
    fundUtilized: 2240000,
  },
];

export const stateStats = {
  totalChildren: 4580,
  samCases: 672,
  mamCases: 1350,
  healthyChildren: 2558,
  avgRecoveryRate: 74.6,
  avgNrcOccupancy: 72,
  totalFundAllocated: 16500000,
  totalFundUtilized: 13280000,
  utilizationPercentage: 80.4,
};

export const fundBreakdown: FundBreakdown[] = [
  {
    category: 'NRC Operations',
    amount: 5200000,
    percentage: 39.1,
    status: 'On Track',
  },
  {
    category: 'Staff Salaries',
    amount: 4100000,
    percentage: 30.8,
    status: 'On Track',
  },
  {
    category: 'Nutrition Supplies',
    amount: 2800000,
    percentage: 21.1,
    status: 'On Track',
  },
  {
    category: 'Transport & Logistics',
    amount: 900000,
    percentage: 6.8,
    status: 'Under Utilized',
  },
  {
    category: 'Training & Development',
    amount: 400000,
    percentage: 3.0,
    status: 'Under Utilized',
  },
];

export const performanceMetrics: PerformanceMetric[] = [
  {
    district: 'Raipur',
    metric: 'Recovery Rate',
    target: 75,
    achieved: 76.5,
    variance: 1.5,
    trend: 'Up',
  },
  {
    district: 'Bilaspur',
    metric: 'Recovery Rate',
    target: 75,
    achieved: 72.3,
    variance: -2.7,
    trend: 'Down',
  },
  {
    district: 'Durg',
    metric: 'Recovery Rate',
    target: 75,
    achieved: 78.2,
    variance: 3.2,
    trend: 'Up',
  },
  {
    district: 'Raipur',
    metric: 'Fund Utilization',
    target: 85,
    achieved: 81.8,
    variance: -3.2,
    trend: 'Stable',
  },
  {
    district: 'Bilaspur',
    metric: 'Fund Utilization',
    target: 85,
    achieved: 77.5,
    variance: -7.5,
    trend: 'Down',
  },
  {
    district: 'Durg',
    metric: 'Fund Utilization',
    target: 85,
    achieved: 82.1,
    variance: -2.9,
    trend: 'Up',
  },
];

export const recentAlerts = [
  {
    id: 'ALERT001',
    type: 'SAM Case',
    message: 'High SAM prevalence in Raipur district (15.0%)',
    date: '2026-05-26',
    severity: 'High',
  },
  {
    id: 'ALERT002',
    type: 'Fund Utilization',
    message: 'Bilaspur district fund utilization below target',
    date: '2026-05-25',
    severity: 'Medium',
  },
  {
    id: 'ALERT003',
    type: 'Recovery Rate',
    message: 'Durg district exceeds recovery rate target',
    date: '2026-05-24',
    severity: 'Low',
  },
  {
    id: 'ALERT004',
    type: 'NRC Occupancy',
    message: 'Raipur NRC at 82% capacity',
    date: '2026-05-23',
    severity: 'Medium',
  },
];

export default {
  districtStats,
  stateStats,
  fundBreakdown,
  performanceMetrics,
  recentAlerts,
};
