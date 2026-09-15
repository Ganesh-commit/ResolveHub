import React from 'react';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      value: '99.4%',
      label: 'SLA Compliance Rate',
      desc: 'Enforced across all campus residential, academic, and lab facilities.'
    },
    {
      value: '4.2h',
      label: 'Avg Resolution Time',
      desc: 'Rapid diagnostic kit triage well within the 6.0h maximum turnaround window.'
    },
    {
      value: '14,800+',
      label: 'Grievances Resolved',
      desc: 'Verified and signed off with 100% digital audit confirmation.'
    }
  ];

  return (
    <section className="bg-bg py-16 md:py-24 border-t border-stroke/40">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex flex-col border-l border-stroke/80 pl-6 sm:pl-8 transition-transform duration-300 hover:translate-x-1"
            >
              <div className="text-5xl sm:text-6xl lg:text-7xl font-display italic text-text-primary tracking-tight mb-3">
                {item.value}
              </div>
              <div className="text-sm font-medium uppercase tracking-wider text-text-primary mb-1">
                {item.label}
              </div>
              <div className="text-xs sm:text-sm text-muted leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
