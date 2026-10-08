import React, { useState } from 'react';
import { X, Lock, Shield, ArrowRight, AlertTriangle, KeyRound, UserPlus, CheckCircle2, Search, User, ShieldCheck, Building2, Eye, EyeOff } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { ForcePasswordChangeModal } from './ForcePasswordChangeModal';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginUser,
    submitSignupRequest,
    checkSignupStatus
  } = useResolveHub();

  const [authMode, setAuthMode] = useState<'student_login' | 'admin_login' | 'signup_request' | 'status_check'>('student_login');

  // Password visibility states
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // Student Login state
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Force Password Modal State
  const [forcePasswordModalOpen, setForcePasswordModalOpen] = useState(false);
  const [forcePasswordRegNo, setForcePasswordRegNo] = useState('');

  // Admin Login state
  const [adminType, setAdminType] = useState<'dept_admin' | 'super_admin'>('dept_admin');
  const [selectedDept] = useState<string>('Information Technology (IT)');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Signup request form state
  const [signupRegNo, setSignupRegNo] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDept, setSignupDept] = useState('CSE');
  const [signupYear, setSignupYear] = useState('1st Year');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Status check state
  const [statusQueryRegNo, setStatusQueryRegNo] = useState('');
  const [statusResult, setStatusResult] = useState<{ status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_FOUND'; reason?: string } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  // Calculate Password Strength for Signup Form
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-stone-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (pwd.length < 8 || !/^(?=.*[a-zA-Z])(?=.*\d)/.test(pwd)) {
      return { score: 1, label: 'Weak (Need 8+ chars with letter & number)', color: 'bg-rose-500' };
    }
    if (score >= 3) {
      return { score: 3, label: 'Strong Password', color: 'bg-emerald-500' };
    }
    return { score: 2, label: 'Medium Password', color: 'bg-amber-500' };
  };

  const pwdStrength = getPasswordStrength(signupPassword);

  // Handle Student Login submission
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    const res = await loginUser(studentRegNo, studentPassword, 'student');
    setLoading(false);

    if (res.mustChangePassword) {
      setForcePasswordRegNo(res.regNo || studentRegNo);
      setForcePasswordModalOpen(true);
      setIsLoginModalOpen(false);
      setStudentRegNo('');
      setStudentPassword('');
      return;
    }

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid credentials');
    } else {
      setStudentRegNo('');
      setStudentPassword('');
      setErrorMessage(null);
    }
  };

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    const targetRole = adminType === 'super_admin' ? 'super_admin' : 'dept_admin';
    const res = await loginUser(adminUsername, adminPassword, targetRole, selectedDept);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid credentials');
    } else {
      setErrorMessage(null);
    }
  };

  // Handle Student Signup Request Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter passwords.');
      return;
    }

    if (signupPassword.length < 8 || !/^(?=.*[a-zA-Z])(?=.*\d)/.test(signupPassword)) {
      setErrorMessage('Password must be at least 8 characters long and contain at least one letter and one number.');
      return;
    }

    setLoading(true);
    const res = await submitSignupRequest({
      regNo: signupRegNo,
      fullName: signupName,
      email: signupEmail,
      department: signupDept,
      year: signupYear,
      phone: signupPhone,
      password: signupPassword,
      confirmPassword: signupConfirmPassword
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Failed to submit registration request.');
    } else {
      setSuccessMessage(res.message || 'Your request has been sent to the Super Admin. You can log in after approval.');
      setSignupRegNo('');
      setSignupName('');
      setSignupEmail('');
      setSignupPhone('');
      setSignupPassword('');
      setSignupConfirmPassword('');
    }
  };

  // Handle Status Check
  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusQueryRegNo.trim()) return;
    const res = checkSignupStatus(statusQueryRegNo);
    setStatusResult(res);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <div 
          className={`relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-slate-700 my-8 animate-slide-up ${
            errorMessage ? 'animate-shake' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsLoginModalOpen(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#8a2410] dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
              {authMode === 'admin_login' ? <ShieldCheck className="w-6 h-6 text-[#8a2410] dark:text-amber-400" /> : <Shield className="w-6 h-6 text-[#8a2410] dark:text-amber-400" />}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
              {authMode === 'student_login' && 'Student Sign In'}
              {authMode === 'admin_login' && 'Admin Secure Login'}
              {authMode === 'signup_request' && 'Request Student Account'}
              {authMode === 'status_check' && 'Check Signup Status'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {authMode === 'student_login' && 'Enter your Student Registration Number & Password.'}
              {authMode === 'admin_login' && 'Secure authentication for Super Admin and Department Admins.'}
              {authMode === 'signup_request' && 'Fill the request form to register for student portal access.'}
              {authMode === 'status_check' && 'Check if your registration request is approved or pending.'}
            </p>
          </div>

          {/* Four Navigation Tabs */}
          <div className="flex bg-stone-100 dark:bg-slate-700/60 p-1.5 rounded-2xl mb-5 text-[11px] font-bold gap-1 border border-stone-200 dark:border-slate-600">
            <button
              type="button"
              onClick={() => {
                setAuthMode('student_login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'student_login'
                  ? 'bg-[#8a2410] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('admin_login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'admin_login'
                  ? 'bg-[#8a2410] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup_request');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'signup_request'
                  ? 'bg-[#8a2410] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('status_check');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                authMode === 'status_check'
                  ? 'bg-[#8a2410] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Status
            </button>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-rose-950 dark:text-rose-100 text-xs uppercase tracking-wider">
                  Authentication Error
                </h4>
                <p className="mt-0.5 font-bold leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-3 animate-slide-up">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-emerald-950 dark:text-emerald-100 text-xs uppercase tracking-wider">
                  Request Submitted
                </h4>
                <p className="mt-0.5 font-bold leading-relaxed">{successMessage}</p>
              </div>
            </div>
          )}

          {/* ── MODE 1: STUDENT SIGN IN FORM ── */}
          {authMode === 'student_login' && (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Registration Number
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentRegNo}
                    onChange={(e) => {
                      setStudentRegNo(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="e.g. 241FA07001"
                    className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono font-bold tracking-wider uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => {
                      setStudentPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#8a2410] hover:bg-[#6f1b0c] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>STUDENT SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-stone-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAuthMode('signup_request')}
                  className="text-xs font-bold text-[#8a2410] dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Don&apos;t have an account? Request Student Account →
                </button>
              </div>
            </form>
          )}

          {/* ── MODE 2: ADMIN SECURE LOGIN FORM ── */}
          {authMode === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              
              {/* Sub-role Toggle */}
              <div className="flex bg-stone-100 dark:bg-slate-700/60 p-1.5 rounded-2xl mb-3 text-xs font-bold gap-1.5 border border-stone-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setAdminType('dept_admin');
                    setAdminUsername('');
                    setAdminPassword('');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminType === 'dept_admin'
                      ? 'bg-[#8a2410] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Department Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminType('super_admin');
                    setAdminUsername('');
                    setAdminPassword('');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminType === 'super_admin'
                      ? 'bg-[#8a2410] text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Super Admin</span>
                </button>
              </div>

              {/* Username Input */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  {adminType === 'dept_admin' ? 'Department Admin Username' : 'Super Admin Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => {
                      setAdminUsername(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder={adminType === 'dept_admin' ? 'Enter Department Admin Username' : 'Enter Super Admin Username (e.g. ksaiganesh64)'}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Enter Password"
                    className="w-full pl-10 pr-10 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#8a2410] hover:bg-[#6f1b0c] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <span>Authenticating Admin Account...</span>
                ) : (
                  <>
                    {adminType === 'dept_admin' ? <Building2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{adminType === 'dept_admin' ? 'AUTHENTICATE DEPT ADMIN' : 'AUTHENTICATE SUPER ADMIN'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── MODE 3: REQUEST STUDENT ACCOUNT (PROBLEM 2 FORM) ── */}
          {authMode === 'signup_request' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter Student Full Name"
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Student Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={signupRegNo}
                  onChange={(e) => setSignupRegNo(e.target.value)}
                  placeholder="Enter Student Reg No (e.g. 241FA07001)"
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@vignan.ac.in"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Department *
                  </label>
                  <select
                    value={signupDept}
                    onChange={(e) => setSignupDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="Information Technology (IT)">Information Technology (IT)</option>
                    <option value="CSE (Computer Science & Engineering)">CSE (Computer Science & Engineering)</option>
                    <option value="AI & ML (Artificial Intelligence & Machine Learning)">AI & ML (Artificial Intelligence & Machine Learning)</option>
                    <option value="EEE (Electrical & Electronics Engineering)">EEE (Electrical & Electronics Engineering)</option>
                    <option value="BI & BT (Bio-Informatics & Bio-Technology)">BI & BT (Bio-Informatics & Bio-Technology)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Robotics">Robotics</option>
                    <option value="ECE (Electronics & Communication Engineering)">ECE (Electronics & Communication Engineering)</option>
                    <option value="Textile Industry">Textile Industry</option>
                    <option value="CS-BS (Computer Science & Business Systems)">CS-BS (Computer Science & Business Systems)</option>
                    <option value="CS-DS (Computer Science & Data Science)">CS-DS (Computer Science & Data Science)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Year / Section *
                  </label>
                  <select
                    value={signupYear}
                    onChange={(e) => setSignupYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Password Fields with Strength Meter & Show/Hide Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 8 chars (letters+numbers)"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter Password"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                      tabIndex={-1}
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Strength Meter Bar */}
              {signupPassword.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={pwdStrength.score === 1 ? 'text-rose-600' : pwdStrength.score === 2 ? 'text-amber-600' : 'text-emerald-600'}>
                      {pwdStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 transition-all ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'}`} />
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-slate-700/50 rounded-2xl border border-amber-200 dark:border-slate-600 text-amber-950 dark:text-amber-200 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8a2410] dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Your request will be sent to Super Admin for verification. Once approved, you can log in directly using the password created above.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#8a2410] hover:bg-[#6f1b0c] disabled:opacity-50 text-white font-extrabold text-xs py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {loading ? (
                  <span>Submitting Request...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>SUBMIT REQUEST TO SUPER ADMIN</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── MODE 4: CHECK SIGNUP STATUS ── */}
          {authMode === 'status_check' && (
            <div className="space-y-4">
              <form onSubmit={handleStatusCheck} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={statusQueryRegNo}
                  onChange={(e) => setStatusQueryRegNo(e.target.value)}
                  placeholder="Enter Registration Number"
                  className="flex-1 px-4 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-950 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-mono font-bold uppercase"
                />
                <button
                  type="submit"
                  className="px-5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Check</span>
                </button>
              </form>

              {statusResult && (
                <div className="p-5 rounded-2xl border bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-700 animate-slide-up">
                  {statusResult.status === 'APPROVED' && (
                    <div className="flex items-start gap-3 text-emerald-950 dark:text-emerald-200">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">
                          ACCOUNT ACTIVATED & APPROVED
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed">
                          Account for Registration Number <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span> is active! Proceed to Student Sign In.
                        </p>
                      </div>
                    </div>
                  )}

                  {statusResult.status === 'PENDING' && (
                    <div className="flex items-start gap-3 text-amber-950 dark:text-amber-200">
                      <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-amber-800 dark:text-amber-400">
                          REQUEST PENDING APPROVAL
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed">
                          Your request for <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span> is awaiting Super Admin verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {statusResult.status === 'REJECTED' && (
                    <div className="flex items-start gap-3 text-rose-950 dark:text-rose-200">
                      <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-rose-800 dark:text-rose-400">
                          REQUEST REJECTED
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed">
                          Your request was rejected: <strong className="text-rose-700 dark:text-rose-300">{statusResult.reason || 'Invalid details'}</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {statusResult.status === 'NOT_FOUND' && (
                    <div className="text-center text-xs text-slate-500 py-2">
                      No account request found for <strong className="font-mono">{statusQueryRegNo.toUpperCase()}</strong>.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {forcePasswordModalOpen && (
        <ForcePasswordChangeModal
          isOpen={forcePasswordModalOpen}
          regNo={forcePasswordRegNo}
          onPasswordSetSuccess={() => setForcePasswordModalOpen(false)}
        />
      )}
    </>
  );
};
