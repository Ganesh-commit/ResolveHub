import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Paperclip,
  ChevronRight,
  Plus,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const MyComplaintsSection: React.FC = () => {
  const { complaints, setSelectedComplaint, setActiveView, setTrackQuery, clearDatabase } = useResolveHub();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      selectedStatusFilter === 'All' || 
      (selectedStatusFilter === 'Pending' && (c.status === 'Submitted' || c.status === 'Under Review')) ||
      (selectedStatusFilter === 'In Progress' && c.status === 'In Progress') ||
      (selectedStatusFilter === 'Resolved' && c.status === 'Resolved');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'submitted' || s === 'new') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Submitted</span>
        </span>
      );
    }
    if (s === 'under review' || s === 'investigating') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-200">
          <AlertCircle className="w-3.5 h-3.5 text-sky-700" />
          <span>Under Review</span>
        </span>
      );
    }
    if (s === 'in progress' || s === 'dispatched') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
          <Clock className="w-3.5 h-3.5 text-indigo-700 animate-spin" style={{ animationDuration: '4s' }} />
          <span>In Progress</span>
        </span>
      );
    }
    if (s === 'resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Resolved</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
        <span>{status}</span>
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || 'Medium').toLowerCase();
    if (p === 'urgent' || p === 'critical') {
      return <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">Urgent</span>;
    }
    if (p === 'high') {
      return <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">High</span>;
    }
    return <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase">{priority || 'Medium'}</span>;
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            <span>CAMPUS DATABASE REGISTRY</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            My Submitted Campus Complaints
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Complaints raised by you stored in the campus database ({complaints.length} records saved).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {complaints.length > 0 && (
            <button
              onClick={clearDatabase}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3.5 py-2.5 rounded-full border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Database</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('report')}
            className="inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-5 py-3 rounded-full shadow-md btn-lift cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>REPORT NEW ISSUE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Reference ID (e.g. UNI-8942), topic, or location..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 rounded-2xl border border-stone-200 focus:bg-white focus:border-emerald-600 outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((statusTab) => (
            <button
              key={statusTab}
              onClick={() => setSelectedStatusFilter(statusTab)}
              className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                selectedStatusFilter === statusTab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              {statusTab}
            </button>
          ))}
        </div>

      </div>

      {/* Complaints List Table / Cards */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 text-slate-500 shadow-xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">
              {complaints.length === 0 ? 'No Campus Complaints Logged in Database' : 'No matching complaints found'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {complaints.length === 0
                ? 'Only complaints submitted by you will be stored in the database. Raise a new complaint using the button below!'
                : 'Try adjusting your search query or filter options.'}
            </p>

            {complaints.length === 0 && (
              <button
                onClick={() => setActiveView('report')}
                className="mt-5 inline-flex items-center gap-2 bg-emerald-800 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-emerald-900 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Your First Campus Complaint</span>
              </button>
            )}
          </div>
        ) : (
          filteredComplaints.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              
              {/* Left Details */}
              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded-lg">
                    {item.id}
                  </span>
                  {getStatusBadge(item.status)}
                  {getPriorityBadge(item.priority)}
                  <span className="text-xs text-slate-400 font-medium">
                    Logged: {item.submittedAt}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700 bg-stone-100 px-2.5 py-0.5 rounded-md">
                    Dept: {item.department || item.category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </span>
                  {item.attachments && item.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Paperclip className="w-3.5 h-3.5" />
                      {item.attachments.length} attached
                    </span>
                  )}
                </div>
              </div>

              {/* Right CTA Actions */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => {
                    setTrackQuery(item.id);
                    setActiveView('track');
                  }}
                  className="bg-stone-100 hover:bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-colors cursor-pointer"
                >
                  Live Progress Bar
                </button>
                
                <button
                  onClick={() => setSelectedComplaint(item)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </section>
  );
};
