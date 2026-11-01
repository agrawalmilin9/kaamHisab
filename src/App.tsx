import React, { useState, useEffect } from 'react';
import { Language, WorkerProfile, WorkEntry, PaymentEntry } from './types.ts';
import { initialProfile, getSampleWorkEntries, getSamplePayments } from './sampleData.ts';
import { translations } from './translations.ts';
import { Navbar } from './components/Navbar.tsx';
import { DashboardMetrics } from './components/DashboardMetrics.tsx';
import { AddWorkModal } from './components/AddWorkModal.tsx';
import { AddPaymentModal } from './components/AddPaymentModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { WorkList } from './components/WorkList.tsx';
import { PaymentList } from './components/PaymentList.tsx';
import { WhatsAppSlipModal } from './components/WhatsAppSlipModal.tsx';
import { Calendar, Receipt, Plus, Sparkles, Filter } from 'lucide-react';

const STORAGE_KEYS = {
  PROFILE: 'kaamhisab_profile_v1',
  WORK_ENTRIES: 'kaamhisab_work_v1',
  PAYMENTS: 'kaamhisab_payments_v1',
  LANG: 'kaamhisab_lang_v1',
};

export default function App() {
  // 1. Language state (Hindi default for Indian daily wage workers)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved === 'en' || saved === 'hi') ? saved : 'hi';
  });

  const t = translations[lang];

  // 2. Profile state
  const [profile, setProfile] = useState<WorkerProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialProfile;
  });

  // 3. Work entries state
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ENTRIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getSampleWorkEntries();
  });

  // 4. Payment entries state
  const [payments, setPayments] = useState<PaymentEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return getSamplePayments();
  });

  // 5. Active Tab ('work' | 'payments')
  const [activeTab, setActiveTab] = useState<'work' | 'payments'>('work');

  // 6. Modals
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWhatsAppSlipOpen, setIsWhatsAppSlipOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(workEntries));
  }, [workEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  // Calculations
  const totalDays = workEntries.length;
  const totalHours = workEntries.reduce((sum, item) => sum + (item.hoursWorked || 0), 0);
  const totalOvertimeHours = workEntries.reduce((sum, item) => sum + (item.overtimeHours || 0), 0);
  const totalEarnings = workEntries.reduce((sum, item) => sum + (item.totalEarnings || 0), 0);
  const totalReceived = payments.reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingBalance = totalEarnings - totalReceived;

  // Handlers
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleSaveWork = (newEntry: Omit<WorkEntry, 'id' | 'createdAt'>) => {
    const created: WorkEntry = {
      ...newEntry,
      id: `work-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // Add to top of list
    setWorkEntries((prev) => [created, ...prev]);
  };

  const handleDeleteWork = (id: string) => {
    setWorkEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSavePayment = (newPayment: Omit<PaymentEntry, 'id' | 'createdAt'>) => {
    const created: PaymentEntry = {
      ...newPayment,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [created, ...prev]);
  };

  const handleDeletePayment = (id: string) => {
    setPayments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm(lang === 'hi' ? 'क्या आप सैंपल डेटा फिर से लोड करना चाहते हैं?' : 'Reset to sample data?')) {
      setProfile(initialProfile);
      setWorkEntries(getSampleWorkEntries());
      setPayments(getSamplePayments());
    }
  };

  // Text-to-speech audio reader in Hindi
  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('इस ब्राउज़र में ऑडियो उपलब्ध नहीं है।');
      return;
    }

    const textToSpeak = lang === 'hi'
      ? `नमस्ते ${profile.name} जी। आपने कुल ${totalDays} दिन काम किया है। कुल कमाई ${totalEarnings} रुपये है। मिला हुआ भुगतान ${totalReceived} रुपये है। और बकाया पैसा ${pendingBalance} रुपये है।`
      : `Hello ${profile.name}. You have worked ${totalDays} days. Total earnings are ${totalEarnings} rupees. Total received is ${totalReceived} rupees. Pending balance is ${pendingBalance} rupees.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 font-sans pb-24 selection:bg-orange-200">
      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSpeakSummary={handleSpeakSummary}
        onResetData={handleResetData}
      />

      {/* Main Content Container */}
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-5">
        {/* Dashboard Top Metrics */}
        <DashboardMetrics
          lang={lang}
          profile={profile}
          totalDays={totalDays}
          totalHours={totalHours}
          totalOvertimeHours={totalOvertimeHours}
          totalEarnings={totalEarnings}
          totalReceived={totalReceived}
          pendingBalance={pendingBalance}
          onOpenAddWork={() => setIsAddWorkOpen(true)}
          onOpenAddPayment={() => setIsAddPaymentOpen(true)}
          onOpenWhatsAppSlip={() => setIsWhatsAppSlipOpen(true)}
        />

        {/* Tab switcher: Daily Work Diary vs Payment Passbook */}
        <div className="bg-white rounded-2xl p-1.5 border border-neutral-200 shadow-2xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'work'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.workEntries} ({workEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.paymentEntries} ({payments.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'work' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-sm text-neutral-800">
                काम की दैनिक सूची
              </h3>
              <button
                onClick={() => setIsAddWorkOpen(true)}
                className="text-xs font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया काम जोड़ें</span>
              </button>
            </div>

            <WorkList
              entries={workEntries}
              onDeleteEntry={handleDeleteWork}
              lang={lang}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-sm text-neutral-800">
                प्राप्त भुगतान की रसीदें
              </h3>
              <button
                onClick={() => setIsAddPaymentOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>भुगतान दर्ज करें</span>
              </button>
            </div>

            <PaymentList
              payments={payments}
              onDeletePayment={handleDeletePayment}
              lang={lang}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Voice/Add Work Bar on Mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-2.5 px-4 z-30 shadow-lg sm:hidden">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={() => setIsAddWorkOpen(true)}
            className="flex-1 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>बोलकर काम जोड़ें</span>
          </button>

          <button
            onClick={() => setIsAddPaymentOpen(true)}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span>+ भुगतान</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddWorkModal
        isOpen={isAddWorkOpen}
        onClose={() => setIsAddWorkOpen(false)}
        onSaveWork={handleSaveWork}
        profile={profile}
        lang={lang}
      />

      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        onSavePayment={handleSavePayment}
        profile={profile}
        pendingBalance={pendingBalance}
        lang={lang}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        lang={lang}
      />

      <WhatsAppSlipModal
        isOpen={isWhatsAppSlipOpen}
        onClose={() => setIsWhatsAppSlipOpen(false)}
        profile={profile}
        workEntries={workEntries}
        payments={payments}
        totalDays={totalDays}
        totalEarnings={totalEarnings}
        totalReceived={totalReceived}
        pendingBalance={pendingBalance}
        lang={lang}
      />
    </div>
  );
}
