import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  BarChart3, 
  Bell, 
  Activity, 
  Settings, 
  Clock, 
  Users, 
  FilePlus, 
  Search, 
  HelpCircle, 
  User, 
  Home, 
  LogIn, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import type { ViewMode } from '../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { 
    activeView, 
    setActiveView, 
    userLoggedIn, 
    authUser, 
    logoutUser, 
    notifications,
    setIsLoginModalOpen,
    complaints,
    signupRequests
  } = useResolveHub();

  const userUnreadCount = notifications.filter(n => !n.read).length;
  const pendingCount = complaints.filter(c => ['new', 'submitted', 'under review'].includes(c.status.toLowerCase())).length;
  const pendingSignupsCount = signupRequests.filter(r => r.status === 'PENDING').length;

  const handleNavClick = (view: ViewMode) => {
    if (view === 'login') {
      setIsLoginModalOpen(true);
      setMobileOpen(false);
      return;
    }

    setActiveView(view);
    setMobileOpen(false);

    // Smooth scroll if section exists
    const elem = document.getElementById(`section-${view}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Get Role-Specific Navigation Menu Items
  const getNavItems = () => {
    if (authUser?.role === 'super_admin') {
      return [
        { label: 'Dashboard', view: 'super_admin_dashboard' as ViewMode, icon: LayoutDashboard },
        { label: 'All Complaints', view: 'super_admin_complaints' as ViewMode, icon: FileText, badge: pendingCount > 0 ? pendingCount : undefined },
        { label: 'Departments', view: 'super_admin_departments' as ViewMode, icon: Building2 },
        { label: 'Students', view: 'super_admin_students' as ViewMode, icon: GraduationCap, badge: pendingSignupsCount > 0 ? pendingSignupsCount : undefined },
        { label: 'Department Admins', view: 'super_admin_admins' as ViewMode, icon: UserCheck },
        { label: 'Access & Roles', view: 'super_admin_roles' as ViewMode, icon: ShieldCheck },
        { label: 'Analytics & Reports', view: 'super_admin_analytics' as ViewMode, icon: BarChart3 },
        { label: 'Notifications', view: 'notifications' as ViewMode, icon: Bell, badge: userUnreadCount > 0 ? userUnreadCount : undefined },
        { label: 'Audit Logs', view: 'super_admin_audit' as ViewMode, icon: Activity },
        { label: 'System Settings', view: 'super_admin_settings' as ViewMode, icon: Settings },
      ];
    }

    if (authUser?.role === 'dept_admin') {
      return [
        { label: 'Dashboard', view: 'dept_admin_dashboard' as ViewMode, icon: LayoutDashboard },
        { label: 'Department Complaints', view: 'dept_admin_complaints' as ViewMode, icon: FileText, badge: pendingCount > 0 ? pendingCount : undefined },
        { label: 'Assigned Complaints', view: 'dept_admin_assigned' as ViewMode, icon: Clock },
        { label: 'Students / Users', view: 'dept_admin_students' as ViewMode, icon: Users },
        { label: 'Analytics & Reports', view: 'dept_admin_analytics' as ViewMode, icon: BarChart3 },
        { label: 'Notifications', view: 'notifications' as ViewMode, icon: Bell, badge: userUnreadCount > 0 ? userUnreadCount : undefined },
        { label: 'Profile & Settings', view: 'settings' as ViewMode, icon: Settings },
      ];
    }

    if (authUser?.role === 'student' || userLoggedIn) {
      return [
        { label: 'Dashboard', view: 'student_dashboard' as ViewMode, icon: LayoutDashboard },
        { label: 'Submit Complaint', view: 'report' as ViewMode, icon: FilePlus },
        { label: 'My Complaints', view: 'my-complaints' as ViewMode, icon: FileText },
        { label: 'Track Status', view: 'track' as ViewMode, icon: Search },
        { label: 'Notifications', view: 'notifications' as ViewMode, icon: Bell, badge: userUnreadCount > 0 ? userUnreadCount : undefined },
        { label: 'Help & FAQ', view: 'faq' as ViewMode, icon: HelpCircle },
        { label: 'Profile & Settings', view: 'settings' as ViewMode, icon: User },
      ];
    }

    return [
      { label: 'Home', view: 'home' as ViewMode, icon: Home },
      { label: 'Submit Complaint', view: 'report' as ViewMode, icon: FilePlus },
      { label: 'Track Status', view: 'track' as ViewMode, icon: Search },
      { label: 'Knowledge Base', view: 'faq' as ViewMode, icon: HelpCircle },
      { label: 'Portal Login', view: 'login' as ViewMode, icon: LogIn },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#8B2414] text-white select-none relative overflow-hidden shadow-2xl">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#9A2A18] via-[#8B2414] to-[#721c0e] pointer-events-none" />

      {/* Top Header: Logo & Branding */}
      <div className="relative z-10 p-4 border-b border-white/10 flex items-center justify-between">
        <div 
          onClick={() => handleNavClick(authUser?.role === 'super_admin' ? 'super_admin_dashboard' : authUser?.role === 'dept_admin' ? 'dept_admin_dashboard' : authUser?.role === 'student' ? 'student_dashboard' : 'home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white text-[#8B2414] flex items-center justify-center shadow-lg font-bold font-serif text-lg group-hover:scale-105 transition-transform flex-shrink-0">
            V
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight font-cinzel text-white">
                  VIGNAN'S
                </span>
                <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  RH
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-200 tracking-wider uppercase font-sans">
                ResolveHub Portal
              </span>
            </div>
          )}
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Menu Links */}
      <div className="relative z-10 flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeView === item.view;

          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.view)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer relative group ${
                isActive
                  ? 'bg-white text-[#8B2414] shadow-lg font-extrabold translate-x-0.5'
                  : 'text-amber-100/90 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-[#8B2414]' : 'text-amber-200/90'
              }`} />

              {!collapsed && (
                <span className="truncate flex-1 text-left tracking-wide">
                  {item.label}
                </span>
              )}

              {/* Badge Counter */}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono flex-shrink-0 ${
                  isActive ? 'bg-[#8B2414] text-white' : 'bg-amber-400 text-slate-950'
                } ${collapsed ? 'absolute top-1 right-1 px-1 py-0 text-[9px]' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User Quick Footer Card */}
      <div className="relative z-10 p-3 border-t border-white/10 bg-black/20">
        {userLoggedIn ? (
          <div className="flex items-center justify-between gap-2">
            <div 
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-white truncate">
                    {authUser?.name}
                  </span>
                  <span className="text-[10px] text-amber-200/80 font-mono capitalize truncate">
                    {authUser?.role.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={logoutUser}
                title="Sign Out"
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className={`w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              collapsed ? 'px-0' : ''
            }`}
          >
            <LogIn className="w-4 h-4" />
            {!collapsed && <span>PORTAL LOGIN</span>}
          </button>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside 
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
