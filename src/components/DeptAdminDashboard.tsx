import React, { useState } from 'react';
import { useResolveHub } from '../context/ResolveHubContext';
import {
  Building2,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  X,
  Flame,
  UserCheck
} from 'lucide-react';
import type { Complaint } from '../types';

export const DeptAdminDashboard: React.FC = () => {
  const {
    complaints,
    authUser,
    updateComplaintStatus,
    assignComplaint,
    addAuditRemarks
  } = useResolveHub();

  const deptName = authUser?.department || 'Facilities & HVAC';

  // Strict Scoping: Department Admin sees ONLY complaints belonging to their department
  const deptComplaints = complaints.filter(c => c.department === deptName);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Modal State for Reviewing Complaint
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatusInput, setNewStatusInput] = useState('');
  const [responseRemarksInput, setResponseRemarksInput] = useState('');
  const [assignStaffInput, setAssignStaffInput] = useState('');

  // Department Statistics
  const totalDept = deptComplaints.length;
  const pendingDept = deptComplaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const inProgressDept = deptComplaints.filter(c => ['investigating', 'dispatched', 'in progress'].includes(c.status.toLowerCase())).length;
  const resolvedDept = deptComplaints.filter(c => ['resolved'].includes(c.status.toLowerCase())).length;
  const rejectedDept = deptComplaints.filter(c => ['rejected'].includes(c.status.toLowerCase())).length;

  // Filtered Complaints for Table
  const filteredComplaints = deptComplaints.filter(c => {
    const statusMatch = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
    const catMatch = filterCategory === 'all' || c.category === filterCategory;
    const prioMatch = filterPriority === 'all' || (c.urgency || c.priority || '').toLowerCase() === filterPriority.toLowerCase();

    const searchMatch = !searchQuery.trim() || (
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complainant?.regNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return statusMatch && catMatch && prioMatch && searchMatch;
  });

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    if (newStatusInput) {
      await updateComplaintStatus(selectedComplaint.id, newStatusInput, responseRemarksInput);
    } else if (responseRemarksInput) {
      await addAuditRemarks(selectedComplaint.id, responseRemarksInput);
    }
    if (assignStaffInput) {
      await assignComplaint(selectedComplaint.id, assignStaffInput, 'Department Technician', deptName);
    }
    setSelectedComplaint(null);
    setNewStatusInput('');
    setResponseRemarksInput('');
    setAssignStaffInput('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      
      {/* Department Admin Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>DEPARTMENT ADMIN CONTROL PANEL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            {deptName}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Department-scoped grievance review, field staff dispatch, status updates & student responses for {deptName}.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-2xl border border-stone-200 text-xs font-bold text-slate-700">
          <UserCheck className="w-4 h-4 text-amber-700" />
          <span>Logged in as: {authUser?.name || 'Department Admin'}</span>
        </div>
      </div>

      {/* ── DEPARTMENT KPI STATISTICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Dept Complaints */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dept Complaints</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 font-heading">{totalDept}</div>
            <div className="text-xs text-slate-500 mt-0.5">{deptName} total</div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-800 font-heading">{pendingDept}</div>
            <div className="text-xs text-slate-500 mt-0.5">Awaiting triage</div>
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
            <div className="text-3xl font-extrabold text-sky-700 font-heading">{inProgressDept}</div>
            <div className="text-xs text-slate-500 mt-0.5">Technicians working</div>
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
            <div className="text-3xl font-extrabold text-emerald-800 font-heading">{resolvedDept}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-0.5">Successfully closed</div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-700 font-heading">{rejectedDept}</div>
            <div className="text-xs text-slate-500 mt-0.5">Verified invalid</div>
          </div>
        </div>
      </div>

      {/* ── DEPARTMENT COMPLAINTS MANAGER ── */}
      <div className="space-y-6">
        {/* Search & Filter Strip */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${deptName} complaints by ID, Student, Title...`}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:border-amber-600 outline-none text-slate-900"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Hostel & Facilities">Hostel & Facilities</option>
              <option value="IT & Network">IT & Network</option>
              <option value="Finance & Scholarship">Finance & Scholarship</option>
              <option value="Sanitation & Hygiene">Sanitation & Hygiene</option>
              <option value="Academics">Academics</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2.5 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white outline-none text-slate-900 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="new">Pending Review</option>
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
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-stone-50 text-slate-500 uppercase font-mono border-b border-stone-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">ID / Reg No</th>
                  <th className="px-4 py-3.5">Complaint Title</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Current Status</th>
                  <th className="px-4 py-3.5">Assigned Staff</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No complaints found for department "{deptName}".
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
                          <div className="font-mono font-extrabold text-amber-900 text-sm">
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
                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-800">
                          {c.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isHighPriority ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                              <Flame className="w-3 h-3 text-rose-600" />
                              URGENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {c.urgency || c.priority || 'Medium'}
                            </span>
                          )}
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
                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                          {c.assignedAgent?.name || c.assignedOfficer || 'Unassigned'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedComplaint(c);
                              setNewStatusInput(c.status);
                              setResponseRemarksInput(c.responseRemarks || '');
                              setAssignStaffInput(c.assignedAgent?.name || '');
                            }}
                            className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review & Respond</span>
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

      {/* ── MODAL: DEPARTMENT COMPLAINT REVIEW & RESPONSE ── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-800 font-mono text-xs font-bold uppercase mb-1">
              <span>{deptName} • Complaint ID: {selectedComplaint.id}</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">
              {selectedComplaint.title}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl mb-4 text-xs font-medium">
              <div><span className="text-slate-400 block text-[10px]">Student Reg No</span><span className="font-mono font-bold">{selectedComplaint.complainant?.regNo || '241FA07001'}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Student Name</span><span className="font-bold">{selectedComplaint.complainant?.name || selectedComplaint.submittedBy}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Location</span><span>{selectedComplaint.location}</span></div>
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
                  <label className="font-bold text-slate-700 block mb-1">Update Status Stage</label>
                  <select
                    value={newStatusInput}
                    onChange={(e) => setNewStatusInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="new">Pending Intake (new)</option>
                    <option value="investigating">Under Investigation (investigating)</option>
                    <option value="dispatched">In Progress / Technician Dispatched (dispatched)</option>
                    <option value="resolved">Resolved (resolved)</option>
                    <option value="rejected">Rejected (rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Field Staff / Technician</label>
                  <input
                    type="text"
                    value={assignStaffInput}
                    onChange={(e) => setAssignStaffInput(e.target.value)}
                    placeholder="Enter Staff Name (e.g. Rahul K.)"
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:bg-white outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Response / Remarks to Student</label>
                <textarea
                  rows={3}
                  value={responseRemarksInput}
                  onChange={(e) => setResponseRemarksInput(e.target.value)}
                  placeholder="Enter official remarks. This will be automatically reflected on the student dashboard..."
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
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold cursor-pointer shadow-md"
                >
                  SAVE & UPDATE DEPT COMPLAINT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
