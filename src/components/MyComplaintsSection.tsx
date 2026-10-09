import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  MapPin, 
  Paperclip,
  PlusCircle,
  Eye,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const MyComplaintsSection: React.FC = () => {
  const { complaints, authUser, setActiveView, setTrackQuery } = useResolveHub();

  const regNo = authUser?.regNo || authUser?.username || '';

  // Filter complaints strictly belonging to this logged-in student
  const studentComplaints = (complaints || []).filter(c => {
    if (!c) return false;
    const targetReg = String(regNo || '').toUpperCase();
    if (!targetReg) return true;
    const cReg = String(c.complainant?.regNo || '').toUpperCase();
    const cBy = String(c.submittedBy || '').toUpperCase();
    return cReg === targetReg || cBy.includes(targetReg);
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredComplaints = studentComplaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Pending' && (c.status === 'Submitted' || c.status === 'Under Review' || c.status === 'new')) ||
      (statusFilter === 'In Progress' && (c.status === 'In Progress' || c.status === 'investigating' || c.status === 'Assigned')) ||
      (statusFilter === 'Resolved' && c.status === 'Resolved') ||
      (statusFilter === 'Escalated' && (c.isEscalated || c.status === 'Escalated'));

    return matchesSearch && matchesStatus;
  });

  // Sort complaints
  filteredComplaints.sort((a, b) => {
    const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <FileText className="w-3.5 h-3.5" /> My Submitted Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading-playfair tracking-tight">
            My Complaints Registry
          </h1>
          <p className="text-xs text-rose-200/90 mt-1">
            Track, filter, and inspect status timelines for all your submitted grievance tickets.
          </p>
        </div>

        <button
          onClick={() => setActiveView('report')}
          className="px-6 py-3 bg-[#ffc20e] hover:bg-[#e0a800] text-[#4a1208] font-black text-xs uppercase tracking-wider rounded-full shadow-lg cursor-pointer flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Report New Issue
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, title, category..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] dark:text-white"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pt-1">
          {['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'].map(chip => (
            <button
              key={chip}
              onClick={() => {
                setStatusFilter(chip);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === chip
                  ? 'bg-[#8a2410] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Registry Cards List */}
      <div className="space-y-4">
        {paginatedComplaints.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Complaints Match Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or filter chips to view submitted tickets.
            </p>
          </div>
        ) : (
          paginatedComplaints.map(c => {
            let progressPct = 25;
            if (c.status === 'Assigned') progressPct = 50;
            else if (c.status === 'In Progress' || c.status === 'investigating') progressPct = 75;
            else if (c.status === 'Resolved') progressPct = 100;

            return (
              <div
                key={c.id}
                className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#8a2410] dark:text-amber-400">{c.id}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">• {c.category}</span>
                    {c.isAnonymous && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800 uppercase">
                        Anonymous Mode
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      c.priority === 'Urgent' || c.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-slate-700'
                    }`}>
                      {c.urgency || c.priority || 'Medium'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Progress Bar per complaint */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Resolution Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8a2410] to-[#ffc20e] rounded-full"
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-stone-100 dark:border-slate-700 gap-2">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Logged on: <strong className="text-slate-700 dark:text-slate-300">{formatDate(c.submittedAt)}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.location || 'Campus'}
                    </span>
                    {c.attachments && c.attachments.length > 0 && (
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <Paperclip className="w-3.5 h-3.5 text-[#8a2410]" /> {c.attachments.length} attachment(s)
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setTrackQuery(c.id);
                      setActiveView('track');
                    }}
                    className="px-4 py-1.5 bg-[#8a2410] text-white font-bold text-xs rounded-xl hover:bg-[#6f1b0c] cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 bg-stone-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 bg-stone-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
