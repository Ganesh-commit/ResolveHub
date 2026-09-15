import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { X, Lock, ArrowRight } from 'lucide-react';

export const StaffLoginModal: React.FC = () => {
  const {
    isStaffLoginModalOpen,
    setIsStaffLoginModalOpen,
    setActiveView,
    showToast
  } = useGrievance();

  const [staffId, setStaffId] = useState('RP-DISPATCH-99');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<'admin' | 'technician'>('admin');

  if (!isStaffLoginModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsStaffLoginModalOpen(false);
    setActiveView('admin');
    showToast(
      'Staff Portal Authenticated',
      `Welcome, Dispatch Lead (${staffId}). Session encrypted.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-cyan-500/30 shadow-2xl relative">
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{ fontFamily: 'var(--font-heading)' }}
                className="text-lg font-semibold text-white tracking-tight"
              >
                Staff Command Portal
              </h2>
              <p className="text-xs text-cyan-300/80 font-mono">
                SECURE ROLE-BASED ACCESS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsStaffLoginModalOpen(false)}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
              Select Duty Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-[#090a0f] text-white/60 border-white/10'
                }`}
              >
                Dispatch Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('technician')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  role === 'technician'
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-[#090a0f] text-white/60 border-white/10'
                }`}
              >
                Field Technician
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
              Officer Identification
            </label>
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-white/60 mb-1">
              Security Key / Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Authenticate & Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[10px] text-white/40 font-mono">
            Demo Credentials Pre-filled. Click Authenticate to enter.
          </div>
        </form>
      </div>
    </div>
  );
};
