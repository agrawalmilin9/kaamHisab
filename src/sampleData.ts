import { WorkerProfile, WorkEntry, PaymentEntry } from './types.ts';

export const initialProfile: WorkerProfile = {
  id: 'worker-1',
  name: 'रमेश कुमार (Ramesh Kumar)',
  phone: '9876543210',
  trade: 'राजमिस्त्री (Mason)',
  defaultDailyWage: 650,
  defaultShiftHours: 8,
  defaultOvertimeRate: 85,
  primaryThekedar: 'राजेश ठेकेदार (Rajesh Contractor)',
};

// Generate relative dates so sample data is always fresh relative to current date
export function getSampleWorkEntries(): WorkEntry[] {
  const today = new Date();
  
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'work-1',
      date: formatDate(0), // Today
      hoursWorked: 10,
      dailyWage: 650,
      overtimeHours: 2,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 170,
      totalEarnings: 820,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'दीवार चिनाई और प्लास्टर का काम किया। 2 घंटे अतिरिक्त काम।',
      originalSentence: 'आज 10 घंटे काम किया, 2 घंटे ओवरटाइम हुआ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'work-2',
      date: formatDate(1), // Yesterday
      hoursWorked: 8,
      dailyWage: 650,
      overtimeHours: 0,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 0,
      totalEarnings: 650,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'पूरा दिन काम किया। सामान्य 8 घंटे।',
      originalSentence: 'कल 8 घंटे पूरा दिन काम किया 650 रुपये',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'work-3',
      date: formatDate(2), // 2 days ago
      hoursWorked: 4,
      dailyWage: 650,
      overtimeHours: 0,
      overtimeRate: 85,
      baseEarnings: 325,
      overtimeEarnings: 0,
      totalEarnings: 325,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'आधा दिन (Half Day) बारिश के कारण दोपहर में काम रुक गया।',
      originalSentence: 'परसों आधा दिन 4 घंटे काम किया',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'work-4',
      date: formatDate(4),
      hoursWorked: 9,
      dailyWage: 650,
      overtimeHours: 1,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 85,
      totalEarnings: 735,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'छत ढलाई की तैयारी',
      originalSentence: '9 घंटे काम किया 1 घंटा ओवरटाइम',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'work-5',
      date: formatDate(5),
      hoursWorked: 8,
      dailyWage: 650,
      overtimeHours: 0,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 0,
      totalEarnings: 650,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'सामान्य दिन',
      originalSentence: '8 घंटे काम किया दिहाड़ी 650',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'work-6',
      date: formatDate(6),
      hoursWorked: 11,
      dailyWage: 650,
      overtimeHours: 3,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 255,
      totalEarnings: 905,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'देर शाम तक काम चला',
      originalSentence: '11 घंटे काम किया 3 घंटे भारी ओवरटाइम',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'work-7',
      date: formatDate(7),
      hoursWorked: 8,
      dailyWage: 650,
      overtimeHours: 0,
      overtimeRate: 85,
      baseEarnings: 650,
      overtimeEarnings: 0,
      totalEarnings: 650,
      thekedarOrSite: 'राजेश ठेकेदार - सेक्टर 62 साइट',
      notes: 'रेगुलर काम',
      originalSentence: '8 ghante kaam kiya 650 rupaye',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];
}

export function getSamplePayments(): PaymentEntry[] {
  const today = new Date();
  
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'pay-1',
      date: formatDate(6),
      amount: 1500,
      payerName: 'राजेश ठेकेदार',
      paymentMode: 'cash',
      note: 'हफ्ते का खर्च (नकद दिया)',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'pay-2',
      date: formatDate(2),
      amount: 1000,
      payerName: 'राजेश ठेकेदार',
      paymentMode: 'upi',
      note: 'PhonePe से भेजा गया',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
}
