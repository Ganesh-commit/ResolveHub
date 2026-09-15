import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { useResolveHub } from '../context/ResolveHubContext';
import {
  Kanban,
  Table as TableIcon,
  Search,
  AlertOctagon,
  Clock,
  UserCheck,
  Flame,
  ShieldCheck,
  Send,
  BarChart3,
  UserPlus,
  CheckCircle,
  XCircle,
  Check,
  X
} from 'lucide-react';
import type { TicketStatus, GrievanceCategory, Ticket } from '../types/grievance';
import type { SignupRequest } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    tickets,
    updateTicketStatus,
    assignTicket,
    escalateTicket,
    addAuditNote,
    departmentMetrics
  } = useGrievance();

  const {
    signupRequests,
    approveSignupRequest,
    rejectSignupRequest
  } = useResolveHub();

  const [activeTab, setActiveTab] = useState<'complaints' | 'signups'>('complaints');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  // Signup filter tab
  const [signupFilter, setSignupFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Reject modal state
  const [rejectModalRequest, setRejectModalRequest] = useState<SignupRequest | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Audit note modal state
  const [activeAuditTicket, setActiveAuditTicket] = useState<Ticket | null>(null);
  const [auditNoteText, setAuditNoteText] = useState('');

  // Re-assign modal state
  const [reassignTicket, setReassignTicket] = useState<Ticket | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const techniciansList = [
    { name: 'Rahul K.', role: 'Lead HVAC Specialist' },
    { name: 'Vikram Mehta', role: 'Senior Network Engineer' },
    { name: 'Santosh Kumar', role: 'Sanitation Officer' },
    { name: 'Manoj Singh', role: 'Electrical Tech' },
    { name: 'Dr. Ananya Ray', role: 'Academic Grievance Officer' },
    { name: 'Deepak Joshi', role: 'Student Finance Bursar' }
  ];

  // KPI Calculations
  const totalTickets = tickets.length;
  const pendingAttention = tickets.filter(
    (t) => t.status === 'new' || t.status === 'investigating'
  ).length;
  const criticalBreaches = tickets.filter(
    (t) => t.urgency === 'critical' || t.slaStatus === 'breached'
  ).length;

  // Signup request metrics
  const pendingSignupCount = signupRequests.filter(r => r.status === 'PENDING').length;
  const approvedSignupCount = signupRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedSignupCount = signupRequests.filter(r => r.status === 'REJECTED').length;

  // Filtered signup requests
  const filteredSignups = signupRequests.filter(req => {
    const matchesFilter = signupFilter === 'all' || req.status === signupFilter;
    const matchesSearch =
      req.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.complainant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDept === 'all' || ticket.category === selectedDept;
    const matchesUrgency =
      selectedUrgency === 'all' || ticket.urgency === selectedUrgency;
    return matchesSearch && matchesDept && matchesUrgency;
  });

  // Kanban status columns
  const kanbanColumns: { id: TicketStatus; label: string; color: string; count: number }[] = [
    {
      id: 'new',
      label: 'New Queue',
      color: 'border-blue-500/40 text-blue-400',
      count: filteredTickets.filter((t) => t.status === 'new').length
    },
    {
      id: 'investigating',
      label: 'Under Investigation',
      color: 'border-amber-500/40 text-amber-400',
      count: filteredTickets.filter((t) => t.status === 'investigating').length
    },
    {
      id: 'dispatched',
      label: 'Dispatched On-Site',
      color: 'border-cyan-500/40 text-cyan-400',
      count: filteredTickets.filter((t) => t.status === 'dispatched').length
    },
    {
      id: 'resolved',
      label: 'Resolved & Signed',
      color: 'border-emerald-500/40 text-emerald-400',
      count: filteredTickets.filter((t) => t.status === 'resolved').length
    }
  ];

  const handleConfirmReject = async () => {
    if (!rejectModalRequest) return;
    await rejectSignupRequest(rejectModalRequest.id, rejectReasonInput || 'Registration number could not be verified with college registry.');
    setRejectModalRequest(null);
    setRejectReasonInput('');
  };

  const handleSaveAuditNote = () => {
    if (!activeAuditTicket || !auditNoteText.trim()) return;
    addAuditNote(activeAuditTicket.id, auditNoteText, 'Lead Admin Dispatcher');
    setAuditNoteText('');
    setActiveAuditTicket(null);
  };

  const handleConfirmReassign = () => {
    if (!reassignTicket || !selectedTechnician) return;
    const tech = techniciansList.find((t) => t.name === selectedTechnician);
    if (tech) {
      assignTicket(reassignTicket.id, tech.name, tech.role);
    }
    setReassignTicket(null);
    setSelectedTechnician('');
  };

  // Category counts for simulated chart
  const categoriesList: GrievanceCategory[] = [
    'Hostel & Facilities',
    'IT & Network',
    'Finance & Scholarship',
    'Academics',
    'Sanitation & Hygiene'
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Campus Operational Command</span>
          </div>
          <h1
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white m-0"
          >
            Admin & Dispatch Control Panel
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Student account verification, live grievance triage, field dispatching, and SLA management.
          </p>
        </div>

        {/* Primary Tab Navigation: Complaint Tickets vs Student Signup Requests */}
        <div className="flex items-center gap-2 bg-[#12151f] p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Complaint Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab('signups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
              activeTab === 'signups'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Pending Signup Requests</span>
            {pendingSignupCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {pendingSignupCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. KPI Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* KPI 1: Pending Signup Requests (HIGHLIGHTED SECURITY LAYER) */}
        <div 
          onClick={() => setActiveTab('signups')}
          className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden ${
            pendingSignupCount > 0 
              ? 'border-amber-400/50 bg-amber-950/20 hover:border-amber-400' 
              : 'border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-amber-300 font-bold">
              Pending Signup Requests
            </span>
            {pendingSignupCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black animate-pulse">
                ACTION NEEDED
              </span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-300 mb-2">
            {pendingSignupCount}
          </div>
          <div className="text-xs text-amber-200/80 flex items-center justify-between">
            <span>Student reg verification</span>
            <span className="text-amber-400 font-bold underline text-[11px]">View All →</span>
          </div>
        </div>

        {/* KPI 2: Total Logged */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="text-xs uppercase font-mono tracking-wider text-white/50 mb-1">
            Total Tickets Logged
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2">
            {totalTickets + 214}
          </div>
          <div className="text-xs text-white/60 flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">+12%</span> vs last 24h intake
          </div>
        </div>

        {/* KPI 3: Open & Pending */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/30 relative overflow-hidden">
          <div className="text-xs uppercase font-mono tracking-wider text-cyan-400 mb-1">
            Active Dispatch Queues
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-cyan-300 mb-2">
            {pendingAttention}
          </div>
          <div className="text-xs text-cyan-300/70 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Technicians in field
          </div>
        </div>

        {/* KPI 4: Critical SLA Breaches */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/40 relative overflow-hidden bg-rose-950/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-mono tracking-wider text-rose-400">
              Critical SLA Breaches
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
              ALERT
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-rose-400 mb-2">
            {criticalBreaches}
          </div>
          <div className="text-xs text-rose-300/80 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" />
            Automatic supervisor escalation active
          </div>
        </div>
      </div>

      {/* ── TAB 2: PENDING STUDENT SIGNUP REQUESTS VERIFICATION HUB ── */}
      {activeTab === 'signups' && (
        <div className="space-y-6 mb-12 animate-fade-in">
          {/* Section Header & Sub-filters */}
          <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <UserPlus className="w-4 h-4" />
                <span>Security Verification Layer</span>
              </div>
              <h2 className="text-xl font-bold text-white">Student Account Creation Verification</h2>
              <p className="text-xs text-white/60 mt-0.5">
                Verify student Registration Numbers before activating account access. Approved students receive login activation.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#090a0f] p-1 rounded-xl border border-white/10 text-xs font-medium">
              <button
                onClick={() => setSignupFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  signupFilter === 'PENDING'
                    ? 'bg-amber-400 text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Pending ({pendingSignupCount})
              </button>
              <button
                onClick={() => setSignupFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  signupFilter === 'APPROVED'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Approved ({approvedSignupCount})
              </button>
              <button
                onClick={() => setSignupFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  signupFilter === 'REJECTED'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Rejected ({rejectedSignupCount})
              </button>
              <button
                onClick={() => setSignupFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  signupFilter === 'all'
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All ({signupRequests.length})
              </button>
            </div>
          </div>

          {/* Signup Requests Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#12151f] text-white/50 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="px-4 py-3.5">Registration No.</th>
                  <th className="px-4 py-3.5">Student Name</th>
                  <th className="px-4 py-3.5">Department / Year</th>
                  <th className="px-4 py-3.5">Email Contact</th>
                  <th className="px-4 py-3.5">Request Date</th>
                  <th className="px-4 py-3.5">Verification Status</th>
                  <th className="px-4 py-3.5 text-right">Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSignups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-white/40">
                      No signup requests match the selected filter query.
                    </td>
                  </tr>
                ) : (
                  filteredSignups.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-amber-300 text-sm whitespace-nowrap">
                        {req.regNo}
                      </td>
                      <td className="px-4 py-4 font-semibold text-white">
                        {req.fullName}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        <div className="font-medium">{req.department}</div>
                        <div className="text-[10px] text-white/40">{req.year}</div>
                      </td>
                      <td className="px-4 py-4 text-white/60 font-mono text-[11px]">
                        {req.email}
                      </td>
                      <td className="px-4 py-4 text-white/50 whitespace-nowrap font-mono text-[11px]">
                        {req.createdAt}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {req.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3 h-3 text-amber-400" />
                            PENDING VERIFICATION
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            ACCOUNT ACTIVATED
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            REQUEST REJECTED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => approveSignupRequest(req.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>APPROVE</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalRequest(req);
                                setRejectReasonInput('');
                              }}
                              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-xl border border-rose-500/40 transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>REJECT</span>
                            </button>
                          </>
                        ) : req.status === 'APPROVED' ? (
                          <button
                            onClick={() => {
                              setRejectModalRequest(req);
                              setRejectReasonInput('Account revoked by Admin.');
                            }}
                            className="px-2.5 py-1 text-xs text-rose-400 hover:underline cursor-pointer font-mono"
                          >
                            Revoke Access
                          </button>
                        ) : (
                          <button
                            onClick={() => approveSignupRequest(req.id)}
                            className="px-2.5 py-1 text-xs text-emerald-400 hover:underline cursor-pointer font-mono"
                          >
                            Re-Approve Account
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 1: COMPLAINT TICKETS CONTROL ── */}
      {activeTab === 'complaints' && (
        <>
          {/* Search & Filter Strip */}
          <div className="glass-card rounded-2xl p-4 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, User, or Keyword..."
                  className="bg-[#090a0f] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 w-full"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="Hostel & Facilities">Hostel & Facilities</option>
                <option value="IT & Network">IT & Network</option>
                <option value="Finance & Scholarship">Finance & Scholarship</option>
                <option value="Academics">Academics</option>
                <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
              </select>

              {/* Urgency Filter */}
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* View Switcher: Kanban vs Table */}
            <div className="flex items-center gap-2 bg-[#12151f] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-cyan-500 text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
          </div>

          {/* 2. Main Ticket Views */}
          {viewMode === 'kanban' ? (
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
              {kanbanColumns.map((col) => {
                const colTickets = filteredTickets.filter((t) => t.status === col.id);

                return (
                  <div
                    key={col.id}
                    className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col min-h-[500px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold uppercase ${col.color}`}>
                          {col.label}
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                        {colTickets.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="bg-[#12151f] rounded-xl p-4 border border-white/10 hover:border-cyan-400/40 transition-all shadow-md group relative"
                        >
                          {/* Card Top: ID & Urgency */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              #{ticket.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                ticket.urgency === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : ticket.urgency === 'high'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40'
                              }`}
                            >
                              {ticket.urgency}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-semibold text-white mb-2 leading-snug line-clamp-2">
                            {ticket.title}
                          </h4>

                          {/* Location & Complainant */}
                          <div className="text-[11px] text-white/50 space-y-1 mb-3">
                            <div className="truncate">Loc: {ticket.location}</div>
                            <div className="truncate">By: {ticket.complainant.name}</div>
                            {ticket.assignedAgent && (
                              <div className="text-cyan-300 truncate">
                                Tech: {ticket.assignedAgent.name}
                              </div>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                            {/* Status Change Selector */}
                            <select
                              value={ticket.status}
                              onChange={(e) =>
                                updateTicketStatus(ticket.id, e.target.value as TicketStatus)
                              }
                              className="bg-[#090a0f] border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                            >
                              <option value="new">New Queue</option>
                              <option value="investigating">Investigating</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="resolved">Resolved</option>
                            </select>

                            {/* Quick Action Icons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setReassignTicket(ticket)}
                                title="Re-assign Technician"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-cyan-400 transition-colors cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => escalateTicket(ticket.id)}
                                title="Escalate Urgency"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Flame className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveAuditTicket(ticket)}
                                title="Add Timestamped Audit Note"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/70 hover:text-cyan-400 transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {colTickets.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-xs text-white/30 border border-dashed border-white/10 rounded-xl">
                          Queue empty
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DATA TABLE VIEW */
            <div className="glass-card rounded-2xl border border-white/10 overflow-x-auto mb-12">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-[#12151f] text-white/50 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Subject / Issue</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Technician</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        #{ticket.id}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-white truncate">{ticket.title}</div>
                        <div className="text-[11px] text-white/40 truncate">{ticket.location}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/70">
                        {ticket.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            ticket.urgency === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : ticket.urgency === 'high'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/40'
                          }`}
                        >
                          {ticket.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            updateTicketStatus(ticket.id, e.target.value as TicketStatus)
                          }
                          className="bg-[#090a0f] border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="new">New Queue</option>
                          <option value="investigating">Investigating</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white/80">
                        {ticket.assignedAgent ? (
                          <div>
                            <div className="font-medium">{ticket.assignedAgent.name}</div>
                            <div className="text-[10px] text-white/40">{ticket.assignedAgent.role}</div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReassignTicket(ticket)}
                            className="text-cyan-400 hover:underline text-[11px] cursor-pointer"
                          >
                            + Assign Tech
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => setReassignTicket(ticket)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Reassign Technician"
                        >
                          <UserCheck className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => escalateTicket(ticket.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Escalate Priority"
                        >
                          <Flame className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => setActiveAuditTicket(ticket)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/70 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Add Internal Audit Note"
                        >
                          <Send className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Resolution Analytics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Bar Chart */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Category Distribution Volume
                </h3>
                <span className="text-xs font-mono text-white/50">Real-time</span>
              </div>

              <div className="space-y-4">
                {categoriesList.map((cat, idx) => {
                  const count = tickets.filter((t) => t.category === cat).length + 30 * (idx + 1);
                  const percentage = Math.round((count / 260) * 100);

                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/80">{cat}</span>
                        <span className="font-mono text-white/60">
                          {count} cases ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Performance Scorecards */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Department SLA On-Time Scorecards
                </h3>
                <span className="text-xs font-mono text-emerald-400">92.4% Campus Avg</span>
              </div>

              <div className="space-y-3.5">
                {departmentMetrics.map((dept) => (
                  <div
                    key={dept.department}
                    className="p-3 bg-[#12151f] rounded-xl border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {dept.department}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {dept.resolvedCount} closed • Avg {dept.avgHours} hrs turnaround
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-sm font-mono font-bold ${
                          dept.onTimeRate >= 90
                            ? 'text-emerald-400'
                            : dept.onTimeRate >= 85
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {dept.onTimeRate}% on-time
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">SLA Compliant</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Reject Signup Request Reason */}
      {rejectModalRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                Reject Signup Request ({rejectModalRequest.regNo})
              </h4>
              <button
                onClick={() => setRejectModalRequest(null)}
                className="text-white/50 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/70 mb-3 leading-relaxed">
              Specify the reason for rejecting student <span className="font-bold text-white">{rejectModalRequest.fullName}</span> ({rejectModalRequest.regNo}). The student will see this note when checking status.
            </p>

            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="Enter rejection reason (e.g. Registration number not found in college academic registry)..."
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalRequest(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Internal Audit Note */}
      {activeAuditTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">
                Add Audit Note to #{activeAuditTicket.id}
              </h4>
              <button
                onClick={() => setActiveAuditTicket(null)}
                className="text-white/50 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60 mb-3">
              This note will be timestamped into the official redressal ledger for #{activeAuditTicket.id}.
            </p>

            <textarea
              rows={3}
              value={auditNoteText}
              onChange={(e) => setAuditNoteText(e.target.value)}
              placeholder="Enter field investigation updates, parts ordered, or customer communications..."
              className="w-full bg-[#090a0f] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveAuditTicket(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAuditNote}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Save Audit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Re-assign Technician */}
      {reassignTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-white">
                Re-assign Technician for #{reassignTicket.id}
              </h4>
              <button
                onClick={() => setReassignTicket(null)}
                className="text-white/50 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60 mb-3">
              Select an available specialist to dispatch on-site for &quot;{reassignTicket.title}&quot;.
            </p>

            <div className="space-y-2 mb-4">
              {techniciansList.map((tech) => (
                <div
                  key={tech.name}
                  onClick={() => setSelectedTechnician(tech.name)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedTechnician === tech.name
                      ? 'bg-cyan-950/60 border-cyan-400 text-white'
                      : 'bg-[#090a0f] border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{tech.name}</div>
                    <div className="text-[11px] text-white/50">{tech.role}</div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Available</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReassignTicket(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTechnician}
                onClick={handleConfirmReassign}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 disabled:opacity-40 cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
