import React, { useState } from 'react';
import { X, Lock, Shield, ArrowRight, AlertTriangle, KeyRound, UserPlus, CheckCircle2, Clock, XCircle, Search, User, ShieldCheck } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginUser,
    submitSignupRequest,
    checkSignupStatus
  } = useResolveHub();

  const [authMode, setAuthMode] = useState<'student_login' | 'admin_login' | 'signup_request' | 'status_check'>('student_login');

  // Student Login state
  const [studentRegNo, setStudentRegNo] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin Login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Signup request form state
  const [signupRegNo, setSignupRegNo] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('Computer Science & Engineering (CSE)');
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

  // Handle Student Login submission
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setLoading(true);
    const res = await loginUser(studentRegNo, studentPassword, 'student');
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Student authentication failed.');
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
    const res = await loginUser(adminUsername, adminPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Invalid Admin Credentials!');
    } else {
      setAdminUsername('');
      setAdminPassword('');
      setErrorMessage(null);
    }
  };

  // Handle Student Signup Request
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await submitSignupRequest({
      regNo: signupRegNo,
      fullName: signupName,
      email: signupEmail,
      department: signupDept,
      year: signupYear,
      password: signupPassword
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Failed to submit signup request.');
    } else {
      setSuccessMessage(res.message || 'Request submitted successfully! Pending Super Admin verification.');
      setSignupRegNo('');
      setSignupName('');
      setSignupEmail('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsLoginModalOpen(false);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
            {authMode === 'admin_login' ? <ShieldCheck className="w-6 h-6 text-indigo-700" /> : <Shield className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-heading">
            {authMode === 'student_login' && 'Student Sign In'}
            {authMode === 'admin_login' && 'Admin Secure Login'}
            {authMode === 'signup_request' && 'Request Student Account'}
            {authMode === 'status_check' && 'Check Signup Status'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === 'student_login' && 'Enter your Student Registration Number & Password.'}
            {authMode === 'admin_login' && 'Secure authentication for Super Admin and Department Admins.'}
            {authMode === 'signup_request' && 'Students can submit an account creation request for Super Admin approval.'}
            {authMode === 'status_check' && 'Check if your registration request is approved or pending.'}
          </p>
        </div>

        {/* Four Navigation Tabs */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-5 text-[11px] font-bold gap-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('student_login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              authMode === 'student_login'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Sign In
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
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Sign In
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
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Request
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
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Check Status
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-slide-up">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-rose-950 text-xs uppercase tracking-wider">
                Authentication Alert
              </h4>
              <p className="mt-0.5 font-bold text-rose-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                Request Registered
              </h4>
              <p className="mt-0.5 font-bold text-emerald-800 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {/* ── MODE 1: STUDENT SIGN IN FORM ── */}
        {authMode === 'student_login' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-mono font-bold tracking-wider uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={studentPassword}
                  onChange={(e) => {
                    setStudentPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter Password"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-3.5 rounded-full shadow-md btn-lift transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? (
                <span>Verifying Student Account...</span>
              ) : (
                <>
                  <span>STUDENT SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setAuthMode('signup_request')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Don&apos;t have an account? Request Student Account →
              </button>
            </div>
          </form>
        )}

        {/* ── MODE 2: ADMIN SECURE LOGIN FORM ── */}
        {authMode === 'admin_login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 text-xs mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700 flex-shrink-0" />
              <span>Enter official Admin credentials to access the Control Center.</span>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                Admin Username
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
                  placeholder="Enter Admin Username"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-indigo-600 outline-none text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter Admin Password"
                  className="w-full pl-10 pr-4 py-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-indigo-600 outline-none text-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs py-3.5 rounded-full shadow-md btn-lift transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? (
                <span>Authenticating Admin Role...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>AUTHENTICATE & OPEN ADMIN DASHBOARD</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── MODE 3: REQUEST STUDENT ACCOUNT ── */}
        {authMode === 'signup_request' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Student Registration Number *
              </label>
              <input
                type="text"
                required
                value={signupRegNo}
                onChange={(e) => setSignupRegNo(e.target.value)}
                placeholder="Enter Student Reg No (e.g. 241FA07001)"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Enter Student Full Name"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Department
                </label>
                <select
                  value={signupDept}
                  onChange={(e) => setSignupDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-medium cursor-pointer"
                >
                  <option value="Computer Science & Engineering (CSE)">CSE</option>
                  <option value="Electronics & Communication (ECE)">ECE</option>
                  <option value="Electrical & Electronics (EEE)">EEE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Information Technology (IT)">IT</option>
                  <option value="Artificial Intelligence & ML">AI & ML</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Academic Year
                </label>
                <select
                  value={signupYear}
                  onChange={(e) => setSignupYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-medium cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Set Password"
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-3.5 rounded-full shadow-md btn-lift transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
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
                className="flex-1 px-4 py-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 font-mono font-bold uppercase"
              />
              <button
                type="submit"
                className="px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Check</span>
              </button>
            </form>

            {statusResult && (
              <div className="p-5 rounded-2xl border bg-stone-50 animate-slide-up">
                {statusResult.status === 'APPROVED' && (
                  <div className="flex items-start gap-3 text-emerald-900">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950">
                        ACCOUNT ACTIVATED & APPROVED BY SUPER ADMIN
                      </h4>
                      <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Account for Registration Number <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span> is active! Proceed to Student Sign In.
                      </p>
                      <button
                        onClick={() => {
                          setStudentRegNo(statusQueryRegNo);
                          setAuthMode('student_login');
                        }}
                        className="mt-3 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-emerald-900"
                      >
                        Proceed to Student Sign In →
                      </button>
                    </div>
                  </div>
                )}

                {statusResult.status === 'PENDING' && (
                  <div className="flex items-start gap-3 text-amber-900">
                    <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-950">
                        VERIFICATION PENDING SUPER ADMIN APPROVAL
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Account request for <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span> is pending Super Admin verification.
                      </p>
                    </div>
                  </div>
                )}

                {statusResult.status === 'REJECTED' && (
                  <div className="flex items-start gap-3 text-rose-900">
                    <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-950">
                        REQUEST REJECTED BY ADMIN
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                        Signup request for <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span> was rejected. Reason: <span className="font-bold">{statusResult.reason || 'Verification failed'}</span>.
                      </p>
                    </div>
                  </div>
                )}

                {statusResult.status === 'NOT_FOUND' && (
                  <div className="flex items-start gap-3 text-slate-700">
                    <AlertTriangle className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">NO RECORD FOUND</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        No request exists for Registration Number <span className="font-mono font-bold">{statusQueryRegNo.toUpperCase()}</span>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Note */}
        <p className="text-[11px] text-center text-slate-400 mt-5 border-t border-stone-100 pt-3">
          🔒 RBAC Security Layer: Admin accounts can only be created by Super Admin.
        </p>

      </div>
    </div>
  );
};
