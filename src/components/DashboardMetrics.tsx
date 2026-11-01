import React from 'react';
import { Language, WorkerProfile } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  CalendarDays, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ArrowDownCircle, 
  Share2, 
  Info,
  Clock
} from 'lucide-react';

interface DashboardMetricsProps {
  lang: Language;
  profile: WorkerProfile;
  totalDays: number;
  totalHours: number;
  totalOvertimeHours: number;
  totalEarnings: number;
  totalReceived: number;
  pendingBalance: number;
  onOpenAddWork: () => void;
  onOpenAddPayment: () => void;
  onOpenWhatsAppSlip: () => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  lang,
  profile,
  totalDays,
  totalHours,
  totalOvertimeHours,
  totalEarnings,
  totalReceived,
  pendingBalance,
  onOpenAddWork,
  onOpenAddPayment,
  onOpenWhatsAppSlip,
}) => {
  const t = translations[lang];

  const isPending = pendingBalance > 0;
  const isAdvance = pendingBalance < 0;

  return (
    <div className="space-y-4">
      {/* Worker Greeting & Current Rate Badge */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-100 bg-white/15 px-2 py-0.5 rounded-full inline-block">
              {profile.trade || 'कारीगर'}
            </span>
            <h2 className="text-xl font-extrabold mt-1 tracking-tight">
              {profile.name}
            </h2>
            <p className="text-xs text-amber-100 mt-0.5 flex items-center gap-1">
              <span>ठेकेदार / साइट:</span>
              <strong className="text-white font-semibold">{profile.primaryThekedar}</strong>
            </p>
          </div>

          <div className="text-right bg-white/15 backdrop-blur-xs rounded-xl p-2.5 border border-white/20">
            <span className="text-[11px] text-amber-100 block font-medium">दैनिक दिहाड़ी दर</span>
            <span className="text-xl font-black text-white">₹{profile.defaultDailyWage}</span>
            <span className="text-[10px] text-amber-100 block">/ {profile.defaultShiftHours} घंटे</span>
          </div>
        </div>

        {/* Quick Rate info & Overtime Formula */}
        <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span>ओवरटाइम दर: <strong>₹{profile.defaultOvertimeRate}/घंटा</strong></span>
          </div>
          <button
            onClick={onOpenWhatsAppSlip}
            className="flex items-center gap-1 bg-white text-orange-700 hover:bg-orange-50 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-green-600" />
            <span>{t.shareSlip}</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Days */}
        <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">{t.totalDays}</span>
            <CalendarDays className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-neutral-900 tracking-tight">
              {totalDays} <span className="text-xs font-semibold text-neutral-500">दिन</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              {totalHours} घंटे {totalOvertimeHours > 0 ? `(${totalOvertimeHours}h OT)` : ''}
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-xs font-semibold">{t.totalEarnings}</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-950 tracking-tight">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              मेहनत की कुल राशि
            </div>
          </div>
        </div>

        {/* Amount Received */}
        <div className="bg-white rounded-xl p-3 border border-emerald-200 bg-emerald-50/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-semibold">{t.amountReceived}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              ₹{totalReceived.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
              खाते या नकद में मिला
            </div>
          </div>
        </div>

        {/* Pending Balance - Highlighted */}
        <div className={`rounded-xl p-3 border shadow-2xs flex flex-col justify-between ${
          isPending 
            ? 'bg-rose-50/90 border-rose-300' 
            : isAdvance 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${
              isPending ? 'text-rose-800' : isAdvance ? 'text-blue-800' : 'text-emerald-800'
            }`}>
              {t.pendingBalance}
            </span>
            <AlertCircle className={`w-4 h-4 ${
              isPending ? 'text-rose-600' : isAdvance ? 'text-blue-600' : 'text-emerald-600'
            }`} />
          </div>
          <div>
            <div className={`text-2xl font-black tracking-tight ${
              isPending ? 'text-rose-700' : isAdvance ? 'text-blue-700' : 'text-emerald-700'
            }`}>
              ₹{Math.abs(pendingBalance).toLocaleString('en-IN')}
            </div>
            <div className={`text-[11px] font-bold mt-0.5 ${
              isPending ? 'text-rose-600' : isAdvance ? 'text-blue-600' : 'text-emerald-600'
            }`}>
              {isPending 
                ? 'मालिक से लेना बाकी' 
                : isAdvance 
                ? 'एडवांस अतिरिक्त मिला' 
                : t.settled}
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons: Big, Clear, High Tap Target for Workers */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={onOpenAddWork}
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-base shadow-md shadow-orange-600/25 active:scale-98 transition-all"
        >
          <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
          <span>{t.addWork}</span>
        </button>

        <button
          onClick={onOpenAddPayment}
          className="flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-md shadow-emerald-600/25 active:scale-98 transition-all"
        >
          <ArrowDownCircle className="w-5 h-5 text-white stroke-[2.5]" />
          <span>{t.addPayment}</span>
        </button>
      </div>

      {/* Transparent Formula / Calculation explainer */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3.5 py-2.5 text-xs text-amber-900 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-bold">कमाई का हिसाब कैसे होता है: </span>
          <span>
            पूरा दिन काम = ₹{profile.defaultDailyWage}। अतिरिक्त समय होने पर ₹{profile.defaultOvertimeRate}/घंटे की दर से ओवरटाइम जुड़ता है।
          </span>
        </div>
      </div>
    </div>
  );
};
