/**
 * Mock data for Parent Dashboard
 * Contains child health summaries, vaccination records, and appointments
 */

export interface ChildHealth {
  id: string;
  name: string;
  age: number;
  weight: number;
  muac: number;
  status: 'Healthy' | 'SAM' | 'MAM' | 'At Risk';
  lastWeightTrend: 'Improving' | 'Stable' | 'Declining';
}

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccine: string;
  dueDate?: string;
  completedDate?: string;
  status: 'Due' | 'Completed' | 'Overdue';
}

export interface Appointment {
  id: string;
  childId: string;
  childName: string;
  appointmentType: string;
  date: string;
  time: string;
  location: string;
  staffName: string;
}

export const mockParentChild: ChildHealth = {
  id: 'CHILD002',
  name: 'Priya Patel',
  age: 24,
  weight: 10.5,
  muac: 128,
  status: 'MAM',
  lastWeightTrend: 'Improving',
};

export const mockVaccinations: VaccinationRecord[] = [
  {
    id: 'VAC001',
    childId: 'CHILD002',
    vaccine: 'BCG (Birth dose)',
    completedDate: '2024-05-15',
    status: 'Completed',
  },
  {
    id: 'VAC002',
    childId: 'CHILD002',
    vaccine: 'OPV (Dose 1)',
    completedDate: '2024-06-20',
    status: 'Completed',
  },
  {
    id: 'VAC003',
    childId: 'CHILD002',
    vaccine: 'DPT (Dose 1)',
    completedDate: '2024-07-15',
    status: 'Completed',
  },
  {
    id: 'VAC004',
    childId: 'CHILD002',
    vaccine: 'DPT (Dose 2)',
    dueDate: '2026-06-10',
    status: 'Due',
  },
  {
    id: 'VAC005',
    childId: 'CHILD002',
    vaccine: 'PCV (Dose 2)',
    dueDate: '2026-06-05',
    status: 'Due',
  },
  {
    id: 'VAC006',
    childId: 'CHILD002',
    vaccine: 'Measles',
    dueDate: '2026-07-15',
    status: 'Due',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    childId: 'CHILD002',
    childName: 'Priya Patel',
    appointmentType: 'Growth Monitoring',
    date: '2026-06-12',
    time: '10:00 AM',
    location: 'NRC Center, Raipur',
    staffName: 'Dr. Anjali Verma',
  },
  {
    id: 'APT002',
    childId: 'CHILD002',
    childName: 'Priya Patel',
    appointmentType: 'Nutrition Counseling',
    date: '2026-06-20',
    time: '2:00 PM',
    location: 'Anganwadi Center',
    staffName: 'Mitanin Worker',
  },
  {
    id: 'APT003',
    childId: 'CHILD002',
    childName: 'Priya Patel',
    appointmentType: 'Vaccination',
    date: '2026-07-10',
    time: '9:30 AM',
    location: 'Health Center',
    staffName: 'Nurse (ANM)',
  },
];

export const parentStats = {
  totalChildren: 1,
  healthyChildren: 0,
  atRiskChildren: 1,
  upcomingAppointments: 3,
  completedVaccines: 3,
  pendingVaccines: 3,
  weightGainThisMonth: 0.3,
};

export const nutritionAdvice = [
  {
    title: 'Iron-Rich Foods',
    description: 'Include spinach, liver, and fortified cereals 3-4 times per week to prevent anemia.',
  },
  {
    title: 'Protein for Growth',
    description: 'Eggs, dal, and legumes daily help children grow stronger and healthier.',
  },
  {
    title: 'Hydration',
    description: 'Offer water, breastmilk, or locally-made milk 6-8 times daily.',
  },
  {
    title: 'Local Seasonal Foods',
    description: 'Use available fruits and vegetables from your area for best nutrition and cost savings.',
  },
];

export default {
  mockParentChild,
  mockVaccinations,
  mockAppointments,
  parentStats,
  nutritionAdvice,
};
