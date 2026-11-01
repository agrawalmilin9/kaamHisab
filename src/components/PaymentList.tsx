import React from 'react';
import { Language, PaymentEntry } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  Banknote, 
  Smartphone, 
  Landmark, 
  Trash2, 
  ArrowDownCircle, 
  CreditCard 
} from 'lucide-react';

interface PaymentListProps {
  payments: PaymentEntry[];
  onDeletePayment: (id: string) => void;
  lang: Language;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  onDeletePayment,
  lang,
}) => {
  const t = translations[lang];

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ArrowDownCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-neutral-800">
          {t.noPayments}
        </p>
      </div>
    );
  }

  const formatDateIndian = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-emerald-600" />;
      case 'upi':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'bank':
        return <Landmark className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-neutral-600" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'cash':
        return 'नकद (Cash)';
      case 'upi':
        return 'UPI / Online';
      case 'bank':
        return 'बैंक ट्रांसफर';
      default:
        return 'अन्य';
    }
  };

  return (
    <div className="space-y-2.5">
      {payments.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl p-3.5 border border-emerald-100/90 shadow-2xs hover:border-emerald-300 transition-all space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                {getModeIcon(p.paymentMode)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-neutral-900">
                    {p.payerName || 'मालिक'}
                  </span>
                  <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                    {getModeLabel(p.paymentMode)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  {formatDateIndian(p.date)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black text-emerald-700">
                +₹{p.amount.toLocaleString('en-IN')}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.deleteConfirm)) {
                    onDeletePayment(p.id);
                  }
                }}
                className="p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {p.note && (
            <p className="text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-100 italic">
              "{p.note}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
