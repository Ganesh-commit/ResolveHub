import React from 'react';
import { ResolveHubProvider, useResolveHub } from './context/ResolveHubContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { HeroSection } from './components/HeroSection';
import { DashboardSection } from './components/DashboardSection';
import { MyComplaintsSection } from './components/MyComplaintsSection';
import { TrackStatusSection } from './components/TrackStatusSection';
import { HelpFaqSection } from './components/HelpFaqSection';
import { LoginModal } from './components/LoginModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { ToastContainer } from './components/ToastContainer';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { DeptAdminDashboard } from './components/DeptAdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { Megaphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, setIsLoginModalOpen, authUser } = useResolveHub();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative overflow-x-hidden">
      
      {/* Fixed Top Navigation Bar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 w-full pt-16">
        {/* Role-based Dashboard Views */}
        {activeView === 'super_admin_dashboard' && <SuperAdminDashboard />}
        {activeView === 'dept_admin_dashboard' && <DeptAdminDashboard />}
        {activeView === 'student_dashboard' && <StudentDashboard />}

        {/* Public or Role-Scoped Main Dashboard View */}
        {activeView === 'dashboard' && (
          authUser?.role === 'super_admin' ? <SuperAdminDashboard /> :
          authUser?.role === 'dept_admin' ? <DeptAdminDashboard /> :
          authUser?.role === 'student' ? <StudentDashboard /> :
          <DashboardSection />
        )}

        {/* Public Views */}
        {activeView === 'home' && (
          authUser?.role === 'super_admin' ? <SuperAdminDashboard /> :
          authUser?.role === 'dept_admin' ? <DeptAdminDashboard /> :
          <HomePage />
        )}

        {activeView === 'report' && (
          authUser?.role === 'super_admin' ? <SuperAdminDashboard /> :
          authUser?.role === 'dept_admin' ? <DeptAdminDashboard /> :
          <HeroSection />
        )}

        {activeView === 'my-complaints' && <MyComplaintsSection />}
        {activeView === 'track' && <TrackStatusSection />}
        {activeView === 'faq' && <HelpFaqSection />}
      </main>

      {/* Global Modals & Notifications */}
      <LoginModal />
      <ComplaintDetailModal />
      <ToastContainer />
      <PushNotificationBanner />

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white pt-14 pb-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Logo & Vision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center font-bold">
                <Megaphone className="w-5 h-5 -rotate-12" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight font-heading">
                Resolve<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Complaint Management System — Super Admin, Department Admin & Student multi-role grievance resolution portal with real-time tracking.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ROLE-BASED ACCESS CONTROL (RBAC) OPERATIONAL</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Quick Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home Landing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('report')} className="hover:text-white transition-colors cursor-pointer">
                  Report an Issue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('track')} className="hover:text-white transition-colors cursor-pointer">
                  Track Complaint Status
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Support & Help</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors cursor-pointer">
                  Knowledge Base & FAQ
                </button>
              </li>
              <li>
                <button onClick={() => setIsLoginModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  Sign In / Login Modal
                </button>
              </li>
              <li>
                <span className="text-slate-400">Helpline: 1-800-RESOLVE</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 ResolveHub. Built with React, TypeScript & Tailwind CSS.
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>RBAC Security Standard</span>
          </div>
        </div>
      </footer>

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

