import React, { useState, useEffect } from 'react';
import { useResolveHub } from '../context/ResolveHubContext';
import { UserAvatar } from './UserAvatar';
import {
  Building2,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  X,
  UserCheck,
  Inbox,
  Users,
  BarChart3,
  BookOpen,
  Bell,
  Plus,
  Download,
  Sparkles,
  CheckSquare,
  Paperclip,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  Shield,
  LayoutGrid,
  List
} from 'lucide-react';
import type { Complaint } from '../types';

interface DepartmentStaff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Available' | 'On Field' | 'Off Duty';
  activeTickets: number;
  resolvedCount: number;
  avgResolutionHours: number;
  rating: number;
  specialization: string;
}

interface DepartmentFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
}

export const DeptAdminDashboard: React.FC = () => {
  const {
    complaints,
    authUser,
    activeView,
    setActiveView,
    updateComplaintStatus,
    assignComplaint,
    addAuditRemarks,
    addToast
  } = useResolveHub();

  const deptName = authUser?.department || 'Information Technology (IT)';

  // ── Scoping: Filter complaints belonging to Department Admin's department ────
  const deptComplaints = complaints.filter(c => {
    if (!c.department) return true;
    const cleanAuthDept = deptName.replace(/\s*\(.*?\)/, '').trim().toLowerCase();
    const cleanTicketDept = (c.department || '').replace(/\s*\(.*?\)/, '').trim().toLowerCase();
    return cleanTicketDept.includes(cleanAuthDept) || cleanAuthDept.includes(cleanTicketDept);
  });

  // ── Sub-view Navigation Sync ──────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inbox' | 'team' | 'analytics' | 'kb' | 'notifications'>('dashboard');

  useEffect(() => {
    if (activeView === 'dept_admin_inbox' || activeView === 'dept_admin_complaints') setCurrentTab('inbox');
    else if (activeView === 'dept_admin_team' || activeView === 'dept_admin_students') setCurrentTab('team');
    else if (activeView === 'dept_admin_analytics') setCurrentTab('analytics');
    else if (activeView === 'dept_admin_kb') setCurrentTab('kb');
    else if (activeView === 'dept_admin_notifications') setCurrentTab('notifications');
    else setCurrentTab('dashboard');
  }, [activeView]);

  // ── View Mode: Kanban vs Table (for Inbox) ─────────────────────────────────
  const [inboxViewMode, setInboxViewMode] = useState<'kanban' | 'table'>('kanban');

  // ── Search & Filters for Complaints ───────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // ── Selection State for Bulk Actions ──────────────────────────────────────
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssigneeInput, setBulkAssigneeInput] = useState('');

  // ── Detail Drawer Modal State ──────────────────────────────────────────────
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatusInput, setNewStatusInput] = useState('');
  const [responseRemarksInput, setResponseRemarksInput] = useState('');
  const [assignStaffInput, setAssignStaffInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');

  // ── Staff Team State ──────────────────────────────────────────────────────
  const [staffList, setStaffList] = useState<DepartmentStaff[]>([
    {
      id: 'st-1',
      name: 'Rahul Kumar (Lead Spec.)',
      role: 'Senior Network Technician',
      email: 'rahul.k@vignan.ac.in',
      phone: '+91 98480 12345',
      status: 'Available',
      activeTickets: 2,
      resolvedCount: 48,
      avgResolutionHours: 3.2,
      rating: 4.9,
      specialization: 'Wi-Fi & Optical Fiber Networks'
    },
    {
      id: 'st-2',
      name: 'Suresh V. (Hardware Spec.)',
      role: 'Systems Engineer',
      email: 'suresh.v@vignan.ac.in',
      phone: '+91 98480 23456',
      status: 'On Field',
      activeTickets: 3,
      resolvedCount: 36,
      avgResolutionHours: 4.1,
      rating: 4.8,
      specialization: 'Lab Systems & Server Rack Mounts'
    },
    {
      id: 'st-3',
      name: 'Anitha M. (Software Spec.)',
      role: 'Portal & ERP Specialist',
      email: 'anitha.m@vignan.ac.in',
      phone: '+91 98480 34567',
      status: 'Available',
      activeTickets: 1,
      resolvedCount: 42,
      avgResolutionHours: 2.8,
      rating: 4.95,
      specialization: 'Student Portal & LMS Support'
    },
    {
      id: 'st-4',
      name: 'K. Ramesh (Facilities Spec.)',
      role: 'Electrical & Power Tech',
      email: 'ramesh.k@vignan.ac.in',
      phone: '+91 98480 45678',
      status: 'Off Duty',
      activeTickets: 0,
      resolvedCount: 29,
      avgResolutionHours: 5.4,
      rating: 4.7,
      specialization: 'Smart Classroom Projectors & UPS'
    }
  ]);

  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffSpec, setNewStaffSpec] = useState('');

  // ── Knowledge Base (Department FAQ) State ────────────────────────────────
  const [faqList, setFaqList] = useState<DepartmentFAQ[]>([
    {
      id: 'faq-1',
      question: 'How to connect to Vignan Wi-Fi network in hostel rooms?',
      answer: 'Select "Vignan_Student_WiFi", login with your Register Number and password provided during registration.',
      category: 'Network & Wi-Fi',
      updatedAt: '05 Oct 2026'
    },
    {
      id: 'faq-2',
      question: 'What to do if lab computer desktop login fails?',
      answer: 'Contact the lab technician on floor 2 or raise an IT complaint with your machine number sticker.',
      category: 'Computer Labs',
      updatedAt: '04 Oct 2026'
    },
    {
      id: 'faq-3',
      question: 'How to request software installations for project work?',
      answer: 'Faculty approved software requests are processed within 24 hours via IT Dept portal ticket.',
      category: 'Software Request',
      updatedAt: '02 Oct 2026'
    }
  ]);

  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Network & Wi-Fi');

  // ── AI Tools Drawer State ────────────────────────────────────────────────
  const [isAiToolActive, setIsAiToolActive] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSuggestedReply, setAiSuggestedReply] = useState<string | null>(null);
  const [aiSuggestedStaff, setAiSuggestedStaff] = useState<string | null>(null);
  const [aiDuplicateAlert, setAiDuplicateAlert] = useState<string | null>(null);

  // ── Department KPI Statistics ─────────────────────────────────────────────
  const totalDept = deptComplaints.length;
  const pendingDept = deptComplaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const inProgressDept = deptComplaints.filter(c => ['investigating', 'dispatched', 'in progress', 'assigned'].includes(c.status.toLowerCase())).length;
  const resolvedDept = deptComplaints.filter(c => ['resolved'].includes(c.status.toLowerCase())).length;
  const overdueDept = deptComplaints.filter(c => (c.slaStatus === 'warning' || c.urgency?.toLowerCase() === 'critical')).length;
  const slaPassRate = totalDept > 0 ? Math.round(((totalDept - overdueDept) / totalDept) * 100) : 98;

  // ── Filtered Complaints for Table & Kanban ────────────────────────────────
  const filteredComplaints = deptComplaints.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    const catMatch = filterCategory === 'all' || c.category === filterCategory;
    const prioMatch = filterPriority === 'all' || (c.urgency || c.priority || '').toLowerCase() === filterPriority.toLowerCase();
    const assigneeMatch = filterAssignee === 'all' || (c.assignedAgent?.name || '').includes(filterAssignee);

    const searchMatch = !searchQuery.trim() || (
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.regNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return statusMatch && catMatch && prioMatch && assigneeMatch && searchMatch;
  });

  // ── Needs Attention List (Overdue & Unassigned Complaints) ────────────────
  const needsAttentionComplaints = deptComplaints.filter(c => 
    ['submitted', 'new', 'under review'].includes(c.status.toLowerCase()) || 
    c.slaStatus === 'warning' || 
    (c.urgency || '').toLowerCase() === 'critical'
  ).slice(0, 5);

  // ── Handle Card Selection for Bulk Actions ────────────────────────────────
  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === filteredComplaints.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredComplaints.map(c => c.id));
    }
  };

  // ── Handle Single Complaint Update ────────────────────────────────────────
  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    if (newStatusInput) {
      await updateComplaintStatus(selectedComplaint.id, newStatusInput, responseRemarksInput);
    } else if (responseRemarksInput) {
      await addAuditRemarks(selectedComplaint.id, responseRemarksInput);
    }

    if (assignStaffInput) {
      await assignComplaint(selectedComplaint.id, assignStaffInput, 'Department Specialist', deptName);
    }

    if (internalNoteInput.trim()) {
      await addAuditRemarks(selectedComplaint.id, `[INTERNAL STAFF NOTE]: ${internalNoteInput}`);
    }

    addToast('success', 'Complaint Updated', `Grievance ${selectedComplaint.id} state updated successfully.`);
    setSelectedComplaint(null);
    setNewStatusInput('');
    setResponseRemarksInput('');
    setAssignStaffInput('');
    setInternalNoteInput('');
  };

  // ── Handle Bulk Assign ───────────────────────────────────────────────────
  const handleExecuteBulkAssign = async () => {
    if (!bulkAssigneeInput || selectedTicketIds.length === 0) return;
    for (const id of selectedTicketIds) {
      await assignComplaint(id, bulkAssigneeInput, 'Department Specialist', deptName);
    }
    addToast('success', 'Bulk Action Complete', `Assigned ${selectedTicketIds.length} complaints to ${bulkAssigneeInput}`);
    setSelectedTicketIds([]);
    setIsBulkAssignOpen(false);
    setBulkAssigneeInput('');
  };

  // ── Canned Reply Insertion ────────────────────────────────────────────────
  const applyCannedReply = (templateText: string) => {
    setResponseRemarksInput(prev => prev ? `${prev}\n${templateText}` : templateText);
  };

  // ── CSV Export Functionality ──────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted Date', 'Complainant', 'Assignee'];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.urgency || c.priority || 'Medium',
      c.status,
      c.submittedAt,
      c.isAnonymous ? 'Anonymous Student' : `"${c.complainant?.name || c.submittedBy}"`,
      `"${c.assignedAgent?.name || 'Unassigned'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${deptName.replace(/\s+/g, '_')}_Grievance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('info', 'CSV Downloaded', `Exported ${filteredComplaints.length} records to CSV.`);
  };

  // ── AI Summary & Recommendation Helpers ──────────────────────────────────
  const generateAiAssist = (complaint: Complaint) => {
    setIsAiToolActive(true);
    setAiSummary(`Complaint regarding ${complaint.category} in ${complaint.location}. Key issue: ${complaint.description.substring(0, 90)}...`);
    setAiSuggestedReply(`Dear Student, Our ${deptName} technical team has received your ticket regarding ${complaint.category}. A specialist has been assigned to resolve this within the SLA target.`);
    const matchedStaff = staffList.find(s => s.status === 'Available') || staffList[0];
    setAiSuggestedStaff(matchedStaff.name);
    if (deptComplaints.some(c => c.id !== complaint.id && c.category === complaint.category && c.location === complaint.location)) {
      setAiDuplicateAlert(`Flagged: 1 similar ${complaint.category} complaint reported in ${complaint.location} today.`);
    } else {
      setAiDuplicateAlert(null);
    }
  };

  // ── Handle Add New Staff Specialist ──────────────────────────────────────
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const newEntry: DepartmentStaff = {
      id: `st-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole || 'Department Specialist',
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@vignan.ac.in`,
      phone: newStaffPhone || '+91 98480 00000',
      status: 'Available',
      activeTickets: 0,
      resolvedCount: 0,
      avgResolutionHours: 3.5,
      rating: 5.0,
      specialization: newStaffSpec || 'General IT Support'
    };
    setStaffList(prev => [...prev, newEntry]);
    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffPhone('');
    setNewStaffSpec('');
    addToast('success', 'Staff Added', `Added ${newEntry.name} to ${deptName} team.`);
  };

  // ── Handle Toggle Staff Availability Status ──────────────────────────────
  const toggleStaffStatus = (id: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Available' ? 'On Field' : s.status === 'On Field' ? 'Off Duty' : 'Available';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // ── Handle Add New FAQ ────────────────────────────────────────────────────
  const handleCreateFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const newFaq: DepartmentFAQ = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion,
      answer: newFaqAnswer,
      category: newFaqCategory,
      updatedAt: 'Just Now'
    };
    setFaqList(prev => [newFaq, ...prev]);
    setIsAddFaqOpen(false);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    addToast('success', 'FAQ Created', 'New FAQ published to student portal and AI Assistant.');
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 animate-fade-in pb-16 text-slate-900 dark:text-slate-100">
      
      {/* ── 1. GRADIENT HERO HEADER ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8a2410] via-[#5c1608] to-[#0b3a6b] p-6 sm:p-8 text-white shadow-2xl border border-amber-400/20">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-extrabold uppercase tracking-wider mb-3">
              <Building2 className="w-4 h-4 text-[#ffc20e]" />
              <span>DEPARTMENT COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-heading-playfair tracking-tight leading-tight">
              {deptName}
            </h1>
            <p className="text-stone-200 text-xs sm:text-sm mt-1 max-w-2xl font-medium leading-relaxed">
              Welcome back, <span className="font-bold text-amber-300">{authUser?.name || 'Department Admin'}</span>. Scoped grievance triage, real-time technician dispatch, and SLA management for {deptName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-bold flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-[#ffc20e]" />
              <div>
                <div className="text-[10px] uppercase text-amber-200 font-extrabold">Active Role</div>
                <div className="text-white font-mono">{authUser?.username || 'dept_admin'}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('dept_admin_inbox')}
              className="px-5 py-3 rounded-full bg-[#ffc20e] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transform hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Inbox className="w-4 h-4" />
              <span>Open Department Inbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. SUB-VIEW NAVIGATION TAB PILLS ─────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200 dark:border-slate-800">
        <button
          onClick={() => setActiveView('dept_admin_dashboard')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'dashboard'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('dept_admin_inbox')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'inbox'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Grievance Inbox</span>
          {pendingDept > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
              {pendingDept}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveView('dept_admin_team')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'team'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & Technicians ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveView('dept_admin_analytics')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'analytics'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Reports</span>
        </button>

        <button
          onClick={() => setActiveView('dept_admin_kb')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'kb'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Knowledge Base</span>
        </button>

        <button
          onClick={() => setActiveView('dept_admin_notifications')}
          className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'notifications'
              ? 'bg-[#8a2410] text-white shadow-md'
              : 'bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-stone-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>
      </div>

      {/* ── 3. TAB CONTENT RENDERING ─────────────────────────────────────────── */}
      
      {/* ── TAB 1: DASHBOARD OVERVIEW ───────────────────────────────────────── */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* 5 Animated KPI Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Open Complaints */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Complaints</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-slate-700 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">{pendingDept + inProgressDept}</div>
                <div className="text-xs text-slate-500 mt-0.5">Requiring action</div>
              </div>
            </div>

            {/* 2. Overdue Complaints */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue / Warning</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-slate-700 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 font-heading">{overdueDept}</div>
                <div className="text-xs text-rose-600 font-bold mt-0.5">SLA Attention</div>
              </div>
            </div>

            {/* 3. Resolved This Week */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved This Week</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-heading">{resolvedDept}</div>
                <div className="text-xs text-slate-500 mt-0.5">Successfully closed</div>
              </div>
            </div>

            {/* 4. Avg Resolution Time */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</span>
                <div className="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-slate-700 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-sky-700 dark:text-sky-400 font-heading">3.8h</div>
                <div className="text-xs text-slate-500 mt-0.5">Target: &lt; 24h</div>
              </div>
            </div>

            {/* 5. SLA Pass Rate */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Pass Rate</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 font-heading">{slaPassRate}%</div>
                <div className="text-xs text-slate-500 mt-0.5">University Standard</div>
              </div>
            </div>

          </div>

          {/* Needs Attention List & Staff Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Needs Attention List (2 Columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                    Needs Attention (Overdue & Unassigned)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveView('dept_admin_inbox')}
                  className="text-xs font-bold text-[#8a2410] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All ({deptComplaints.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {needsAttentionComplaints.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All department complaints are assigned and progressing within SLA targets!
                </div>
              ) : (
                <div className="space-y-3">
                  {needsAttentionComplaints.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComplaint(c)}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-700/50 border border-stone-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 cursor-pointer transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#8a2410] dark:text-amber-400">{c.id}</span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">{c.title}</span>
                          {c.isAnonymous && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1">
                              <Shield className="w-3 h-3 text-slate-600 dark:text-slate-300" /> Shielded
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{c.description}</p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-3">
                          <span>Submitted: {c.submittedAt}</span>
                          <span>Category: {c.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (c.urgency || c.priority || '').toLowerCase() === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {c.urgency || c.priority || 'Medium'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#8a2410] hover:bg-[#6c1b0c] text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Review / Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Staff Workload Distribution (1 Column) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                    Technician Workload
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-bold">{staffList.filter(s => s.status === 'Available').length} Available</span>
              </div>

              <div className="space-y-3">
                {staffList.map(staff => (
                  <div key={staff.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-700/50 border border-stone-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{staff.name}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          staff.status === 'Available' ? 'bg-emerald-500' : staff.status === 'On Field' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                        {staff.activeTickets} Active
                      </span>
                    </div>

                    {/* Progress Bar for Workload Capacity */}
                    <div className="w-full bg-stone-200 dark:bg-slate-600 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all rounded-full ${
                          staff.activeTickets >= 3 ? 'bg-rose-500' : staff.activeTickets >= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(staff.activeTickets * 25, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Visual Graphs (Complaints Over Time & Category Breakdown) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Complaints Over Time Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Complaints Volume Trend (Weekly)
              </h3>
              
              <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
                {[
                  { day: 'Mon', count: 12, height: '60%' },
                  { day: 'Tue', count: 18, height: '85%' },
                  { day: 'Wed', count: 9, height: '45%' },
                  { day: 'Thu', count: 15, height: '75%' },
                  { day: 'Fri', count: 22, height: '100%' },
                  { day: 'Sat', count: 6, height: '30%' },
                  { day: 'Sun', count: 4, height: '20%' }
                ].map(item => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-[#8a2410] to-amber-500 rounded-t-xl group-hover:brightness-110 transition-all"
                      style={{ height: item.height }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-600" />
                Category Distribution
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  { label: 'Network & Hostel Wi-Fi', percentage: 45, color: 'bg-[#8a2410]' },
                  { label: 'Lab Computer Systems', percentage: 25, color: 'bg-amber-500' },
                  { label: 'Smart Classroom Projectors', percentage: 18, color: 'bg-indigo-600' },
                  { label: 'Software & Portal Access', percentage: 12, color: 'bg-emerald-600' }
                ].map(cat => (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="text-slate-900 dark:text-white">{cat.percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 2: INBOX (KANBAN & TABLE VIEWS) ─────────────────────────────── */}
      {(currentTab === 'inbox' || currentTab === 'dashboard') && (
        <div className={`space-y-6 ${currentTab === 'dashboard' ? 'mt-8 border-t border-stone-200 dark:border-slate-800 pt-8' : ''}`}>
          
          {/* Header Controls: Search, Filters, Bulk Actions, CSV Export, Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-stone-200/90 dark:border-slate-700 shadow-sm">
            
            <div className="flex-1 flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px] flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Ref ID, Student, Title, Location..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-700/60 rounded-2xl border border-stone-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 outline-none font-medium"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-slate-700/60 rounded-2xl border border-stone-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 outline-none font-bold cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Network & Wi-Fi">Network & Wi-Fi</option>
                <option value="Computer Labs">Computer Labs</option>
                <option value="Hardware & Projector">Hardware & Projector</option>
                <option value="Software Request">Software Request</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-slate-700/60 rounded-2xl border border-stone-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 outline-none font-bold cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical / Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-slate-700/60 rounded-2xl border border-stone-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 outline-none font-bold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">Submitted (New)</option>
                <option value="investigating">Under Review</option>
                <option value="dispatched">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-slate-700/60 rounded-2xl border border-stone-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 outline-none font-bold cursor-pointer"
              >
                <option value="all">All Assignees</option>
                {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 self-end lg:self-auto">
              
              {/* Bulk Actions Button */}
              {selectedTicketIds.length > 0 && (
                <button
                  onClick={() => setIsBulkAssignOpen(true)}
                  className="px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer animate-pulse"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Bulk Assign ({selectedTicketIds.length})</span>
                </button>
              )}

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 rounded-2xl bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>

              {/* View Toggle: Kanban vs Table */}
              <div className="flex items-center bg-stone-100 dark:bg-slate-700 p-1 rounded-2xl border border-stone-200 dark:border-slate-600">
                <button
                  onClick={() => setInboxViewMode('kanban')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    inboxViewMode === 'kanban' ? 'bg-white dark:bg-slate-800 shadow-xs text-[#8a2410] dark:text-amber-400' : 'text-slate-500'
                  }`}
                  title="Kanban Board View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInboxViewMode('table')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    inboxViewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-xs text-[#8a2410] dark:text-amber-400' : 'text-slate-500'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* ── KANBAN BOARD VIEW ───────────────────────────────────────────── */}
          {inboxViewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
              
              {[
                { title: 'New (Submitted)', statusKey: 'new', color: 'bg-amber-500' },
                { title: 'Assigned', statusKey: 'assigned', color: 'bg-indigo-500' },
                { title: 'In Progress', statusKey: 'investigating', color: 'bg-sky-500' },
                { title: 'Waiting Student', statusKey: 'dispatched', color: 'bg-[#8a2410]' },
                { title: 'Resolved', statusKey: 'resolved', color: 'bg-emerald-500' }
              ].map(column => {
                const columnTickets = filteredComplaints.filter(c => {
                  const st = c.status.toLowerCase();
                  if (column.statusKey === 'new') return ['submitted', 'new', 'under review'].includes(st) && !c.assignedAgent;
                  if (column.statusKey === 'assigned') return ['assigned', 'under review'].includes(st) || (['submitted', 'new'].includes(st) && !!c.assignedAgent);
                  if (column.statusKey === 'investigating') return ['investigating', 'in progress'].includes(st);
                  if (column.statusKey === 'dispatched') return ['dispatched', 'waiting'].includes(st);
                  if (column.statusKey === 'resolved') return ['resolved'].includes(st);
                  return false;
                });

                return (
                  <div key={column.statusKey} className="bg-stone-100/70 dark:bg-slate-800/60 rounded-3xl p-4 border border-stone-200/80 dark:border-slate-700 flex flex-col min-h-[500px]">
                    
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-slate-700 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${column.color}`} />
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          {column.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white dark:bg-slate-700 font-extrabold text-slate-700 dark:text-slate-300">
                        {columnTickets.length}
                      </span>
                    </div>

                    {/* Column Cards List */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
                      {columnTickets.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-[11px] text-slate-400 font-medium italic border-2 border-dashed border-stone-200 dark:border-slate-700 rounded-2xl">
                          No complaints
                        </div>
                      ) : (
                        columnTickets.map(ticket => (
                          <div
                            key={ticket.id}
                            onClick={() => setSelectedComplaint(ticket)}
                            className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 ${
                              selectedTicketIds.includes(ticket.id) ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={selectedTicketIds.includes(ticket.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    toggleSelectTicket(ticket.id);
                                  }}
                                  className="w-3.5 h-3.5 accent-[#8a2410] rounded cursor-pointer"
                                />
                                <span className="font-mono text-xs font-bold text-[#8a2410] dark:text-amber-400">{ticket.id}</span>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                (ticket.urgency || ticket.priority || '').toLowerCase() === 'critical'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {ticket.urgency || ticket.priority || 'Medium'}
                              </span>
                            </div>

                            <h5 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2">
                              {ticket.title}
                            </h5>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {ticket.description}
                            </p>

                            {/* Badges: SLA countdown & Anonymous */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {ticket.slaStatus === 'warning' && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-50 text-rose-700 border border-rose-200 font-extrabold flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> SLA OVERDUE
                                </span>
                              )}

                              {ticket.isAnonymous && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-slate-500" /> Shielded
                                </span>
                              )}

                              {ticket.attachments && ticket.attachments.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-stone-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> {ticket.attachments.length}
                                </span>
                              )}
                            </div>

                            {/* Card Footer: Complainant / Assignee */}
                            <div className="pt-2 border-t border-stone-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                              <span>{ticket.isAnonymous ? 'Anonymous' : ticket.complainant?.name || ticket.submittedBy}</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {ticket.assignedAgent?.name ? ticket.assignedAgent.name.split(' ')[0] : 'Unassigned'}
                              </span>
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          ) : (
            /* ── TABLE VIEW ───────────────────────────────────────────────── */
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-stone-200/90 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-slate-700/60 border-b border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedTicketIds.length === filteredComplaints.length && filteredComplaints.length > 0}
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5 accent-[#8a2410] rounded cursor-pointer"
                        />
                      </th>
                      <th className="p-4">Ref ID</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Complaint Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Assignee</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-slate-700/60">
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                          No matching department complaints found.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map(t => (
                        <tr
                          key={t.id}
                          onClick={() => setSelectedComplaint(t)}
                          className="hover:bg-amber-50/40 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                        >
                          <td className="p-4" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedTicketIds.includes(t.id)}
                              onChange={() => toggleSelectTicket(t.id)}
                              className="w-3.5 h-3.5 accent-[#8a2410] rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-mono font-bold text-[#8a2410] dark:text-amber-400">{t.id}</td>
                          <td className="p-4">
                            {t.isAnonymous ? (
                              <span className="font-bold text-slate-500 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-amber-600" /> Anonymous Shielded
                              </span>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{t.complainant?.name || t.submittedBy}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{t.complainant?.regNo || '241FA07001'}</div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 max-w-xs truncate font-bold text-slate-800 dark:text-slate-200">{t.title}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-400">{t.category}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              (t.urgency || t.priority || '').toLowerCase() === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {t.urgency || t.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="p-4 font-bold capitalize text-slate-700 dark:text-slate-300">{t.status}</td>
                          <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{t.assignedAgent?.name || 'Unassigned'}</td>
                          <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedComplaint(t)}
                              className="px-3 py-1.5 bg-[#8a2410] hover:bg-[#6c1b0c] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── TAB 3: TEAM & TECHNICIANS MANAGEMENT ────────────────────────────── */}
      {currentTab === 'team' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-stone-200/90 dark:border-slate-700 shadow-sm">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {deptName} Staff & Field Technicians
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage technician availability, workload limits, and performance ratings.
              </p>
            </div>

            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="px-5 py-3 bg-[#8a2410] hover:bg-[#6c1b0c] text-white font-bold text-xs rounded-full shadow-md cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#ffc20e]" />
              <span>Add Staff Specialist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {staffList.map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4 relative">
                
                <div className="flex items-center justify-between">
                  <UserAvatar name={s.name} size="md" />
                  <button
                    onClick={() => toggleStaffStatus(s.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${
                      s.status === 'Available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      s.status === 'On Field' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {s.status} (Click)
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white font-heading">{s.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{s.role}</p>
                  <p className="text-[11px] text-amber-600 font-bold mt-1">{s.specialization}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-stone-50 dark:bg-slate-700/50 p-3 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Active</span>
                    <span className="font-extrabold text-[#8a2410] dark:text-amber-400">{s.activeTickets}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Closed</span>
                    <span className="font-extrabold text-emerald-600">{s.resolvedCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Rating</span>
                    <span className="font-extrabold text-amber-500 flex items-center justify-center gap-0.5">
                      {s.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>📞 {s.phone}</div>
                  <div className="truncate">✉️ {s.email}</div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: ANALYTICS & REPORTS ───────────────────────────────────────── */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {deptName} Analytics & Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed KPI performance metrics, SLA compliance, and student satisfaction ratings.
              </p>
            </div>

            <button
              onClick={() => addToast('info', 'Report Generated', 'Weekly Department Performance PDF report sent to your email.')}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#ffc20e]" />
              <span>Download Weekly PDF Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Student Satisfaction Rating</h4>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                4.85 <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-slate-500">Based on 142 student feedback responses after ticket closure.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">SLA Target Compliance</h4>
              <div className="text-4xl font-extrabold text-emerald-600 font-heading">98.4%</div>
              <p className="text-xs text-slate-500">Target 95.0% - Outperforming university threshold.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">First Contact Resolution</h4>
              <div className="text-4xl font-extrabold text-indigo-600 font-heading">84.2%</div>
              <p className="text-xs text-slate-500">Resolved on initial technician field dispatch.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: KNOWLEDGE BASE (DEPARTMENT FAQ EDITOR) ───────────────────── */}
      {currentTab === 'kb' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {deptName} Knowledge Base & FAQs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit department FAQ entries that automatically feed the student FAQ page and AI assistant.
              </p>
            </div>

            <button
              onClick={() => setIsAddFaqOpen(true)}
              className="px-5 py-3 bg-[#8a2410] hover:bg-[#6c1b0c] text-white font-bold text-xs rounded-full shadow-md cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#ffc20e]" />
              <span>Add Department FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqList.map(faq => (
              <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Updated: {faq.updatedAt}</span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">{faq.question}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: NOTIFICATIONS CENTER ──────────────────────────────────────── */}
      {currentTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-slate-700">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#8a2410] dark:text-amber-400" />
                Department Notifications Feed
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time alerts for new complaints, student replies & SLA warnings.</p>
            </div>
            <button
              onClick={() => addToast('info', 'Notifications Cleared', 'All notifications marked as read.')}
              className="text-xs font-bold text-[#8a2410] dark:text-amber-400 hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: 'n1', title: 'New Critical Complaint', desc: 'RP-4821 Hostel Wi-Fi router failure reported in Block C.', time: '10m ago', urgent: true },
              { id: 'n2', title: 'Student Reply Received', desc: 'Reg No 241FA07001 submitted additional details for RP-2041.', time: '45m ago', urgent: false },
              { id: 'n3', title: 'SLA Warning Alert', desc: 'Ticket RP-1092 approaching SLA target deadline.', time: '2h ago', urgent: true }
            ].map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                n.urgent ? 'bg-rose-50/60 dark:bg-slate-700/60 border-rose-200 dark:border-slate-600' : 'bg-stone-50 dark:bg-slate-700/40 border-stone-200 dark:border-slate-700'
              }`}>
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {n.title}
                    {n.urgent && <span className="px-2 py-0.5 rounded-full text-[9px] bg-rose-600 text-white font-bold uppercase">Urgent</span>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{n.desc}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: COMPLAINT DETAIL & REVIEW SIDE DRAWER ─────────────────────── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6 border-l border-stone-200 dark:border-slate-800">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-[#8a2410] dark:text-amber-400">{selectedComplaint.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    (selectedComplaint.urgency || selectedComplaint.priority || '').toLowerCase() === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {selectedComplaint.urgency || selectedComplaint.priority || 'Medium'}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                  {selectedComplaint.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Identity Shield Banner if Anonymous */}
            {selectedComplaint.isAnonymous ? (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl flex items-center gap-3">
                <Shield className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Confidential Anonymous Submission</div>
                  <div className="text-[11px] text-slate-500">Student identity is shielded by portal policy. Focus strictly on issue resolution.</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 dark:bg-slate-800 p-3.5 rounded-2xl text-xs font-medium">
                <div><span className="text-slate-400 block text-[10px]">Student Name</span><span className="font-bold text-slate-900 dark:text-white">{selectedComplaint.complainant?.name || selectedComplaint.submittedBy}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Reg No</span><span className="font-mono font-bold text-slate-900 dark:text-white">{selectedComplaint.complainant?.regNo || '241FA07001'}</span></div>
                <div><span className="text-slate-400 block text-[10px]">Location</span><span className="font-bold text-slate-900 dark:text-white">{selectedComplaint.location || 'Campus'}</span></div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Grievance Description</h4>
              <p className="p-4 bg-stone-50 dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {selectedComplaint.description}
              </p>
            </div>

            {/* AI Recommendation Engine Trigger */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-amber-300/60 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8a2410] dark:text-amber-400" />
                  <span className="text-xs font-black uppercase text-[#8a2410] dark:text-amber-400">ResolveHub AI Copilot</span>
                </div>
                <button
                  onClick={() => generateAiAssist(selectedComplaint)}
                  className="px-3 py-1 bg-[#8a2410] hover:bg-[#6c1b0c] text-white rounded-full text-[10px] font-bold cursor-pointer"
                >
                  Generate AI Assist
                </button>
              </div>

              {isAiToolActive && (
                <div className="space-y-2 text-xs pt-2 border-t border-amber-200/60 dark:border-slate-700">
                  {aiSummary && <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl"><strong>Summary:</strong> {aiSummary}</div>}
                  {aiSuggestedStaff && <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl"><strong>Suggested Assignee:</strong> {aiSuggestedStaff} (Optimal Workload)</div>}
                  {aiSuggestedReply && (
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl space-y-1">
                      <div><strong>Suggested Reply Draft:</strong></div>
                      <p className="italic text-slate-600 dark:text-slate-400">{aiSuggestedReply}</p>
                      <button
                        onClick={() => applyCannedReply(aiSuggestedReply)}
                        className="mt-1 px-2.5 py-1 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-md cursor-pointer"
                      >
                        Insert Draft into Response
                      </button>
                    </div>
                  )}
                  {aiDuplicateAlert && <div className="p-2.5 bg-rose-50 text-rose-800 font-bold rounded-xl">{aiDuplicateAlert}</div>}
                </div>
              )}
            </div>

            {/* Canned Reply Templates */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Canned Reply Templates</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Technician dispatched for on-site inspection.',
                  'Awaiting required hardware spare parts.',
                  'Resolved & verified by department supervisor.',
                  'Additional info requested from student.'
                ].map(txt => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => applyCannedReply(txt)}
                    className="px-3 py-1.5 bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-medium border border-stone-200 dark:border-slate-700 cursor-pointer"
                  >
                    + {txt.substring(0, 24)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Form */}
            <div className="space-y-4 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Update Status Stage</label>
                <select
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 font-bold outline-none cursor-pointer"
                >
                  <option value="">Keep Current Status ({selectedComplaint.status})</option>
                  <option value="investigating">Under Review / Investigation</option>
                  <option value="dispatched">In Field Action / Dispatched</option>
                  <option value="resolved">Resolved & Signed Off</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assign Technician (Workload Included)</label>
                <select
                  value={assignStaffInput}
                  onChange={(e) => setAssignStaffInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 font-bold outline-none cursor-pointer"
                >
                  <option value="">{selectedComplaint.assignedAgent?.name ? `Assigned: ${selectedComplaint.assignedAgent.name}` : 'Select Technician...'}</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.activeTickets} Active Tasks - {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Official Response / Student Remarks</label>
                <textarea
                  rows={3}
                  value={responseRemarksInput}
                  onChange={(e) => setResponseRemarksInput(e.target.value)}
                  placeholder="Official status update or resolution notes visible to student..."
                  className="w-full p-3.5 bg-stone-50 dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Internal Note (Staff-Only Audit Note)</label>
                <input
                  type="text"
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="Private notes visible only to department admins & staff..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 outline-none font-medium"
                />
              </div>

              {/* Escalate & Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleUpdateComplaint}
                  className="w-full bg-[#8a2410] hover:bg-[#6c1b0c] text-white font-extrabold py-3 rounded-full shadow-md cursor-pointer uppercase tracking-wider text-xs"
                >
                  Save & Update Grievance
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToast('warning', 'Escalated to HOD', `Ticket ${selectedComplaint.id} escalated to HOD Level 1.`);
                    setSelectedComplaint(null);
                  }}
                  className="w-full sm:w-auto px-4 py-3 bg-amber-100 text-amber-950 font-bold rounded-full text-xs hover:bg-amber-200 cursor-pointer whitespace-nowrap"
                >
                  Escalate HOD
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: BULK ASSIGN ────────────────────────────────────────────────── */}
      {isBulkAssignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
              Bulk Assign ({selectedTicketIds.length}) Complaints
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Technician</label>
              <select
                value={bulkAssigneeInput}
                onChange={(e) => setBulkAssigneeInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="">Choose Staff Specialist...</option>
                {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.activeTickets} Active)</option>)}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkAssignOpen(false)}
                className="px-4 py-2 bg-stone-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkAssign}
                className="px-5 py-2 bg-[#8a2410] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD STAFF SPECIALIST ───────────────────────────────────────── */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
              Add New Department Staff / Technician
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Title</label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Senior Network Engineer"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="e.g. +91 98480 12345"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Specialization</label>
                <input
                  type="text"
                  value={newStaffSpec}
                  onChange={(e) => setNewStaffSpec(e.target.value)}
                  placeholder="e.g. Optical Fiber & Wi-Fi Routers"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8a2410] text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Add Technician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD FAQ ────────────────────────────────────────────────────── */}
      {isAddFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
              Add Department FAQ
            </h3>

            <form onSubmit={handleCreateFaq} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="e.g. How to access Wi-Fi in hostel?"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
                <select
                  value={newFaqCategory}
                  onChange={(e) => setNewFaqCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none font-bold cursor-pointer"
                >
                  <option value="Network & Wi-Fi">Network & Wi-Fi</option>
                  <option value="Computer Labs">Computer Labs</option>
                  <option value="Hardware & Projector">Hardware & Projector</option>
                  <option value="Software Request">Software Request</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Answer *</label>
                <textarea
                  rows={3}
                  required
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Clear step-by-step instructions for students..."
                  className="w-full p-3.5 bg-stone-50 dark:bg-slate-700 rounded-xl border border-stone-200 dark:border-slate-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFaqOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8a2410] text-white rounded-full text-xs font-bold cursor-pointer"
                >
                  Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

function PieChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
