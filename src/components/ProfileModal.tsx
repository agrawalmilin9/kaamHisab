import React, { useState } from 'react';
import { Language, WorkerProfile } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  X, 
  UserCircle, 
  Phone, 
  Briefcase, 
  CircleDollarSign, 
  Clock, 
  Building, 
  Check 
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WorkerProfile;
  onSaveProfile: (updated: WorkerProfile) => void;
  lang: Language;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  lang,
}) => {
  const t = translations[lang];

  const [formData, setFormData] = useState<WorkerProfile>({ ...profile });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-orange-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 leading-tight">
                {t.profile}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                आपकी पहचान और डिफ़ॉल्ट दिहाड़ी सेटिंग्स
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Worker Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <UserCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t.workerName} <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="जैसे: रमेश कुमार"
              className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t.phone}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-500">+91</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full pl-10 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Trade / Work type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t.trade}</span>
            </label>
            <select
              value={formData.trade}
              onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
              className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              {t.trades.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
          </div>

          {/* Default Daily Wage & Shift Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <CircleDollarSign className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.dailyWage} (₹)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">₹</span>
                <input
                  type="number"
                  step="50"
                  min="100"
                  required
                  value={formData.defaultDailyWage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultDailyWage: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full pl-7 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-extrabold focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.shiftHours}</span>
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={formData.defaultShiftHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultShiftHours: parseInt(e.target.value, 10) || 8,
                  })
                }
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Overtime Rate & Primary Thekedar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.otRate}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">₹</span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={formData.defaultOvertimeRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultOvertimeRate: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full pl-7 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.primaryEmployer}</span>
              </label>
              <input
                type="text"
                value={formData.primaryThekedar}
                onChange={(e) =>
                  setFormData({ ...formData, primaryThekedar: e.target.value })
                }
                placeholder="जैसे: राजेश ठेकेदार"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-base shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{t.saveProfile}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
