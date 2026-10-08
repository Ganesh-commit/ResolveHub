import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Lock, 
  Zap, 
  Activity, 
  UserCheck, 
  Users, 
  Bot,
  Menu,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { Footer } from './Footer';
import { ScrollReveal } from './ScrollReveal';

export const AboutPage: React.FC = () => {
  const { setIsLoginModalOpen, setActiveView } = useResolveHub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      
      {/* ── STICKY NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Badge */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer" 
            onClick={() => handleNavClick('home')}
          >
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

          {/* Desktop Center Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wide text-slate-700 uppercase">
            <button onClick={() => handleNavClick('home')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Home
            </button>
            <button onClick={() => handleNavClick('home')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              How It Works
            </button>
            <button onClick={() => handleNavClick('about')} className="landing-nav-link text-[#8a2410] font-black cursor-pointer border-b-2 border-[#8a2410] pb-0.5">
              About
            </button>
            <button onClick={() => handleNavClick('home')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Categories
            </button>
            <button onClick={() => handleNavClick('faq')} className="landing-nav-link hover:text-[#8a2410] cursor-pointer">
              Help & FAQ
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
            <button onClick={() => handleNavClick('home')} className="block w-full text-left py-2 hover:text-[#8a2410]">
              Home
            </button>
            <button onClick={() => handleNavClick('about')} className="block w-full text-left py-2 text-[#8a2410] font-black">
              About Us
            </button>
            <button onClick={() => handleNavClick('faq')} className="block w-full text-left py-2 hover:text-[#8a2410]">
              Help & FAQ
            </button>
            <button onClick={() => handleNavClick('login')} className="block w-full text-left py-2 text-[#8a2410] uppercase font-black">
              Portal Login
            </button>
          </div>
        )}
      </nav>

      {/* ── HEADER BANNER ───────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-[#4a1208] via-[#8a2410] to-[#0b3a6b] text-white py-14 border-b border-rose-950">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Vignan University Official Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading-playfair text-white tracking-tight">
            About ResolveHub
          </h1>
          <p className="text-sm sm:text-base text-rose-100/90 max-w-2xl font-normal">
            Empowering students and administration with transparent, SLA-backed, real-time grievance redressal across campus.
          </p>
        </div>
      </section>

      {/* ── SECTION 1: WHAT IS RESOLVEHUB? ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Explanation */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8a2410] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200">
                Platform Overview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading-playfair text-slate-900 tracking-tight">
                What is ResolveHub?
              </h2>
              
              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                <p>
                  <strong>ResolveHub</strong> is Vignan University's official online grievance resolution platform designed to streamline communication between students and university administration. Students can file issues across seven core campus sectors: <em>Academics, Hostel & Facilities, Transport, Examinations, Library, Finance & Scholarship, and Security</em>.
                </p>
                <p>
                  Every complaint filed in ResolveHub is automatically categorized, assigned to the exact responsible department officer, and tracked in real time through an interactive status timeline (<em>Submitted ➔ Assigned ➔ In Progress ➔ Resolved</em>).
                </p>
                <p>
                  If a grievance remains pending beyond its defined SLA deadline (standard 3 days), the system automatically escalates the issue to the Head of Department (HOD) and subsequently to the Dean, ensuring complete accountability and timely closure.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-[#8a2410]" /> Auto-Routing Engine
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
                  <Clock className="w-4 h-4 text-[#8a2410]" /> 3-Day SLA Escalation
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
                  <Lock className="w-4 h-4 text-[#8a2410]" /> Confidential Shield
                </div>
              </div>
            </div>

            {/* Right Column: Clean Icon Cluster Orbit Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-rose-50/80 border-2 border-rose-200/60 flex items-center justify-center p-8 shadow-inner">
                
                {/* Center Badge */}
                <div className="w-28 h-28 rounded-full bg-[#8a2410] text-white flex flex-col items-center justify-center text-center p-2 shadow-xl border-4 border-[#ffc20e] z-10">
                  <span className="text-2xl font-black font-heading-playfair">V</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ffc20e]">ResolveHub</span>
                </div>

                {/* Orbiting Feature Icons */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-[#8a2410] flex items-center gap-2 text-xs font-bold">
                  <FileText className="w-4 h-4 text-[#8a2410]" /> Submission
                </div>

                <div className="absolute top-1/4 right-0 translate-x-4 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-[#0b3a6b] flex items-center gap-2 text-xs font-bold">
                  <Building2 className="w-4 h-4 text-[#0b3a6b]" /> Routing
                </div>

                <div className="absolute bottom-1/4 right-0 translate-x-4 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-emerald-700 flex items-center gap-2 text-xs font-bold">
                  <Activity className="w-4 h-4 text-emerald-600" /> Real-Time Tracking
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-amber-700 flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#ffc20e]" /> SLA Resolution
                </div>

                <div className="absolute bottom-1/4 left-0 -translate-x-4 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-rose-700 flex items-center gap-2 text-xs font-bold">
                  <Lock className="w-4 h-4 text-rose-600" /> Confidentiality
                </div>

                <div className="absolute top-1/4 left-0 -translate-x-4 p-3 bg-white rounded-2xl shadow-md border border-stone-200 text-slate-800 flex items-center gap-2 text-xs font-bold">
                  <Bot className="w-4 h-4 text-[#8a2410]" /> AI Helper
                </div>

              </div>
            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* ── SECTION 2: WHAT DO WE DO? ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto bg-stone-100/70 rounded-3xl border border-stone-200/70 my-4">
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Graphic Illustration */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="text-xs font-black uppercase text-[#8a2410] tracking-wider">System Capabilities</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">ACTIVE</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">AI Auto-Categorization</span>
                      <span className="text-slate-500">Detects hostel, IT, academic categories instantly.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#8a2410] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">SLA Auto-Escalation</span>
                      <span className="text-slate-500">Auto-escalates to HOD after 3 days & Dean after 6 days.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">Identity Shielding</span>
                      <span className="text-slate-500">Anonymous reporting for anti-ragging & welfare issues.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Text List */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0b3a6b] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
                Core Functionalities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading-playfair text-slate-900 tracking-tight">
                What do we do?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-[#8a2410]" /> Easy Submission
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Submit detailed complaints in seconds with photo evidence and specific hostel room/campus location tagging.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4 text-amber-500" /> Smart Routing
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Intelligent category matching dispatches tickets directly to concerned department desks.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <Lock className="w-4 h-4 text-emerald-600" /> Anonymous Reporting
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Identity is 100% masked for sensitive anti-ragging, safety, or student welfare complaints.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-[#0b3a6b]" /> Admin Analytics
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    University leaders monitor campus-wide issue heatmaps and bottleneck resolution metrics.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>
      </section>

      {/* ── SECTION 3: WHO IS IT FOR? ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#8a2410] bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200">
              User Roles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading-playfair text-slate-900 tracking-tight">
              Who is it for?
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Tailored interfaces for every stakeholder in Vignan University.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Students Card */}
            <ScrollReveal delayMs={80}>
              <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-[#8a2410] hover:shadow-xl transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#8a2410] flex items-center justify-center font-bold group-hover:bg-[#8a2410] group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold font-heading-playfair text-slate-900">
                  Students
                </h3>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed font-normal">
                  <li>• Submit grievances across hostel, academics, IT & transport.</li>
                  <li>• Track live status stepper and SLA progress.</li>
                  <li>• Report anti-ragging or welfare issues anonymously.</li>
                  <li>• Re-open unresolved complaints if unsatisfied.</li>
                  <li>• Get instant answers from the integrated AI Helper.</li>
                </ul>
              </div>
            </ScrollReveal>

            {/* 2. Department Staff Card */}
            <ScrollReveal delayMs={160}>
              <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-[#0b3a6b] hover:shadow-xl transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0b3a6b] flex items-center justify-center font-bold group-hover:bg-[#0b3a6b] group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold font-heading-playfair text-slate-900">
                  Department Staff
                </h3>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed font-normal">
                  <li>• Receive auto-assigned ticket dispatches.</li>
                  <li>• Inspect campus sites & update field resolution notes.</li>
                  <li>• Manage department-specific complaint queues.</li>
                  <li>• Maintain SLA compliance within defined 3-day deadlines.</li>
                </ul>
              </div>
            </ScrollReveal>

            {/* 3. Administrators & HODs Card */}
            <ScrollReveal delayMs={240}>
              <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm hover:border-[#ffc20e] hover:shadow-xl transition-all space-y-4 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:bg-[#ffc20e] group-hover:text-[#4a1208] transition-colors">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold font-heading-playfair text-slate-900">
                  Administrators & HODs
                </h3>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed font-normal">
                  <li>• View university-wide Campus Issue Heatmaps.</li>
                  <li>• Review SLA breached & auto-escalated tickets.</li>
                  <li>• Configure department registries & category rules.</li>
                  <li>• Access audit logs & natural language analytics.</li>
                </ul>
              </div>
            </ScrollReveal>

          </div>
        </ScrollReveal>
      </section>

      {/* ── SECTION 4: OUR COMMITMENT ───────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 w-full max-w-[1800px] mx-auto">
        <ScrollReveal>
          <div className="w-full bg-[#8a2410] text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-4 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#ffc20e] bg-rose-950/60 px-4 py-1.5 rounded-full border border-rose-800">
              University Core Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading-playfair">
              Our Commitment
            </h2>
            <p className="text-sm sm:text-base text-rose-100 max-w-3xl mx-auto leading-relaxed font-normal">
              Vignan University is dedicated to absolute student confidentiality, timely resolution, and complete transparency. Every complaint filed through ResolveHub is treated with strict urgency and handled under enforced SLA guidelines.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ── UNIVERSAL FOOTER ────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
};
