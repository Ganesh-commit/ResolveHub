import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  MapPin
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import type { Complaint } from '../types';

export const TrackStatusSection: React.FC = () => {
  const { complaints, trackQuery, setTrackQuery } = useResolveHub();

  const [inputVal, setInputVal] = useState(trackQuery || 'RH-8942');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (trackQuery) {
      setInputVal(trackQuery);
    }
    const query = (trackQuery || inputVal).trim().toUpperCase();
    const found = complaints.find(c => c.id.toUpperCase() === query);
    if (found) {
      setActiveComplaint(found);
    } else {
      setActiveComplaint(complaints[0] || null);
    }
  }, [trackQuery, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim().toUpperCase();
    const found = complaints.find(c => c.id.toUpperCase() === query);
    if (found) {
      setActiveComplaint(found);
      setTrackQuery(found.id);
    } else {
      setActiveComplaint(null);
    }
  };

  const sampleIds = ['RH-8942', 'RH-9021', 'RH-8410', 'RH-9104'];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-extrabold tracking-widest uppercase mb-3">
          <Search className="w-3.5 h-3.5 text-emerald-700" />
          <span>TRANSPARENT STATUS TRACKER</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          Track Complaint Progress
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-2">
          Enter your reference ID to view real-time status updates and department field logs.
        </p>
      </div>

      {/* Complaint Search Box */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-lg max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Complaint Reference ID (e.g. RH-8942)"
              className="w-full pl-12 pr-4 py-3 text-sm bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none font-mono font-bold text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-7 py-3.5 rounded-2xl shadow-md btn-lift cursor-pointer"
          >
            TRACK STATUS
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100">
          <span className="text-[11px] font-bold text-slate-400">Sample Reference IDs:</span>
          {sampleIds.map(id => (
            <button
              key={id}
              onClick={() => {
                setInputVal(id);
                setTrackQuery(id);
                const found = complaints.find(c => c.id === id);
                if (found) setActiveComplaint(found);
              }}
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Details Card & 4-Step Progress Bar */}
      {activeComplaint ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md space-y-8 animate-slide-up">
          
          {/* Top Info Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-extrabold text-white bg-emerald-800 px-3 py-1 rounded-xl">
                  {activeComplaint.id}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {activeComplaint.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                {activeComplaint.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeComplaint.location}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end text-xs text-slate-500 space-y-1">
              <div>Assigned Dept: <span className="font-bold text-slate-800">{activeComplaint.department}</span></div>
              <div>Field Officer: <span className="font-bold text-slate-800">{activeComplaint.assignedOfficer}</span></div>
              <div>Submitted: <span className="font-mono text-slate-700">{activeComplaint.submittedAt}</span></div>
            </div>
          </div>

          {/* 4-Step Visual Progress Bar Component */}
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-6">
              Resolution Progress Workflow
            </h4>

            {/* Horizontal Timeline Bar on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {activeComplaint.timeline.map((step, idx) => {
                const isCurrent = activeComplaint.status === step.status;
                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-2xl border transition-all ${
                      step.completed
                        ? 'bg-emerald-50/80 border-emerald-300'
                        : isCurrent
                        ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/20'
                        : 'bg-stone-50 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        step.completed
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-200 text-slate-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{step.date}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-3 leading-tight">{step.description}</p>

                    {step.assignedOfficer && (
                      <span className="inline-block mt-2 text-[10px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                        Officer: {step.assignedOfficer}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Complaint Logs */}
          <div className="border-t border-stone-100 pt-6">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Full Description & Attachments
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
              {activeComplaint.description}
            </p>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 text-slate-500">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700">Complaint Not Found</h4>
          <p className="text-xs text-slate-500 mt-1">Please double check reference ID format (e.g. RH-8942).</p>
        </div>
      )}

    </section>
  );
};
