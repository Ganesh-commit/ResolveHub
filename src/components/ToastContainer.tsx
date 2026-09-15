import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useResolveHub();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-stone-200 flex items-start gap-3 animate-slide-up"
        >
          <div className="mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-indigo-600" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
