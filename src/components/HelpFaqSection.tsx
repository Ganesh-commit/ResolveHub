import React, { useState } from 'react';
import { ChevronDown, Search, GraduationCap } from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

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
    answer: 'Yes! ResolveHub provides strict confidentiality for student welfare and anti-ragging complaints. Your identity is protected, and reports are routed directly to the Anti-Ragging Committee & Dean of Student Welfare for emergency action.'
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
    category: 'Tracking',
    question: 'Where is my Reference ID saved when I raise a complaint?',
    answer: 'Every complaint is assigned a unique Reference ID (e.g. UNI-8942) and stored in your local browser database and campus registry. You can check progress anytime under "MY COMPLAINTS" or "TRACK STATUS".'
  }
];

export const HelpFaqSection: React.FC = () => {
  const { setActiveView } = useResolveHub();
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<string[]>(['f1', 'f2']);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = campusFaqData.filter(item =>
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.answer.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-extrabold tracking-widest uppercase mb-3">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>STUDENT HELP & SUPPORT CENTER</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
          University FAQ & Grievance Guide
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mt-2">
          Everything you need to know about campus complaint submission and resolution procedures.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions by keyword (e.g. hostel, anti-ragging, exams)..."
          className="w-full pl-12 pr-4 py-3.5 text-sm bg-white rounded-2xl border border-stone-200 shadow-xs focus:border-emerald-600 outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md uppercase">
                    {faq.category}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-stone-100 bg-stone-50/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need Additional Help Contact Banner */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold">Need urgent campus assistance?</h3>
          <p className="text-xs text-emerald-200 mt-1">Student welfare desk & anti-ragging cell hotline active 24/7.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('report')}
            className="bg-white text-emerald-900 text-xs font-extrabold px-6 py-3 rounded-full hover:bg-emerald-50 transition-all btn-lift cursor-pointer"
          >
            Submit Campus Grievance
          </button>
        </div>
      </div>

    </section>
  );
};
