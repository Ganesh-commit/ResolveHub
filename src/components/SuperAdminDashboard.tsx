import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useResolveHub, ACADEMIC_DEPARTMENTS } from '../context/ResolveHubContext';
import { authApi } from '../services/api';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  UserCheck,
  UserPlus,
  Settings,
  PieChart,
  Activity,
  Search,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Flame,
  BarChart3,
  Building2,
  Sliders,
  Download,
  ArrowRight,
  KeyRound,
  Loader2
} from 'lucide-react';
import type { Complaint, SignupRequest } from '../types';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';

export const SuperAdminDashboard: React.FC = () => {
  const {
    activeView,
    setActiveView,
    complaints,
    signupRequests,
    approveSignupRequest,
    rejectSignupRequest,
    adminsList,
    createDeptAdmin,
    toggleAdminStatus,
    deleteAdminAccount,
    studentsList,
    toggleStudentStatus,
    systemSettings,
    updateSettings,
    activityLogs,
    updateComplaintStatus,
    assignComplaint,
    addAuditRemarks,
    addToast
  } = useResolveHub();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'students' | 'admins' | 'settings' | 'reports' | 'logs'>('dashboard');

  // Socket.io Realtime Listener for new account requests
  useEffect(() => {
    let socket: any;
    try {
      socket = io('http://localhost:3001');
      socket.on('new_account_request', (data: any) => {
        addToast('info', 'New Account Request', `Signup request from ${data?.fullName || 'a student'} (${data?.regNo || ''})`);
      });
    } catch (e) {}
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (activeView === 'super_admin_students') setActiveTab('students');
    else if (activeView === 'super_admin_admins' || activeView === 'super_admin_roles') setActiveTab('admins');
    else if (activeView === 'super_admin_settings' || activeView === 'super_admin_departments') setActiveTab('settings');
    else if (activeView === 'super_admin_analytics') setActiveTab('reports');
    else if (activeView === 'super_admin_audit') setActiveTab('logs');
    else if (activeView === 'super_admin_complaints') setActiveTab('complaints');
    else setActiveTab('dashboard');
  }, [activeView]);

  // Search & Filters for Complaints
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Modal State for Reviewing Complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatusInput, setNewStatusInput] = useState('');
  const [responseRemarksInput, setResponseRemarksInput] = useState('');
  const [assignDeptInput, setAssignDeptInput] = useState('');
  const [assignStaffInput, setAssignStaffInput] = useState('');

  // Modal State for Creating Department Admin
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [newAdminDept, setNewAdminDept] = useState('Information Technology (IT)');
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  // Modal State for Rejecting Student Signup
  const [rejectStudentReq, setRejectStudentReq] = useState<SignupRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Modal State for Resetting Student Password
  const [resetStudentModal, setResetStudentModal] = useState<any | null>(null);
  const [resetNewPasswordInput, setResetNewPasswordInput] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  // Search & Filter for Signup Requests
  const [signupSearch, setSignupSearch] = useState('');
  const [signupStatusFilter, setSignupStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredSignupRequests = signupRequests.filter(r => {
    const statusMatch = signupStatusFilter === 'ALL' || r.status === signupStatusFilter;
    const searchMatch = !signupSearch.trim() || (
      r.regNo.toLowerCase().includes(signupSearch.toLowerCase()) ||
      r.fullName.toLowerCase().includes(signupSearch.toLowerCase()) ||
      r.email.toLowerCase().includes(signupSearch.toLowerCase()) ||
      (r.department || '').toLowerCase().includes(signupSearch.toLowerCase())
    );
    return statusMatch && searchMatch;
  });

  const handleResetStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetStudentModal || !resetNewPasswordInput.trim()) return;
    if (resetNewPasswordInput.length < 6) {
      setResetPasswordError('Password must be at least 6 characters.');
      return;
    }
    try {
      setResetPasswordLoading(true);
      setResetPasswordError(null);
      await authApi.resetStudentPassword(resetStudentModal.id, resetNewPasswordInput);
      addToast('success', 'Password Reset!', `Password reset successfully for ${resetStudentModal.fullName} (${resetStudentModal.regNo}).`);
      setResetStudentModal(null);
      setResetNewPasswordInput('');
    } catch (err: any) {
      setResetPasswordError(err.data?.error || err.message || 'Failed to reset student password.');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // New Category / Department State in Settings
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newDeptInput, setNewDeptInput] = useState('');

  // Calculate 8 Dashboard Statistics Cards
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const inProgressComplaints = complaints.filter(c => ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase())).length;
  const resolvedComplaints = complaints.filter(c => ['resolved'].includes(c.status.toLowerCase())).length;
  const rejectedComplaints = complaints.filter(c => ['rejected'].includes(c.status.toLowerCase())).length;
  const totalStudents = studentsList.length;
  const totalAdmins = adminsList.length;
  const pendingSignups = signupRequests.filter(r => r.status === 'PENDING').length;

  // Filtered Complaints (for All Complaints tab)
  const filteredComplaints = complaints.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    const catMatch = filterCategory === 'all' || c.category === filterCategory;
    const deptMatch = filterDept === 'all' || c.department === filterDept;
    const prioMatch = filterPriority === 'all' || (c.urgency || c.priority || '').toLowerCase() === filterPriority.toLowerCase();

    const searchMatch = !searchQuery.trim() || (
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.regNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return statusMatch && catMatch && deptMatch && prioMatch && searchMatch;
  });

  // Top 5 Urgent / Recent Complaints for Overview Dashboard
  const recentOrHighPriorityComplaints = [...complaints]
    .sort((a, b) => {
      const isAHigh = ['critical', 'urgent', 'high'].includes((a.urgency || a.priority || '').toLowerCase());
      const isBHigh = ['critical', 'urgent', 'high'].includes((b.urgency || b.priority || '').toLowerCase());
      if (isAHigh && !isBHigh) return -1;
      if (!isAHigh && isBHigh) return 1;
      return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
    })
    .slice(0, 5);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);
    const res = await createDeptAdmin({
      name: newAdminName,
      username: newAdminUsername,
      password: newAdminPassword,
      department: newAdminDept
    });

    if (!res.success) {
      setAddAdminError(res.message || 'Failed to create admin.');
    } else {
      setIsAddAdminOpen(false);
      setNewAdminName('');
      setNewAdminUsername('');
      setNewAdminPassword('');
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    if (newStatusInput) {
      await updateComplaintStatus(selectedComplaint.id, newStatusInput, responseRemarksInput);
    } else if (responseRemarksInput) {
      await addAuditRemarks(selectedComplaint.id, responseRemarksInput);
    }
    if (assignStaffInput) {
      await assignComplaint(selectedComplaint.id, assignStaffInput, 'Staff Specialist', assignDeptInput || selectedComplaint.department);
    }
    setSelectedComplaint(null);
    setNewStatusInput('');
    setResponseRemarksInput('');
  };

  const handleConfirmRejectStudent = async () => {
    if (!rejectStudentReq) return;
    await rejectSignupRequest(rejectStudentReq.id, rejectReasonInput || 'Registration number could not be verified with college registry.');
    setRejectStudentReq(null);
    setRejectReasonInput('');
  };

  const handleExportCSV = () => {
    const listToExport = activeTab === 'complaints' ? filteredComplaints : complaints;
    const headers = ['Complaint ID', 'Title', 'Complainant Name', 'Reg No', 'Category', 'Department', 'Priority', 'Status', 'Submitted Date', 'Assigned Staff', 'Remarks'];
    const rows = listToExport.map(c => [
      `"${c.id}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.complainant?.name || c.submittedBy || '').replace(/"/g, '""')}"`,
      `"${c.complainant?.regNo || ''}"`,
      `"${c.category || ''}"`,
      `"${c.department || ''}"`,
      `"${c.urgency || c.priority || 'Medium'}"`,
      `"${c.status || ''}"`,
      `"${c.submittedAt || ''}"`,
      `"${c.assignedAgent?.name || ''}"`,
      `"${(c.responseRemarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Complaint_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-12 max-w-[1800px] mx-auto w-full space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="border-b border-stone-200/80 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          {activeTab === 'dashboard' && 'System Overview Dashboard'}
          {activeTab === 'complaints' && 'All College Complaints & Grievances'}
          {activeTab === 'students' && 'Student Accounts & Registration Approvals'}
          {activeTab === 'admins' && 'Department Admins & Access Roles'}
          {activeTab === 'settings' && 'System & Department Settings'}
          {activeTab === 'reports' && 'Analytics & Grievance Reports'}
          {activeTab === 'logs' && 'System Audit Trail & Log History'}
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          {activeTab === 'dashboard' && 'Real-time high-level governance metrics, analytics trends, urgent grievances, and quick administrative controls.'}
          {activeTab === 'complaints' && 'Search, filter, track status, and reassign all complaints across departments.'}
          {activeTab === 'students' && 'Verify registration numbers, approve signup requests, and manage active student accounts.'}
          {activeTab === 'admins' && 'Provision new department admin credentials and manage role-based permissions.'}
          {activeTab === 'settings' && 'Configure grievance categories and university department registries.'}
          {activeTab === 'reports' && 'Visual breakdown of complaint volume by department and category performance trends.'}
          {activeTab === 'logs' && 'Comprehensive audit log of system events, actions, and status updates.'}
        </p>
      </div>

      {/* ── 8 STATISTICS CARDS RIBBON (Always visible on Overview & Complaints view) ── */}
      {(activeTab === 'dashboard' || activeTab === 'complaints') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 font-heading">{totalComplaints}</div>
              <div className="text-xs text-slate-500 mt-0.5">All college grievances logged</div>
            </div>
          </div>

          {/* Card 2: Pending Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Complaints</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-700 font-heading">{pendingComplaints}</div>
              <div className="text-xs text-slate-500 mt-0.5">Awaiting initial review</div>
            </div>
          </div>

          {/* Card 3: In Progress Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-sky-700 font-heading">{inProgressComplaints}</div>
              <div className="text-xs text-slate-500 mt-0.5">Technicians in field</div>
            </div>
          </div>

          {/* Card 4: Resolved Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-[#8B2414] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[#8B2414] font-heading">{resolvedComplaints}</div>
              <div className="text-xs text-[#8B2414] font-semibold mt-0.5">Verified & closed</div>
            </div>
          </div>

          {/* Card 5: Rejected Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-rose-700 font-heading">{rejectedComplaints}</div>
              <div className="text-xs text-slate-500 mt-0.5">Invalid or duplicate</div>
            </div>
          </div>

          {/* Card 6: Total Students */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 font-heading">{totalStudents}</div>
              <div className="text-xs text-slate-500 mt-0.5">Active student accounts</div>
            </div>
          </div>

          {/* Card 7: Total Admins */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Admins</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-indigo-900 font-heading">{totalAdmins}</div>
              <div className="text-xs text-slate-500 mt-0.5">Super & Dept Admins</div>
            </div>
          </div>

          {/* Card 8: Pending Signup Requests */}
          <div 
            onClick={() => setActiveView('super_admin_students')}
            className={`rounded-3xl p-5 border shadow-xs transition-all cursor-pointer ${
              pendingSignups > 0 ? 'bg-amber-500/10 border-amber-400 hover:bg-amber-500/20' : 'bg-white border-stone-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Pending Signups</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-900 font-heading">{pendingSignups}</div>
              <div className="text-xs text-amber-800 font-bold mt-0.5">Needs Reg Verification →</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN OVERVIEW DASHBOARD PAGE ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Quick Administrative Action Shortcuts */}
          <div>
            <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Quick Governance Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setIsAddAdminOpen(true);
                  setAddAdminError(null);
                }}
                className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Add Dept Admin</div>
                <div className="text-xs text-slate-500 mt-1">Create new department manager account</div>
              </button>

              <button
                onClick={() => setActiveView('super_admin_students')}
                className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Verify Student Signups</div>
                <div className="text-xs text-slate-500 mt-1">{pendingSignups} pending registration approvals</div>
              </button>

              <button
                onClick={handleExportCSV}
                className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Export System Report</div>
                <div className="text-xs text-slate-500 mt-1">Download CSV audit & complaint records</div>
              </button>

              <button
                onClick={() => setActiveView('super_admin_settings')}
                className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">System Configuration</div>
                <div className="text-xs text-slate-500 mt-1">Manage departments and categories</div>
              </button>
            </div>
          </div>

          {/* Analytics Overview Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department-wise Complaint Volume */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-700" />
                  Department Grievance Volume
                </h3>
                <button 
                  onClick={() => setActiveView('super_admin_analytics')}
                  className="text-xs font-bold text-indigo-900 hover:text-indigo-950 flex items-center gap-1 cursor-pointer"
                >
                  <span>Detailed Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {systemSettings.departments.slice(0, 5).map((dept) => {
                  const count = complaints.filter(c => c.department === dept).length;
                  const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{dept}</span>
                        <span className="font-mono text-slate-500">{count} complaints ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#8B2414]" />
                  Category Distribution
                </h3>
                <button 
                  onClick={() => setActiveView('super_admin_analytics')}
                  className="text-xs font-bold text-[#8B2414] hover:text-[#721c0e] flex items-center gap-1 cursor-pointer"
                >
                  <span>View Trends</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {systemSettings.categories.slice(0, 5).map((cat) => {
                  const count = complaints.filter(c => c.category === cat).length;
                  const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{cat}</span>
                        <span className="font-mono text-slate-500">{count} issues ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B2414] rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top 5 Urgent / Recent Complaints Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-stone-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  Recent & High-Priority Grievances
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overview of top urgent complaints requiring immediate admin action.
                </p>
              </div>
              <button
                onClick={() => setActiveView('super_admin_complaints')}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                <span>View All Complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">ID / Reg No</th>
                    <th className="px-4 py-3.5">Grievance Subject</th>
                    <th className="px-4 py-3.5">Category & Dept</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5">Submitted Date</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrHighPriorityComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No active complaints recorded.
                      </td>
                    </tr>
                  ) : (
                    recentOrHighPriorityComplaints.map((c) => {
                      const isHighPriority = (c.urgency || c.priority || '').toLowerCase() === 'critical' || (c.urgency || c.priority || '').toLowerCase() === 'urgent' || (c.urgency || c.priority || '').toLowerCase() === 'high';

                      return (
                        <tr 
                          key={c.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isHighPriority ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-mono font-extrabold text-indigo-900 text-sm">
                              {c.id}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              Reg: {c.complainant?.regNo || '241FA07001'}
                            </div>
                          </td>
                          <td className="px-4 py-4 max-w-xs">
                            <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">By: {c.complainant?.name || c.submittedBy}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{c.category}</div>
                            <div className="text-[10px] text-slate-500">{c.department}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {isHighPriority ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                                <Flame className="w-3 h-3 text-rose-600" />
                                HIGH PRIORITY
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {c.urgency || c.priority || 'Medium'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              c.status.toLowerCase() === 'resolved' ? 'bg-rose-100 text-[#8B2414]' :
                              c.status.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase()) ? 'bg-sky-100 text-sky-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {c.submittedAt}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setNewStatusInput(c.status);
                                setResponseRemarksInput(c.responseRemarks || '');
                                setAssignDeptInput(c.department);
                              }}
                              className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL COMPLAINTS CONTROL CENTER VIEW ── */}
      {activeTab === 'complaints' && (
        <div className="space-y-6">
          {/* Multi-Search & Filter Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Complaint ID, Reg No, Title, Location..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:border-indigo-600 outline-none text-slate-900"
                />
              </div>

              {/* Department Filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
              >
                <option value="all">All Departments</option>
                {systemSettings.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                {systemSettings.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">Pending Intake</option>
                <option value="investigating">Investigating</option>
                <option value="dispatched">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical / Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Export CSV Report Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold text-xs rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all ml-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT REPORT (CSV)</span>
              </button>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">ID / Reg No</th>
                    <th className="px-4 py-3.5">Grievance Subject</th>
                    <th className="px-4 py-3.5">Category & Dept</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5">Submitted Date</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No complaints match the search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const isHighPriority = (c.urgency || c.priority || '').toLowerCase() === 'critical' || (c.urgency || c.priority || '').toLowerCase() === 'urgent' || (c.urgency || c.priority || '').toLowerCase() === 'high';

                      return (
                        <tr 
                          key={c.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isHighPriority ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-mono font-extrabold text-indigo-900 text-sm">
                              {c.id}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              Reg: {c.complainant?.regNo || '241FA07001'}
                            </div>
                          </td>
                          <td className="px-4 py-4 max-w-xs">
                            <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">By: {c.complainant?.name || c.submittedBy}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{c.category}</div>
                            <div className="text-[10px] text-slate-500">{c.department}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {isHighPriority ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                                <Flame className="w-3 h-3 text-rose-600" />
                                HIGH PRIORITY
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {c.urgency || c.priority || 'Medium'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              c.status.toLowerCase() === 'resolved' ? 'bg-rose-100 text-[#8B2414]' :
                              c.status.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' :
                              ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase()) ? 'bg-sky-100 text-sky-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {c.submittedAt}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedComplaint(c);
                                setNewStatusInput(c.status);
                                setResponseRemarksInput(c.responseRemarks || '');
                                setAssignDeptInput(c.department);
                              }}
                              className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENT MANAGEMENT & SIGNUP APPROVALS VIEW ── */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Student Signup Verification Section */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-amber-950 dark:text-amber-300 font-heading flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  Account Verification & Registration Requests
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  Verify Registration Numbers before activating student account credentials.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                {pendingSignups} Pending
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search request by Reg No, Name, Email..."
                  value={signupSearch}
                  onChange={(e) => setSignupSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={signupStatusFilter}
                onChange={(e) => setSignupStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-stone-50 dark:bg-slate-900 text-slate-500 uppercase font-mono border-b border-stone-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Registration No.</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Department / Year</th>
                    <th className="px-4 py-3">Email Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-700">
                  {filteredSignupRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No student signup requests found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSignupRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3.5 font-mono font-bold text-amber-900 dark:text-amber-300 text-sm">
                          {req.regNo}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{req.fullName}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                          <div>{req.department}</div>
                          <div className="text-[10px] text-slate-400">{req.year}</div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">{req.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200' :
                            req.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          {req.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => approveSignupRequest(req.id)}
                                className="px-3 py-1.5 bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>APPROVE & ACTIVATE</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectStudentReq(req);
                                  setRejectReasonInput('');
                                }}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>REJECT</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Students List Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8B2414]" />
              Registered Student Accounts Database
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Registration No.</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Email Contact</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {studentsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No active student records found.
                      </td>
                    </tr>
                  ) : (
                    studentsList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{st.regNo}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="px-4 py-3.5 text-slate-600">{st.department}</td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{st.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                            st.status === 'ACTIVE' ? 'bg-rose-100 text-[#8B2414]' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => {
                              setResetStudentModal(st);
                              setResetNewPasswordInput('');
                              setResetPasswordError(null);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8a2410]/10 text-[#8a2410] dark:text-amber-400 hover:bg-[#8a2410]/20 border border-[#8a2410]/30 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Reset Password</span>
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(st.id, st.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              st.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-rose-50 text-[#8B2414] hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {st.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN MANAGEMENT VIEW ── */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-700" />
                Department Admins Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Only Super Admin can create and manage Department Admin accounts. Public registration is disabled.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAddAdminOpen(true);
                setAddAdminError(null);
              }}
              className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW DEPARTMENT ADMIN</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3.5">Admin Name</th>
                    <th className="px-4 py-3.5">Username</th>
                    <th className="px-4 py-3.5">Assigned Department</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Account Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {adminsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No Department Admin accounts created yet. Click &quot;ADD NEW DEPARTMENT ADMIN&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    adminsList.map((ad) => (
                      <tr key={ad.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-extrabold text-slate-900">{ad.name}</td>
                        <td className="px-4 py-4 font-mono font-bold text-indigo-900">{ad.username}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{ad.department}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                            ad.role === 'super_admin' ? 'bg-indigo-100 text-indigo-900' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {ad.role === 'super_admin' ? 'Super Admin' : 'Dept Admin'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                            ad.status === 'ACTIVE' ? 'bg-rose-100 text-[#8B2414]' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                          {ad.role !== 'super_admin' && ad.username !== 'superadmin' && ad.username !== 'ksaiganesh64' && (
                            <>
                              <button
                                onClick={() => toggleAdminStatus(ad.id, ad.status)}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                              >
                                {ad.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteAdminAccount(ad.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Remove</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM SETTINGS VIEW ── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complaint Categories Manager */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-700" />
              Complaint Categories Configuration
            </h3>
            <div className="space-y-2">
              {systemSettings.categories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs font-semibold text-slate-800">
                  <span>{cat}</span>
                  <button
                    onClick={() => {
                      const filtered = systemSettings.categories.filter((_, i) => i !== idx);
                      updateSettings({ categories: filtered });
                    }}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Enter new category name..."
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-900"
              />
              <button
                onClick={() => {
                  if (!newCategoryInput.trim()) return;
                  updateSettings({ categories: [...systemSettings.categories, newCategoryInput.trim()] });
                  setNewCategoryInput('');
                }}
                className="px-4 py-2 bg-[#8B2414] hover:bg-[#721c0e] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Category
              </button>
            </div>
          </div>

          {/* College Departments Manager */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              University Departments Registry
            </h3>
            <div className="space-y-2">
              {systemSettings.departments.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs font-semibold text-slate-800">
                  <span>{dept}</span>
                  <button
                    onClick={() => {
                      const filtered = systemSettings.departments.filter((_, i) => i !== idx);
                      updateSettings({ departments: filtered });
                    }}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newDeptInput}
                onChange={(e) => setNewDeptInput(e.target.value)}
                placeholder="Enter new department name..."
                className="flex-1 px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-900"
              />
              <button
                onClick={() => {
                  if (!newDeptInput.trim()) return;
                  updateSettings({ departments: [...systemSettings.departments, newDeptInput.trim()] });
                  setNewDeptInput('');
                }}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REPORTS & ANALYTICS VIEW ── */}
      {activeTab === 'reports' && (
        <AdminAnalyticsDashboard />
      )}

      {/* ── AUDIT LOGS VIEW ── */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-700" />
            System Audit Trail & Action Stream
          </h3>
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / Author</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Details / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No activity logs recorded.
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{log.author}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">{log.role}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: COMPLAINT REVIEW & STATUS CHANGE / REMARKS ── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-700 font-mono text-xs font-bold uppercase mb-1">
              <span>Complaint ID: {selectedComplaint.id}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">
              {selectedComplaint.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl mb-4 text-xs font-medium">
              <div><span className="text-slate-400 block text-[10px]">Student Reg No</span><span className="font-mono font-bold">{selectedComplaint.complainant?.regNo || '241FA07001'}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Student Name</span><span className="font-bold">{selectedComplaint.complainant?.name || selectedComplaint.submittedBy}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Department</span><span>{selectedComplaint.department}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Submitted Date</span><span className="font-mono text-[11px]">{selectedComplaint.submittedAt}</span></div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Complaint Description</label>
                <p className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-slate-800 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Change Status Stage</label>
                  <select
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="new">Pending Intake (new)</option>
                    <option value="investigating">Under Investigation (investigating)</option>
                    <option value="dispatched">In Progress / Field Action (dispatched)</option>
                    <option value="resolved">Resolved & Signed (resolved)</option>
                    <option value="rejected">Rejected (rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Staff / Specialist</label>
                  <input
                    type="text"
                    value={assignStaffInput}
                    onChange={(e) => setAssignStaffInput(e.target.value)}
                    placeholder="e.g. Rahul K. (HVAC Tech)"
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Response / Admin Remarks</label>
                <textarea
                  rows={3}
                  value={responseRemarksInput}
                  onChange={(e) => setResponseRemarksInput(e.target.value)}
                  placeholder="Enter response remarks to be displayed on student dashboard..."
                  className="w-full p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComplaint}
                  className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold cursor-pointer shadow-md"
                >
                  SAVE & UPDATE COMPLAINT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE DEPARTMENT ADMIN ── */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button
              onClick={() => setIsAddAdminOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-1">
              Create Department Admin
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Admin accounts can only be generated by Super Admin.
            </p>

            {addAdminError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                {addAdminError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="e.g. dept_it"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showNewAdminPassword ? 'text' : 'password'}
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Set Admin Password"
                    className="w-full pl-3.5 pr-9 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showNewAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Department *</label>
                <select
                  value={newAdminDept}
                  onChange={(e) => setNewAdminDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-semibold cursor-pointer text-slate-900"
                >
                  {(systemSettings.departments && systemSettings.departments.some(d => d.includes('(') || d.includes('Engineering') || d.includes('Robotics'))
                    ? systemSettings.departments
                    : ACADEMIC_DEPARTMENTS
                  ).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-3 rounded-full shadow-md cursor-pointer uppercase tracking-wider"
              >
                CREATE DEPARTMENT ADMIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REJECT STUDENT SIGNUP REQUEST ── */}
      {rejectStudentReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button
              onClick={() => setRejectStudentReq(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-1">
              Reject Student Signup Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reg No: <span className="font-mono font-bold text-amber-900">{rejectStudentReq.regNo}</span> ({rejectStudentReq.fullName})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rejection Reason / Message *</label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Specify why the registration request is rejected (e.g. Invalid registration record with registry)..."
                  className="w-full p-3 bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectStudentReq(null)}
                  className="px-4 py-2 bg-stone-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejectStudent}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  CONFIRM REJECT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET STUDENT PASSWORD MODAL ── */}
      {resetStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-slate-700 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#8a2410] dark:text-amber-400" />
                Reset Student Password
              </h3>
              <button
                onClick={() => setResetStudentModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{resetStudentModal.fullName}</p>
              <p className="text-slate-500 font-mono text-[11px]">Reg No: {resetStudentModal.regNo}</p>
            </div>

            {resetPasswordError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                {resetPasswordError}
              </p>
            )}

            <form onSubmit={handleResetStudentPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetNewPasswordInput}
                  onChange={(e) => setResetNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="w-full px-3.5 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#8a2410] text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetStudentModal(null)}
                  className="px-4 py-2 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="px-5 py-2 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {resetPasswordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{resetPasswordLoading ? 'Resetting...' : 'Reset Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
