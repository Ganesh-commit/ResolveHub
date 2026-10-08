import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Megaphone, 
  Check, 
  Search, 
  ChevronRight, 
  Calendar, 
  Clock
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAllNotificationsAsRead, 
    markNotificationAsRead, 
    setActiveView, 
    setTrackQuery 
  } = useResolveHub();

  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifs = notifications.filter(n => {
    if (filterTab === 'unread' && n.read) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || n.complaintId?.toLowerCase().includes(q);
    }
    return true;
  });

  // Group notifications into Today vs Earlier
  const todayNotifs: typeof notifications = [];
  const earlierNotifs: typeof notifications = [];

  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  filteredNotifs.forEach(n => {
    if (n.timestamp.includes('Today') || n.timestamp.includes(todayStr) || n.timestamp.includes('Just now') || n.timestamp.includes('min ago')) {
      todayNotifs.push(n);
    } else {
      earlierNotifs.push(n);
    }
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'resolution':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'assignment':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case 'escalation':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-[#8a2410]" />;
    }
  };

  const handleNotifClick = (n: any) => {
    markNotificationAsRead(n.id);
    if (n.complaintId) {
      setTrackQuery(n.complaintId);
      setActiveView('track');
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto space-y-6 py-6 px-4 sm:px-8 lg:px-12">
      
      {/* Header Banner */}
      <div className="bg-[#8a2410] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-900/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" /> Campus Communication Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading-playfair tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-xs text-rose-200/90 mt-1">
            Real-time complaint status updates, SLA escalations, and official university announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-full border border-white/30 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Check className="w-4 h-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-stone-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#8a2410] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200'
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            onClick={() => setFilterTab('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'unread'
                ? 'bg-[#8a2410] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-stone-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 dark:bg-slate-900 rounded-xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:border-[#8a2410] dark:text-white"
          />
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="space-y-6">
        
        {/* Today Group */}
        {todayNotifs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
              <Clock className="w-3.5 h-3.5 text-[#8a2410]" /> Today
            </h3>
            <div className="space-y-3">
              {todayNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-xs hover:shadow-md ${
                    !n.read 
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60' 
                      : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                      {getNotifIcon(n.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                        <span>{n.timestamp}</span>
                        {n.complaintId && (
                          <span className="text-[#8a2410] dark:text-amber-400 font-bold">Ticket: {n.complaintId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earlier Group */}
        {earlierNotifs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 pt-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Earlier
            </h3>
            <div className="space-y-3">
              {earlierNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-xs hover:shadow-md ${
                    !n.read 
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60' 
                      : 'bg-white dark:bg-slate-800 border-stone-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                      {getNotifIcon(n.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                        <span>{n.timestamp}</span>
                        {n.complaintId && (
                          <span className="text-[#8a2410] dark:text-amber-400 font-bold">Ticket: {n.complaintId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotifs.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-stone-200 dark:border-slate-700 space-y-3">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No Notifications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! New status updates, assignment notifications, and announcements will appear here.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
