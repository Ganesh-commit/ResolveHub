import React, { useState } from 'react';
import { X, User, KeyRound, Check, ShieldCheck, GraduationCap, Building2 } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { authApi } from '../services/api';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'password';
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile'
}) => {
  const { authUser, addToast } = useResolveHub();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(initialTab);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !authUser) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await authApi.updateProfile({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordSuccess(true);
      addToast('success', 'Password Updated!', 'Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.data?.error || err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    if (authUser.role === 'super_admin') return <ShieldCheck className="w-5 h-5 text-[#8B2414]" />;
    if (authUser.role === 'dept_admin') return <Building2 className="w-5 h-5 text-[#8B2414]" />;
    return <GraduationCap className="w-5 h-5 text-[#8B2414]" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up"
      >
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#8B2414] to-[#721c0e] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-[#8B2414] flex items-center justify-center font-extrabold text-xl shadow-lg">
              {authUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-extrabold font-heading">{authUser.name}</h3>
              <p className="text-xs text-amber-200 font-mono capitalize">
                {authUser.name} – {authUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#8B2414] text-[#8B2414] font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Account Details</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'password'
                ? 'border-[#8B2414] text-[#8B2414] font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
                {getRoleIcon()}
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Official Campus Credentials
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Authenticated account registered in Vignan University Database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Full Name</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{authUser.name}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">System Role</span>
                  <span className="font-mono font-bold text-[#8B2414] text-xs mt-0.5 block capitalize">
                    {authUser.role.replace('_', ' ')}
                  </span>
                </div>

                {authUser.regNo && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Registration No.</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm mt-0.5 block">{authUser.regNo}</span>
                  </div>
                )}

                {authUser.department && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Assigned Department</span>
                    <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{authUser.department}</span>
                  </div>
                )}

                {authUser.email && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Email Address</span>
                    <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">{authUser.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#8B2414] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              
              {passwordSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8B2414] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8B2414] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8B2414] outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#8B2414] hover:bg-[#721c0e] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
