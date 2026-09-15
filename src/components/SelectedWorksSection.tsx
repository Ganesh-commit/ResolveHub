import React from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { ArrowUpRight } from 'lucide-react';

export const SelectedWorksSection: React.FC = () => {
  const { setActiveView, setSelectedTicketId } = useGrievance();

  const cases = [
    {
      id: 'RP-8042',
      colSpan: 'md:col-span-7',
      title: 'Hostel & HVAC Systems',
      subtitle: 'Central Chiller Diagnostics & Rooftop Compressors',
      sla: 'SLA: 4.0 Hours',
      status: 'Technician Dispatched',
      category: 'Facilities',
      gradient: 'from-cyan-950/40 via-slate-900 to-black',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'RP-8039',
      colSpan: 'md:col-span-5',
      title: 'Enterprise Networks',
      subtitle: 'Aruba 5GHz Access Point Gateway Failover',
      sla: 'SLA: 1.5 Hours',
      status: 'Investigation Active',
      category: 'IT Systems',
      gradient: 'from-blue-950/40 via-slate-900 to-black',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'RP-7911',
      colSpan: 'md:col-span-5',
      title: 'Water & RO Sanitation',
      subtitle: 'Dining Hall Reverse Osmosis Membrane Renewal',
      sla: 'SLA: 2.0 Hours',
      status: 'Resolved & Tested',
      category: 'Sanitation',
      gradient: 'from-emerald-950/40 via-slate-900 to-black',
      image: 'https://images.unsplash.com/photo-1584772658145-12cf518c8651?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'RP-7994',
      colSpan: 'md:col-span-7',
      title: 'Finance & Scholarships',
      subtitle: 'Merit Tuition Waiver Ledger Reconciliation',
      sla: 'SLA: 48 Hours',
      status: 'Queued in Intake',
      category: 'Student Accounts',
      gradient: 'from-purple-950/40 via-slate-900 to-black',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const handleCardClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveView('citizen');
  };

  return (
    <section id="works" className="bg-bg py-16 md:py-24 border-t border-stroke/40">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <div className="flex items-center gap-3 text-xs text-muted uppercase tracking-[0.3em] font-medium mb-3">
              <span className="w-8 h-px bg-stroke" />
              <span>Operational Verticals</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-text-primary tracking-tight">
              Active <span className="font-display italic text-text-primary">redressal domains</span>
            </h2>
            <p className="text-sm md:text-base text-muted mt-2 max-w-lg">
              Critical campus utility and administrative branches managed under 24/7 automated SLA accountability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="hidden md:inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-primary border border-stroke hover:border-transparent rounded-full px-5 py-2.5 transition-all relative group cursor-pointer"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]" />
            <span className="relative flex items-center gap-1.5">
              <span>View Command Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Bento Grid: 7 / 5 / 5 / 7 columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {cases.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className={`${item.colSpan} relative bg-surface border border-stroke rounded-3xl overflow-hidden min-h-[360px] md:min-h-[420px] flex flex-col justify-between p-6 sm:p-8 cursor-pointer group transition-all duration-300 hover:border-white/20`}
            >
              {/* Card Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 group-hover:opacity-30"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-90`} />
                {/* Halftone Overlay */}
                <div className="absolute inset-0 halftone-overlay opacity-25 mix-blend-multiply pointer-events-none" />
              </div>

              {/* Card Top: Badge & SLA */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/50 border border-white/10 text-text-primary backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {item.category}
                </span>

                <span className="text-xs font-mono text-muted bg-black/40 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                  {item.sla}
                </span>
              </div>

              {/* Card Bottom: Titles & Status */}
              <div className="relative z-10">
                <div className="text-xs text-muted font-mono mb-1">
                  Ticket #{item.id} • {item.status}
                </div>
                <h3 className="text-2xl sm:text-3xl font-normal text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted line-clamp-2 max-w-md">
                  {item.subtitle}
                </p>
              </div>

              {/* Hover Pill with animated gradient border */}
              <div className="absolute inset-0 bg-bg/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                <div className="relative p-[1.5px] rounded-full accent-gradient-border shadow-2xl">
                  <span className="block px-6 py-2.5 rounded-full bg-white text-black text-xs font-medium tracking-wide shadow-lg">
                    Track — <span className="font-display italic text-sm">{item.title}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
