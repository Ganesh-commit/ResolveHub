import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, UserCheck, FileText } from 'lucide-react';
import type { TimelineStep, EscalationLevel, Complaint } from '../types';

interface StatusTimelineProps {
  currentStatus?: string;
  timeline?: TimelineStep[];
  escalationLevel?: EscalationLevel;
  escalationReason?: string;
  slaDeadline?: string;
  ticket?: Complaint;
}

export const StatusTimelineStepper: React.FC<StatusTimelineProps> = ({
  currentStatus,
  timeline = [],
  escalationLevel = 'LEVEL_0_STAFF',
  escalationReason,
  slaDeadline,
  ticket
}) => {
  const activeStatus = ticket ? ticket.status : (currentStatus || 'Pending');
  const activeTimeline = ticket ? (ticket.timeline || []) : timeline;
  const activeEscalationLevel = ticket ? (ticket.escalationLevel || 'LEVEL_0_STAFF') : escalationLevel;
  const activeEscalationReason = ticket ? ticket.escalationReason : escalationReason;
  const activeSlaDeadline = ticket ? ticket.slaDeadline : slaDeadline;
  const steps = [
    { key: 'submitted', label: 'Submitted', icon: FileText },
    { key: 'assigned', label: 'Assigned', icon: UserCheck },
    { key: 'in_progress', label: 'In Progress', icon: Clock },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2 }
  ];

  const formatDate = (ts?: string | Date | null) => {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return String(ts);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(ts);
    }
  };

  const getStepStatus = (key: string, idx: number) => {
    const normCurrent = (activeStatus || '').toLowerCase();
    
    // Check if timeline step exists and is completed
    const matchingStep = activeTimeline.find(t => t.stepKey === key);
    if (matchingStep && matchingStep.completed) return 'completed';

    // Status map fallback index
    const statusIndices: Record<string, number> = {
      new: 0,
      submitted: 0,
      investigating: 1,
      'under review': 1,
      assigned: 1,
      dispatched: 2,
      'in progress': 2,
      resolved: 3,
      rejected: 3
    };

    const currentIdx = statusIndices[normCurrent] ?? 0;

    if (idx < currentIdx) return 'completed';
    if (idx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-xs space-y-6">
      
      {/* Header & Escalation Alert Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-700 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
            Grievance Resolution Progress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            SLA Target Deadline: <span className="font-mono font-bold text-slate-700 dark:text-amber-300">{activeSlaDeadline || '3 Business Days'}</span>
          </p>
        </div>

        {/* SLA Escalation Badges */}
        {activeEscalationLevel === 'LEVEL_1_HOD' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>ESCALATED TO HOD (3+ Days Pending)</span>
          </div>
        )}

        {activeEscalationLevel === 'LEVEL_2_DEAN' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-extrabold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>CRITICAL: ESCALATED TO DEAN (6+ Days)</span>
          </div>
        )}
      </div>

      {/* Escalation Reason Notice */}
      {activeEscalationReason && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs font-semibold rounded-2xl">
          ⚠️ {activeEscalationReason}
        </div>
      )}

      {/* ── Visual Stepper Bar ── */}
      <div className="relative flex items-center justify-between max-w-2xl mx-auto py-4">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-6 right-6 h-1 bg-stone-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const stepState = getStepStatus(step.key, idx);
          const stepData = activeTimeline.find(t => t.stepKey === step.key);
          const timestampFormatted = formatDate(stepData?.timestamp) || (stepState === 'completed' ? 'Completed' : 'Pending');
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
                  stepState === 'completed'
                    ? 'bg-[#8B2414] text-white shadow-md ring-4 ring-rose-100' 
                    : stepState === 'active'
                      ? 'bg-indigo-900 text-white shadow-md ring-4 ring-indigo-100 animate-pulse'
                      : 'bg-stone-100 text-slate-400 border border-stone-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="text-center mt-2.5">
                <div className={`text-xs font-extrabold ${stepState !== 'pending' ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {stepState !== 'pending' ? timestampFormatted : 'Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
