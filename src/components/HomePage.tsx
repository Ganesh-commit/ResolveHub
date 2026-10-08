import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FilePlus, 
  ArrowRight, 
  GraduationCap,
  Tag,
  Lock,
  Wifi,
  Wrench,
  Bus,
  Sparkles,
  BookOpen,
  Home as HomeIcon,
  Heart,
  HelpCircle,
  Bell,
  FileText,
  ShieldCheck,
  Search,
  MessageSquare
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    id: 1,
    image: '/carousel/slide1.webp',
    title: 'Every Concern Heard. Every Complaint Resolved.',
    subtitle: 'Vignan Foundation for Science, Technology & Research — Grievance & Redressal Management Portal',
    tag: 'VIGNAN CAMPUS'
  },
  {
    id: 2,
    image: '/carousel/slide2.webp',
    title: 'Safe, Inclusive & Modern Learning Environment',
    subtitle: 'Dedicated to student welfare, rapid administrative action, and continuous campus development.',
    tag: 'HERITAGE & EXCELLENCE'
  }
];

export const HomePage: React.FC = () => {
  const { 
    setActiveView, 
    userLoggedIn, 
    setIsLoginModalOpen
  } = useResolveHub();

  // Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);

  // Tab State for News/Events Card
  const [activeCardTab, setActiveCardTab] = useState<'news' | 'events'>('news');

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (!isCarouselPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isCarouselPlaying, nextSlide]);

  const handleReportCta = () => {
    if (!userLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      setActiveView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTrackCta = () => {
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMyComplaintsCta = () => {
    if (!userLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      setActiveView('my-complaints');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#faf7f4] dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-rose-100 selection:text-rose-950 font-sans relative overflow-x-hidden space-y-16 pb-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH AUTO-SLIDING SLIDESHOW & QUICK ACCESS CARD             */}
      {/* ========================================================================= */}
      <section 
        className="relative min-h-[580px] lg:min-h-[640px] w-full overflow-hidden bg-slate-950 text-white rounded-b-3xl shadow-xl"
        onMouseEnter={() => setIsCarouselPlaying(false)}
        onMouseLeave={() => setIsCarouselPlaying(true)}
      >
        {/* Background Slideshow Images */}
        <div className="absolute inset-0 z-0">
          {carouselSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-100 transition-transform duration-10000 ease-linear transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-slate-950/30" />
            </div>
          ))}
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-20 w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-12 min-h-[580px] lg:min-h-[640px] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Title & Key Highlights */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffc20e] text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                <GraduationCap className="w-4 h-4 text-[#8a2410]" />
                <span>RESOLVEHUB • VIGNAN UNIVERSITY GRIEVANCE PORTAL</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-heading-playfair leading-[1.15] text-white drop-shadow-md">
                Every Concern Heard. <br />
                <span className="text-[#ffc20e]">Every Complaint Resolved.</span>
              </h1>

              {/* 6 Feature Quick Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div onClick={handleReportCta} className="flex items-start gap-3 group cursor-pointer bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8a2410] flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <FilePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-[#ffc20e] uppercase">
                      EASY COMPLAINT SUBMISSION
                    </h4>
                    <p className="text-[11px] text-stone-200 leading-snug font-medium">
                      Raise academic, hostel, or campus concerns in a few simple steps.
                    </p>
                  </div>
                </div>

                <div onClick={handleReportCta} className="flex items-start gap-3 group cursor-pointer bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8a2410] flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-[#ffc20e] uppercase">
                      SMART CATEGORIZATION
                    </h4>
                    <p className="text-[11px] text-stone-200 leading-snug font-medium">
                      Issues automatically route to the responsible department head.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group cursor-pointer bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8a2410] flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-[#ffc20e] uppercase">
                      CONFIDENTIAL REPORTING
                    </h4>
                    <p className="text-[11px] text-stone-200 leading-snug font-medium">
                      Your identity and complaint data are protected at all times.
                    </p>
                  </div>
                </div>

                <div onClick={handleTrackCta} className="flex items-start gap-3 group cursor-pointer bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 hover:bg-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#8a2410] flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-wider text-[#ffc20e] uppercase">
                      REAL-TIME TRACKING
                    </h4>
                    <p className="text-[11px] text-stone-200 leading-snug font-medium">
                      Follow every update from submission to final sign-off.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: "Choose ResolveHub" Action Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 text-slate-900 dark:text-white shadow-2xl border border-stone-200 dark:border-slate-700 space-y-4">
                
                <h3 className="text-2xl font-black font-heading-playfair text-[#8a2410] dark:text-amber-400 tracking-tight text-center">
                  Vignan Grievance Portal
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center font-medium">
                  Official multi-role grievance management portal. Empowering students with direct department routing, 100% confidentiality, and real-time SLA tracking.
                </p>

                <div className="pt-1 text-center">
                  <button
                    onClick={handleReportCta}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#8a2410] hover:bg-[#6c1b0c] text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg transition-all cursor-pointer group"
                  >
                    <span>Report a Complaint Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* News & Events Tabs */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-700">
                  <div className="flex bg-stone-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-bold mb-3">
                    <button
                      onClick={() => setActiveCardTab('news')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeCardTab === 'news' ? 'bg-[#8a2410] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Live Updates
                    </button>
                    <button
                      onClick={() => setActiveCardTab('events')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeCardTab === 'events' ? 'bg-[#8a2410] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Notice Board
                    </button>
                  </div>

                  {activeCardTab === 'news' ? (
                    <div className="space-y-2 text-xs text-left">
                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-slate-700/60 border border-amber-200/60 dark:border-slate-600">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Oct 07, 2026</span>
                          <span className="font-bold text-[#8a2410] dark:text-amber-400">GRIEVANCE SYSTEM</span>
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                          SLA Resolution rate reached 98.5% across all engineering departments.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-left">
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-700 border border-stone-200 dark:border-slate-600">
                        <span className="font-bold text-[#8a2410] dark:text-amber-400 text-[11px]">SLA Action Drive 2026</span>
                        <p className="text-slate-600 dark:text-slate-300 text-[10px] mt-0.5">All CSE and ECE campus facility issues resolved under 24 hours.</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-center">
                    <button
                      onClick={handleTrackCta}
                      className="w-full text-center py-1.5 px-4 rounded-full border border-[#8a2410] text-[#8a2410] dark:text-amber-400 dark:border-amber-400 hover:bg-[#8a2410] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Track Live Complaint →
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: MISSION & PURPOSE (Why ResolveHub for Our Campus?)          */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider border border-emerald-300/80">
            MISSION & PURPOSE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading-playfair tracking-tight">
            Why ResolveHub for Our Campus?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            ResolveHub bridges the communication gap between university students and campus administration, replacing slow manual paperwork with a modern, transparent digital portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Direct Administrative Accountability
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Complaints are assigned directly to verified Department Heads (CSE, ECE, Mech, Civil, IT) and audited by Super Admin for timely SLA completion.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-slate-700 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Real-Time Progress Visibility
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Students can track exactly when a complaint is Pending, Under Review, In Progress, or Resolved with official remarks and timestamps.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-colors space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-slate-700 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Confidential & Protected
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Sensitive welfare and anti-ragging issues are handled with strict privacy protocols, protecting student well-being at all times.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: STUDENT SERVICES PORTAL (What You Can Do on ResolveHub)    */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-950 text-[10px] font-black uppercase tracking-wider border border-indigo-300/80">
            STUDENT SERVICES PORTAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading-playfair tracking-tight">
            What You Can Do on ResolveHub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Explore key features designed to give you seamless control over your campus grievance lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Report a Complaint */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <FilePlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Report a Complaint</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Submit detailed campus issues with registration number, category, location, and mandatory photo/document proof.
              </p>
            </div>
            <button
              onClick={handleReportCta}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Submit Issue Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Track Complaint Status */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-slate-700 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Track Complaint Status</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enter your unique Complaint ID (e.g. #HUB-8492) to view instant live status, audit remarks, and assigned agent details.
              </p>
            </div>
            <button
              onClick={handleTrackCta}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Track Live Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: My Complaints History */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-slate-700 text-indigo-800 dark:text-indigo-300 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">My Complaints History</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Log in as a student to view all past complaints you have raised, check resolution remarks, and filter by status.
              </p>
            </div>
            <button
              onClick={handleMyComplaintsCta}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>View Personal History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Alerts & Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Alerts & Notifications</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Receive real-time bell notifications and dashboard alerts the moment an admin updates your complaint status.
              </p>
            </div>
            <button
              onClick={() => { setActiveView('notifications'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Check Notifications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 5: Help & FAQs */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-slate-700 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Help & FAQs</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Find quick answers to common questions regarding department guidelines, submission policies, and helpline contacts.
              </p>
            </div>
            <button
              onClick={() => { setActiveView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Browse FAQ Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 6: Student Feedback */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-slate-700 text-rose-800 dark:text-rose-300 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Student Feedback</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Read authentic feedback and transparent responses from department heads and campus leadership.
              </p>
            </div>
            <button
              onClick={() => { setActiveView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pt-2 text-xs font-black text-[#8a2410] dark:text-amber-400 flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <span>Read Student Voice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: TRANSPARENT PROCESS (How ResolveHub Works - 4 Steps)        */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider border border-emerald-300/80">
            TRANSPARENT PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading-playfair tracking-tight">
            How ResolveHub Works (4 Simple Steps)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            From submission to final resolution, every step is tracked digitally with full transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4 text-center relative">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">1. Submit Complaint</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Log in with student credentials, select department & category, and attach mandatory photo proof.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4 text-center relative">
            <div className="w-12 h-12 rounded-full bg-sky-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">2. Admin Review</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Super Admin & Department Admins verify the issue details and assign an action team officer.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4 text-center relative">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">3. Department Action</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Campus maintenance or academic staff inspect the site, fix the problem, and submit completion proof.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm space-y-4 text-center relative">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md">
              4
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">4. Resolution & Alert</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Complaint is marked Resolved, official remarks are attached, and notification is sent.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: CAMPUS DEPARTMENTS & SCOPE (Supported Categories)           */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-teal-100 text-teal-950 text-[10px] font-black uppercase tracking-wider border border-teal-300/80">
            CAMPUS DEPARTMENTS & SCOPE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading-playfair tracking-tight">
            Supported Complaint Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            ResolveHub handles issues across all key university divisions with dedicated department handlers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {[
            { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800', title: 'Academic Issues', desc: 'Syllabus, exams, lab access & grades' },
            { icon: HomeIcon, color: 'bg-amber-100 text-amber-900', title: 'Hostel & Housing', desc: 'Room maintenance, water & mess food' },
            { icon: Wifi, color: 'bg-sky-100 text-sky-800', title: 'Wi-Fi & Internet', desc: 'Hostel Wi-Fi, lab network & speed' },
            { icon: Wrench, color: 'bg-indigo-100 text-indigo-800', title: 'Infrastructure', desc: 'Classroom AC, fans, benches & lights' },
            { icon: Bus, color: 'bg-purple-100 text-purple-800', title: 'Transport & Parking', desc: 'Bus routes, timings & vehicle parking' },
            { icon: Sparkles, color: 'bg-teal-100 text-teal-800', title: 'Cleanliness & Sanitation', desc: 'Restroom hygiene & campus litter' },
            { icon: ShieldCheck, color: 'bg-rose-100 text-rose-800', title: 'Security & Safety', desc: 'Campus guards, ID checks & night safety' },
            { icon: Heart, color: 'bg-blue-100 text-blue-800', title: 'Student Welfare', desc: 'Anti-ragging, counseling & support' }
          ].map((cat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-stone-200/90 dark:border-slate-700 shadow-sm hover:border-[#8a2410] transition-all space-y-3">
              <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center font-bold`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">{cat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{cat.desc}</p>
            </div>
          ))}

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 5: TRANSPARENT COMPLAINT STATUS STAGES (AUDIT TIMELINE)        */}
      {/* ========================================================================= */}
      <section className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider border border-emerald-300/80">
            AUDIT STAGE TIMELINE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading-playfair tracking-tight">
            Transparent Complaint Status Stages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Every submitted grievance passes through 5 clear stages, eliminating hidden delays or lost complaints.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-stone-200/90 dark:border-slate-700 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {[
              { stage: 'Stage 1', name: 'Submitted', desc: 'Intake & Reg No Verification' },
              { stage: 'Stage 2', name: 'Under Review', desc: 'Department Admin Triage' },
              { stage: 'Stage 3', name: 'In Field Action', desc: 'Technician Dispatched' },
              { stage: 'Stage 4', name: 'Resolved & Signed', desc: 'Official Remarks Attached' },
              { stage: 'Stage 5', name: 'Closed', desc: 'Student Rating & Feedback' }
            ].map((stg, i) => (
              <div key={i} className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-700/50 border border-stone-200 dark:border-slate-600 space-y-1">
                <span className="text-[10px] font-black text-[#8a2410] dark:text-amber-400 uppercase tracking-wider">{stg.stage}</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">{stg.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{stg.desc}</p>
              </div>
            ))}

          </div>
        </div>

      </section>

    </div>
  );
};
