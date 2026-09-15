import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Building2, 
  ArrowUpRight,
  Activity,
  GraduationCap
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const DashboardSection: React.FC = () => {
  const { complaints, setActiveView, setTrackQuery } = useResolveHub();

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '100';

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <span>CAMPUS RESOLUTION ANALYTICS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            University Grievance Metrics
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Real-time public database statistics across college departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('report')}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md btn-lift cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>RAISE CAMPUS COMPLAINT</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Complaints */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged Complaints</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-heading">{total}</div>
            <div className="text-emerald-700 text-xs font-semibold mt-1">
              Active in database
            </div>
          </div>
        </div>

        {/* Pending Triage */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-heading">{pending}</div>
            <div className="text-slate-500 text-xs font-medium mt-1">
              Awaiting HOD dispatch
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Field Action</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-heading">{inProgress}</div>
            <div className="text-slate-500 text-xs font-medium mt-1">
              Technician assigned
            </div>
          </div>
        </div>

        {/* Successfully Resolved */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Issues</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-800 font-heading">{resolved}</div>
            <div className="text-emerald-700 text-xs font-bold mt-1">
              {resolutionRate}% Resolution Rate
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Department Performance & Recent Public Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Department Resolution Speed */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Department Response Targets</h3>
              <p className="text-xs text-slate-500">Service Level Agreement (SLA) benchmarks</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              SLA Standard
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  Hostel Management & Maintenance Board
                </span>
                <span className="text-slate-500">Target: &lt; 24 hrs</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[95%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-700" />
                  Academic & Examination Cell
                </span>
                <span className="text-slate-500">Target: &lt; 48 hrs</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full w-[90%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  Campus IT & Network Infrastructure
                </span>
                <span className="text-slate-500">Target: &lt; 12 hrs</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  Canteen & Food Quality Committee
                </span>
                <span className="text-slate-500">Target: &lt; 6 hrs</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[92%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Database Activity Stream */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Database Record Stream</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {complaints.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200/60 text-slate-500">
                <p className="text-xs font-bold text-slate-700">Database is currently empty</p>
                <p className="text-[11px] text-slate-500 mt-1">Submit your first complaint on the home page to populate the database records.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setTrackQuery(item.id);
                      setActiveView('track');
                    }}
                    className="p-3.5 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 transition-colors border border-stone-200/60 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{item.category} • {item.submittedAt}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <button
              onClick={() => setActiveView('my-complaints')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer"
            >
              Explore My Complaints Database →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
