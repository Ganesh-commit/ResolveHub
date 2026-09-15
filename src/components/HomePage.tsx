import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users, 
  FilePlus, 
  Search, 
  MessageSquare, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Lock, 
  Building2, 
  Wifi, 
  BookOpen, 
  Home as HomeIcon, 
  Wrench, 
  Bus, 
  Sparkles, 
  ShieldAlert, 
  HeartHandshake, 
  Bell, 
  Calendar, 
  FileText,
  GraduationCap
} from 'lucide-react';
import { CivicCommunityBg } from './CivicCommunityBg';
import { useResolveHub } from '../context/ResolveHubContext';
import { BTECH_DEPARTMENTS } from '../data/complaintCategories';

export const HomePage: React.FC = () => {
  const { 
    setActiveView, 
    complaints, 
    studentsList, 
    userLoggedIn, 
    setIsLoginModalOpen
  } = useResolveHub();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Compute dynamic stats from backend context
  const totalSubmitted = complaints?.length || 42;
  const totalResolved = complaints?.filter(c => c.status?.toUpperCase() === 'RESOLVED')?.length || 38;
  const activeDepartmentsCount = BTECH_DEPARTMENTS?.length || 8;
  const studentsCount = studentsList?.length ? `${studentsList.length}+` : '1,450+';

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

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

  return (
    <div className="w-full bg-[#faf8f5] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (100vh Viewport Landing)                                   */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-64px)] pt-4 pb-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden bg-[#faf8f5] border-b border-stone-200/60">
        
        {/* Background Illustrated Community Environment */}
        <CivicCommunityBg />

        {/* Subtle Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/50 via-[#faf8f5]/20 to-[#faf8f5]/90 pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center py-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Side Feature Badges */}
            <div className="hidden lg:flex lg:col-span-3 flex-col space-y-3.5">
              
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    CONFIDENTIAL & SAFE
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Protected student identity & welfare
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    REAL-TIME TRACKING
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Step-by-step resolution status
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    DIRECT DEPT ACTION
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Assigned directly to head officials
                  </p>
                </div>
              </div>

            </div>

            {/* Center Column: Hero Headline & Action Card */}
            <div className="lg:col-span-6 text-center flex flex-col items-center">
              
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-extrabold tracking-wider uppercase mb-3 border border-emerald-300/60 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>RESOLVEHUB • COMPLAINT MANAGEMENT SYSTEM</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12] font-heading">
                How can the University <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-700 bg-clip-text text-transparent">
                  help you today?
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed font-medium">
                Submit your campus issues, track resolution progress with college administration, and get timely solutions — all in one centralized student portal.
              </p>



            </div>

            {/* Right Column: Side Feature Badges */}
            <div className="hidden lg:flex lg:col-span-3 flex-col space-y-3.5">
              
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    STUDENT VOICE MATTERS
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Empowering every campus student
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    CAMPUS IMPROVEMENT
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Data-driven university upgrades
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/70 shadow-xs transition-all duration-200 hover:shadow-md hover:bg-white">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <HeartHandshake className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase">
                    ZERO RAGGING POLICY
                  </h4>
                  <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                    Immediate anti-ragging response
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHY RESOLVEHUB? SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              MISSION & PURPOSE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Why ResolveHub for Our Campus?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              ResolveHub bridges the communication gap between university students and campus administration, replacing slow manual paperwork with a modern, transparent digital portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4 shadow-xs group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Direct Administrative Accountability</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Complaints are assigned directly to verified Department Heads (CSE, ECE, Mech, Civil, IT) and audited by Super Admin for timely SLA completion.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold mb-4 shadow-xs group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Real-Time Progress Visibility</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Students can track exactly when a complaint is Pending, Under Review, In Progress, or Resolved with official remarks and timestamps.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold mb-4 shadow-xs group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Confidential & Protected</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Sensitive welfare and anti-ragging issues are handled with strict privacy protocols, protecting student well-being at all times.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHAT YOU CAN DO SECTION (Interactive Portal Features)                  */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#faf8f5] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-indigo-700 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
              STUDENT SERVICES PORTAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              What You Can Do on ResolveHub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Explore key features designed to give you seamless control over your campus grievance lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Report Complaint */}
            <div 
              onClick={handleReportCta}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FilePlus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Report a Complaint
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Submit detailed campus issues with registration number, category, location, and mandatory photo/document proof.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Submit Issue Now</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Track Status */}
            <div 
              onClick={handleTrackCta}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                  Track Complaint Status
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Enter your unique Complaint ID (e.g. #HUB-8492) to view instant live status, audit remarks, and assigned agent details.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-sky-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Track Live Progress</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: My Complaints */}
            <div 
              onClick={() => {
                if (!userLoggedIn) setIsLoginModalOpen(true);
                else setActiveView('my-complaints');
              }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  My Complaints History
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Log in as a student to view all past complaints you have raised, check resolution remarks, and filter by status.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>View Personal History</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Real-time Notifications */}
            <div 
              onClick={() => {
                if (!userLoggedIn) setIsLoginModalOpen(true);
                else setActiveView('student_dashboard');
              }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Alerts & Notifications
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Receive real-time bell notifications and dashboard alerts the moment an admin updates your complaint status.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-amber-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Check Notifications</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 5: Knowledge Base & FAQ */}
            <div 
              onClick={() => setActiveView('faq')}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                  Help & FAQs
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Find quick answers to common questions regarding department guidelines, submission policies, and helpline contacts.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-teal-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Browse FAQ Guide</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 6: Student Feedback */}
            <div 
              onClick={() => {
                const feedbackElem = document.getElementById('testimonials-section');
                if (feedbackElem) feedbackElem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                  Student Feedback
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Read authentic feedback from fellow students on resolved issues and administrative performance.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-rose-700 gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Read Student Voice</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS SECTION (4-Step Timeline Flow)                            */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              TRANSPARENT PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              How ResolveHub Works (4 Simple Steps)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              From submission to final resolution, every step is tracked digitally with full transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-emerald-200 via-sky-200 via-indigo-200 to-purple-200 -translate-y-8 z-0" />

            {/* Step 1 */}
            <div className="relative z-10 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-emerald-700/20">
                1
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">1. Submit Complaint</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Log in with student credentials, select department & category, and attach mandatory photo proof.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sky-700 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-sky-700/20">
                2
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">2. Admin Review</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Super Admin & Department Admins verify the issue details and assign an action team officer.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-700 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-indigo-700/20">
                3
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">3. Department Action</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Campus maintenance or academic staff inspect the site, fix the problem, and submit completion proof.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-700 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-purple-700/20">
                4
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">4. Resolution & Alert</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Complaint is marked Resolved, official remarks are attached, and notification is sent to student.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COMPLAINT CATEGORIES SECTION                                            */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#faf8f5] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-teal-700 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80">
              CAMPUS DEPARTMENTS & SCOPE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Supported Complaint Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              ResolveHub handles issues across all key university divisions with dedicated department handlers.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Academic Issues</h4>
              <p className="text-[11px] text-slate-500 mt-1">Syllabus, exams, lab access & grades</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HomeIcon className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Hostel & Housing</h4>
              <p className="text-[11px] text-slate-500 mt-1">Room maintenance, water & mess food</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Wifi className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Wi-Fi & Internet</h4>
              <p className="text-[11px] text-slate-500 mt-1">Hostel Wi-Fi, lab network & speed</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Wrench className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Infrastructure</h4>
              <p className="text-[11px] text-slate-500 mt-1">Classroom AC, fans, benches & lights</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bus className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Transport & Parking</h4>
              <p className="text-[11px] text-slate-500 mt-1">Bus routes, timings & vehicle parking</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Cleanliness & Sanitation</h4>
              <p className="text-[11px] text-slate-500 mt-1">Restroom hygiene & campus litter</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Security & Safety</h4>
              <p className="text-[11px] text-slate-500 mt-1">Campus guards, ID checks & night safety</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col items-center text-center group">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HeartHandshake className="w-5.5 h-5.5" />
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">Student Welfare</h4>
              <p className="text-[11px] text-slate-500 mt-1">Anti-ragging, counseling & support</p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TRANSPARENT COMPLAINT TRACKING TIMELINE SECTION                        */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              AUDIT STAGE TIMELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Transparent Complaint Status Stages
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Every submitted grievance passes through 5 clear stages, eliminating hidden delays or lost complaints.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              
              {/* Stage 1 */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-amber-200 shadow-2xs">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                  STAGE 1
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-2">PENDING</h4>
                <p className="text-[11px] text-slate-500 mt-1">Ticket registered & ID generated</p>
              </div>

              {/* Stage 2 */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-sky-200 shadow-2xs">
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase">
                  STAGE 2
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-2">UNDER REVIEW</h4>
                <p className="text-[11px] text-slate-500 mt-1">Department Admin assigned</p>
              </div>

              {/* Stage 3 */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-indigo-200 shadow-2xs">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                  STAGE 3
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-2">IN PROGRESS</h4>
                <p className="text-[11px] text-slate-500 mt-1">Field action & work in progress</p>
              </div>

              {/* Stage 4 */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-emerald-200 shadow-2xs">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  STAGE 4
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-2">RESOLVED</h4>
                <p className="text-[11px] text-slate-500 mt-1">Issue fixed & student notified</p>
              </div>

              {/* Stage 5 */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-purple-200 shadow-2xs">
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                  STAGE 5
                </span>
                <h4 className="text-xs font-extrabold text-slate-900 mt-2">CLOSED</h4>
                <p className="text-[11px] text-slate-500 mt-1">Verified & archived into log</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. UNIVERSITY AT A GLANCE STATISTICS SECTION (Connected to Context Data)    */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700/60">
              REAL-TIME BACKEND IMPACT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight font-heading">
              University Resolution at a Glance
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Empirical statistics calculated directly from our live university database.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                <FilePlus className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                {totalSubmitted}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">Complaints Submitted</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                {totalResolved}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">Issues Resolved</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                {activeDepartmentsCount}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">Active Departments</span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                {studentsCount}
              </span>
              <span className="text-xs text-slate-400 font-medium mt-1">Students Supported</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. RECENT CAMPUS UPDATES & NOTICES                                        */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-sky-700 uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
              CAMPUS ANNOUNCEMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Recent Campus Maintenance Updates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Stay informed about ongoing campus repairs, Wi-Fi upgrades, and student welfare notices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  COMPLETED
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" /> Sept 14, 2026
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Block C Hostel High-Speed Wi-Fi Upgrade</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Network department completed fiber optic cable installation across Block C hostel rooms, boosting speed to 200 Mbps.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full">
                  IN PROGRESS
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" /> Sept 15, 2026
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Central Library AC Maintenance</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Infrastructure team is servicing main reading hall air conditioners. Work expected to complete by tomorrow evening.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                  ANNOUNCEMENT
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" /> Sept 16, 2026
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Extended Evening Transport Buses</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Based on student feedback, two additional campus bus routes have been added for late-evening lab hours.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. STUDENT TESTIMONIALS & FEEDBACK SECTION                                 */}
      {/* ========================================================================= */}
      <section id="testimonials-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#faf8f5] border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-rose-700 uppercase bg-rose-50 px-3 py-1 rounded-full border border-rose-200/80">
              STUDENT TESTIMONIALS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Why Students Trust ResolveHub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Real resolution experiences shared by students across engineering departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Our lab Wi-Fi was disconnecting frequently during coding assignments. I submitted a complaint on ResolveHub with a screenshot of the connection log. Within 24 hours, the IT team replaced the router!"
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">B.Tech CSE Student</h4>
                  <span className="text-[11px] text-slate-500">Reg No: 241FA07***</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Resolved in 24h
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "The streetlight near Hostel Block B was flickering, making evening study walks uncomfortable. I logged a ticket and received SMS alerts as maintenance replaced the bulb. Fantastic portal!"
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">B.Tech ECE Student</h4>
                  <span className="text-[11px] text-slate-500">Reg No: 241FA08***</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Resolved in 18h
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "What I like most about ResolveHub is transparency. You don't have to chase office staff. Super Admin oversees every ticket and Department Heads respond with full audit notes."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">B.Tech Mech Student</h4>
                  <span className="text-[11px] text-slate-500">Reg No: 241FA09***</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified Audit
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FREQUENTLY ASKED QUESTIONS (Accordion)                                 */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight font-heading">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Everything you need to know about reporting, tracking, and resolution policies.
            </p>
          </div>

          <div className="space-y-4">
            
            {[
              {
                q: "How do I submit a new complaint on ResolveHub?",
                a: "Simply click 'REPORT A COMPLAINT' from the top menu or hero section. Sign in with your registered student credentials, select your B.Tech department and complaint category, describe the issue, attach a mandatory photo/document proof, and click Submit."
              },
              {
                q: "How can I track the live status of my complaint?",
                a: "Click 'TRACK STATUS' in the navigation bar or home page. Enter your unique Complaint ID (e.g. #HUB-8492) or search using your registration number to view the live status, assigned officer, and administrative remarks."
              },
              {
                q: "Who can see my complaint details?",
                a: "Your complaint details are accessible only by verified Super Admins and the designated Department Head (e.g., CSE Head for Computer Science issues). Your identity is protected under university privacy standards."
              },
              {
                q: "Why is photo or document proof mandatory for submitting a complaint?",
                a: "Mandatory photo/document proof ensures that maintenance teams can accurately identify physical damage, error messages, or location details before heading to the site, accelerating resolution times."
              },
              {
                q: "What happens after I submit a complaint?",
                a: "Once submitted, your complaint is automatically assigned a tracking ID and routed to the corresponding Department Admin. The department inspects the issue, updates the status to 'In Progress', and notifies you upon final resolution."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-slate-200/90 bg-slate-50/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. STRONG FINAL CTA BANNER SECTION                                       */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-extrabold tracking-wider uppercase mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BE A PART OF A BETTER CAMPUS</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Have a campus issue? Let your voice be heard.
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-3 max-w-xl mx-auto leading-relaxed">
            Report infrastructure, academic, or hostel issues in under 2 minutes and experience transparent administrative accountability.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReportCta}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs tracking-wider uppercase shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
            >
              <FilePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>REPORT A COMPLAINT NOW</span>
            </button>
            <button
              onClick={handleTrackCta}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-white font-extrabold text-xs tracking-wider uppercase border border-emerald-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>TRACK COMPLAINT STATUS</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
