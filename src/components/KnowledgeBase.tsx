import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import {
  Search,
  Wifi,
  Home,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const { setIsComplaintModalOpen, setIsEmergencyModalOpen } = useGrievance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqs = [
    {
      id: 1,
      category: 'IT & Network',
      icon: Wifi,
      title: 'Hostel & Lab Wi-Fi "Connected without Internet" Fix',
      summary: 'Steps to clear DNS cache, re-authenticate via campus 802.1X captive portal, and renewal protocol.',
      sla: 'Self-Service (Instant)',
      solution:
        '1. Disconnect and forget "CAMPUS-ENTERPRISE-5G". 2. Open browser and visit http://1.1.1.1 to force the captive gateway. 3. Enter your student/staff SSO credentials. If issue persists, check if your block switch is reported down in the Citizen Dashboard.'
    },
    {
      id: 2,
      category: 'Hostel & Facilities',
      icon: Home,
      title: 'Air Conditioner / Cooling Failure Escalation Protocol',
      summary: 'Official SLA timelines for HVAC breakdown, compressor tripping, and remote temperature alarms.',
      sla: 'SLA: 4.0 Hours Max',
      solution:
        'HVAC failures in computer laboratories and high-density hostel blocks are triaged as High Urgency. If ambient temperature exceeds 30°C in server rooms, the ticket automatically escalates to Critical with dispatch within 45 minutes.'
    },
    {
      id: 3,
      category: 'Finance & Scholarship',
      icon: GraduationCap,
      title: 'Fee Ledger & Merit Scholarship Disbursal Timelines',
      summary: 'How semester fee adjustments are verified between the Academic Council and Student Accounts.',
      sla: 'SLA: 48 Hours',
      solution:
        'Approved scholarship letters are reconciled every Tuesday and Friday. If your ERP ledger balance does not reflect the sanctioned fee waiver within 3 working days of council publication, file a Finance ticket with your Award Notification attached.'
    },
    {
      id: 4,
      category: 'Health & Sanitation',
      icon: CheckCircle2,
      title: 'Drinking Water RO Filtration & Hygiene Audits',
      summary: 'Daily purity testing benchmarks (TDS < 80 PPM) and immediate cartridge swap procedures.',
      sla: 'SLA: 2.0 Hours',
      solution:
        'Drinking water stations are checked daily at 07:00 AM. Any reported dispenser leakage or TDS anomaly triggers an automatic technician dispatch within 2 hours.'
    },
    {
      id: 5,
      category: 'Discipline & Safety',
      icon: ShieldAlert,
      title: 'Confidential Harassment & Anti-Ragging Redressal',
      summary: 'Encrypted, anonymous filing route routed exclusively to the statutory Presiding Officer.',
      sla: 'Immediate (< 30 Mins)',
      solution:
        'All filings under Harassment & Discipline are pseudonymized. Neither your roommate nor department faculty can view the case details without statutory high-level authorization.'
    }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.solution.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
      {/* Hero Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Self-Service Redressal Directory</span>
        </div>
        <h1
          style={{ fontFamily: 'var(--font-heading)' }}
          className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-3"
        >
          Resolve Issues Instantly
        </h1>
        <p className="text-white/60 text-sm sm:text-base">
          Search instant fixes, campus operational policies, and SLA resolution protocols before logging a field ticket.
        </p>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-xl mx-auto">
          <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms: e.g. Wi-Fi down, AC leaking, scholarship ledger..."
            className="w-full bg-[#12151f] border border-white/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 shadow-xl"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {['all', 'IT & Network', 'Hostel & Facilities', 'Finance & Scholarship', 'Health & Sanitation', 'Discipline & Safety'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20'
                : 'bg-white/5 text-white/70 hover:text-white border border-white/10'
            }`}
          >
            {cat === 'all' ? 'All Knowledge Articles' : cat}
          </button>
        ))}
      </div>

      {/* FAQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filteredFaqs.map((faq) => {
          const Icon = faq.icon;
          return (
            <div
              key={faq.id}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                    <Icon className="w-4 h-4" />
                    {faq.category}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    {faq.sla}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 leading-snug">
                  {faq.title}
                </h3>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  {faq.summary}
                </p>

                <div className="bg-[#12151f] p-3.5 rounded-xl border border-white/5 text-xs text-white/80 leading-relaxed font-sans">
                  <strong className="text-cyan-300 block mb-1 font-mono uppercase text-[10px]">
                    Recommended Protocol:
                  </strong>
                  {faq.solution}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-white/40">Issue unresolved?</span>
                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  Log Official Ticket
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Still need help CTA banner */}
      <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto">
          <h3
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-2xl font-semibold text-white mb-2"
          >
            Cannot find a self-service fix?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mb-6">
            Our automated dispatch engine connects you with trained field technicians, departmental heads, and statutory officers in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              + File Official Grievance
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
            >
              Emergency Desk Hotline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
