import React, { useState } from 'react';
import { useResolveHub } from '../context/ResolveHubContext';
import {
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X
} from 'lucide-react';
import type { Complaint } from '../types';

export const StudentDashboard: React.FC = () => {
  const {
    complaints,
    authUser,
    notifications
  } = useResolveHub();

  const regNo = authUser?.regNo || authUser?.username || '241FA07001';
  const studentName = authUser?.name || 'Venkata Sai Teja';
  const studentEmail = authUser?.email || `${regNo.toLowerCase()}@campus.edu`;
  const studentDept = authUser?.department || 'Computer Science & Engineering (CSE)';

  // Check if student has an account approval notification
  const approvalNotif = notifications.find(n => n.targetRegNo?.toUpperCase() === regNo.toUpperCase());

  // Filter complaints strictly belonging to this logged-in student
  const myComplaints = complaints.filter(c => {
    const cReg = c.complainant?.regNo || '';
    const cBy = c.submittedBy || '';
    return cReg.toUpperCase() === regNo.toUpperCase() || cBy.toUpperCase().includes(regNo.toUpperCase());
  });

  // Selected Complaint Modal for Viewing Full Details & Admin Remarks
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Statistics for Student
  const totalMy = myComplaints.length;
  const pendingMy = myComplaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const inProgressMy = myComplaints.filter(c => ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase())).length;
  const resolvedMy = myComplaints.filter(c => ['resolved'].includes(c.status.toLowerCase())).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      
      {/* Account Approved Celebration Banner */}
      {approvalNotif && (
        <div className="p-4 rounded-3xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-center justify-between shadow-xs animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-lg shadow-xs flex-shrink-0">
              🎉
            </div>
            <div>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-950">Registration Request Approved!</h4>
              <p className="text-xs font-semibold text-emerald-900 mt-0.5">
                {approvalNotif.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-mono font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>AUTHENTICATED STUDENT PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
            Welcome, {studentName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-200">
            <span>Reg No: <strong className="text-white font-bold">{regNo}</strong></span>
            <span>•</span>
            <span>Dept: <strong className="text-white font-bold">{studentDept}</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-white font-bold">{studentEmail}</strong></span>
          </div>
        </div>
      </div>

      {/* Student Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total My Complaints */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Complaints</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-heading">{totalMy}</div>
            <div className="text-xs text-slate-500 mt-0.5">Submitted by {regNo}</div>
          </div>
        </div>

        {/* Pending Intake */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-700 font-heading">{pendingMy}</div>
            <div className="text-xs text-slate-500 mt-0.5">Awaiting HOD assignment</div>
          </div>
        </div>

        {/* In Field Action */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Field Action</span>
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-sky-700 font-heading">{inProgressMy}</div>
            <div className="text-xs text-slate-500 mt-0.5">Technician dispatched</div>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolved</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-800 font-heading">{resolvedMy}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-0.5">Issues resolved</div>
          </div>
        </div>
      </div>

      {/* ── MY COMPLAINTS TRACKER TABLE ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            My Submitted Complaints Status Tracker ({totalMy})
          </h3>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Complaint ID</th>
                  <th className="px-4 py-3.5">Subject / Description</th>
                  <th className="px-4 py-3.5">Category & Assigned Dept</th>
                  <th className="px-4 py-3.5">Current Status</th>
                  <th className="px-4 py-3.5">Admin Response & Remarks</th>
                  <th className="px-4 py-3.5">Submitted Date</th>
                  <th className="px-4 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      You have not submitted any complaints yet. Navigate to HOME or REPORT COMPLAINT to submit a new issue.
                    </td>
                  </tr>
                ) : (
                  myComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-mono font-extrabold text-emerald-800 text-sm whitespace-nowrap">
                        {c.id}
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">Loc: {c.location}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{c.category}</div>
                        <div className="text-[10px] text-slate-500">{c.department}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          c.status.toLowerCase() === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          c.status.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase()) ? 'bg-sky-100 text-sky-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-xs text-slate-700">
                        {c.responseRemarks ? (
                          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium text-[11px]">
                            {c.responseRemarks}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Awaiting Admin remarks...</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {c.submittedAt}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Details</span>
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

      {/* ── MODAL: VIEW COMPLAINT DETAILS & ADMIN RESPONSES ── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase mb-1">
              <span>Complaint ID: {selectedComplaint.id}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">
              {selectedComplaint.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl mb-4 text-xs font-medium">
              <div><span className="text-slate-400 block text-[10px]">Category</span><span className="font-bold">{selectedComplaint.category}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Assigned Dept</span><span className="font-semibold">{selectedComplaint.department}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Current Status</span><span className="font-bold uppercase text-emerald-800">{selectedComplaint.status}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Submitted Date</span><span className="font-mono text-[11px]">{selectedComplaint.submittedAt}</span></div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Complaint Description</label>
                <p className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-slate-800 leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Response & Remarks</label>
                {selectedComplaint.responseRemarks ? (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-medium leading-relaxed">
                    {selectedComplaint.responseRemarks}
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-slate-500">
                    No official response remarks submitted by department admin yet.
                  </div>
                )}
              </div>

              {/* Timeline Steps */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">Resolution Progress History</label>
                <div className="space-y-2">
                  {(selectedComplaint.auditLogs || []).map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{log.note || `Action performed by ${log.author}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
