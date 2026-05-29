// Shared application types and models used across the frontend.

export interface User {
  id: string;
  name: string;
  role: string;
  phone?: string;
  district?: string;
}

export interface Child {
  child_id: string;
  name: string;
  dob: string;
  gender: string;
  mother_name: string;
  mother_phone?: string;
  village?: string;
  district?: string;
  weight?: number;
  height?: number;
  muac?: number;
  health_status?: 'SAM' | 'MAM' | 'Healthy';
}

export interface DistrictMetrics {
  samPercent: number;
  recoveryRate: number;
  fundUtilization: number;
  nrcOccupancy: number;
}

export interface Hotspot {
  name: string;
  cases: number;
}
