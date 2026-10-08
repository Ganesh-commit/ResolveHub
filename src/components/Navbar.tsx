import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  ListFilter, 
  Search, 
  HelpCircle, 
  Bell, 
  Moon, 
  Sun, 
  Bot, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  BarChart3, 
  Building2, 
  Users, 
  UserCog, 
  Key, 
  FileText, 
  Settings,
  CheckCircle2,
  Inbox,
  BookOpen,
  Home,
  GraduationCap
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';

export const Navbar: React.FC = () => {
  const { 
    authUser, 
    activeView, 
    setActiveView, 
    logoutUser, 
    notifications, 
    unreadCount, 
    markAllNotificationsAsRead, 
    markNotificationAsRead,
    setIsLoginModalOpen
  } = useResolveHub();

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Dropdown States
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const manageRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (manageRef.current && !manageRef.current.contains(e.target as Node)) {
        setManageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: any) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setManageDropdownOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStudent = authUser?.role === 'student' || !authUser;
  const isAdmin = authUser?.role === 'super_admin' || authUser?.role === 'dept_admin';
  const isSuperAdmin = authUser?.role === 'super_admin';

  // Check active state helpers
  const isManageActive = activeView.startsWith('super_admin_departments') || activeView.startsWith('super_admin_students') || activeView.startsWith('super_admin_admins') || activeView.startsWith('super_admin_roles') || activeView.startsWith('dept_admin_students');

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between">
        
        {/* ── Left: Brand Logo & Badge ───────────────────────────────────── */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleNavClick(isAdmin ? (isSuperAdmin ? 'super_admin_dashboard' : 'dept_admin_dashboard') : 'student_dashboard')}
        >
          <div className="w-10 h-10 rounded-full bg-[#8a2410] text-white flex items-center justify-center font-black text-xl border-2 border-[#ffc20e] shadow-md transform hover:scale-105 transition-transform">
            V
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-heading-playfair leading-none flex items-center gap-1.5 whitespace-nowrap">
              Vignan's <span className="text-[#8a2410] dark:text-amber-400">ResolveHub</span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-md text-[9px] bg-amber-400/20 text-[#8a2410] dark:text-amber-300 border border-amber-400/40 uppercase font-extrabold tracking-wider shrink-0 whitespace-nowrap">
                  {isSuperAdmin ? 'Super Admin' : 'Dept Admin'}
                </span>
              )}
            </h1>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
              Grievance Resolution Portal
            </p>
          </div>
        </div>

        {/* ── Center: Horizontal Nav Links (Desktop) ──────────────────────── */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold tracking-wide">
          {isStudent ? (
            <>
              {/* Student Navigation Links */}
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'home' || activeView === 'landing'
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavClick('report')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'report' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>Report Complaint</span>
              </button>

              <button
                onClick={() => handleNavClick('student_dashboard')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'student_dashboard' || activeView === 'dashboard'
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('my-complaints')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'my-complaints' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>My Complaints</span>
              </button>

              <button
                onClick={() => handleNavClick('track')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'track' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Track Status</span>
              </button>

              <button
                onClick={() => handleNavClick('faq')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'faq' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help & FAQ</span>
              </button>
            </>
          ) : isSuperAdmin ? (
            <>
              {/* Super Admin Navigation Links */}
              <button
                onClick={() => handleNavClick('super_admin_dashboard')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'super_admin_dashboard' || activeView === 'dashboard' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('super_admin_complaints')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'super_admin_complaints' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>All Complaints</span>
              </button>

              <button
                onClick={() => handleNavClick('super_admin_analytics')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'super_admin_analytics' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Reports</span>
              </button>

              {/* Manage Dropdown */}
              <div className="relative" ref={manageRef}>
                <button
                  onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                  className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isManageActive 
                      ? 'bg-[#8a2410] text-white shadow-sm' 
                      : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Manage</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {manageDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold animate-slide-down">
                    <button
                      onClick={() => handleNavClick('super_admin_departments')}
                      className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/60 hover:text-[#8a2410] flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-amber-500" /> Departments
                    </button>
                    <button
                      onClick={() => handleNavClick('super_admin_students')}
                      className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/60 hover:text-[#8a2410] flex items-center gap-2"
                    >
                      <Users className="w-4 h-4 text-blue-500" /> Students List
                    </button>
                    <button
                      onClick={() => handleNavClick('super_admin_admins')}
                      className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/60 hover:text-[#8a2410] flex items-center gap-2"
                    >
                      <UserCog className="w-4 h-4 text-emerald-500" /> Department Admins
                    </button>
                    <button
                      onClick={() => handleNavClick('super_admin_roles')}
                      className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-700/60 hover:text-[#8a2410] flex items-center gap-2"
                    >
                      <Key className="w-4 h-4 text-purple-500" /> Access & Roles
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('super_admin_audit')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'super_admin_audit' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Audit Logs</span>
              </button>

              <button
                onClick={() => handleNavClick('super_admin_settings')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView.includes('settings') 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>System Settings</span>
              </button>
            </>
          ) : (
            <>
              {/* Department Admin Navigation Links */}
              <button
                onClick={() => handleNavClick('dept_admin_dashboard')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_dashboard' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('dept_admin_inbox')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_inbox' || activeView === 'dept_admin_complaints' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
              </button>

              <button
                onClick={() => handleNavClick('dept_admin_team')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_team' || activeView === 'dept_admin_students' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>

              <button
                onClick={() => handleNavClick('dept_admin_analytics')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_analytics' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => handleNavClick('dept_admin_kb')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_kb' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Base</span>
              </button>

              <button
                onClick={() => handleNavClick('dept_admin_notifications')}
                className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'dept_admin_notifications' || activeView === 'notifications' 
                    ? 'bg-[#8a2410] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-[#8a2410] dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
            </>
          )}
        </nav>

        {/* ── Right: Right Utility Actions ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50 animate-slide-down">
                <div className="p-4 bg-[#8a2410] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#ffc20e]" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Campus Notifications</h4>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-bold text-amber-200 hover:text-white underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-700 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setNotifDropdownOpen(false);
                          handleNavClick('notifications');
                        }}
                        className={`p-3.5 hover:bg-stone-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors flex items-start gap-3 ${
                          !n.read ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-[#8a2410] dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-900 dark:text-white leading-tight">{n.title}</h5>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-stone-50 dark:bg-slate-900 border-t border-stone-100 dark:border-slate-700 text-center">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      handleNavClick('notifications');
                    }}
                    className="text-xs font-bold text-[#8a2410] dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    View all notifications ({notifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Ask AI Assistant Button */}
          <button
            onClick={() => {
              const aiTrigger = document.querySelector('[aria-label="Open ResolveHub AI Assistant"]') as HTMLButtonElement;
              if (aiTrigger) aiTrigger.click();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#8a2410] dark:text-amber-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-[#8a2410] hover:text-white dark:hover:bg-amber-400 dark:hover:text-[#4a1208] transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          {/* User Avatar & Profile Dropdown */}
          <div className="relative" ref={userRef}>
            {authUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-stone-200 dark:border-slate-700"
              >
                <UserAvatar name={authUser.name} avatarUrl={authUser.avatarUrl} size="sm" />
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2 bg-[#8a2410] hover:bg-[#6f1b0c] text-white text-xs font-extrabold uppercase rounded-full shadow-md transition-all cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Avatar Dropdown Menu */}
            {userDropdownOpen && authUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-3xl shadow-2xl py-3 z-50 animate-slide-down">
                <div className="px-4 pb-3 mb-2 border-b border-stone-100 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{authUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {authUser.regNo || authUser.username || authUser.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950 text-[#8a2410] dark:text-amber-300 border border-rose-200 dark:border-rose-800 uppercase">
                    {authUser.role}
                  </span>
                </div>

                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#8a2410] dark:text-amber-400" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={() => handleNavClick('notifications')}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700/60 flex items-center gap-2.5 cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>Notifications ({unreadCount})</span>
                </button>

                <div className="pt-2 mt-2 border-t border-stone-100 dark:border-slate-700">
                  <button
                    onClick={logoutUser}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* ── Mobile Hamburger Drawer ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 px-6 py-4 space-y-3 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl">
          {isStudent ? (
            <>
              <button onClick={() => handleNavClick('student_dashboard')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📊 Dashboard
              </button>
              <button onClick={() => handleNavClick('report')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📝 Submit Complaint
              </button>
              <button onClick={() => handleNavClick('my-complaints')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📋 My Complaints
              </button>
              <button onClick={() => handleNavClick('track')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                🔍 Track Status
              </button>
              <button onClick={() => handleNavClick('faq')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                ❓ Help & FAQ
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick(isSuperAdmin ? 'super_admin_dashboard' : 'dept_admin_dashboard')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📊 Dashboard
              </button>
              <button onClick={() => handleNavClick(isSuperAdmin ? 'super_admin_complaints' : 'dept_admin_complaints')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📑 All Complaints
              </button>
              <button onClick={() => handleNavClick(isSuperAdmin ? 'super_admin_analytics' : 'dept_admin_analytics')} className="block w-full text-left py-2 hover:text-[#8a2410]">
                📈 Analytics & Reports
              </button>
            </>
          )}
          <button onClick={() => handleNavClick('profile')} className="block w-full text-left py-2 text-[#8a2410] dark:text-amber-400 font-extrabold">
            👤 Profile & Settings
          </button>
        </div>
      )}
    </header>
  );
};
