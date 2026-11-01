export type Language = 'hi' | 'en';

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  trade: string; // e.g. 'राजमिस्त्री (Mason)', 'पेंटर (Painter)', etc.
  defaultDailyWage: number;
  defaultShiftHours: number;
  defaultOvertimeRate: number; // ₹ per hour
  primaryThekedar: string;
}

export interface WorkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hoursWorked: number;
  dailyWage: number;
  overtimeHours: number;
  overtimeRate: number;
  baseEarnings: number;
  overtimeEarnings: number;
  totalEarnings: number;
  thekedarOrSite: string;
  notes?: string;
  originalSentence?: string;
  createdAt: string;
}

export interface PaymentEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  payerName: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'other';
  note?: string;
  createdAt: string;
}

export interface ExtractedWorkData {
  date: string;
  hoursWorked: number;
  dailyWage: number;
  overtimeHours: number;
  overtimeRate: number;
  thekedarOrSite: string;
  workType?: string;
  notes?: string;
}
