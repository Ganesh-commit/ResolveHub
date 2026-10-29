import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useResolveHub, ACADEMIC_DEPARTMENTS } from '../context/ResolveHubContext';
import { authApi } from '../services/api';
import { FileText, AlertCircle, Clock, CheckCircle2, XCircle, Users, UserCheck, UserPlus, Settings, PieChart, Activity, Search, Plus, Trash2, Eye, EyeOff, Check, X, Flame, BarChart3, Building2, Sliders, Download, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
export const SuperAdminDashboard = () => {
    const { activeView, setActiveView, complaints, signupRequests, approveSignupRequest, rejectSignupRequest, deleteSignupRequest, adminsList, createDeptAdmin, toggleAdminStatus, deleteAdminAccount, studentsList, toggleStudentStatus, deleteStudentAccount, systemSettings, updateSettings, activityLogs, updateComplaintStatus, assignComplaint, addAuditRemarks, triggerSmartRouting, addToast } = useResolveHub();
    const [activeTab, setActiveTab] = useState('dashboard');
    // Socket.io Realtime Listener for new account requests
    useEffect(() => {
        let socket;
        try {
            socket = io('http://localhost:3001');
            socket.on('new_account_request', (data) => {
                addToast('info', 'New Account Request', `Signup request from ${data?.fullName || 'a student'} (${data?.regNo || ''})`);
            });
        }
        catch (e) { }
        return () => {
            if (socket)
                socket.disconnect();
        };
    }, []);
    React.useEffect(() => {
        if (activeView === 'super_admin_requests')
            setActiveTab('requests');
        else if (activeView === 'super_admin_students')
            setActiveTab('students');
        else if (activeView === 'super_admin_admins' || activeView === 'super_admin_roles')
            setActiveTab('admins');
        else if (activeView === 'super_admin_settings' || activeView === 'super_admin_departments')
            setActiveTab('settings');
        else if (activeView === 'super_admin_analytics')
            setActiveTab('reports');
        else if (activeView === 'super_admin_audit')
            setActiveTab('logs');
        else if (activeView === 'super_admin_complaints')
            setActiveTab('complaints');
        else
            setActiveTab('dashboard');
    }, [activeView]);
    // Search, Filters, Sorting & Pagination for Complaints
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterDept, setFilterDept] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    // Modal State for Reviewing Complaint
    const [selectedComplaint, setSelectedComplaint] = useState(null);
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
    const [addAdminError, setAddAdminError] = useState(null);
    // Modal State for Rejecting Student Signup
    const [rejectStudentReq, setRejectStudentReq] = useState(null);
    const [rejectReasonInput, setRejectReasonInput] = useState('');
    // Modal State for Resetting Student Password
    const [resetStudentModal, setResetStudentModal] = useState(null);
    const [resetNewPasswordInput, setResetNewPasswordInput] = useState('');
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
    const [resetPasswordError, setResetPasswordError] = useState(null);
    // Search & Filter for Signup Requests
    const [signupSearch, setSignupSearch] = useState('');
    const [signupStatusFilter, setSignupStatusFilter] = useState('ALL');
    const filteredSignupRequests = signupRequests.filter(r => {
        const statusMatch = signupStatusFilter === 'ALL' || r.status === signupStatusFilter;
        const searchMatch = !signupSearch.trim() || (r.regNo.toLowerCase().includes(signupSearch.toLowerCase()) ||
            r.fullName.toLowerCase().includes(signupSearch.toLowerCase()) ||
            r.email.toLowerCase().includes(signupSearch.toLowerCase()) ||
            (r.department || '').toLowerCase().includes(signupSearch.toLowerCase()));
        return statusMatch && searchMatch;
    });
    const handleResetStudentPassword = async (e) => {
        e.preventDefault();
        if (!resetStudentModal || !resetNewPasswordInput.trim())
            return;
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
        }
        catch (err) {
            setResetPasswordError(err.data?.error || err.message || 'Failed to reset student password.');
        }
        finally {
            setResetPasswordLoading(false);
        }
    };
    // New Category / Department State in Settings
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [newDeptInput, setNewDeptInput] = useState('');
    // Calculate 8 Dashboard Statistics Cards
    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(c => ['pending', 'new', 'submitted', 'under review'].includes((c.status || '').toLowerCase())).length;
    const inProgressComplaints = complaints.filter(c => ['in progress', 'investigating', 'dispatched', 'assigned', 'pending student verification'].includes((c.status || '').toLowerCase())).length;
    const resolvedComplaints = complaints.filter(c => ['resolved'].includes((c.status || '').toLowerCase())).length;
    const rejectedComplaints = complaints.filter(c => ['rejected'].includes((c.status || '').toLowerCase())).length;
    const uniqueComplainantRegs = new Set(complaints.map(c => c.complainant?.regNo).filter(Boolean)).size;
    const totalStudents = Math.max(studentsList.length, uniqueComplainantRegs);
    const totalAdmins = Math.max(adminsList.length, 10);
    const pendingSignups = signupRequests.filter(r => r.status === 'PENDING').length;

    const priorityWeight = (p) => {
        const val = (p || '').toLowerCase();
        if (val === 'urgent' || val === 'critical') return 4;
        if (val === 'high') return 3;
        if (val === 'medium') return 2;
        return 1;
    };

    // Filtered & Sorted Complaints
    const filteredComplaints = complaints
        .filter(c => {
            const stLower = (c.status || '').toLowerCase();
            let statusMatch = filterStatus === 'all';
            if (!statusMatch) {
                const fLower = filterStatus.toLowerCase();
                if (fLower === 'pending' || fLower === 'new') {
                    statusMatch = ['pending', 'new', 'submitted', 'under review'].includes(stLower);
                } else if (fLower === 'in progress' || fLower === 'dispatched' || fLower === 'investigating') {
                    statusMatch = ['in progress', 'investigating', 'dispatched', 'assigned', 'pending student verification'].includes(stLower);
                } else {
                    statusMatch = stLower === fLower;
                }
            }
            const catMatch = filterCategory === 'all' || c.category === filterCategory;
            const deptMatch = filterDept === 'all' || c.department === filterDept;
            const pLower = (c.priority || c.urgency || 'medium').toLowerCase();
            const prioMatch = filterPriority === 'all' ||
                pLower === filterPriority.toLowerCase() ||
                (filterPriority.toLowerCase() === 'urgent' && (pLower === 'urgent' || pLower === 'critical'));
            const q = searchQuery.trim().toLowerCase();
            const searchMatch = !q || (
                (c.id || '').toLowerCase().includes(q) ||
                (c.title || '').toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q) ||
                (c.complainant?.name || '').toLowerCase().includes(q) ||
                (c.complainant?.regNo || '').toLowerCase().includes(q) ||
                (c.category || '').toLowerCase().includes(q) ||
                (c.department || '').toLowerCase().includes(q) ||
                (c.location || '').toLowerCase().includes(q)
            );
            return statusMatch && catMatch && deptMatch && prioMatch && searchMatch;
        })
        .sort((a, b) => {
            if (sortBy === 'priority_desc') {
                return priorityWeight(b.priority || b.urgency) - priorityWeight(a.priority || a.urgency);
            }
            if (sortBy === 'regno_asc') {
                return (a.complainant?.regNo || '').localeCompare(b.complainant?.regNo || '');
            }
            const tA = new Date(a.createdAtIso || a.submittedAt || a.createdAt || 0).getTime() || 0;
            const tB = new Date(b.createdAtIso || b.submittedAt || b.createdAt || 0).getTime() || 0;
            return sortBy === 'oldest' ? tA - tB : tB - tA;
        });

    const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedComplaints = filteredComplaints.slice((safePage - 1) * pageSize, safePage * pageSize);
    const handleCreateAdmin = async (e) => {
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
        }
        else {
            setIsAddAdminOpen(false);
            setNewAdminName('');
            setNewAdminUsername('');
            setNewAdminPassword('');
        }
    };
    const handleUpdateComplaint = async () => {
        if (!selectedComplaint)
            return;
        if (newStatusInput) {
            await updateComplaintStatus(selectedComplaint.id, newStatusInput, responseRemarksInput);
        }
        else if (responseRemarksInput) {
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
        if (!rejectStudentReq)
            return;
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
    return (<div className="min-h-screen pt-24 pb-16 px-4 sm:px-8 lg:px-12 max-w-[1800px] mx-auto w-full space-y-8 animate-fade-in">
      
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
      {(activeTab === 'dashboard' || activeTab === 'complaints') && (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Complaints */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Complaints</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4"/>
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
                <AlertCircle className="w-4 h-4"/>
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
                <Clock className="w-4 h-4"/>
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
                <CheckCircle2 className="w-4 h-4"/>
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
                <XCircle className="w-4 h-4"/>
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
                <Users className="w-4 h-4"/>
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
                <UserCheck className="w-4 h-4"/>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-indigo-900 font-heading">{totalAdmins}</div>
              <div className="text-xs text-slate-500 mt-0.5">Super & Dept Admins</div>
            </div>
          </div>

          {/* Card 8: Pending Signup Requests */}
          <div onClick={() => setActiveView('super_admin_students')} className={`rounded-3xl p-5 border shadow-xs transition-all cursor-pointer ${pendingSignups > 0 ? 'bg-amber-500/10 border-amber-400 hover:bg-amber-500/20' : 'bg-white border-stone-200/90'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Pending Signups</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4"/>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-900 font-heading">{pendingSignups}</div>
              <div className="text-xs text-amber-800 font-bold mt-0.5">Needs Reg Verification →</div>
            </div>
          </div>
        </div>)}

      {/* ── MAIN OVERVIEW DASHBOARD PAGE ── */}
      {activeTab === 'dashboard' && (<div className="space-y-8">
          {/* Quick Administrative Action Shortcuts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider">
                Quick Governance Actions & Smart Auto-Routing Engine
              </h2>
              <button onClick={triggerSmartRouting} className="px-4 py-2 bg-[#8B2414] hover:bg-[#721c0e] text-white text-xs font-extrabold rounded-full shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-300"/>
                <span>Run Smart HOD Auto-Routing Engine</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={() => {
                setIsAddAdminOpen(true);
                setAddAdminError(null);
            }} className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5"/>
                </div>
                <div className="font-bold text-slate-900 text-sm">Add Dept Admin</div>
                <div className="text-xs text-slate-500 mt-1">Create new department manager account</div>
              </button>

              <button onClick={() => setActiveView('super_admin_students')} className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5"/>
                </div>
                <div className="font-bold text-slate-900 text-sm">Verify Student Signups</div>
                <div className="text-xs text-slate-500 mt-1">{pendingSignups} pending registration approvals</div>
              </button>

              <button onClick={handleExportCSV} className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5"/>
                </div>
                <div className="font-bold text-slate-900 text-sm">Export System Report</div>
                <div className="text-xs text-slate-500 mt-1">Download CSV audit & complaint records</div>
              </button>

              <button onClick={() => setActiveView('super_admin_settings')} className="p-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-3xl text-left transition-all shadow-2xs group cursor-pointer">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5"/>
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
                  <BarChart3 className="w-5 h-5 text-indigo-700"/>
                  Department Grievance Volume
                </h3>
                <button onClick={() => setActiveView('super_admin_analytics')} className="text-xs font-bold text-indigo-900 hover:text-indigo-950 flex items-center gap-1 cursor-pointer">
                  <span>Detailed Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5"/>
                </button>
              </div>
              <div className="space-y-3">
                {systemSettings.departments.slice(0, 5).map((dept) => {
                const count = complaints.filter(c => c.department === dept).length;
                const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                return (<div key={dept}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{dept}</span>
                        <span className="font-mono text-slate-500">{count} complaints ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%` }}/>
                      </div>
                    </div>);
            })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#8B2414]"/>
                  Category Distribution
                </h3>
                <button onClick={() => setActiveView('super_admin_analytics')} className="text-xs font-bold text-[#8B2414] hover:text-[#721c0e] flex items-center gap-1 cursor-pointer">
                  <span>View Trends</span>
                  <ArrowRight className="w-3.5 h-3.5"/>
                </button>
              </div>
              <div className="space-y-3">
                {systemSettings.categories.slice(0, 5).map((cat) => {
                const count = complaints.filter(c => c.category === cat).length;
                const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                return (<div key={cat}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{cat}</span>
                        <span className="font-mono text-slate-500">{count} issues ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B2414] rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 4)}%` }}/>
                      </div>
                    </div>);
            })}
              </div>
            </div>
          </div>
        </div>)}

      {/* ── UNIFIED ALL COMPLAINTS CONTROL CENTER (Visible on both Overview Dashboard & All Complaints Tab) ── */}
      {(activeTab === 'dashboard' || activeTab === 'complaints') && (<div className="space-y-5">
          {/* Multi-Search, Filter & Sort Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#8B2414]"/>
                  All Student Grievances & Smart Routing Registry ({filteredComplaints.length} of {totalComplaints} Complaints across {uniqueComplainantRegs} Unique Reg Nos)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live JSON Database feed across all batches (231FA07xxx, 241FA07xxx, 251FA07xxx). Search by Registration Number, filter by Category/Status, sort, or update status directly.
                </p>
              </div>
              <button onClick={handleExportCSV} className="px-4 py-2 bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold text-xs rounded-2xl cursor-pointer flex items-center gap-1.5 shadow-2xs transition-all self-start sm:self-auto">
                <Download className="w-3.5 h-3.5"/>
                <span>EXPORT CSV ({filteredComplaints.length})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search Reg No (e.g. 241FA07011), Student Name, ID, Title..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:border-indigo-600 outline-none text-slate-900 font-medium"/>
              </div>

              {/* Category Filter */}
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-bold cursor-pointer">
                <option value="all">All Categories</option>
                {systemSettings.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Status Filter */}
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-bold cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* Priority Filter */}
              <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }} className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-bold cursor-pointer">
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Department Filter */}
              <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }} className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer max-w-[210px]">
                <option value="all">All Departments</option>
                {systemSettings.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              {/* Sort Order */}
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="px-3.5 py-2.5 text-xs bg-indigo-50/70 rounded-2xl border border-indigo-200 focus:bg-white outline-none text-indigo-950 font-bold cursor-pointer">
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="priority_desc">Sort: Priority (Urgent → Low)</option>
                <option value="regno_asc">Sort: Reg No (A → Z)</option>
              </select>

              {/* Page Size */}
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="px-3 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-700 font-mono font-bold cursor-pointer">
                <option value={15}>15 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>Show All ({totalComplaints})</option>
              </select>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Ticket ID & Reg No</th>
                    <th className="px-4 py-3.5">Student Name & Grievance Subject</th>
                    <th className="px-4 py-3.5">Category & Routed Dept</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Current Status</th>
                    <th className="px-4 py-3.5">Submitted Timestamp</th>
                    <th className="px-4 py-3.5 text-right">Quick Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {paginatedComplaints.length === 0 ? (<tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                        No complaints match the current search and filter criteria.
                      </td>
                    </tr>) : (paginatedComplaints.map((c) => {
                const prioLabel = c.priority || (c.urgency === 'critical' ? 'Urgent' : (c.urgency ? c.urgency.charAt(0).toUpperCase() + c.urgency.slice(1) : 'Medium'));
                const pLow = prioLabel.toLowerCase();
                const isUrgentOrHigh = pLow === 'urgent' || pLow === 'critical' || pLow === 'high';
                const sLow = (c.status || 'Pending').toLowerCase();
                return (<tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${pLow === 'urgent' || pLow === 'critical' ? 'bg-rose-50/25' : ''}`}>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-mono font-extrabold text-indigo-900 text-sm">
                              {c.id}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-[#8B2414] bg-rose-50 inline-block px-2 py-0.5 rounded-md border border-rose-200/70 mt-0.5">
                              {c.complainant?.regNo || '241FA07011'}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 max-w-sm">
                            <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                            <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                              👤 {c.complainant?.name || c.submittedBy}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">📍 {c.location || 'Main Campus'}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{c.category}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{c.department}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isUrgentOrHigh ? (<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${pLow === 'urgent' || pLow === 'critical' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                                <Flame className="w-3 h-3 text-rose-600"/>
                                {prioLabel.toUpperCase()}
                              </span>) : (<span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {prioLabel}
                              </span>)}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${sLow === 'resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        sLow === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            ['investigating', 'dispatched', 'in progress', 'assigned', 'pending student verification'].includes(sLow) ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                                'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                            {c.submittedAt || c.createdAt}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-2">
                              <select
                                value={sLow === 'resolved' ? 'Resolved' : sLow === 'rejected' ? 'Rejected' : ['in progress', 'investigating', 'dispatched', 'assigned'].includes(sLow) ? 'In Progress' : 'Pending'}
                                onChange={(e) => updateComplaintStatus(c.id, e.target.value, `Status updated to ${e.target.value} by Super Admin.`)}
                                className="px-2.5 py-1.5 bg-stone-50 hover:bg-white border border-stone-200 rounded-xl text-[11px] font-bold text-slate-800 cursor-pointer outline-none"
                                title="Quick Update Status"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <button onClick={() => {
                        setSelectedComplaint(c);
                        setNewStatusInput(c.status);
                        setResponseRemarksInput(c.responseRemarks || '');
                        setAssignDeptInput(c.department);
                    }} className="px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer">
                                <Eye className="w-3.5 h-3.5"/>
                                <span>Review</span>
                              </button>
                            </div>
                          </td>
                        </tr>);
            }))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-600 font-medium">
                Showing <span className="font-extrabold text-slate-900">{filteredComplaints.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span> to <span className="font-extrabold text-slate-900">{Math.min(safePage * pageSize, filteredComplaints.length)}</span> of <span className="font-extrabold text-[#8B2414]">{filteredComplaints.length}</span> complaints ({uniqueComplainantRegs} unique student registration numbers)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-mono font-extrabold text-xs cursor-pointer transition-all ${safePage === pageNum ? 'bg-[#8B2414] text-white shadow-xs' : 'bg-white border border-stone-200 text-slate-700 hover:bg-stone-100'}`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 font-bold text-slate-700 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>)}

      {/* ── STUDENT MANAGEMENT & SIGNUP APPROVALS VIEW ── */}
      {(activeTab === 'students' || activeTab === 'requests') && (<div className="space-y-6">
          {/* Student Signup Verification Section */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-amber-950 dark:text-amber-300 font-heading flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-700 dark:text-amber-400"/>
                  Account Verification & Registration Requests
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  Verify Registration Numbers before activating student account credentials.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono">
                  {signupRequests.filter(r => r.status === 'PENDING').length} Pending
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono">
                  {signupRequests.filter(r => r.status === 'APPROVED').length} Approved
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-mono">
                  {signupRequests.filter(r => r.status === 'REJECTED').length} Rejected
                </span>
              </div>
            </div>

            {/* Sub-tab Pill Selectors for Request Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
              <button type="button" onClick={() => setSignupStatusFilter('PENDING')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${signupStatusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100/60 border border-amber-200 dark:border-slate-700'}`}>
                <span>⏳ Pending Requests</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                  {signupRequests.filter(r => r.status === 'PENDING').length}
                </span>
              </button>

              <button type="button" onClick={() => setSignupStatusFilter('APPROVED')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${signupStatusFilter === 'APPROVED'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-100/60 border border-amber-200 dark:border-slate-700'}`}>
                <span>✅ Accepted / Approved</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                  {signupRequests.filter(r => r.status === 'APPROVED').length}
                </span>
              </button>

              <button type="button" onClick={() => setSignupStatusFilter('REJECTED')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${signupStatusFilter === 'REJECTED'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-100/60 border border-amber-200 dark:border-slate-700'}`}>
                <span>❌ Rejected Requests</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                  {signupRequests.filter(r => r.status === 'REJECTED').length}
                </span>
              </button>

              <button type="button" onClick={() => setSignupStatusFilter('ALL')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${signupStatusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 border border-stone-200 dark:border-slate-700'}`}>
                <span>📋 All Requests</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                  {signupRequests.length}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400"/>
                <input type="text" placeholder="Search request by Reg No, Name, Email, Department..." value={signupSearch} onChange={(e) => setSignupSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white"/>
              </div>
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
                  {filteredSignupRequests.length === 0 ? (<tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No student signup requests found matching criteria.
                      </td>
                    </tr>) : (filteredSignupRequests.map((req) => (<tr key={req.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-700/50">
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
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase ${req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200' :
                    req.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          {req.status === 'PENDING' ? (<>
                              <button onClick={() => approveSignupRequest(req.id)} className="px-3 py-1.5 bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer">
                                <Check className="w-3.5 h-3.5"/>
                                <span>APPROVE & ACTIVATE</span>
                              </button>
                              <button onClick={() => {
                        setRejectStudentReq(req);
                        setRejectReasonInput('');
                    }} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer">
                                <X className="w-3.5 h-3.5"/>
                                <span>REJECT</span>
                              </button>
                              <button onClick={() => deleteSignupRequest(req.id)} className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer" title="Delete Request">
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </>) : (<div className="inline-flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-mono">Processed</span>
                              <button onClick={() => deleteSignupRequest(req.id)} className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-slate-700 font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer" title="Delete Request Record">
                                <Trash2 className="w-3.5 h-3.5"/>
                              </button>
                            </div>)}
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Students List Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8B2414]"/>
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
                  {studentsList.length === 0 ? (<tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No active student records found.
                      </td>
                    </tr>) : (studentsList.map((st) => (<tr key={st.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{st.regNo}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="px-4 py-3.5 text-slate-600">{st.department}</td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{st.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${st.status === 'ACTIVE' ? 'bg-rose-100 text-[#8B2414]' : 'bg-rose-100 text-rose-800'}`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                          <button onClick={() => {
                    setResetStudentModal(st);
                    setResetNewPasswordInput('');
                    setResetPasswordError(null);
                }} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8a2410]/10 text-[#8a2410] dark:text-amber-400 hover:bg-[#8a2410]/20 border border-[#8a2410]/30 transition-all cursor-pointer inline-flex items-center gap-1">
                            <KeyRound className="w-3.5 h-3.5"/>
                            <span>Reset Password</span>
                          </button>
                          <button onClick={() => toggleStudentStatus(st.id, st.status)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${st.status === 'ACTIVE'
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-rose-50 text-[#8B2414] hover:bg-rose-100 border border-rose-200'}`}>
                            {st.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                          </button>
                          <button onClick={() => deleteStudentAccount(st.id)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs" title="Delete Student Account">
                            <Trash2 className="w-3.5 h-3.5"/>
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {/* ── ADMIN MANAGEMENT VIEW ── */}
      {activeTab === 'admins' && (<div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-700"/>
                Department Admins Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Only Super Admin can create and manage Department Admin accounts. Public registration is disabled.
              </p>
            </div>
            <button onClick={() => {
                setIsAddAdminOpen(true);
                setAddAdminError(null);
            }} className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer flex items-center gap-2">
              <Plus className="w-4 h-4"/>
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
                  {adminsList.length === 0 ? (<tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                        No Department Admin accounts created yet. Click &quot;ADD NEW DEPARTMENT ADMIN&quot; to create one.
                      </td>
                    </tr>) : (adminsList.map((ad) => (<tr key={ad.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 font-extrabold text-slate-900">{ad.name}</td>
                        <td className="px-4 py-4 font-mono font-bold text-indigo-900">{ad.username}</td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{ad.department}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${ad.role === 'super_admin' ? 'bg-indigo-100 text-indigo-900' : 'bg-amber-100 text-amber-900'}`}>
                            {ad.role === 'super_admin' ? 'Super Admin' : 'Dept Admin'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${ad.status === 'ACTIVE' ? 'bg-rose-100 text-[#8B2414]' : 'bg-rose-100 text-rose-800'}`}>
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right space-x-2 whitespace-nowrap">
                          {ad.role !== 'super_admin' && ad.username !== 'superadmin' && ad.username !== 'ksaiganesh64' && (<>
                              <button onClick={() => toggleAdminStatus(ad.id, ad.status)} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                                {ad.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button onClick={() => deleteAdminAccount(ad.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1">
                                <Trash2 className="w-3.5 h-3.5 text-rose-600"/>
                                <span>Remove</span>
                              </button>
                            </>)}
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </div>
        </div>)}

      {/* ── SYSTEM SETTINGS VIEW ── */}
      {activeTab === 'settings' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complaint Categories Manager */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-700"/>
              Complaint Categories Configuration
            </h3>
            <div className="space-y-2">
              {systemSettings.categories.map((cat, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs font-semibold text-slate-800">
                  <span>{cat}</span>
                  <button onClick={() => {
                    const filtered = systemSettings.categories.filter((_, i) => i !== idx);
                    updateSettings({ categories: filtered });
                }} className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer">
                    Remove
                  </button>
                </div>))}
            </div>

            <div className="flex gap-2 pt-2">
              <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="Enter new category name..." className="flex-1 px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-900"/>
              <button onClick={() => {
                if (!newCategoryInput.trim())
                    return;
                updateSettings({ categories: [...systemSettings.categories, newCategoryInput.trim()] });
                setNewCategoryInput('');
            }} className="px-4 py-2 bg-[#8B2414] hover:bg-[#721c0e] text-white text-xs font-bold rounded-xl cursor-pointer">
                Add Category
              </button>
            </div>
          </div>

          {/* College Departments Manager */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700"/>
              University Departments Registry
            </h3>
            <div className="space-y-2">
              {systemSettings.departments.map((dept, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-xs font-semibold text-slate-800">
                  <span>{dept}</span>
                  <button onClick={() => {
                    const filtered = systemSettings.departments.filter((_, i) => i !== idx);
                    updateSettings({ departments: filtered });
                }} className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer">
                    Remove
                  </button>
                </div>))}
            </div>

            <div className="flex gap-2 pt-2">
              <input type="text" value={newDeptInput} onChange={(e) => setNewDeptInput(e.target.value)} placeholder="Enter new department name..." className="flex-1 px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none text-slate-900"/>
              <button onClick={() => {
                if (!newDeptInput.trim())
                    return;
                updateSettings({ departments: [...systemSettings.departments, newDeptInput.trim()] });
                setNewDeptInput('');
            }} className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-xl cursor-pointer">
                Add Department
              </button>
            </div>
          </div>
        </div>)}

      {/* ── REPORTS & ANALYTICS VIEW ── */}
      {activeTab === 'reports' && (<AdminAnalyticsDashboard />)}

      {/* ── AUDIT LOGS VIEW ── */}
      {activeTab === 'logs' && (<div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-700"/>
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
                {activityLogs.length === 0 ? (<tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No activity logs recorded.
                    </td>
                  </tr>) : (activityLogs.map((log) => (<tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{log.author}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">{log.role}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-900">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">{log.details}</td>
                    </tr>)))}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* ── MODAL: COMPLAINT REVIEW & STATUS CHANGE / REMARKS ── */}
      {selectedComplaint && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <button onClick={() => setSelectedComplaint(null)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer">
              <X className="w-5 h-5"/>
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

              {/* Attachments Section */}
              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (<div>
                  <label className="font-bold text-slate-700 block mb-1">Attached Media & Documents</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedComplaint.attachments.map((att, i) => {
                    const rawUrl = att.url || (att.fileName ? `http://localhost:3001/uploads/attachments/${att.fileName}` : '');
                    const url = rawUrl.startsWith('/') ? `http://localhost:3001${rawUrl}` : rawUrl;
                    const isImage = att.type === 'image' || att.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(att.name || att.originalName || '');
                    const displayName = att.originalName || att.name || `Attachment ${i + 1}`;
                    if (isImage && url) {
                        return (<div key={i} className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                            <div className="overflow-hidden rounded-xl border border-stone-200 bg-black/5 aspect-video relative">
                              <img src={url} alt={displayName} className="w-full h-full object-cover"/>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800 truncate max-w-[140px]">{displayName}</span>
                              <a href={url} target="_blank" rel="noopener noreferrer" download className="text-indigo-600 font-extrabold hover:underline">
                                View / Download
                              </a>
                            </div>
                          </div>);
                    }
                    return (<div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-400">{att.size || 'Attachment'}</p>
                          </div>
                          {url && (<a href={url} download target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-indigo-900 text-white font-bold text-[10px] rounded-lg">
                              Download
                            </a>)}
                        </div>);
                })}
                  </div>
                </div>)}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Change Status Stage</label>
                  <select value={newStatusInput} onChange={(e) => setNewStatusInput(e.target.value)} className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:bg-white outline-none cursor-pointer">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Staff / Specialist</label>
                  <input type="text" value={assignStaffInput} onChange={(e) => setAssignStaffInput(e.target.value)} placeholder="e.g. Rahul K. (HVAC Tech)" className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white outline-none"/>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Response / Admin Remarks</label>
                <textarea rows={3} value={responseRemarksInput} onChange={(e) => setResponseRemarksInput(e.target.value)} placeholder="Enter response remarks to be displayed on student dashboard..." className="w-full p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs focus:bg-white outline-none"/>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 rounded-xl bg-stone-100 text-slate-700 font-bold cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleUpdateComplaint} className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold cursor-pointer shadow-md">
                  SAVE & UPDATE COMPLAINT
                </button>
              </div>
            </div>
          </div>
        </div>)}

      {/* ── MODAL: CREATE DEPARTMENT ADMIN ── */}
      {isAddAdminOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button onClick={() => setIsAddAdminOpen(false)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-5 h-5"/>
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-1">
              Create Department Admin
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Admin accounts can only be generated by Super Admin.
            </p>

            {addAdminError && (<div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                {addAdminError}
              </div>)}

            <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Full Name *</label>
                <input type="text" required value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="e.g. Vikram Mehta" className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none"/>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username *</label>
                <input type="text" required value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} placeholder="e.g. dept_it" className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-mono"/>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <input type={showNewAdminPassword ? 'text' : 'password'} required value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="Set Admin Password" className="w-full pl-3.5 pr-9 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-mono"/>
                  <button type="button" onClick={() => setShowNewAdminPassword(!showNewAdminPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-md transition-colors cursor-pointer" tabIndex={-1} aria-label={showNewAdminPassword ? 'Hide password' : 'Show password'}>
                    {showNewAdminPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Department *</label>
                <select value={newAdminDept} onChange={(e) => setNewAdminDept(e.target.value)} className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:bg-white outline-none font-semibold cursor-pointer text-slate-900">
                  {(systemSettings.departments && systemSettings.departments.some(d => d.includes('(') || d.includes('Engineering') || d.includes('Robotics'))
                ? systemSettings.departments
                : ACADEMIC_DEPARTMENTS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full mt-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-3 rounded-full shadow-md cursor-pointer uppercase tracking-wider">
                CREATE DEPARTMENT ADMIN
              </button>
            </form>
          </div>
        </div>)}

      {/* ── MODAL: REJECT STUDENT SIGNUP REQUEST ── */}
      {rejectStudentReq && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
            <button onClick={() => setRejectStudentReq(null)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-5 h-5"/>
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
                <textarea rows={3} value={rejectReasonInput} onChange={(e) => setRejectReasonInput(e.target.value)} placeholder="Specify why the registration request is rejected (e.g. Invalid registration record with registry)..." className="w-full p-3 bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none"/>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setRejectStudentReq(null)} className="px-4 py-2 bg-stone-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleConfirmRejectStudent} className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl cursor-pointer shadow-md">
                  CONFIRM REJECT
                </button>
              </div>
            </div>
          </div>
        </div>)}

      {/* ── RESET STUDENT PASSWORD MODAL ── */}
      {resetStudentModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-slate-700 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#8a2410] dark:text-amber-400"/>
                Reset Student Password
              </h3>
              <button onClick={() => setResetStudentModal(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{resetStudentModal.fullName}</p>
              <p className="text-slate-500 font-mono text-[11px]">Reg No: {resetStudentModal.regNo}</p>
            </div>

            {resetPasswordError && (<p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                {resetPasswordError}
              </p>)}

            <form onSubmit={handleResetStudentPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  New Password *
                </label>
                <input type="password" required value={resetNewPasswordInput} onChange={(e) => setResetNewPasswordInput(e.target.value)} placeholder="Enter new password (min. 6 chars)" className="w-full px-3.5 py-2 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#8a2410] text-slate-900 dark:text-white font-mono"/>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setResetStudentModal(null)} className="px-4 py-2 bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={resetPasswordLoading} className="px-5 py-2 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5">
                  {resetPasswordLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                  <span>{resetPasswordLoading ? 'Resetting...' : 'Reset Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>)}

    </div>);
};
