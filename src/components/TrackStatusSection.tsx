import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  User, 
  Building2, 
  RotateCcw, 
  Star, 
  Calendar,
  FileText
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { StatusTimelineStepper } from './StatusTimelineStepper';
import type { Complaint } from '../types';

export const TrackStatusSection: React.FC = () => {
  const { complaints, trackQuery, setTrackQuery, authUser, updateComplaintStatus, addToast } = useResolveHub();

  const userRegNo = authUser?.regNo || (authUser?.role === 'student' ? authUser.username : undefined);
  const myComplaints = complaints.filter(c => {
    if (!userRegNo) return true;
    const cReg = c.complainant?.regNo || '';
    const cBy = c.submittedBy || '';
    return cReg.toUpperCase() === userRegNo.toUpperCase() || cBy.toUpperCase().includes(userRegNo.toUpperCase());
  });

  const [inputVal, setInputVal] = useState(trackQuery || (myComplaints[0]?.id || ''));
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(myComplaints[0] || complaints[0] || null);

  // Rating & Feedback State
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reopen State
  const [reopenReason, setReopenReason] = useState('');
  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  useEffect(() => {
    if (trackQuery) {
      setInputVal(trackQuery);
      const found = complaints.find(c => c.id.toUpperCase() === trackQuery.toUpperCase());
      if (found) setActiveComplaint(found);
    }
  }, [trackQuery, complaints]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim().toUpperCase();
    if (!query) return;

    const found = complaints.find(c => c.id.toUpperCase() === query || c.id.toUpperCase() === `#${query}`);
    if (found) {
      setActiveComplaint(found);
      setTrackQuery(found.id);
    } else {
      addToast('warning', 'Ticket Not Found', `No complaint found matching ID "${inputVal}".`);
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    addToast('success', 'Feedback Submitted', 'Thank you for rating our resolution service!');
  };

  const handleReopenComplaint = async () => {
    if (!activeComplaint || !reopenReason.trim()) return;
    await updateComplaintStatus(activeComplaint.id, 'In Progress', `Reopened by student: ${reopenReason}`);
    setReopenModalOpen(false);
    setReopenReason('');
    addToast('info', 'Complaint Re-opened', `Ticket ${activeComplaint.id} has been re-opened for department re-inspection.`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-6 py-6 px-4 sm:px-8 lg:px-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#8a2410] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold mb-2">
            <Search className="w-3.5 h-3.5" /> Real-Time SLA Monitor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading-playfair tracking-tight">
            Track Grievance Status
          </h1>
          <p className="text-xs text-rose-200/90 mt-1">
            View live status stepper, SLA deadline timers, assigned officer notes, and field action remarks.
          </p>
        </div>

        {/* Quick Select Dropdown */}
        {myComplaints.length > 0 && (
          <select
            value={activeComplaint?.id || ''}
            onChange={(e) => {
              const selected = complaints.find(c => c.id === e.target.value);
              if (selected) {
                setActiveComplaint(selected);
                setTrackQuery(selected.id);
                setInputVal(selected.id);
              }
            }}
            className="px-4 py-2.5 bg-white/15 backdrop-blur-md text-white font-bold text-xs rounded-xl border border-white/30 outline-none cursor-pointer"
          >
            {myComplaints.map(c => (
              <option key={c.id} value={c.id} className="text-slate-900">
                {c.id} - {c.title.length > 30 ? `${c.title.slice(0, 27)}...` : c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Ticket ID Search Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter Complaint ID (e.g., #RH-1002)"
            className="w-full pl-9 pr-4 py-2.5 text-xs font-mono bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
        >
          Track Ticket
        </button>
      </form>

      {/* Active Complaint Detailed View */}
      {activeComplaint ? (
        <div className="space-y-6">
          
          {/* Main Ticket Summary Card */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-slate-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-[#8a2410] dark:text-amber-400">{activeComplaint.id}</span>
                  <span className="text-xs font-bold text-slate-500">• {activeComplaint.category}</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {activeComplaint.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* SLA Timer Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> SLA: 3 Business Days
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  activeComplaint.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                  activeComplaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {activeComplaint.status}
                </span>
              </div>
            </div>

            {/* Stepper Timeline (StatusTimelineStepper) */}
            <div className="py-4">
              <StatusTimelineStepper ticket={activeComplaint} />
            </div>

            {/* Assigned Officer & Department Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-stone-100 dark:border-slate-700 text-xs">
              
              <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#8a2410] shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Responsible Department</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeComplaint.department}</span>
                </div>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Officer / Technician</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeComplaint.assignedOfficer || activeComplaint.assignedAgent?.name || 'Department Desk Officer'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Date</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(activeComplaint.submittedAt)}</span>
                </div>
              </div>

            </div>

            {/* Description & Remarks */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Detailed Description:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{activeComplaint.description}</p>
              </div>

              {activeComplaint.responseRemarks && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Inspection Remarks:
                  </span>
                  <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed font-normal">{activeComplaint.responseRemarks}</p>
                </div>
              )}
            </div>

            {/* Rating & Feedback / Reopen Section if Resolved */}
            {activeComplaint.status === 'Resolved' && (
              <div className="p-6 bg-stone-50 dark:bg-slate-900 rounded-3xl border border-stone-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-700 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading-playfair">
                      Resolution Feedback & Quality Check
                    </h4>
                    <p className="text-xs text-slate-500">Rate the service quality or reopen the ticket if unsatisfied.</p>
                  </div>

                  <button
                    onClick={() => setReopenModalOpen(true)}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-950 text-[#8a2410] dark:text-amber-300 border border-rose-200 dark:border-rose-800 font-bold text-xs rounded-xl hover:bg-[#8a2410] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Re-open Complaint
                  </button>
                </div>

                {!feedbackSubmitted ? (
                  <form onSubmit={handleRatingSubmit} className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Rate Resolution:</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            onClick={() => setRating(star)}
                            className={`w-5 h-5 cursor-pointer ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Leave feedback on technician work..."
                      rows={2}
                      className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-stone-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                    />

                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#8a2410] text-white font-bold rounded-xl cursor-pointer"
                    >
                      Submit Rating
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                    ✓ Feedback recorded! Thank you for rating our resolution service.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Complaint Selected</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enter a valid ticket ID above or select a complaint from your dashboard registry.
          </p>
        </div>
      )}

      {/* Re-open Complaint Modal */}
      {reopenModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200 dark:border-slate-700">
            <h3 className="text-lg font-black font-heading-playfair text-[#8a2410]">
              Re-open Complaint {activeComplaint?.id}
            </h3>
            <p className="text-xs text-slate-500">
              Please state why the resolution was unsatisfactory so the department can re-inspect.
            </p>

            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Explain what problem persists..."
              rows={3}
              className="w-full p-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReopenModalOpen(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenComplaint}
                className="px-5 py-2 bg-[#8a2410] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Re-open
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
