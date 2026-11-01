import React, { useState, useEffect, useRef } from 'react';
import { Language, WorkerProfile, WorkEntry, ExtractedWorkData } from '../types.ts';
import { translations } from '../translations.ts';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  Calendar, 
  Clock, 
  CircleDollarSign, 
  Building, 
  FileText, 
  Plus, 
  Minus,
  AlertCircle,
  HelpCircle,
  Keyboard
} from 'lucide-react';

interface AddWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWork: (entry: Omit<WorkEntry, 'id' | 'createdAt'>) => void;
  profile: WorkerProfile;
  lang: Language;
}

export const AddWorkModal: React.FC<AddWorkModalProps> = ({
  isOpen,
  onClose,
  onSaveWork,
  profile,
  lang,
}) => {
  const t = translations[lang];

  // Modes: 'input' (voice or text entry) | 'confirm' (review extracted data)
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [inputTab, setInputTab] = useState<'voice' | 'text' | 'manual'>('voice');
  
  // Voice & text state
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'hi-IN' | 'mr-IN' | 'en-IN'>('hi-IN');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Extracted/Confirmed Form State
  const [extractedData, setExtractedData] = useState<ExtractedWorkData>({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: profile.defaultShiftHours || 8,
    dailyWage: profile.defaultDailyWage || 600,
    overtimeHours: 0,
    overtimeRate: profile.defaultOvertimeRate || 85,
    thekedarOrSite: profile.primaryThekedar || '',
    notes: '',
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setInputTab('text');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setExtractError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setExtractError('माइक्रोफोन की अनुमति नहीं मिली। कृपया लिखकर बताएं।');
          setInputTab('text');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition init error:', err);
      setSpeechSupported(false);
      setInputTab('text');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [speechLanguage]);

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInputText('');
      setExtractError(null);
      recognitionRef.current.lang = speechLanguage;
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.abort();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 150);
      }
    }
  };

  // Perform AI extraction from voice/text sentence
  const handleExtract = async (textToProcess?: string) => {
    const query = textToProcess || inputText;
    if (!query.trim()) {
      setExtractError('कृपया पहले कोई वाक्य बोलें या लिखें।');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const res = await fetch('/api/extract-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: query,
          defaultWage: profile.defaultDailyWage,
          defaultHours: profile.defaultShiftHours,
          referenceDate: new Date().toISOString().split('T')[0],
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const hours = Number(d.hoursWorked) || profile.defaultShiftHours;
        const ot = Number(d.overtimeHours) || Math.max(0, hours - profile.defaultShiftHours);
        const wage = Number(d.dailyWage) || profile.defaultDailyWage;
        const otRate = Number(d.overtimeRate) || profile.defaultOvertimeRate || Math.round(wage / (profile.defaultShiftHours || 8));

        setExtractedData({
          date: d.date || new Date().toISOString().split('T')[0],
          hoursWorked: hours,
          dailyWage: wage,
          overtimeHours: ot,
          overtimeRate: otRate,
          thekedarOrSite: d.thekedarOrSite || profile.primaryThekedar || '',
          notes: d.notes || query,
        });

        setStep('confirm');
      } else {
        throw new Error(json.error || 'Failed to extract');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      // Fallback directly to client parse so user is never blocked!
      fallbackClientParse(query);
    } finally {
      setIsExtracting(false);
    }
  };

  // Resilient client-side fallback if network is interrupted
  const fallbackClientParse = (query: string) => {
    const q = query.toLowerCase();
    let hours = profile.defaultShiftHours;
    let ot = 0;
    let wage = profile.defaultDailyWage;

    if (q.includes('आधा दिन') || q.includes('half day')) {
      hours = Math.round(profile.defaultShiftHours / 2);
    }

    const hoursMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:घंटे|घंटा|hours?|hrs?|ghante|taas|तास)/);
    if (hoursMatch) hours = parseFloat(hoursMatch[1]);

    const otMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:घंटे|घंटा)?\s*(?:ओवरटाइम|overtime|ओव्हरटाइम)/);
    if (otMatch) {
      ot = parseFloat(otMatch[1]);
    } else if (hours > profile.defaultShiftHours) {
      ot = hours - profile.defaultShiftHours;
    }

    const wageMatch = q.match(/(?:दिहाड़ी|दिहाडी|wage|रोज)\s*[:=₹Rs\.]*\s*(\d{3,5})/) ||
                      q.match(/(\d{3,5})\s*(?:रुपये|रूपये|रुपए|rupees|rs)/);
    if (wageMatch) wage = parseInt(wageMatch[1], 10);

    setExtractedData({
      date: new Date().toISOString().split('T')[0],
      hoursWorked: hours,
      dailyWage: wage,
      overtimeHours: ot,
      overtimeRate: profile.defaultOvertimeRate,
      thekedarOrSite: profile.primaryThekedar,
      notes: query,
    });
    setStep('confirm');
  };

  // Calculation helpers
  const calculateEarnings = () => {
    const standardHours = profile.defaultShiftHours || 8;
    const baseHours = Math.min(extractedData.hoursWorked, standardHours);
    
    // Base wage calculation
    const baseEarnings = extractedData.hoursWorked < standardHours
      ? Math.round((extractedData.hoursWorked / standardHours) * extractedData.dailyWage)
      : extractedData.dailyWage;

    // Overtime calculation
    const overtimeEarnings = Math.round(extractedData.overtimeHours * (extractedData.overtimeRate || profile.defaultOvertimeRate));
    const totalEarnings = baseEarnings + overtimeEarnings;

    return { baseEarnings, overtimeEarnings, totalEarnings };
  };

  const { baseEarnings, overtimeEarnings, totalEarnings } = calculateEarnings();

  // Handle final save
  const handleConfirmSave = () => {
    onSaveWork({
      date: extractedData.date,
      hoursWorked: extractedData.hoursWorked,
      dailyWage: extractedData.dailyWage,
      overtimeHours: extractedData.overtimeHours,
      overtimeRate: extractedData.overtimeRate,
      baseEarnings,
      overtimeEarnings,
      totalEarnings,
      thekedarOrSite: extractedData.thekedarOrSite || profile.primaryThekedar || 'साइट',
      notes: extractedData.notes,
      originalSentence: inputText,
    });

    handleClose();
  };

  const handleClose = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStep('input');
    setInputText('');
    setExtractError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-neutral-900 leading-tight">
                {step === 'input' ? t.addWork : t.reviewExtracted}
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                {step === 'input' ? 'बोलें या लिखें, AI विवरण निकाल देगा' : t.reviewSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 'input' ? (
            <>
              {/* Tab Selector: Voice vs Text vs Manual */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setInputTab('voice');
                    setExtractError(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    inputTab === 'voice'
                      ? 'bg-white text-orange-700 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t.voiceInput}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isListening && recognitionRef.current) recognitionRef.current.stop();
                    setIsListening(false);
                    setInputTab('text');
                    setExtractError(null);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    inputTab === 'text'
                      ? 'bg-white text-orange-700 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{t.textInput}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isListening && recognitionRef.current) recognitionRef.current.stop();
                    setIsListening(false);
                    // Pre-fill manual mode
                    setExtractedData({
                      date: new Date().toISOString().split('T')[0],
                      hoursWorked: profile.defaultShiftHours,
                      dailyWage: profile.defaultDailyWage,
                      overtimeHours: 0,
                      overtimeRate: profile.defaultOvertimeRate,
                      thekedarOrSite: profile.primaryThekedar,
                      notes: 'सामान्य दिन का काम',
                    });
                    setStep('confirm');
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.quickForm}</span>
                </button>
              </div>

              {/* Voice Input Section */}
              {inputTab === 'voice' && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  {/* Language Selector for speech */}
                  <div className="flex items-center gap-1 mb-4 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full text-xs">
                    <span className="text-neutral-600 font-medium">बोलने की भाषा:</span>
                    <select
                      value={speechLanguage}
                      onChange={(e) => setSpeechLanguage(e.target.value as any)}
                      className="bg-transparent font-bold text-orange-700 focus:outline-hidden cursor-pointer"
                    >
                      <option value="hi-IN">हिंदी (Hindi)</option>
                      <option value="mr-IN">मराठी (Marathi)</option>
                      <option value="en-IN">Indian English</option>
                    </select>
                  </div>

                  {/* Pulsing Mic Button */}
                  <div className="relative my-2">
                    {isListening && (
                      <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-30" />
                    )}
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={!speechSupported || isExtracting}
                      className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 z-10 relative ${
                        isListening
                          ? 'bg-rose-600 text-white ring-8 ring-rose-200'
                          : 'bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white ring-8 ring-orange-100'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-8 h-8 animate-pulse" />
                          <span className="text-[11px] font-bold mt-1">रोकें</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-8 h-8" />
                          <span className="text-[11px] font-bold mt-1">बोलिए</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-neutral-800 mt-3">
                    {isListening ? t.listening : 'माइक बटन दबाएं और बोलें'}
                  </p>

                  {/* Realtime Spoken Transcript or Prompt */}
                  <div className="w-full mt-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 min-h-[70px] text-left text-sm">
                    {inputText ? (
                      <span className="text-neutral-900 font-medium">{inputText}</span>
                    ) : (
                      <span className="text-neutral-400 italic">
                        {t.voiceHint}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Text Input Section */}
              {inputTab === 'text' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-neutral-700">
                    अपने काम का विवरण वाक्य में लिखें:
                  </label>
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.voiceHint}
                    className="w-full p-3 text-sm rounded-xl border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
                  />
                </div>
              )}

              {/* Quick Sample Sentences for 1-click testing */}
              <div>
                <p className="text-xs font-bold text-neutral-500 flex items-center gap-1 mb-2">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>उदाहरण वाक्य (क्लिक करके जांचें):</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    t.voiceExample1,
                    t.voiceExample2,
                    t.voiceExample3,
                    t.voiceExample4,
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(example);
                        handleExtract(example);
                      }}
                      className="text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-2 rounded-lg border border-amber-200 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium truncate mr-2">"{example}"</span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase shrink-0 group-hover:underline">
                        ट्राई करें →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error warning if any */}
              {extractError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{extractError}</span>
                </div>
              )}

              {/* Submit Button for Voice/Text */}
              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={isExtracting || !inputText.trim()}
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-300 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                {isExtracting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t.extracting}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI से हिसाब निकालें (Extract Details)</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Confirm & Review Step */
            <div className="space-y-4">
              {/* Review Notification */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">विवरण निकाल लिया गया है! </span>
                  <span>यदि कोई संख्या बदलनी हो तो नीचे सीधे सही कर सकते हैं।</span>
                </div>
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.workDate}</span>
                  </label>
                  <input
                    type="date"
                    value={extractedData.date}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, date: e.target.value })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Thekedar / Site */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.thekedarOrSite}</span>
                  </label>
                  <input
                    type="text"
                    value={extractedData.thekedarOrSite}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, thekedarOrSite: e.target.value })
                    }
                    placeholder="जैसे: राजेश ठेकेदार"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Hours Worked with stepper */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.hoursWorked} (Hours)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: Math.max(1, extractedData.hoursWorked - 1),
                        })
                      }
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={extractedData.hoursWorked}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-center p-2 border border-neutral-300 rounded-lg text-base font-extrabold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: extractedData.hoursWorked + 1,
                        })
                      }
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Quick pills */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: 4,
                          overtimeHours: 0,
                        })
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      आधा दिन (4h)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: 8,
                          overtimeHours: 0,
                        })
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 hover:bg-orange-200 text-orange-800"
                    >
                      पूरा दिन (8h)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          hoursWorked: 10,
                          overtimeHours: 2,
                        })
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      +2h OT (10h)
                    </button>
                  </div>
                </div>

                {/* Daily Wage Rate */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <CircleDollarSign className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.dailyWage} (₹ प्रति दिन)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      value={extractedData.dailyWage}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          dailyWage: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full pl-7 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-extrabold focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Overtime Hours */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.overtimeHours}</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          overtimeHours: Math.max(0, extractedData.overtimeHours - 1),
                        })
                      }
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="12"
                      value={extractedData.overtimeHours}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          overtimeHours: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-center p-2 border border-neutral-300 rounded-lg text-base font-extrabold text-amber-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExtractedData({
                          ...extractedData,
                          overtimeHours: extractedData.overtimeHours + 1,
                        })
                      }
                      className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Overtime Rate */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                    <CircleDollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.overtimeRate}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-500 font-bold">₹</span>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={extractedData.overtimeRate}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          overtimeRate: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full pl-7 p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  <span>काम का विवरण / नोट:</span>
                </label>
                <input
                  type="text"
                  value={extractedData.notes || ''}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, notes: e.target.value })
                  }
                  placeholder="जैसे: प्लास्टर, चिनाई, वायरिंग आदि"
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium"
                />
              </div>

              {/* Earnings Calculator Breakdown Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 shadow-xs">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wide block mb-2">
                  {t.calculationBreakdown}
                </span>

                <div className="space-y-1.5 text-xs text-neutral-800">
                  <div className="flex justify-between items-center">
                    <span>
                      {t.baseWageCalc} ({extractedData.hoursWorked >= (profile.defaultShiftHours || 8) ? 'पूरा दिन' : `${extractedData.hoursWorked} घंटे`}):
                    </span>
                    <strong className="text-sm font-bold">₹{baseEarnings}</strong>
                  </div>

                  {extractedData.overtimeHours > 0 && (
                    <div className="flex justify-between items-center text-amber-800">
                      <span>
                        {t.overtimeCalc} ({extractedData.overtimeHours}h × ₹{extractedData.overtimeRate}/h):
                      </span>
                      <strong className="text-sm font-bold">+₹{overtimeEarnings}</strong>
                    </div>
                  )}

                  <div className="border-t border-amber-300 pt-2 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-neutral-900">
                      {t.totalCalculated}:
                    </span>
                    <span className="text-xl font-black text-orange-700">
                      ₹{totalEarnings}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="w-1/3 py-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-sm"
                >
                  ← वापस
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-base shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{t.confirmAndSave}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
