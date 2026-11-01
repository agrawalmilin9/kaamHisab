import React from 'react';
import { Language, WorkerProfile } from '../types.ts';
import { translations } from '../translations.ts';
import { Languages, Volume2, UserCircle, RotateCcw } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  profile: WorkerProfile;
  onOpenProfile: () => void;
  onSpeakSummary: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  profile,
  onOpenProfile,
  onSpeakSummary,
  onResetData,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* App Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-neutral-900 leading-none">
                {lang === 'hi' ? 'काम हिसाब' : 'KaamHisab'}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-sm">
                दैनिक खाता
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium leading-tight mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Audio Speak button for accessibility */}
          <button
            onClick={onSpeakSummary}
            title={t.speakSummary}
            aria-label={t.speakSummary}
            className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 hover:border-orange-400 bg-neutral-50 hover:bg-orange-50/50 text-xs font-bold text-neutral-800 transition-all shadow-2xs"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-orange-600" />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Worker Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title={t.profile}
          >
            <UserCircle className="w-4 h-4" />
            <span className="hidden sm:inline max-w-[100px] truncate">
              {profile.name.split(' ')[0] || 'प्रोफाइल'}
            </span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={onResetData}
            title={t.resetData}
            aria-label={t.resetData}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
