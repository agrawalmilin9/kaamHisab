import React, { useState } from 'react';
import { Language, PaymentEntry, WorkerProfile } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  X, 
  ArrowDownCircle, 
  Calendar, 
  User, 
  CreditCard, 
  FileText, 
  Check, 
  Banknote, 
  Smartphone, 
  Landmark 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (entry: Omit<PaymentEntry, 'id' | 'createdAt'>) => void;
  profile: WorkerProfile;
  pendingBalance: number;
  lang: Language;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSavePayment,
  profile,
  pendingBalance,
  lang,
}) => {
  const t = translations[lang];

  const [amount, setAmount] = useState<number | ''>(pendingBalance > 0 ? pendingBalance : 1000);
  const [payerName, setPayerName] = useState(profile.primaryThekedar || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'bank' | 'other'>('cash');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('कृपया सही राशि दर्ज करें।');
      return;
    }

    onSavePayment({
      amount: Number(amount),
      payerName: payerName.trim() || profile.primaryThekedar || 'ठेकेदार',
      date,
      paymentMode,
      note: note.trim(),
    });

    // Fire celebratory confetti for receiving payment!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  const quickPills = [500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 leading-tight">
                {t.recordPaymentTitle}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                मालिक या ठेकेदार से मिला हुआ पैसा दर्ज करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">
              {t.amountReceivedLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xl font-black text-emerald-700">₹</span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => {
                  setError(null);
                  setAmount(e.target.value === '' ? '' : Number(e.target.value));
                }}
                placeholder="0"
                className="w-full pl-9 p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-2xl font-black text-emerald-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Quick Amount Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {pendingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(pendingBalance)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
                >
                  पूरा बकाया (₹{pendingBalance})
                </button>
              )}
              {quickPills.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">
              {t.paymentMode}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>नकद (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'upi'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span>UPI / ऑनलाइन</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('bank')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMode === 'bank'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Landmark className="w-5 h-5 text-purple-600" />
                <span>बैंक ट्रांसफर</span>
              </button>
            </div>
          </div>

          {/* Date & Payer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.paymentDate}</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.payerNameLabel}</span>
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="जैसे: राजेश ठेकेदार"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t.paymentNote}</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="जैसे: दिवाली एडवांस, साप्ताहिक मजदूरी, आदि"
              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600">{error}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-sm"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{t.savePayment}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
