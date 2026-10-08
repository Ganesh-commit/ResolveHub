import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Clock, 
  Building2, 
  Lock, 
  Zap, 
  Activity, 
  PhoneCall, 
  Menu, 
  X, 
  AlertTriangle
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { HeroSlideshow } from './HeroSlideshow';
import { ScrollReveal } from './ScrollReveal';
import { Footer } from './Footer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PublicTrackResult {
  id: string;
  category: string;
  department: string;
  location: string;
  urgency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  timeline: Array<{ status: string; timestamp: string; note: string }>;
}

export const PublicLandingPage: React.FC = () => {
  const { setIsLoginModalOpen, authUser, setActiveView } = useResolveHub();
  
  // Mobile Nav Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track Status Modal State
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackInputId, setTrackInputId] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<PublicTrackResult | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // How it works line animation state
  const lineDrawn = true;

  // Marquee Categories
  const [categories, setCategories] = useState<string[]>([
    'Hostel & Facilities',
    'Academics',
    'Examinations',
    'Transport',
    'Library',
    'Finance & Scholarship',
    'IT & Network',
    'Canteen & Food',
    'Security & Safety',
    'Anti-Ragging & Welfare'
  ]);

  useEffect(() => {
    // Redirect to role dashboard if already logged in
    if (authUser) {
      if (authUser.role === 'super_admin') setActiveView('super_admin_dashboard');
      else if (authUser.role === 'dept_admin') setActiveView('dept_admin_dashboard');
      else if (authUser.role === 'student') setActiveView('student_dashboard');
    }
  }, [authUser, setActiveView]);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE}/public/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Execute Public Track Lookup
  const handlePublicTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInputId.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await fetch(`${API_BASE}/public/track/${encodeURIComponent(trackInputId.trim())}`);
      const data = await res.json();
      setTrackLoading(false);

      if (data.success) {
        setTrackResult(data.data);
      } else {
        setTrackError(data.error || 'Complaint ID not found.');
      }
    } catch (err) {
      setTrackLoading(false);
      setTrackError('Could not check status. Please check your network connection.');
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (view: 'home' | 'about' | 'faq' | 'login') => {
    setMobileMenuOpen(false);
    if (view === 'login') {
      setIsLoginModalOpen(true);
    } else {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f4] text-slate-900 font-body-jakarta overflow-x-hidden selection:bg-[#ffc20e] selection:text-[#4a1208]">
      
      {/* ── 1. STICKY NAVBAR ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Badge */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-full bg-[#8a2410] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-[#ffc20e]">
              V
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight font-heading-playfair leading-none">
                Vignan's <span className="text-[#8a2410]">ResolveHub</span>
              </h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-0.5">
                Grievance Resolution Portal
              </p>
            </div>
          </div>

          {/* Desktop Center Links (Includes "About" Link) */}
          <div className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wide text-slate-700 uppercase">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              How It Works
            </button>
            <button onClick={() => handleNavClick('about')} className="landing-nav-link hover:text-[#8a2410] text-[#8a2410] font-black cursor-pointer">
              About
            </button>
            <button onClick={() => scrollToSection('categories')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Categories
            </button>
            <button onClick={() => setTrackModalOpen(true)} className="landing-nav-link hover:text-[#8a2410] cursor-pointer flex items-center gap-1 text-[#8a2410]">
              <Search className="w-3.5 h-3.5" /> Track Complaint
            </button>
            <button onClick={() => scrollToSection('features')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Features
            </button>
          </div>

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-extrabold text-xs tracking-wider rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer uppercase"
            >
              Login
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#8a2410] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 space-y-3 text-sm font-bold text-slate-800 shadow-xl">
            <button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="block w-full text-left py-2 hover:text-[#8a2410]">
              Home
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 hover:text-[#8a2410]">
              How It Works
            </button>
            <button onClick={() => handleNavClick('about')} className="block w-full text-left py-2 text-[#8a2410] font-black">
              About Us
            </button>
            <button onClick={() => scrollToSection('categories')} className="block w-full text-left py-2 hover:text-[#8a2410]">
              Categories
            </button>
            <button onClick={() => { setMobileMenuOpen(false); setTrackModalOpen(true); }} className="block w-full text-left py-2 text-[#8a2410] font-black">
              🔍 Track Complaint
            </button>
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 hover:text-[#8a2410]">
              Features
            </button>
          </div>
        )}
      </nav>

      {/* ── 2. HERO PHOTO SLIDESHOW & STATS ROW ─────────────────────────────── */}
      <HeroSlideshow onOpenTrackModal={() => setTrackModalOpen(true)} />

      {/* ── 3. CATEGORY MARQUEE BANNER ──────────────────────────────────────── */}
      <ScrollReveal>
        <section id="categories" className="w-full bg-[#ffc20e] text-[#4a1208] py-4 border-y-2 border-[#4a1208]/15 overflow-hidden shadow-inner">
          <div className="animate-marquee-continuous flex items-center gap-4">
            {[...categories, ...categories, ...categories].map((cat, idx) => (
              <div
                key={idx}
                className="px-5 py-2 rounded-full bg-white text-[#4a1208] text-xs font-black uppercase tracking-wider border border-[#4a1208]/10 shadow-xs whitespace-nowrap hover:bg-[#8a2410] hover:text-white transition-colors cursor-pointer"
              >
                {cat}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── 4. FEATURES SECTION ("Built so nothing slips through") ──────────── */}
      <section id="features" className="py-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8a2410] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200">
              System Capabilities
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-heading-playfair text-slate-900 tracking-tight">
              Built so nothing slips through
            </h3>
            <p className="text-base text-slate-600 max-w-2xl mx-auto font-normal">
              From automated department routing to real-time status updates and identity protection, ResolveHub ensures every issue gets prompt, verified action.
            </p>
          </div>
        </ScrollReveal>

        {/* 6 Responsive Cards Grid with Left-to-Right Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: 'Easy Complaint Submission',
              desc: 'File grievances in under 60 seconds with location selection, image attachments, and priority tagging.'
            },
            {
              icon: Zap,
              title: 'Smart Categorization',
              desc: 'AI-assisted routing ensures your ticket reaches the exact responsible department without delays.'
            },
            {
              icon: Lock,
              title: 'Confidential Reporting',
              desc: 'Shield your identity when submitting anti-ragging or student welfare concerns with anonymous mode.'
            },
            {
              icon: Activity,
              title: 'Real-Time Tracking',
              desc: 'Watch your grievance move through Submitted, Assigned, In Progress, and Resolved with live timestamps.'
            },
            {
              icon: Building2,
              title: 'Department Routing',
              desc: 'Direct dispatch to HODs, Hostel Wardens, Exam Cell officers, and Estate Maintenance engineers.'
            },
            {
              icon: Clock,
              title: 'Timely SLA Resolution',
              desc: 'Automated 3-day SLA timers trigger auto-escalation to department heads if unresolved.'
            }
          ].map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <ScrollReveal key={idx} delayMs={idx * 100}>
                <div className="p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:border-[#8a2410] hover:shadow-xl hover:shadow-[#8a2410]/10 transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer h-full">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#8a2410] flex items-center justify-center mb-6 group-hover:bg-[#8a2410] group-hover:text-white group-hover:rotate-6 transition-all duration-300 shadow-xs">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900 font-heading-playfair mb-3 group-hover:text-[#8a2410] transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── 5. HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto bg-stone-100/60 rounded-3xl border border-stone-200/60 my-8">
        <ScrollReveal>
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b3a6b] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
              Step-by-Step Workflow
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-heading-playfair text-slate-900 tracking-tight">
              How It Works
            </h3>
            <p className="text-base text-slate-600 max-w-xl mx-auto font-normal">
              Transparent four-stage process connecting students directly with university administration.
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Step Sequence Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-10 left-16 right-16 h-1 bg-stone-300 -z-0">
            <div
              className="h-full bg-[#ffc20e] transition-all duration-1000 ease-out origin-left"
              style={{ transform: lineDrawn ? 'scaleX(1)' : 'scaleX(1)' }}
            ></div>
          </div>

          {[
            { num: '1', title: 'Submit Concern', desc: 'Pick a category, describe the issue, and attach photo proof if available.' },
            { num: '2', title: 'Auto-Route', desc: 'System automatically assigns ticket to the concerned department office.' },
            { num: '3', title: 'Track Progress', desc: 'Receive real-time progress updates & technician inspection remarks.' },
            { num: '4', title: 'Resolved & Signed', desc: 'Issue is fixed, verified by student, and closed with SLA confirmation.' }
          ].map((step, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 100}>
              <div className="relative z-10 text-center space-y-4 group">
                <div className="w-20 h-20 rounded-full bg-[#ffc20e] text-[#4a1208] font-black text-2xl font-heading-playfair flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-white ring-2 ring-[#ffc20e]/40">
                  {step.num}
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 font-heading-playfair group-hover:text-[#8a2410] transition-colors">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-normal">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}

        </div>
      </section>

      {/* ── 6. CONFIDENTIALITY BANNER ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="w-full bg-gradient-to-r from-[#0b3a6b] to-[#1e40af] text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
                <Lock className="w-3.5 h-3.5" /> Anonymous Protection Active
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-heading-playfair">
                Your identity stays protected
              </h3>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                Anti-ragging, safety, and student welfare grievances can be filed in 100% Anonymous Mode. Your registration number and student name are completely shielded from department staff and go directly to the Anti-Ragging Committee and the Dean of Student Welfare.
              </p>
            </div>

            <div className="lg:col-span-4 bg-white text-slate-900 p-6 rounded-2xl shadow-xl space-y-4 border border-blue-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0b3a6b] flex items-center gap-2 border-b border-stone-100 pb-3">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Emergency Helplines
              </h4>
              
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-800 block">Anti-Ragging Committee</span>
                  <a href="tel:+918632344700" className="text-[#0b3a6b] font-black flex items-center gap-1 mt-1 hover:underline">
                    <PhoneCall className="w-3.5 h-3.5" /> +91-863-2344700
                  </a>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-slate-800 block">Dean Student Welfare (DSW)</span>
                  <a href="tel:+918632344710" className="text-[#0b3a6b] font-black flex items-center gap-1 mt-1 hover:underline">
                    <PhoneCall className="w-3.5 h-3.5" /> +91-863-2344710
                  </a>
                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* ── 7. CLOSING CTA STRIP ────────────────────────────────────────────── */}
      <ScrollReveal>
        <section className="w-full bg-[#ffc20e] text-[#4a1208] py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black font-heading-playfair">
                Have a concern? Raise it now.
              </h3>
              <p className="text-xs sm:text-sm font-bold opacity-90 mt-1">
                Submit your complaint directly to campus administration in under 2 minutes.
              </p>
            </div>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-3.5 bg-[#4a1208] hover:bg-[#8a2410] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-xl transition-all transform hover:scale-105 cursor-pointer shrink-0"
            >
              Portal Login & Submit
            </button>
          </div>
        </section>
      </ScrollReveal>

      {/* ── 8. UNIVERSAL FOOTER ─────────────────────────────────────────────── */}
      <Footer />

      {/* ── 9. PUBLIC COMPLAINT TRACK MODAL ─────────────────────────────────── */}
      {trackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-slide-up">
            
            <button
              onClick={() => { setTrackModalOpen(false); setTrackResult(null); setTrackError(null); }}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#8a2410] bg-rose-50 px-3 py-1 rounded-full">
                Public Status Lookup
              </span>
              <h3 className="text-2xl font-extrabold font-heading-playfair text-slate-900">
                Track Complaint Progress
              </h3>
              <p className="text-xs text-slate-500">
                Enter your reference ticket ID (e.g., #RH-1002) to check basic status updates. Student identities remain confidential.
              </p>
            </div>

            <form onSubmit={handlePublicTrack} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={trackInputId}
                  onChange={(e) => setTrackInputId(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. RH-1002)"
                  required
                  className="w-full px-4 py-3 text-sm bg-stone-50 rounded-xl border border-stone-300 focus:bg-white focus:border-[#8a2410] outline-none font-mono"
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="absolute right-2 top-2 bottom-2 px-5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {trackLoading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {trackError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {/* Public Safe Result Display */}
            {trackResult && (
              <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span className="font-mono font-bold text-[#8a2410] text-sm">{trackResult.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                    {trackResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <p><strong className="text-slate-900">Category:</strong> {trackResult.category}</p>
                  <p><strong className="text-slate-900">Department:</strong> {trackResult.department}</p>
                  <p><strong className="text-slate-900">Assigned Desk:</strong> {trackResult.assignedTo}</p>
                  <p><strong className="text-slate-900">Urgency:</strong> {trackResult.urgency}</p>
                </div>

                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Public Timeline History
                  </span>
                  {trackResult.timeline.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      <div className="w-2 h-2 rounded-full bg-[#8a2410] mt-1 shrink-0"></div>
                      <div>
                        <span className="font-bold text-slate-800">{t.status}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[10px]">{t.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
