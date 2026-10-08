import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, Bot, Mail } from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const campusFaqData: FaqItem[] = [
  {
    id: 'f1',
    category: 'Hostel & Facilities',
    question: 'How do I submit a hostel or maintenance complaint on ResolveHub?',
    answer: 'Select "Hostel & Accommodation" from the category tags on the home page, write your issue details (e.g. room water supply, fan repair, electrical socket), specify your Hostel Block and Room Number, and click SUBMIT COMPLAINT. It immediately registers in the campus database.'
  },
  {
    id: 'f2',
    category: 'Anti-Ragging & Safety',
    question: 'Can I report anti-ragging or student welfare issues confidentially?',
    answer: 'Yes! ResolveHub provides strict confidentiality for student welfare and anti-ragging complaints. Your identity is protected in Anonymous Mode, and reports are routed directly to the Anti-Ragging Committee & Dean of Student Welfare for emergency action.'
  },
  {
    id: 'f3',
    category: 'Academic & Exams',
    question: 'How are examination and marks discrepancy complaints handled?',
    answer: 'Grievances logged under "Academic & Exam Cell" are assigned directly to the Controller of Examinations and department HOD. Target SLA for hall ticket corrections is under 24 hours.'
  },
  {
    id: 'f4',
    category: 'IT & Wi-Fi',
    question: 'How long does IT support take to fix lab PCs or campus Wi-Fi issues?',
    answer: 'Campus IT Network Services monitors the portal 24/7. Laboratory network outages or projector repairs are triaged within 2 to 4 hours of submission.'
  },
  {
    id: 'f5',
    category: 'SLA Escalation',
    question: 'What happens if a department does not resolve my complaint in 3 days?',
    answer: 'Every complaint has an enforced SLA deadline. If unresolved after 3 days, it auto-escalates to the Head of Department (HOD). After 6 days, it escalates directly to the Dean.'
  },
  {
    id: 'f6',
    category: 'Tracking & Reopening',
    question: 'Can I re-open a complaint if the problem is not fixed?',
    answer: 'Yes! If an issue is marked resolved but recurs, navigate to your Track Status page or My Complaints tab and click "Re-open Complaint" to send it back for re-inspection.'
  }
];

export const HelpFaqSection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [openIds, setOpenIds] = useState<string[]>(['f1', 'f2']);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const categories = ['All', 'Hostel & Facilities', 'Anti-Ragging & Safety', 'Academic & Exams', 'IT & Wi-Fi', 'SLA Escalation', 'Tracking & Reopening'];

  const filteredFaqs = campusFaqData.filter(item => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) ||
                          item.answer.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-6 py-6 px-4 sm:px-8 lg:px-12 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-[#8a2410] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> University Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading-playfair tracking-tight">
            Help & Frequently Asked Questions
          </h1>
          <p className="text-xs text-rose-200/90 mt-1">
            Find instant guidance on complaint filing, SLA escalation, anonymous reporting, and hostel policies.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Chips */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-stone-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold pt-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-[#8a2410] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => {
          const isOpen = openIds.includes(faq.id);

          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950 text-[#8a2410] dark:text-amber-300 uppercase">
                    {faq.category}
                  </span>
                  <span>{faq.question}</span>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#8a2410]' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-stone-100 dark:border-slate-700/60 font-normal animate-slide-down">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Requirement 9: Bottom CTA Card */}
      <div className="p-6 sm:p-8 bg-stone-100 dark:bg-slate-800/80 rounded-3xl border border-stone-200 dark:border-slate-700 text-center space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading-playfair">
          Still need help or policy clarification?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          Our AI Assistant is available 24/7 to answer policy questions, check your complaint status, or direct you to campus offices.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => {
              const aiTrigger = document.querySelector('[aria-label="Open ResolveHub AI Assistant"]') as HTMLButtonElement;
              if (aiTrigger) aiTrigger.click();
            }}
            className="px-6 py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-full shadow-md cursor-pointer flex items-center gap-2"
          >
            <Bot className="w-4 h-4 animate-pulse" /> Ask AI Assistant
          </button>

          <a
            href="mailto:grievance@vignan.ac.in"
            className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-full hover:bg-stone-50 cursor-pointer flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-[#8a2410]" /> Contact Campus Office
          </a>
        </div>
      </div>

    </div>
  );
};
