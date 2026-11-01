import React from 'react';
import { Language, WorkEntry } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Building, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface WorkListProps {
  entries: WorkEntry[];
  onDeleteEntry: (id: string) => void;
  lang: Language;
}

export const WorkList: React.FC<WorkListProps> = ({
  entries,
  onDeleteEntry,
  lang,
}) => {
  const t = translations[lang];

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-neutral-800">
          {t.noWorkEntries}
        </p>
      </div>
    );
  }

  // Helper to format date in Indian style (DD MMM YYYY)
  const formatDateIndian = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-2.5">
      {entries.map((item) => {
        const isHalfDay = item.hoursWorked < 6;
        const hasOvertime = item.overtimeHours > 0;

        return (
          <div
            key={item.id}
            className="bg-white rounded-xl p-3.5 border border-neutral-200/90 shadow-2xs hover:border-amber-300 transition-all space-y-2.5"
          >
            {/* Top row: Date + Badges + Delete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-neutral-900">
                  {formatDateIndian(item.date)}
                </span>
                
                {isHalfDay && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    आधा दिन (Half Day)
                  </span>
                )}
                {hasOvertime && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    +{item.overtimeHours}h OT
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-black text-amber-950">
                  ₹{item.totalEarnings.toLocaleString('en-IN')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t.deleteConfirm)) {
                      onDeleteEntry(item.id);
                    }
                  }}
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors"
                  title={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Middle row: Shift hours breakdown & calculation detail */}
            <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1.5 rounded-lg border border-neutral-100">
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  <strong>{item.hoursWorked} घंटे</strong> (दर: ₹{item.dailyWage}/दिन)
                </span>
              </div>

              {hasOvertime && (
                <div className="text-amber-700 font-semibold text-[11px]">
                  बेस ₹{item.baseEarnings} + OT ₹{item.overtimeEarnings}
                </div>
              )}
            </div>

            {/* Contractor / Site info & Notes */}
            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-neutral-400" />
                <span className="font-medium truncate max-w-[200px]">
                  {item.thekedarOrSite || 'सामान्य साइट'}
                </span>
              </div>
              {item.notes && (
                <span className="italic truncate max-w-[180px] text-neutral-400">
                  {item.notes}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
