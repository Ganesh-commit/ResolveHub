import React, { useEffect } from 'react';
import { Megaphone, X, ArrowRight, Copy, Check } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const PushNotificationBanner: React.FC = () => {
  const { pushBanner, dismissPushBanner, setActiveView, setTrackQuery, addToast } = useResolveHub();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!pushBanner) return;
    const timer = setTimeout(() => {
      dismissPushBanner();
    }, 12000); // auto-hide after 12 seconds
    return () => clearTimeout(timer);
  }, [pushBanner, dismissPushBanner]);

  if (!pushBanner) return null;

  const handleTrackClick = () => {
    navigator.clipboard.writeText(pushBanner.code);
    setCopied(true);
    setTrackQuery(pushBanner.code);
    setActiveView('track');
    addToast('success', 'Tracking Code Copied!', `Code ${pushBanner.code} copied to clipboard.`);
    setTimeout(() => {
      dismissPushBanner();
    }, 800);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92vw] sm:w-full animate-slide-down pointer-events-auto">
      <div 
        onClick={handleTrackClick}
        className="bg-slate-900/95 backdrop-blur-xl border border-[#8B2414]/40 rounded-3xl p-4 text-white shadow-2xl hover:border-[#8B2414] transition-all cursor-pointer group relative overflow-hidden"
      >
        {/* Subtle Top Notification Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B2414] via-amber-500 to-[#721c0e]" />

        {/* Smartphone Notification Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#8B2414] text-white flex items-center justify-center font-extrabold text-[10px] shadow-xs">
              RH
            </div>
            <span className="font-bold text-slate-200 uppercase tracking-wider">Campus Grievance Portal</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Now</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissPushBanner();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Main Body */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#8B2414]/20 border border-[#8B2414]/60 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <Megaphone className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Complaint Registered! Tracking Code Generated
              </h4>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Your Complaint Tracking Code is <strong className="text-amber-300 font-mono font-extrabold text-sm px-2 py-0.5 rounded bg-[#8B2414]/40 border border-[#8B2414]/80">{pushBanner.code}</strong>.
            </p>
          </div>
        </div>

        {/* Bottom Interactive Tap Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Code Copied!' : 'Tap Notification to Copy & Track'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-[#8B2414] hover:bg-[#721c0e] text-white px-3 py-1.5 rounded-full shadow-xs">
            <span>TRACK NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
