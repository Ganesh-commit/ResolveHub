import React, { useState, useEffect } from 'react';
import { UserCheck, RefreshCw, X, ShieldCheck, Check } from 'lucide-react';
import type { Complaint } from '../types';
import { useResolveHub } from '../context/ResolveHubContext';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Complaint | null;
  onAssignSuccess?: (updatedTicket: Complaint) => void;
}

interface StaffMember {
  id: string;
  name: string;
  role?: string;
  department?: string;
  departmentId?: string;
}

export const AssignTicketModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAssignSuccess
}) => {
  const { assignComplaint, addToast } = useResolveHub();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && ticket) {
      setLoading(true);
      const queryDept = encodeURIComponent(ticket.department || '');
      fetch(`/api/auth/staff?department=${queryDept}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setStaffList(data.data);
            if (data.data.length > 0) {
              setSelectedStaff(data.data[0].name);
            }
          }
        })
        .catch(() => {
          // Fallback list of default department specialists
          setStaffList([
            { id: 's1', name: 'Dr. Ramesh Kumar', role: 'Department Specialist', department: ticket.department },
            { id: 's2', name: 'Prof. Lakshmi Devi', role: 'Faculty Coordinator', department: ticket.department },
            { id: 's3', name: 'Er. Suresh Babu', role: 'Field Technician Lead', department: ticket.department }
          ]);
          setSelectedStaff('Dr. Ramesh Kumar');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const isReassignment = Boolean(ticket.assignedAgent && ticket.assignedAgent.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmitting(true);

    try {
      await assignComplaint(ticket.id, selectedStaff, ticket.department);
      addToast('success', isReassignment ? 'Ticket Reassigned' : 'Ticket Assigned', `Complaint ${ticket.id} assigned to ${selectedStaff}`);
      if (onAssignSuccess) {
        onAssignSuccess({
          ...ticket,
          assignedAgent: { name: selectedStaff, role: 'Staff Specialist', department: ticket.department },
          status: 'Assigned'
        });
      }
      onClose();
    } catch {
      addToast('warning', 'Assignment Error', 'Failed to assign complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-stone-200 dark:border-slate-700 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-700">
          <div className="flex items-center gap-2 text-[#8a2410] dark:text-amber-400 font-extrabold font-heading">
            <UserCheck className="w-5 h-5" />
            <span>{isReassignment ? 'Reassign Complaint Officer' : 'Assign Department Specialist'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 cursor-pointer">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Ticket Summary */}
        <div className="p-3 bg-stone-50 dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 text-xs space-y-1">
          <div className="font-extrabold text-slate-900 dark:text-white">Ticket: #{ticket.id}</div>
          <div className="text-slate-500 font-medium truncate">{ticket.title}</div>
          <div className="text-amber-700 dark:text-amber-300 font-bold text-[11px] uppercase">
            Department: {ticket.department}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Select Officer / Staff Specialist
            </label>

            {loading ? (
              <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#8a2410]" /> Fetching department staff...
              </div>
            ) : (
              <select
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
                className="w-full px-3.5 py-3 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:border-[#8a2410] outline-none text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                {staffList.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role || 'Specialist'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8a2410] shrink-0" />
            <span>An audit trail entry will be recorded for this {isReassignment ? 'reassignment' : 'assignment'}.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? 'Assigning...' : <><Check className="w-4 h-4" /> Confirm Assignment</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
