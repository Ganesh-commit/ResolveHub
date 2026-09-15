import React from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { ArrowRight } from 'lucide-react';

export const JournalSection: React.FC = () => {
  const { setActiveView, setSelectedTicketId } = useGrievance();

  const entries = [
    {
      id: 'RP-8042',
      title: 'Chiller Unit Compressor Trip in Block-C Server Wing',
      domain: 'Facilities & HVAC',
      slaTarget: '45m Diagnostic Window',
      timestamp: 'Today, 10:30 AM',
      author: 'Lead HVAC Specialist Rahul K.',
      status: 'Dispatched On-Site'
    },
    {
      id: 'RP-8039',
      title: 'Main Library 5GHz Gateway Aruba AP-535 Offline Alert',
      domain: 'IT & Network',
      slaTarget: '1.2h NOC Remediation',
      timestamp: 'Today, 09:15 AM',
      author: 'Network NOC Ops',
      status: 'Under Investigation'
    },
    {
      id: 'RP-7994',
      title: 'Semester V Merit Tuition Waiver Ledger Reconciliation',
      domain: 'Student Finance Bureau',
      slaTarget: '48h Bursar Resolution',
      timestamp: 'Yesterday, 04:20 PM',
      author: 'Finance Registrar',
      status: 'Queued in Intake'
    },
    {
      id: 'RP-7911',
      title: 'Dining Hall B Reverse Osmosis Purity Recalibration (45 PPM)',
      domain: 'Health & Sanitation',
      slaTarget: '2.0h Swapped & Tested',
      timestamp: 'Oct 10, 03:45 PM',
      author: 'Sanitation Officer S. Kumar',
      status: 'Resolved & Signed'
    }
  ];

  const handleEntryClick = (id: string) => {
    setSelectedTicketId(id);
    setActiveView('citizen');
  };

  return (
    <section id="journal" className="bg-bg py-16 md:py-24 border-t border-stroke/40">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-xs text-muted uppercase tracking-[0.3em] font-medium mb-3">
              <span className="w-8 h-px bg-stroke" />
              <span>Audit Ledger</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-text-primary tracking-tight">
              Recent <span className="font-display italic text-text-primary">incident audits</span>
            </h2>
            <p className="text-sm md:text-base text-muted mt-2 max-w-lg">
              Immutable timestamps, technician dispatch assignments, and verified resolution logs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="hidden md:inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-primary border border-stroke hover:border-transparent rounded-full px-5 py-2.5 transition-all relative group cursor-pointer"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]" />
            <span className="relative flex items-center gap-1.5">
              <span>View All Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* 4 Horizontal Pill Entries */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => handleEntryClick(entry.id)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[28px] sm:rounded-full bg-surface/30 hover:bg-surface/90 border border-stroke hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              {/* Left Side: Tag & Title */}
              <div className="flex items-center gap-4 min-w-0">
                <span className="shrink-0 font-mono text-xs text-text-primary px-3 py-1 rounded-full bg-stroke/60 group-hover:bg-stroke transition-colors">
                  #{entry.id}
                </span>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-normal text-text-primary truncate group-hover:text-cyan-300 transition-colors">
                    {entry.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
                    <span>{entry.domain}</span>
                    <span>•</span>
                    <span>{entry.author}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: SLA & Timestamp */}
              <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stroke/40">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-mono text-cyan-400 font-medium">
                    {entry.slaTarget}
                  </div>
                  <div className="text-[11px] text-muted">{entry.timestamp}</div>
                </div>

                <span className="w-8 h-8 rounded-full border border-stroke flex items-center justify-center text-muted group-hover:text-text-primary group-hover:border-white/40 group-hover:translate-x-1 transition-all">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
