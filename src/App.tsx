import React from 'react';
import { ResolveHubProvider, useResolveHub } from './context/ResolveHubContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MyComplaintsSection } from './components/MyComplaintsSection';
import { TrackStatusSection } from './components/TrackStatusSection';
import { HelpFaqSection } from './components/HelpFaqSection';
import { NotificationsPage } from './components/NotificationsPage';
import { ProfileSettingsPage } from './components/ProfileSettingsPage';
import { LoginModal } from './components/LoginModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ToastContainer } from './components/ToastContainer';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { DeptAdminDashboard } from './components/DeptAdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AdvancedAIChatbot } from './components/AdvancedAIChatbot';
import { PublicLandingPage } from './components/PublicLandingPage';
import { AboutPage } from './components/AboutPage';
import { HomePage } from './components/HomePage';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, authUser } = useResolveHub();

  // 1. Render Public Animated Landing Page if user is unauthenticated on "/" or "home" / "dashboard"
  if (!authUser && (activeView === 'home' || activeView === 'dashboard' || activeView === 'landing')) {
    return (
      <div className="min-h-screen bg-[#faf7f4]">
        <PublicLandingPage />
        <LoginModal />
        <ComplaintDetailModal />
        <ToastContainer />
        <PushNotificationBanner />
        <AdvancedAIChatbot />
      </div>
    );
  }

  // 2. Render Public About Us Page if activeView is 'about'
  if (activeView === 'about') {
    return (
      <div className="min-h-screen bg-[#faf7f4]">
        <AboutPage />
        <LoginModal />
        <ComplaintDetailModal />
        <ToastContainer />
        <PushNotificationBanner />
        <AdvancedAIChatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 selection:bg-rose-100 selection:text-rose-950 font-sans relative flex flex-col">
      
      {/* 1. Sticky Horizontal Top Navbar */}
      <Navbar />

      {/* 2. Main Dashboard Content Area */}
      <div className="flex-1 flex flex-col w-full">
        
        <main className="flex-1 w-full animate-fade-in">
          
          {/* Profile & Account Settings */}
          {activeView === 'profile' && (
            <ProfileSettingsPage />
          )}

          {/* Notifications Center */}
          {activeView === 'notifications' && (
            <NotificationsPage />
          )}

          {/* Super Admin Dashboard Sub-views */}
          {(activeView === 'super_admin_dashboard' || activeView.startsWith('super_admin_')) && (
            <SuperAdminDashboard />
          )}

          {/* Dept Admin Dashboard Sub-views */}
          {(activeView === 'dept_admin_dashboard' || activeView.startsWith('dept_admin_')) && (
            <DeptAdminDashboard />
          )}

          {/* Student Dashboard */}
          {activeView === 'student_dashboard' && (
            <StudentDashboard />
          )}

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            authUser?.role === 'super_admin' ? <SuperAdminDashboard /> :
            authUser?.role === 'dept_admin' ? <DeptAdminDashboard /> :
            authUser?.role === 'student' ? <StudentDashboard /> :
            <PublicLandingPage />
          )}

          {/* Home View */}
          {activeView === 'home' && (
            authUser?.role === 'super_admin' ? <SuperAdminDashboard /> :
            authUser?.role === 'dept_admin' ? <DeptAdminDashboard /> :
            <HomePage />
          )}

          {/* Grievance Submission Form */}
          {activeView === 'report' && (
            <HeroSection />
          )}

          {/* Personal Submitted Complaints */}
          {activeView === 'my-complaints' && (
            <MyComplaintsSection />
          )}

          {/* Track Complaint Progress */}
          {activeView === 'track' && (
            <TrackStatusSection />
          )}

          {/* Knowledge Base & FAQ */}
          {activeView === 'faq' && (
            <HelpFaqSection />
          )}

        </main>

        {/* Global Modals & System Overlays */}
        <LoginModal />
        <ComplaintDetailModal />
        <ToastContainer />
        <PushNotificationBanner />
        <AdvancedAIChatbot />

        {/* Production Footer */}
        <footer className="w-full bg-slate-900 text-white pt-10 pb-6 border-t border-slate-800 mt-12">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8B2414] text-white flex items-center justify-center font-bold text-sm">
                V
              </div>
              <span className="text-lg font-extrabold tracking-tight font-heading">
                Vignan <span className="text-amber-400">ResolveHub</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-sans">
              <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors cursor-pointer">
                Portal Home
              </button>
              <button onClick={() => setActiveView('report')} className="hover:text-white transition-colors cursor-pointer">
                Submit Grievance
              </button>
              <button onClick={() => setActiveView('track')} className="hover:text-white transition-colors cursor-pointer">
                Track Status
              </button>
              <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors cursor-pointer">
                Help & FAQ
              </button>
              {!!authUser && (
                <button onClick={() => setActiveView('profile')} className="hover:text-white text-amber-300 transition-colors cursor-pointer">
                  My Profile
                </button>
              )}
            </div>

          </div>

          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div>
              © 2026 Vignan Foundation for Science, Technology & Research (Deemed to be University).
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ENTERPRISE RBAC MANAGEMENT SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default function App() {
  return (
    <ResolveHubProvider>
      <AppContent />
    </ResolveHubProvider>
  );
}
