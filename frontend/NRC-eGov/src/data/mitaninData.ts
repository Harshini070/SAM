/**
 * Mock data for Mitanin Worker Dashboard
 * Contains child records, risk assessments, and followup tasks
 */

export interface ChildRecord {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  caregiver: string;
  phone: string;
  weight: number;
  muac: number;
  status: 'Healthy' | 'SAM' | 'MAM' | 'At Risk';
  lastCheckup: string;
  nextFollowup: string;
}

export interface FollowupTask {
  id: string;
  childId: string;
  childName: string;
  type: 'Weight Check' | 'Nutrition Counseling' | 'Vaccination' | 'Medical Referral' | 'Home Visit';
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
}

export const mockChildren: ChildRecord[] = [
  {
    id: 'CHILD001',
    name: 'Aarav Sharma',
    age: 18,
    gender: 'M',
    caregiver: 'Meera Sharma',
    phone: '9876543210',
    weight: 8.2,
    muac: 118,
    status: 'SAM',
    lastCheckup: '2026-05-20',
    nextFollowup: '2026-05-28',
  },
  {
    id: 'CHILD002',
    name: 'Priya Patel',
    age: 24,
    gender: 'F',
    caregiver: 'Savitri Patel',
    phone: '9123456789',
    weight: 10.5,
    muac: 128,
    status: 'MAM',
    lastCheckup: '2026-05-18',
    nextFollowup: '2026-05-25',
  },
  {
    id: 'CHILD003',
    name: 'Vikas Kumar',
    age: 12,
    gender: 'M',
    caregiver: 'Lakshmi Kumar',
    phone: '8765432109',
    weight: 7.9,
    muac: 115,
    status: 'SAM',
    lastCheckup: '2026-05-21',
    nextFollowup: '2026-05-29',
  },
  {
    id: 'CHILD004',
    name: 'Anjali Singh',
    age: 20,
    gender: 'F',
    caregiver: 'Sunita Singh',
    phone: '7654321098',
    weight: 11.2,
    muac: 135,
    status: 'Healthy',
    lastCheckup: '2026-05-19',
    nextFollowup: '2026-06-02',
  },
  {
    id: 'CHILD005',
    name: 'Rohan Gupta',
    age: 15,
    gender: 'M',
    caregiver: 'Neha Gupta',
    phone: '6543210987',
    weight: 9.1,
    muac: 122,
    status: 'At Risk',
    lastCheckup: '2026-05-22',
    nextFollowup: '2026-05-30',
  },
];

export const mockFollowups: FollowupTask[] = [
  {
    id: 'TASK001',
    childId: 'CHILD001',
    childName: 'Aarav Sharma',
    type: 'Weight Check',
    dueDate: '2026-05-28',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'TASK002',
    childId: 'CHILD002',
    childName: 'Priya Patel',
    type: 'Nutrition Counseling',
    dueDate: '2026-05-25',
    status: 'Pending',
    priority: 'Medium',
  },
  {
    id: 'TASK003',
    childId: 'CHILD003',
    childName: 'Vikas Kumar',
    type: 'Medical Referral',
    dueDate: '2026-05-29',
    status: 'Overdue',
    priority: 'High',
  },
  {
    id: 'TASK004',
    childId: 'CHILD004',
    childName: 'Anjali Singh',
    type: 'Vaccination',
    dueDate: '2026-06-02',
    status: 'Pending',
    priority: 'Low',
  },
  {
    id: 'TASK005',
    childId: 'CHILD005',
    childName: 'Rohan Gupta',
    type: 'Home Visit',
    dueDate: '2026-05-30',
    status: 'Pending',
    priority: 'Medium',
  },
];

export const mitaninStats = {
  totalChildren: 24,
  samCases: 5,
  mamCases: 8,
  healthyChildren: 11,
  pendingFollowups: 12,
  overdueFollowups: 3,
  weeklyGrowthRate: 2.3,
};

export default {
  mockChildren,
  mockFollowups,
  mitaninStats,
};
