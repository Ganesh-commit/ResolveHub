import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Pencil, 
  Check, 
  Bell, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  ListFilter,
  Trash2,
  Loader2
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { authApi } from '../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { authUser, complaints, addToast, updateAuthUserAvatar, updateAuthUserProfile } = useResolveHub();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Editable Profile State
  const [name, setName] = useState(authUser?.name || 'Student');
  const [email, setEmail] = useState(authUser?.email || `${authUser?.regNo?.toLowerCase() || 'student'}@vignan.ac.in`);
  const [phone, setPhone] = useState(authUser?.phone || '+91-9876543210');
  const [location, setLocation] = useState('NTR Boys Hostel, Block B');
  const [department] = useState(authUser?.department || 'Computer Science & Engineering');

  // Inline edit toggle modes
  const [editingField, setEditingField] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('Today, 10:30 AM');

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifs: true,
    inAppNotifs: true,
    smsNotifs: false
  });

  // Password Form State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
      setEmail(authUser.email || '');
      if (authUser.phone) setPhone(authUser.phone);
    }
  }, [authUser]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter complaints belonging to logged in student
  const studentComplaints = complaints.filter(c => 
    c.complainant?.regNo?.toUpperCase() === authUser?.regNo?.toUpperCase() ||
    c.submittedBy?.toUpperCase().includes(authUser?.regNo?.toUpperCase() || '')
  );

  const resolvedCount = studentComplaints.filter(c => c.status === 'Resolved').length;

  // Calculate profile completion percentage
  let completionScore = 40;
  if (name) completionScore += 15;
  if (email) completionScore += 15;
  if (phone) completionScore += 10;
  if (location) completionScore += 10;
  if (authUser?.avatarUrl) completionScore += 10;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('warning', 'File Too Large', 'Profile photo must be less than 2MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      addToast('warning', 'Invalid Format', 'Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await authApi.uploadAvatar(formData);
      if (res && res.data && res.data.avatarUrl) {
        const cacheBustedUrl = `${res.data.avatarUrl}?v=${Date.now()}`;
        updateAuthUserAvatar(cacheBustedUrl);
        setLastUpdated('Just now');
        addToast('success', 'Profile Photo Updated', 'Your avatar image has been uploaded.');
      }
    } catch (err: any) {
      addToast('warning', 'Upload Failed', err.data?.error || err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setUploading(true);
      await authApi.deleteAvatar();
      updateAuthUserAvatar('');
      addToast('info', 'Photo Removed', 'Profile photo has been deleted.');
    } catch (err: any) {
      addToast('warning', 'Error', err.data?.error || 'Failed to remove photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveField = async (fieldName: string) => {
    try {
      setEditingField(null);
      await authApi.updateProfile({
        name,
        email,
        phone
      });
      updateAuthUserProfile({ name, email, phone });
      setLastUpdated('Just now');
      addToast('success', 'Profile Updated', `${fieldName} updated successfully.`);
    } catch (err: any) {
      addToast('warning', 'Update Failed', err.data?.error || 'Failed to update profile info.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Please fill out all password fields.' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    try {
      setPwdLoading(true);
      await authApi.updateProfile({
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmPassword: confirmPwd
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      addToast('success', 'Password Changed', 'Your security password was changed successfully.');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.data?.error || err.message || 'Failed to change password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1800px] mx-auto space-y-6 py-6 px-4 sm:px-8 lg:px-12 animate-pulse">
        <div className="h-44 bg-stone-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-stone-200 dark:bg-slate-800 rounded-3xl md:col-span-2"></div>
          <div className="h-64 bg-stone-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-8 py-6 px-4 sm:px-8 lg:px-12">
      
      {/* ── 1. HEADER CARD: PROFILE OVERVIEW & COMPLETION RING ────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-slate-700 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            
            {/* Profile Photo with SVG Progress Ring */}
            <div className="relative group">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-stone-200 dark:text-slate-700"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * completionScore) / 100}
                  className="text-[#8a2410] dark:text-amber-400 transition-all duration-1000"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-1.5 rounded-full overflow-hidden bg-[#8a2410] text-white flex items-center justify-center font-black text-2xl shadow-inner border-2 border-white dark:border-slate-800">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
                ) : authUser?.avatarUrl ? (
                  <img src={authUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{(name || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Upload Photo Button */}
              <label className="absolute bottom-0 right-0 p-2 bg-[#8a2410] text-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
              </label>

              {/* Delete Photo Button if avatar exists */}
              {authUser?.avatarUrl && !uploading && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="absolute bottom-0 left-0 p-2 bg-rose-700 text-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
                  title="Remove Profile Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Student Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black font-heading-playfair text-slate-900 dark:text-white">{name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  ACTIVE STUDENT
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Reg No: <strong>{authUser?.regNo || '211FA04001'}</strong> | Dept: <strong>{department}</strong>
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#8a2410]" /> {email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#8a2410]" /> {phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#8a2410]" /> {location}</span>
              </div>
            </div>

          </div>

          {/* Completion Score Badge */}
          <div className="text-center sm:text-right bg-stone-50 dark:bg-slate-900 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Profile Strength
            </span>
            <span className="text-2xl font-black font-heading-playfair text-[#8a2410] dark:text-amber-400">
              {completionScore}% Complete
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Last updated: {lastUpdated}
            </span>
          </div>

        </div>
      </div>

      {/* ── 2. TWO-COLUMN: EDITABLE DETAILS & NOTIFICATION PREFERENCES ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Editable Personal Details Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading-playfair flex items-center gap-2 border-b border-stone-100 dark:border-slate-700 pb-3">
            <User className="w-4 h-4 text-[#8a2410] dark:text-amber-400" /> Personal & Campus Information
          </h3>

          <div className="space-y-4 text-xs">
            
            {/* Full Name */}
            <div className="p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Student Name</span>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border rounded outline-none text-slate-900 dark:text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{name}</span>
                )}
              </div>
              {editingField === 'name' ? (
                <button onClick={() => handleSaveField('Name')} className="p-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setEditingField('name')} className="p-1.5 text-slate-400 hover:text-[#8a2410] cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Email Address */}
            <div className="p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Campus Email</span>
                {editingField === 'email' ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border rounded outline-none text-slate-900 dark:text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{email}</span>
                )}
              </div>
              {editingField === 'email' ? (
                <button onClick={() => handleSaveField('Email')} className="p-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setEditingField('email')} className="p-1.5 text-slate-400 hover:text-[#8a2410] cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Phone Number */}
            <div className="p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone Number</span>
                {editingField === 'phone' ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border rounded outline-none text-slate-900 dark:text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{phone}</span>
                )}
              </div>
              {editingField === 'phone' ? (
                <button onClick={() => handleSaveField('Phone')} className="p-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setEditingField('phone')} className="p-1.5 text-slate-400 hover:text-[#8a2410] cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Campus Location */}
            <div className="p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Hostel / Campus Room Location</span>
                {editingField === 'location' ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border rounded outline-none text-slate-900 dark:text-white font-bold"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{location}</span>
                )}
              </div>
              {editingField === 'location' ? (
                <button onClick={() => handleSaveField('Location')} className="p-1.5 bg-emerald-600 text-white rounded-lg cursor-pointer">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setEditingField('location')} className="p-1.5 text-slate-400 hover:text-[#8a2410] cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right: Notification Preferences */}
        <div className="md:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading-playfair flex items-center gap-2 border-b border-stone-100 dark:border-slate-700 pb-3">
            <Bell className="w-4 h-4 text-[#8a2410] dark:text-amber-400" /> Notification Preferences
          </h3>

          <div className="space-y-4 text-xs">
            
            <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Email Alerts</span>
                <span className="text-slate-500 text-[11px]">Receive SLA status updates via campus email.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.emailNotifs}
                onChange={(e) => {
                  setNotifPrefs(p => ({ ...p, emailNotifs: e.target.checked }));
                  addToast('info', 'Preferences Saved', 'Email notification settings updated.');
                }}
                className="w-4 h-4 accent-[#8a2410] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">In-App Push Banner</span>
                <span className="text-slate-500 text-[11px]">Show live banner popups when status changes.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.inAppNotifs}
                onChange={(e) => {
                  setNotifPrefs(p => ({ ...p, inAppNotifs: e.target.checked }));
                  addToast('info', 'Preferences Saved', 'In-app notification settings updated.');
                }}
                className="w-4 h-4 accent-[#8a2410] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">SMS Notifications</span>
                <span className="text-slate-500 text-[11px]">Express SMS alerts for urgent tickets.</span>
              </div>
              <input
                type="checkbox"
                checked={notifPrefs.smsNotifs}
                onChange={(e) => {
                  setNotifPrefs(p => ({ ...p, smsNotifs: e.target.checked }));
                  addToast('info', 'Preferences Saved', 'SMS notification settings updated.');
                }}
                className="w-4 h-4 accent-[#8a2410] cursor-pointer"
              />
            </div>

          </div>
        </div>

      </div>

      {/* ── 3. ACTIVITY STATS & RECENT COMPLAINTS SUMMARY ─────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#8a2410] dark:bg-rose-950 dark:text-amber-300 flex items-center justify-center font-bold">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-heading-playfair text-slate-900 dark:text-white">
              {studentComplaints.length}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Complaints Raised</div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-heading-playfair text-slate-900 dark:text-white">
              {resolvedCount}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaints Resolved</div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-heading-playfair text-slate-900 dark:text-white">
              2.4 Days
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Speed</div>
          </div>
        </div>

      </div>

      {/* ── 4. SECURITY & CHANGE PASSWORD SECTION ──────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-slate-700 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading-playfair flex items-center gap-2 border-b border-stone-100 dark:border-slate-700 pb-3">
          <Lock className="w-4 h-4 text-[#8a2410] dark:text-amber-400" /> Account Security & Active Sessions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="md:col-span-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Change Password</h4>

            {pwdMsg && (
              <p className={`text-xs font-bold p-2.5 rounded-xl border ${
                pwdMsg.type === 'error'
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                  : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              }`}>
                {pwdMsg.text}
              </p>
            )}

            <div className="space-y-3 text-xs">
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Current Password"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
              />

              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="New Password (min. 6 characters)"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
              />

              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="px-6 py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2"
            >
              {pwdLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{pwdLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>

          {/* Active Login Sessions */}
          <div className="md:col-span-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Login Sessions</h4>
            
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Chrome on Windows 11</span>
                    <span className="text-[10px] text-slate-400">Current active session • IP: 182.72.xx.xx</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">
                  ONLINE
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
