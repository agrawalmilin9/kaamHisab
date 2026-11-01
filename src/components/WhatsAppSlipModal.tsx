import React, { useState } from 'react';
import { Language, WorkerProfile, WorkEntry, PaymentEntry } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Receipt,
  Download
} from 'lucide-react';

interface WhatsAppSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WorkerProfile;
  workEntries: WorkEntry[];
  payments: PaymentEntry[];
  totalDays: number;
  totalEarnings: number;
  totalReceived: number;
  pendingBalance: number;
  lang: Language;
}

export const WhatsAppSlipModal: React.FC<WhatsAppSlipModalProps> = ({
  isOpen,
  onClose,
  profile,
  workEntries,
  payments,
  totalDays,
  totalEarnings,
  totalReceived,
  pendingBalance,
  lang,
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Format dates
  const todayStr = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Construct readable WhatsApp text slip
  const slipText = `*📋 काम व मजदूरी का हिसाब (KaamHisab)*
---------------------------------
👷 *श्रमिक:* ${profile.name}
📞 *फोन:* ${profile.phone ? `+91 ${profile.phone}` : 'दर्ज नहीं'}
🛠 *काम:* ${profile.trade}
🏗 *ठेकेदार / साइट:* ${profile.primaryThekedar}
📅 *हिसाब की तारीख:* ${todayStr}
---------------------------------
*विवरण:*
• कुल काम के दिन: *${totalDays} दिन*
• कुल मजदूरी कमाई: *₹${totalEarnings.toLocaleString('en-IN')}*
• प्राप्त भुगतान: *₹${totalReceived.toLocaleString('en-IN')}*
---------------------------------
*⚠️ शेष बकाया राशि: ₹${pendingBalance.toLocaleString('en-IN')}*
---------------------------------
${pendingBalance > 0 ? '🙏 आपसे विनम्र निवेदन है कि कृपया शेष बकाया राशि का भुगतान जल्द करने की कृपा करें।\nधन्यवाद!' : '✅ पूरा हिसाब चुकता है। धन्यवाद!'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(slipText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 leading-tight">
                {t.shareSlip}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                ठेकेदार या मालिक को भेजने के लिए डिजिटल पर्ची
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

        {/* Body Slip Preview */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Visual Receipt Card */}
          <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-4 font-mono text-xs text-neutral-800 space-y-2 relative shadow-inner">
            <div className="text-center pb-2 border-b border-neutral-200 font-sans">
              <h4 className="font-black text-sm text-neutral-900">काम व मजदूरी का हिसाब</h4>
              <p className="text-[11px] text-neutral-500">KaamHisab Digital Slip</p>
            </div>

            <div className="space-y-1 font-sans">
              <div className="flex justify-between">
                <span className="text-neutral-500">श्रमिक का नाम:</span>
                <span className="font-bold text-neutral-900">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">काम का प्रकार:</span>
                <span className="font-semibold text-neutral-800">{profile.trade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">ठेकेदार / साइट:</span>
                <span className="font-semibold text-neutral-800">{profile.primaryThekedar}</span>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-2 space-y-1 font-sans">
              <div className="flex justify-between">
                <span>कुल काम के दिन:</span>
                <span className="font-bold">{totalDays} दिन</span>
              </div>
              <div className="flex justify-between">
                <span>कुल मजदूरी:</span>
                <span className="font-bold">₹{totalEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>प्राप्त भुगतान (-):</span>
                <span className="font-bold">₹{totalReceived.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="border-t-2 border-neutral-800 pt-2 flex justify-between items-center font-sans">
              <span className="font-extrabold text-sm text-neutral-900">बकाया राशि:</span>
              <span className={`text-lg font-black ${pendingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                ₹{pendingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>{t.shareText}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-sm flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">{t.copiedToClipboard}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-600" />
                  <span>पर्ची कॉपी करें (Copy Text)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
