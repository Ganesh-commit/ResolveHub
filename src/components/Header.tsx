import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  KeyRound, 
  LogOut, 
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  GraduationCap,
  HelpCircle
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
  onOpenProfileModal: () => void;
  onOpenPasswordModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenProfileModal,
  onOpenPasswordModal
}) => {
  const { 
    activeView, 
    notifications, 
    markAllNotificationsAsRead, 
    setIsLoginModalOpen, 
    userLoggedIn, 
    authUser, 
    logoutUser 
  } = useResolveHub();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter unread notifications for active user
  const userNotifications = notifications.filter(n => {
    if (!authUser) return false;
    if (authUser.role === 'student') {
      const activeReg = (authUser.regNo || authUser.username || '').toUpperCase();
      if (n.type === 'status_update' || n.targetRegNo) {
        return n.targetRegNo ? n.targetRegNo.toUpperCase() === activeReg : false;
      }
      return n.targetRole === 'all' || n.targetRole === 'student';
    }
    if (authUser.role === 'super_admin' || authUser.role === 'dept_admin') {
      return !n.targetRegNo && (n.targetRole === 'super_admin' || n.targetRole === 'dept_admin' || n.targetRole === 'all');
    }
    return false;
  });
  const userUnreadCount = userNotifications.filter(n => !n.read).length;

  // Dynamic Page Title & Subtitle based on activeView and authUser
  const getPageHeaderInfo = () => {
    if (activeView === 'super_admin_dashboard' || activeView.startsWith('super_admin_')) {
      return {
        title: 'Super Admin Control Center',
        badge: 'Master Control',
        icon: ShieldCheck
      };
    }
    if (activeView === 'dept_admin_dashboard' || activeView.startsWith('dept_admin_')) {
      return {
        title: `${authUser?.department || 'Department'} Action Hub`,
        badge: 'Dept Management',
        icon: Building2
      };
    }
    if (activeView === 'student_dashboard') {
      return {
        title: 'Student Grievance Portal',
        badge: 'Student Dashboard',
        icon: GraduationCap
      };
    }
    if (activeView === 'report') {
      return {
        title: 'Submit Campus Grievance',
        badge: 'Grievance Intake',
        icon: Sparkles
      };
    }
    if (activeView === 'my-complaints') {
      return {
        title: 'My Complaints Registry',
        badge: 'Personal Log',
        icon: Clock
      };
    }
    if (activeView === 'track') {
      return {
        title: 'Live Complaint Progress Tracker',
        badge: 'Status Tracker',
        icon: CheckCircle2
      };
    }
    if (activeView === 'faq') {
      return {
        title: 'Knowledge Base & FAQ',
        badge: 'Student Help',
        icon: HelpCircle
      };
    }
    return {
      title: 'Vignan Grievance Resolution Portal',
      badge: 'University Portal',
      icon: Sparkles
    };
  };

  const headerInfo = getPageHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  const getUserRoleLabel = () => {
    if (authUser?.role === 'super_admin') return 'Super Admin';
    if (authUser?.role === 'dept_admin') return 'Dept Admin';
    if (authUser?.role === 'student') return 'Student';
    return 'Guest';
  };

  return (
    <header className="fixed top-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/90 py-3 px-4 sm:px-6 lg:px-8 transition-all duration-300 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Toggle Sidebar & Page Title (Clean without duplicating logo) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(!mobileOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            className="p-2 rounded-2xl bg-stone-100 hover:bg-[#8B2414] hover:text-white text-slate-700 transition-colors cursor-pointer flex-shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B2414] flex items-center justify-center font-bold flex-shrink-0">
              <HeaderIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate font-heading leading-tight">
                {headerInfo.title}
              </h1>
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider hidden sm:block">
                VIGNAN RESOLVEHUB • {headerInfo.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Notification Bell & User Profile Dropdown */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-rose-50 text-slate-700 hover:text-[#8B2414] transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {userUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8B2414] text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                  {userUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white border border-stone-200 shadow-2xl p-4 z-50 animate-slide-down space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Notifications ({userUnreadCount} Unread)
                  </h4>
                  {userUnreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-bold text-[#8B2414] hover:underline cursor-pointer"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {userNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      No notifications available.
                    </div>
                  ) : (
                    userNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border text-xs transition-colors ${
                          n.read
                            ? 'bg-stone-50 border-stone-200/60 text-slate-600'
                            : 'bg-rose-50/60 border-rose-200 text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-mono">
                          <span>{n.timestamp}</span>
                          <span className="font-bold uppercase text-[#8B2414]">{n.type.replace('_', ' ')}</span>
                        </div>
                        <h5 className="font-bold text-slate-900">{n.title}</h5>
                        <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card & Profile Dropdown */}
          {userLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-stone-100 hover:bg-stone-200/80 border border-stone-200/80 transition-colors cursor-pointer"
              >
                {/* User Avatar Circle */}
                <div className="w-8 h-8 rounded-xl bg-[#8B2414] text-white flex items-center justify-center font-extrabold text-xs shadow-md">
                  {authUser?.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                </div>

                {/* User Name & Role Name (e.g., "Sai Ganesh – Super Admin") */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">
                    {authUser?.name}
                  </span>
                  <span className="text-[10px] font-bold text-[#8B2414] font-mono leading-tight">
                    {getUserRoleLabel()}
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {/* Profile Dropdown Options Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-white border border-stone-200 shadow-2xl p-2 z-50 animate-slide-down space-y-1">
                  
                  {/* User Info Header Banner inside Dropdown */}
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 mb-1">
                    <div className="text-xs font-extrabold text-slate-900">{authUser?.name}</div>
                    <div className="text-[11px] text-[#8B2414] font-mono font-bold mt-0.5">
                      {authUser?.name} – {getUserRoleLabel()}
                    </div>
                    {authUser?.email && (
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {authUser.email}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-[#8B2414]" />
                    <span>Profile Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#8B2414]" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenPasswordModal();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-800 hover:bg-stone-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[#8B2414]" />
                    <span>Change Password</span>
                  </button>

                  <div className="border-t border-stone-100 my-1" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out / Logout</span>
                  </button>

                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-5 py-2 rounded-2xl bg-[#8B2414] hover:bg-[#721c0e] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Portal Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
