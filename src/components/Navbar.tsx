import React, { useState } from 'react';
import { 
  Megaphone, 
  Bell, 
  User, 
  Menu, 
  X,
  LogOut,
  GraduationCap,
  ChevronDown,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import type { ViewMode } from '../types';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    unreadCount, 
    notifications, 
    markAllNotificationsAsRead, 
    markNotificationAsRead,
    setIsLoginModalOpen,
    setTrackQuery,
    userLoggedIn,
    authUser,
    logoutUser
  } = useResolveHub();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNavClick = (view: ViewMode) => {
    let targetView = view;
    if (authUser?.role === 'super_admin' && (view === 'home' || view === 'report')) {
      targetView = 'super_admin_dashboard';
    } else if (authUser?.role === 'dept_admin' && (view === 'home' || view === 'report')) {
      targetView = 'dept_admin_dashboard';
    }
    setActiveView(targetView);
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    setProfileDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Role-based navigation items
  const getNavItems = (): { label: string; view: ViewMode; isProminent?: boolean; icon?: any }[] => {
    if (authUser?.role === 'super_admin') {
      return [
        { label: 'SUPER ADMIN CONTROL', view: 'super_admin_dashboard', isProminent: true, icon: ShieldCheck },
        { label: 'ALL COMPLAINTS', view: 'super_admin_dashboard' },
        { label: 'HELP & FAQ', view: 'faq' }
      ];
    }

    if (authUser?.role === 'dept_admin') {
      return [
        { label: 'DEPT DASHBOARD', view: 'dept_admin_dashboard', isProminent: true, icon: Building2 },
        { label: 'DEPT COMPLAINTS', view: 'dept_admin_dashboard' },
        { label: 'HELP & FAQ', view: 'faq' }
      ];
    }

    if (authUser?.role === 'student' || userLoggedIn) {
      return [
        { label: 'HOME', view: 'home' },
        { label: 'REPORT COMPLAINT', view: 'report' },
        { label: 'STUDENT DASHBOARD', view: 'student_dashboard', isProminent: true, icon: GraduationCap },
        { label: 'MY COMPLAINTS', view: 'my-complaints' },
        { label: 'TRACK STATUS', view: 'track' },
        { label: 'HELP & FAQ', view: 'faq' }
      ];
    }

    return [
      { label: 'HOME', view: 'home' },
      { label: 'REPORT COMPLAINT', view: 'report' },
      { label: 'TRACK STATUS', view: 'track' },
      { label: 'HELP & FAQ', view: 'faq' }
    ];
  };

  const navItems = getNavItems();

  // User-scoped notifications filtering
  const userNotifications = notifications.filter(n => {
    if (!authUser) return true;
    if (authUser.role === 'student') {
      const activeReg = (authUser.regNo || authUser.username || '').toUpperCase();
      const regMatch = !n.targetRegNo || n.targetRegNo.toUpperCase() === activeReg;
      const roleMatch = !n.targetRole || n.targetRole === 'student' || n.targetRole === 'all';
      return regMatch && roleMatch;
    }
    if (authUser.role === 'super_admin' || authUser.role === 'dept_admin') {
      return !n.targetRegNo && (n.targetRole === 'super_admin' || n.targetRole === 'dept_admin' || n.targetRole === 'all' || !n.targetRole);
    }
    return true;
  });
  const userUnreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT SIDE LOGO & TAGLINE */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group py-1.5 select-none"
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform duration-200">
              <Megaphone className="w-4 h-4 -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                  Resolve<span className="text-indigo-600">Hub</span>
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-600 tracking-wider uppercase font-sans">
                Complaint Management System
              </span>
            </div>
          </div>

          {/* CENTER NAVIGATION (DESKTOP) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            {navItems.map((item) => {
              const isActive = activeView === item.view;

              if (item.isProminent) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.view)}
                    className={`px-3 py-1 text-[11px] font-bold tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 hover:bg-emerald-100'
                    }`}
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5" />}
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.view)}
                  className={`px-2.5 py-1 text-[11px] font-semibold tracking-wider transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-emerald-800 font-bold nav-link-active'
                      : 'text-slate-700 hover:text-emerald-700 nav-link-hover'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE: NOTIFICATION BELL & LOGIN PROFILE */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer relative"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {userUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pulse-badge ring-2 ring-white">
                    {userUnreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200/90 py-3 z-50 animate-slide-up">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-sm text-slate-900">Campus Alerts</span>
                      {userUnreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-extrabold rounded-full">
                          {userUnreadCount} new
                        </span>
                      )}
                    </div>
                    {userUnreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No active campus notifications.
                      </div>
                    ) : (
                      userNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.complaintId) {
                              setTrackQuery(n.complaintId);
                              setActiveView('track');
                              setNotifDropdownOpen(false);
                            }
                          }}
                          className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                            !n.read ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-rose-500' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                            {n.complaintId && (
                              <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Track {n.complaintId} →
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2 border-t border-stone-100 text-center">
                    <button
                      onClick={() => {
                        if (authUser?.role === 'super_admin') setActiveView('super_admin_dashboard');
                        else if (authUser?.role === 'dept_admin') setActiveView('dept_admin_dashboard');
                        else setActiveView('student_dashboard');
                        setNotifDropdownOpen(false);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-700"
                    >
                      Open Dashboard Overview
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Role Badge with Profile Dropdown */}
            {userLoggedIn && authUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-full border shadow-2xs transition-all cursor-pointer select-none font-mono ${
                    authUser.role === 'super_admin'
                      ? 'bg-indigo-900 text-white border-indigo-700'
                      : authUser.role === 'dept_admin'
                      ? 'bg-amber-100 text-amber-950 border-amber-300'
                      : 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  }`}
                >
                  {authUser.role === 'super_admin' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  ) : authUser.role === 'dept_admin' ? (
                    <Building2 className="w-4 h-4 text-amber-700" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                  )}
                  <span>
                    {authUser.role === 'super_admin'
                      ? 'Super Admin'
                      : authUser.role === 'dept_admin'
                      ? `Admin: ${authUser.department?.substring(0, 12)}...`
                      : authUser.regNo || authUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-2 z-50 animate-slide-up">
                    <div className="px-3.5 py-3 bg-stone-50 rounded-xl mb-1 border border-stone-100">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Authenticated Role: {authUser.role.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">
                        {authUser.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {authUser.regNo ? `Reg No: ${authUser.regNo}` : `Dept: ${authUser.department || 'All'}`}
                      </div>
                    </div>

                    {authUser.role === 'super_admin' && (
                      <button
                        onClick={() => handleNavClick('super_admin_dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-stone-50 rounded-lg cursor-pointer mb-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Super Admin Control Center</span>
                      </button>
                    )}

                    {authUser.role === 'dept_admin' && (
                      <button
                        onClick={() => handleNavClick('dept_admin_dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-stone-50 rounded-lg cursor-pointer mb-1"
                      >
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span>Department Control Panel</span>
                      </button>
                    )}

                    {authUser.role === 'student' && (
                      <button
                        onClick={() => handleNavClick('student_dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-stone-50 rounded-lg cursor-pointer mb-1"
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>Student Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logoutUser();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold tracking-wider px-5 py-2.5 rounded-full shadow-md shadow-emerald-900/20 btn-lift cursor-pointer"
              >
                <User className="w-4 h-4 text-emerald-200" />
                <span>SIGN IN / LOGIN</span>
              </button>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex items-center space-x-2 sm:hidden">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 text-slate-700 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b border-stone-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.view)}
              className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider rounded-xl transition-colors cursor-pointer ${
                activeView === item.view
                  ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700'
                  : 'text-slate-700 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2">
            {userLoggedIn && authUser ? (
              <button
                onClick={() => {
                  logoutUser();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-700 font-bold text-xs py-3 rounded-full border border-rose-200"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT ({authUser.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-800 text-white font-bold text-xs py-3 rounded-full shadow-md"
              >
                <User className="w-4 h-4" />
                SIGN IN / REGISTER ACCOUNT
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

