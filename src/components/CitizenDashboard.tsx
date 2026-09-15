import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  MapPin,
  FileText,
  Paperclip,
  ChevronRight,
  PlusCircle,
  Search,
  Timer,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import type { TicketStatus, UrgencyLevel } from '../types/grievance';

export const CitizenDashboard: React.FC = () => {
  const {
    tickets,
    setSelectedTicketId,
    activeTicket,
    setIsComplaintModalOpen
  } = useGrievance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Metrics
  const activeTickets = tickets.filter((t) => t.status !== 'resolved');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
  const escalatedTickets = tickets.filter((t) => t.urgency === 'critical' || t.slaStatus === 'breached');

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || ticket.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const current = activeTicket || tickets[0];

  // Helper for status badge
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            LOGGED
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            INVESTIGATING
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            DISPATCHED
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            RESOLVED
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            MEDIUM
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold bg-zinc-500/20 text-zinc-300 border border-zinc-500/40">
            LOW
          </span>
        );
    }
  };

  // Steps definition for live stepper
  const steps = [
    {
      title: 'Logged & Triaged',
      time: current?.createdAt || 'Oct 12, 10:30 AM',
      detail: 'Registered in automated redressal queue'
    },
    {
      title: 'Assigned Specialist',
      time: current?.assignedAgent?.name || 'Dispatcher Rahul K.',
      detail: current?.department || 'Facilities & HVAC'
    },
    {
      title: 'Technician Dispatched',
      time: current?.status === 'new' ? 'Pending' : 'On-Site Diagnostic',
      detail: 'Rapid response unit deployed with toolkits'
    },
    {
      title: 'Verification & Resolution',
      time: current?.status === 'resolved' ? 'Completed & Signed' : 'Sign-Off Pending',
      detail: 'Citizen confirmation & audit closure'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Citizen Redressal Command</span>
          </div>
          <h1
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white m-0"
          >
            My Grievance Portal
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Instant grievance filing, real-time dispatch telemetry, and SLA accountability tracking.
          </p>
        </div>

        <button
          onClick={() => setIsComplaintModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          + File New Complaint
        </button>
      </div>

      {/* 1. User Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Active */}
        <div className="glass-card rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
            <Clock className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="text-xs uppercase font-mono tracking-wider text-cyan-400 mb-1">
            Active Grievances
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2">
            {activeTickets.length}
          </div>
          <div className="text-xs text-white/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Under active field resolution
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="glass-card rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="text-xs uppercase font-mono tracking-wider text-emerald-400 mb-1">
            Resolved & Verified
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2">
            {resolvedTickets.length + 14}
          </div>
          <div className="text-xs text-emerald-300/80 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% resolution sign-off
          </div>
        </div>

        {/* Card 3: SLA Escalations */}
        <div className="glass-card rounded-2xl p-5 border border-rose-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
            <Flame className="w-16 h-16 text-rose-400" />
          </div>
          <div className="text-xs uppercase font-mono tracking-wider text-rose-400 mb-1">
            SLA Escalations
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2">
            {escalatedTickets.length}
          </div>
          <div className="text-xs text-rose-300/80 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Priority response protocol
          </div>
        </div>

        {/* Card 4: Avg Turnaround */}
        <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-30 transition-opacity">
            <Timer className="w-16 h-16 text-amber-400" />
          </div>
          <div className="text-xs uppercase font-mono tracking-wider text-amber-400 mb-1">
            Avg Turnaround
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white mb-2">
            3.4 <span className="text-base text-white/50 font-normal">Hours</span>
          </div>
          <div className="text-xs text-white/50">
            Across campus facilities
          </div>
        </div>
      </div>

      {/* 2. Live Ticket Tracker Component */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-10 border border-cyan-500/30 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LIVE TRACKER
              </span>
              {getUrgencyBadge(current.urgency)}
              {getStatusBadge(current.status)}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              #{current.id}: {current.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {current.location}
              </span>
              <span>•</span>
              <span>Department: <strong>{current.department}</strong></span>
              <span>•</span>
              <span>Complainant: <strong>{current.complainant.name}</strong></span>
            </div>
          </div>

          {/* Ticket Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label htmlFor="ticket-select" className="text-xs text-white/50 whitespace-nowrap">
              Switch Ticket:
            </label>
            <select
              id="ticket-select"
              value={current.id}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="bg-[#12151f] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} - {t.title.slice(0, 36)}... ({t.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Graphical Progress Stepper */}
        <div className="py-8">
          <div className="text-xs uppercase font-mono tracking-widest text-cyan-400/80 mb-6">
            Redressal Pipeline Milestones
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, index) => {
              const isPassed = index <= current.currentStepIndex;
              const isCurrent = index === current.currentStepIndex;

              return (
                <div key={step.title} className="relative flex flex-col items-start group">
                  {/* Step Icon & Node */}
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-500 text-black ring-4 ring-cyan-500/20 glow-cyan animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white/10 text-white/40 border border-white/10'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-5 h-5 text-black" />
                      ) : (
                        `0${index + 1}`
                      )}
                    </div>

                    <div className="flex-1 h-[2px] bg-white/10 hidden md:block">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPassed ? 'bg-cyan-500' : 'bg-transparent'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step Labels */}
                  <div className="font-medium text-sm text-white">{step.title}</div>
                  <div className="text-xs font-mono text-cyan-300/80 mt-0.5">
                    {step.time}
                  </div>
                  <div className="text-[11px] text-white/50 mt-1 leading-relaxed">
                    {step.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10">
          {/* Left 2 Cols: Description & Attachments */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="text-xs uppercase font-mono text-white/50 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Incident Statement & Impact
              </div>
              <p className="text-sm text-white/80 leading-relaxed bg-[#12151f]/80 p-4 rounded-xl border border-white/5">
                {current.description}
              </p>
            </div>

            {/* Attached Photos / Documents Preview */}
            <div>
              <div className="text-xs uppercase font-mono text-white/50 mb-2 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                Attached Evidence & Diagnostics ({current.attachments.length})
              </div>

              {current.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {current.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="glass-card rounded-xl p-3 border border-white/10 hover:border-cyan-400/40 transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-mono">
                          IMG
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                          {file.size}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-white truncate group-hover:text-cyan-300">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-white/40 italic p-3 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                  No photographic attachments uploaded.
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Live ETA & Field Specialist Contact */}
          <div className="space-y-4">
            {/* Live ETA Box */}
            <div className="bg-gradient-to-br from-cyan-950/40 to-[#12151f] p-4 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  Target SLA Turnaround
                </span>
                <span className="text-xs font-mono text-white/60">
                  {current.eta}
                </span>
              </div>

              {current.status === 'resolved' ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolution Officially Logged
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-mono text-white">
                    {current.etaMinutesLeft > 0 ? `${current.etaMinutesLeft} Mins` : 'Imminent'}
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.max(15, 100 - (current.etaMinutesLeft / 240) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-white/50 mt-1.5 flex justify-between">
                    <span>SLA window</span>
                    <span className="text-cyan-300">Guaranteed 4h</span>
                  </div>
                </div>
              )}
            </div>

            {/* Assigned Specialist Card */}
            {current.assignedAgent ? (
              <div className="glass-card rounded-2xl p-4 border border-white/10">
                <div className="text-xs font-mono uppercase text-white/50 mb-2">
                  Assigned Field Engineer
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center font-mono">
                      {current.assignedAgent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {current.assignedAgent.name}
                      </div>
                      <div className="text-xs text-white/60">
                        {current.assignedAgent.role}
                      </div>
                    </div>
                  </div>

                  {current.assignedAgent.phone && (
                    <a
                      href={`tel:${current.assignedAgent.phone}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 border border-white/10 transition-colors"
                      title="Call Specialist"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-4 border border-dashed border-white/10 text-xs text-white/50 text-center">
                Awaiting automated technician assignment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Grievance History List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            Grievance History & Audit Record
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets or location..."
                className="bg-[#12151f] border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 w-52 sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#12151f] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Hostel & Facilities">Hostel & Facilities</option>
              <option value="IT & Network">IT & Network</option>
              <option value="Finance & Scholarship">Finance & Scholarship</option>
              <option value="Academics">Academics</option>
              <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === current.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-white/[0.04] ${
                    isSelected ? 'bg-cyan-950/20 border-l-4 border-l-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="font-mono text-xs font-bold text-cyan-400 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 whitespace-nowrap">
                      #{ticket.id}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white hover:text-cyan-300 transition-colors">
                          {ticket.title}
                        </span>
                        {getUrgencyBadge(ticket.urgency)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.location}</span>
                        <span>•</span>
                        <span>Logged: {ticket.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {getStatusBadge(ticket.status)}
                    <button
                      type="button"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      Track
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="p-10 text-center text-sm text-white/50">
                No grievances match your search criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
