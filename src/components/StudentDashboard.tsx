import React from 'react';
import { useResolveHub } from '../context/ResolveHubContext';
import { CampusImageCarousel } from './CampusImageCarousel';
import {
  FileText,
  Clock,
  CheckCircle2,
  Eye,
  PlusCircle,
  Search,
  HelpCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    complaints,
    authUser,
    setActiveView,
    setTrackQuery
  } = useResolveHub();

  const regNo = authUser?.regNo || authUser?.username || '241FA07001';
  const studentName = authUser?.name || 'Venkata Sai Teja';
  const studentDept = authUser?.department || 'Computer Science & Engineering';

  // Greeting by time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter complaints belonging strictly to logged-in student
  const myComplaints = (complaints || []).filter(c => {
    if (!c) return false;
    const cReg = String(c.complainant?.regNo || '').toUpperCase();
    const cBy = String(c.submittedBy || '').toUpperCase();
    const targetReg = String(regNo || '').toUpperCase();
    if (!targetReg) return false;
    return cReg === targetReg || cBy.includes(targetReg);
  });

  // Statistics calculation
  const totalMy = myComplaints.length;
  const pendingMy = myComplaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const inProgressMy = myComplaints.filter(c => ['investigating', 'dispatched', 'in progress', 'assigned'].includes(c.status.toLowerCase())).length;
  const resolvedMy = myComplaints.filter(c => ['resolved'].includes(c.status.toLowerCase())).length;

  // Banner bug fix: check for latest resolved complaint banner vs registration approved banner
  const latestResolved = myComplaints.find(c => c.status === 'Resolved');

  // Generate 90-day activity heatmap grid data
  const activityDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    const isToday = i === 89;
    const hasActivity = i % 7 === 0 || i % 11 === 0 || isToday;
    return { date: d.toISOString().split('T')[0], count: hasActivity ? Math.floor((i % 4) + 1) : 0 };
  });

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 py-6 space-y-8 animate-fade-in">
      
      {/* ── 1. WELCOME TOP BANNER ────────────────────────────────────────────── */}
      <div className="bg-[#8a2410] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-rose-900/40 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#ffc20e]" />
            <span>{getGreeting()}, {studentName}!</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading-playfair tracking-tight">
            Student Grievance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/90 font-medium flex items-center gap-3">
            <span>Reg No: <strong className="font-mono text-white">{regNo}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-white">{studentDept}</strong></span>
          </p>
        </div>

        <button
          onClick={() => setActiveView('report')}
          className="shine-sweep-button px-6 py-3.5 bg-[#ffc20e] hover:bg-[#e0a800] text-[#4a1208] font-black text-xs uppercase tracking-wider rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 shrink-0 relative z-10"
        >
          <PlusCircle className="w-4 h-4 text-[#4a1208]" />
          <span>Report New Issue</span>
        </button>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ffc20e]/15 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* ── 2. CAMPUS IMAGE CAROUSEL (DASHBOARD ONLY) ────────────────────────── */}
      <CampusImageCarousel />

      {/* ── 3. BANNER BUG FIX: RESOLVED COMPLAINT NOTIFICATION ───────────────── */}
      {latestResolved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-100">
                Complaint Resolved
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Ticket <strong>{latestResolved.id}</strong> ({latestResolved.title}) has been resolved by {latestResolved.department}.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTrackQuery(latestResolved.id);
              setActiveView('track');
            }}
            className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
          >
            View Details
          </button>
        </div>
      )}

      {/* ── 4. 4 ANIMATED STAT CARDS WITH GRADIENT ACCENTS ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#8a2410] dark:bg-rose-950 dark:text-amber-300 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TOTAL</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-heading-playfair text-slate-900 dark:text-white">
              {totalMy}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">My Complaints</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">PENDING</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-heading-playfair text-amber-600 dark:text-amber-400">
              {pendingMy}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Under Review</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">ACTION</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-heading-playfair text-blue-600 dark:text-blue-400">
              {inProgressMy}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">In Field Action</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">CLOSED</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black font-heading-playfair text-emerald-600 dark:text-emerald-400">
              {resolvedMy}
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Resolved</div>
          </div>
        </div>

      </div>

      {/* ── 5. TWO-COLUMN: STATUS TRACKER CARDS vs QUICK ACTIONS & ACTIVITY ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: My Complaints Status Tracker Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-3">
            <h3 className="text-lg font-black font-heading-playfair text-slate-900 dark:text-white">
              My Complaints Status Tracker
            </h3>
            <button
              onClick={() => setActiveView('my-complaints')}
              className="text-xs font-bold text-[#8a2410] dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              View All Registry <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myComplaints.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Complaints Submitted Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Have an issue regarding academics, hostel, transport, or facilities? Submit a ticket now for rapid resolution.
              </p>
              <button
                onClick={() => setActiveView('report')}
                className="px-5 py-2 bg-[#8a2410] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Submit Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myComplaints.slice(0, 4).map(c => {
                let progressPct = 25;
                if (c.status === 'Assigned') progressPct = 50;
                else if (c.status === 'In Progress' || c.status === 'investigating') progressPct = 75;
                else if (c.status === 'Resolved') progressPct = 100;

                return (
                  <div
                    key={c.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#8a2410] dark:text-amber-400">{c.id}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">• {c.category}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {c.title}
                    </h4>

                    {/* Progress Bar per complaint */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Status Progress</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8a2410] to-[#ffc20e] rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>Dept: <strong className="text-slate-700 dark:text-slate-300">{c.department}</strong></span>
                      <button
                        onClick={() => {
                          setTrackQuery(c.id);
                          setActiveView('track');
                        }}
                        className="text-[#8a2410] dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Track Progress
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Activity Calendar Heatmap */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading-playfair border-b border-stone-100 dark:border-slate-700 pb-2.5">
              Quick Actions
            </h3>

            <div className="space-y-2.5 text-xs font-bold">
              <button
                onClick={() => setActiveView('report')}
                className="w-full p-3 bg-stone-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-2xl border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#8a2410] dark:text-amber-400" />
                <span>Submit New Grievance</span>
              </button>

              <button
                onClick={() => setActiveView('track')}
                className="w-full p-3 bg-stone-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-2xl border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-blue-500" />
                <span>Track Complaint Status</span>
              </button>

              <button
                onClick={() => setActiveView('faq')}
                className="w-full p-3 bg-stone-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-2xl border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Knowledge Base & Rules</span>
              </button>
            </div>
          </div>

          {/* Activity Calendar Heatmap Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-700 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading-playfair flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#8a2410]" /> Activity Calendar (90 Days)
              </h3>
            </div>

            <p className="text-[11px] text-slate-500">
              Days you submitted or received ticket status updates.
            </p>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 gap-1.5 pt-1">
              {activityDays.map((day, idx) => (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} update(s)`}
                  className={`w-full aspect-square rounded-md transition-all cursor-pointer ${
                    day.count === 0 ? 'bg-stone-100 dark:bg-slate-700' :
                    day.count === 1 ? 'bg-rose-200 dark:bg-rose-900' :
                    day.count === 2 ? 'bg-rose-400 dark:bg-rose-700' :
                    'bg-[#8a2410] dark:bg-amber-400'
                  }`}
                />
              ))}
            </div>

            {/* Highlight Cards */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-slate-700 text-center">
              <div className="p-2 bg-stone-50 dark:bg-slate-900 rounded-xl">
                <span className="text-xs font-black text-slate-900 dark:text-white block">{totalMy}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Raised</span>
              </div>
              <div className="p-2 bg-stone-50 dark:bg-slate-900 rounded-xl">
                <span className="text-xs font-black text-emerald-600 block">{resolvedMy}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Resolved</span>
              </div>
              <div className="p-2 bg-stone-50 dark:bg-slate-900 rounded-xl">
                <span className="text-xs font-black text-amber-600 block">2.4d</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Avg Speed</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
