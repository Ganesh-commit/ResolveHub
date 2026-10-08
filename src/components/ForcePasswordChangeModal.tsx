import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

interface ForcePasswordModalProps {
  isOpen: boolean;
  regNo: string;
  onPasswordSetSuccess: () => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordModalProps> = ({
  isOpen,
  regNo,
  onPasswordSetSuccess
}) => {
  const { addToast } = useResolveHub();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your typing.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password-first-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Password Set Successfully', 'Your permanent password has been configured.');
        onPasswordSetSuccess();
      } else {
        setError(data.error || 'Failed to update password. Please try again.');
      }
    } catch {
      setError('Server error during password setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md border border-stone-200 dark:border-slate-700 shadow-2xl space-y-4">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-[#8a2410] dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto font-bold border border-amber-200 dark:border-amber-800">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-extrabold font-heading-playfair text-slate-900 dark:text-white">
            Set Your Permanent Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Welcome to ResolveHub! For security, please replace your default initial password (<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{regNo}</span>) with a new permanent password.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              New Permanent Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Confirm Permanent Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Password...' : <><CheckCircle2 className="w-4 h-4" /> Save & Access Portal Dashboard</>}
          </button>
        </form>

      </div>
    </div>
  );
};
