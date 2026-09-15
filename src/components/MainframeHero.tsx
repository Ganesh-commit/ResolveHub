import React, { useState, useRef, useEffect } from 'react';
import {
  Megaphone, Bell, User, LayoutDashboard, FilePlus, ClipboardList,
  Search, BellRing, HelpCircle, LogIn, Menu, X, Send, Paperclip,
  MessageSquare, TrendingUp, Users, ShieldCheck, Clock, Heart,
  CheckCircle, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Loader2, FileText, Eye, EyeOff, BarChart3,
  Activity, AlertTriangle, CircleCheck
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type NavSection = 'home' | 'dashboard' | 'report' | 'complaints' | 'track' | 'notifications' | 'faq';

// ─── Sample Data ─────────────────────────────────────────────────────────────
const SAMPLE_COMPLAINTS = [
  { id: 'RP-8042', category: 'Hostel & Facilities', date: 'Sep 14, 2026', status: 'In Progress', priority: 'High', title: 'AC Breakdown in Block-C' },
  { id: 'RP-8039', category: 'IT & Network', date: 'Sep 14, 2026', status: 'Under Review', priority: 'Critical', title: 'Library Wi-Fi Gateway Offline' },
  { id: 'RP-7994', category: 'Finance & Scholarship', date: 'Sep 13, 2026', status: 'Submitted', priority: 'Medium', title: 'Scholarship Disbursal Discrepancy' },
  { id: 'RP-7911', category: 'Sanitation & Hygiene', date: 'Oct 10, 2026', status: 'Resolved', priority: 'Medium', title: 'Water Filtration Filter Replacement' },
  { id: 'RP-7890', category: 'IT & Network', date: 'Oct 08, 2026', status: 'Resolved', priority: 'Critical', title: 'GPU Server Overheating' },
];

const NOTIFICATIONS = [
  { id: 1, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', title: 'RP-7911 Resolved', desc: 'Water filtration issue has been resolved.', time: '2h ago' },
  { id: 2, icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50', title: 'RP-8042 In Progress', desc: 'Technician dispatched to Block-C.', time: '3h ago' },
  { id: 3, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', title: 'RP-8039 SLA Warning', desc: 'Wi-Fi issue approaching SLA deadline.', time: '5h ago' },
];

const FAQS = [
  { q: 'How do I submit a complaint?', a: 'Click "REPORT ISSUE" in the navigation or use the complaint card on the homepage. Fill in the title, category, description, and submit.' },
  { q: 'How long does it take to resolve a complaint?', a: 'Resolution times depend on urgency. Critical issues are addressed within 2 hours, high within 24 hours, medium within 48 hours, and low within 7 days.' },
  { q: 'Can I track my complaint anonymously?', a: 'Yes. Use the "TRACK STATUS" section and enter your complaint ID (e.g. RP-8042) to view real-time updates without logging in.' },
  { q: 'What categories of complaints can I raise?', a: 'Hostel & Facilities, IT & Network, Finance & Scholarship, Sanitation & Hygiene, Academics, and Harassment & Discipline.' },
  { q: 'Will I be notified of updates to my complaint?', a: 'Yes. You will receive in-app notifications and email updates whenever your complaint status changes.' },
  { q: 'How do I contact support directly?', a: 'Use the Help Desk option in the navigation or email support@resolvehub.edu. Our team responds within 1 business hour.' },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'Submitted': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Resolved': 'bg-green-50 text-green-700 border border-green-200',
  };
  return map[status] || 'bg-gray-50 text-gray-600 border border-gray-200';
};

const priorityBadge = (p: string) => {
  const map: Record<string, string> = {
    'Critical': 'bg-red-50 text-red-700',
    'High': 'bg-orange-50 text-orange-700',
    'Medium': 'bg-yellow-50 text-yellow-700',
    'Low': 'bg-gray-50 text-gray-600',
  };
  return map[p] || 'bg-gray-50 text-gray-600';
};

// ─── FeatureItem ─────────────────────────────────────────────────────────────
interface FeatureItemProps {
  icon: React.ElementType;
  label: string;
  sub: string;
  bg: string;
  color: string;
}
const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, label, sub, bg, color }) => (
  <div className="flex items-center gap-3 group">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${bg} transition-transform group-hover:scale-110`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-[13px] font-bold uppercase tracking-widest text-gray-800 leading-tight">{label}</p>
      <p className="text-[12px] text-gray-500 leading-snug">{sub}</p>
    </div>
  </div>
);

// ─── RightFeatureItem ─────────────────────────────────────────────────────────
const RightFeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, label, sub, bg, color }) => (
  <div className="flex items-center gap-3 group flex-row-reverse text-right">
    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${bg} transition-transform group-hover:scale-110`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-[13px] font-bold uppercase tracking-widest text-gray-800 leading-tight">{label}</p>
      <p className="text-[12px] text-gray-500 leading-snug">{sub}</p>
    </div>
  </div>
);

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────
const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
        <span className="font-semibold text-gray-800 text-[15px]">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-600 text-[14px] leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
};

// ─── Login Modal ──────────────────────────────────────────────────────────────
const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full bg-green-900 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-xs text-gray-500">Sign in to your ResolveHub account</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input type="email" placeholder="you@campus.edu" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all pr-11" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-green-800 focus:ring-green-800" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button className="text-sm text-green-800 hover:underline font-medium">Forgot password?</button>
          </div>
          <button className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold rounded-xl py-3 text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-5">
          Don't have an account? <button className="text-green-800 font-medium hover:underline">Register here</button>
        </p>
      </div>
    </div>
  );
};

// ─── Track Status Section ─────────────────────────────────────────────────────
const TrackSection: React.FC = () => {
  const [id, setId] = useState('');
  const [result, setResult] = useState<typeof SAMPLE_COMPLAINTS[0] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = () => {
    const found = SAMPLE_COMPLAINTS.find(c => c.id.toLowerCase() === id.trim().toLowerCase());
    if (found) { setResult(found); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const STEPS = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
  const stepIndex = result ? STEPS.indexOf(result.status) : -1;

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          value={id} onChange={e => setId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          placeholder="Enter Complaint ID (e.g. RP-8042)"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all bg-white"
        />
        <button onClick={handleTrack} className="bg-green-900 hover:bg-green-800 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <Search className="w-4 h-4" /> Track
        </button>
      </div>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">No complaint found with ID "{id}". Please check and try again.</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{result.id}</span>
              <h3 className="font-bold text-gray-900 mt-1 text-[15px]">{result.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{result.category} · {result.date}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusBadge(result.status)}`}>{result.status}</span>
          </div>
          {/* Status Stepper */}
          <div className="pt-2">
            <div className="flex items-center">
              {STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= stepIndex ? 'bg-green-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium text-center w-16 leading-tight ${i <= stepIndex ? 'text-green-900' : 'text-gray-400'}`}>{step}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 ${i < stepIndex ? 'bg-green-900' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {!result && !notFound && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Enter your complaint ID above to track its status in real time.</p>
          <p className="text-gray-400 text-xs mt-1">e.g. RP-8042, RP-7911</p>
        </div>
      )}
    </div>
  );
};

// ─── Dashboard Section ────────────────────────────────────────────────────────
const DashboardSection: React.FC = () => {
  const stats = [
    { label: 'Total Complaints', value: 5, icon: ClipboardList, bg: 'bg-indigo-50', color: 'text-indigo-600', change: '+2 this week' },
    { label: 'Pending Review', value: 1, icon: AlertTriangle, bg: 'bg-amber-50', color: 'text-amber-600', change: '1 awaiting' },
    { label: 'In Progress', value: 2, icon: Activity, bg: 'bg-blue-50', color: 'text-blue-600', change: 'Active now' },
    { label: 'Resolved', value: 2, icon: CircleCheck, bg: 'bg-green-50', color: 'text-green-700', change: '100% satisfaction' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-600 font-medium mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-1">{s.change}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {SAMPLE_COMPLAINTS.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.id}</span>
                <span className="text-sm text-gray-700 font-medium">{c.title}</span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const MainframeHero: React.FC = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => { if (notifOpen) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleSubmit = () => {
    if (!complaintText.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setComplaintText('');
  };

  const navLinks: { id: NavSection; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'report', label: 'Report Issue' },
    { id: 'complaints', label: 'My Complaints' },
    { id: 'track', label: 'Track Status' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'faq', label: 'Help & FAQ' },
  ];



  // Sections other than home
  const renderSection = () => {
    const sectionMeta: Record<string, { title: string; sub: string; icon: React.ElementType }> = {
      dashboard: { title: 'Your Dashboard', sub: 'Overview of your complaint activity', icon: LayoutDashboard },
      report: { title: 'Report an Issue', sub: 'Describe your issue and we will act swiftly', icon: FilePlus },
      complaints: { title: 'My Complaints', sub: 'All your submitted grievances in one place', icon: ClipboardList },
      track: { title: 'Track Status', sub: 'Enter your Complaint ID to track in real time', icon: Search },
      notifications: { title: 'Notifications', sub: 'Stay updated on your complaints', icon: BellRing },
      faq: { title: 'Help & FAQ', sub: 'Answers to common questions', icon: HelpCircle },
    };

    const meta = sectionMeta[activeSection];
    if (!meta) return null;

    return (
      <section className="min-h-screen bg-[#faf9f6] pt-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-green-900 rounded-2xl flex items-center justify-center">
              <meta.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
              <p className="text-sm text-gray-500">{meta.sub}</p>
            </div>
          </div>

          {/* Dashboard */}
          {activeSection === 'dashboard' && <DashboardSection />}

          {/* Report Issue */}
          {activeSection === 'report' && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Complaint Title *</label>
                <input placeholder="Brief title of your issue" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all bg-white">
                    <option>Hostel &amp; Facilities</option>
                    <option>IT &amp; Network</option>
                    <option>Finance &amp; Scholarship</option>
                    <option>Sanitation &amp; Hygiene</option>
                    <option>Academics</option>
                    <option>Harassment &amp; Discipline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgency *</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all bg-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input placeholder="Building, Room, Block..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea rows={5} placeholder="Describe your issue in detail..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                  <input placeholder="Full name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input type="email" placeholder="you@campus.edu" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all" />
                </div>
              </div>
              <button className="w-full bg-green-900 hover:bg-green-800 text-white font-semibold rounded-xl py-3.5 text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Submit Complaint
              </button>
            </div>
          )}

          {/* My Complaints */}
          {activeSection === 'complaints' && (
            <div className="space-y-3">
              {SAMPLE_COMPLAINTS.map(c => (
                <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center gap-5">
                  <div className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-xl items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityBadge(c.priority)}`}>{c.priority}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.category} · {c.date}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusBadge(c.status)}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Track Status */}
          {activeSection === 'track' && <TrackSection />}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-3">
              {NOTIFICATIONS.map(n => (
                <div key={n.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${n.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          )}

          {/* Help & FAQ */}
          {activeSection === 'faq' && (
            <div className="space-y-3">
              {FAQS.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans">
      {/* ── Fixed Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button onClick={() => setActiveSection('home')} className="flex flex-col items-start flex-shrink-0 group">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-900 rounded-lg flex items-center justify-center">
                <Megaphone className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[18px] font-extrabold text-gray-900 leading-none">
                Resolve<span className="text-indigo-600">Hub</span>
              </span>
            </div>
            <p className="text-[9px] text-gray-400 tracking-[0.15em] uppercase ml-9 mt-0.5 leading-none">
              Report Today &nbsp;|&nbsp; Resolve Tomorrow
            </p>
          </button>

          {/* Center Nav — Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => setActiveSection(link.id)}
                className={`relative px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all
                  ${activeSection === link.id
                    ? 'text-green-900 bg-green-900/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                  ${link.id === 'report' ? 'font-semibold' : ''}
                `}
              >
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-green-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification Bell */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">3</span>
              </button>
              {notifOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className={`w-8 h-8 ${n.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <n.icon className={`w-4 h-4 ${n.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => setLoginOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-green-900 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <User className="w-3.5 h-3.5" /> Login
            </button>

            {/* Hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-3 px-5 space-y-1">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => { setActiveSection(link.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeSection === link.id ? 'bg-green-900/5 text-green-900' : 'text-gray-600 hover:bg-gray-50'}`}>
                {link.label}
              </button>
            ))}
            <button onClick={() => setLoginOpen(true)} className="w-full mt-2 bg-green-900 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Login
            </button>
          </div>
        )}
      </nav>

      {/* ── Non-home sections ─────────────────────────────────────────────── */}
      {activeSection !== 'home' && renderSection()}

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      {activeSection === 'home' && (
        <section className="relative min-h-screen w-full overflow-hidden pt-16">

          {/* Background illustration */}
          <img src="/hero-bg.png" alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-bottom z-0 opacity-90" />

          {/* Gradient overlay — cream top fade for readability */}
          <div className="absolute inset-0 z-[1] pointer-events-none"
            style={{ background: 'linear-gradient(180deg, rgba(250,249,246,0.97) 0%, rgba(250,249,246,0.88) 40%, rgba(250,249,246,0.3) 75%, rgba(250,249,246,0) 100%)' }} />

          {/* Main content */}
          <div className="relative z-[2] max-w-[1360px] mx-auto px-5 sm:px-10 min-h-[calc(100vh-64px)] flex flex-col justify-center py-16">

            {/* Three-column layout */}
            <div className="flex items-center gap-6 lg:gap-10">

              {/* LEFT FEATURES */}
              <div className="hidden lg:flex flex-col gap-6 w-[200px] xl:w-[220px] flex-shrink-0 pt-8">
                <FeatureItem icon={FilePlus} label="REPORT" sub="Raise an issue easily" bg="bg-blue-100" color="text-blue-600" />
                <FeatureItem icon={Search} label="TRACK" sub="Stay updated always" bg="bg-amber-100" color="text-amber-600" />
                <FeatureItem icon={CheckCircle} label="RESOLVE" sub="Get timely action" bg="bg-green-100" color="text-green-700" />
                <FeatureItem icon={TrendingUp} label="IMPROVE" sub="Build a better tomorrow" bg="bg-purple-100" color="text-purple-600" />
              </div>

              {/* CENTER */}
              <div className="flex-1 min-w-0 flex flex-col items-center text-center">

                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="w-12 h-[1.5px] bg-green-800 rounded" />
                  <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-green-800 select-none">
                    A Greener · Safer · Better Tomorrow
                  </p>
                  <span className="w-12 h-[1.5px] bg-green-800 rounded" />
                </div>

                {/* Big Headline */}
                <h1 className="text-[clamp(36px,5.5vw,64px)] font-extrabold text-gray-900 leading-[1.05] tracking-[-0.03em] mb-1">
                  How can we help you
                </h1>
                <h1 className="text-[clamp(36px,5.5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-3">
                  <span className="text-green-800">today?</span>
                </h1>
                {/* Decorative underline */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  <div className="w-16 h-1 bg-green-800 rounded-full" />
                  <div className="w-4 h-1 bg-green-400 rounded-full" />
                  <div className="w-2 h-1 bg-green-200 rounded-full" />
                </div>

                {/* Subtitle */}
                <p className="text-[15px] sm:text-[17px] text-gray-600 max-w-[520px] leading-relaxed mb-8">
                  Submit your complaint, track its status, and get timely<br className="hidden sm:block" />
                  resolutions — all in one place.
                </p>

                {/* GLASS COMPLAINT CARD */}
                <div ref={cardRef}
                  className="w-full max-w-[820px] bg-white/60 backdrop-blur-xl border border-white/90 rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.16)] transition-shadow p-6 sm:p-7">

                  {/* Text area */}
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-9 h-9 bg-green-900/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-green-900" />
                    </div>
                    <textarea
                      value={complaintText}
                      onChange={e => setComplaintText(e.target.value)}
                      rows={3}
                      placeholder={"I want to report an issue and track my complaint\nuntil it is resolved..."}
                      className="flex-1 bg-transparent resize-none text-[15px] text-gray-700 placeholder:text-gray-400/80 focus:outline-none leading-relaxed font-medium"
                    />
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between gap-3 border-t border-gray-100/80 pt-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-800 transition-colors group"
                    >
                      <Paperclip className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Attach files (optional)</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" />

                    {submitted ? (
                      <div className="flex items-center gap-2 bg-green-900 text-white px-6 py-3 rounded-full text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Submitted!
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 bg-green-900 hover:bg-green-800 text-white px-6 py-3 rounded-full text-sm font-bold transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Complaint</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick action pills */}
                <div className="flex flex-wrap justify-center gap-2 mt-5">
                  {['Hostel & Facilities', 'IT & Network', 'Finance', 'Sanitation', 'Academics'].map(cat => (
                    <button key={cat} onClick={() => setActiveSection('report')}
                      className="text-xs font-medium px-4 py-1.5 rounded-full border border-gray-200 bg-white/70 text-gray-600 hover:border-green-800 hover:text-green-800 hover:bg-white transition-all backdrop-blur-sm">
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-6 mt-8 flex-wrap justify-center">
                  {[
                    { label: 'Complaints Resolved', value: '2,400+' },
                    { label: 'Avg. Resolution Time', value: '< 48hr' },
                    { label: 'Satisfaction Rate', value: '97%' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-xl font-extrabold text-green-900">{s.value}</p>
                      <p className="text-[11px] text-gray-500 tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT FEATURES */}
              <div className="hidden lg:flex flex-col gap-6 w-[220px] xl:w-[240px] flex-shrink-0 pt-8">
                <RightFeatureItem icon={Users} label="YOUR VOICE MATTERS" sub="We are here to listen" bg="bg-rose-100" color="text-rose-600" />
                <RightFeatureItem icon={ShieldCheck} label="EVERY ISSUE COUNTS" sub="Small or big, we care" bg="bg-teal-100" color="text-teal-600" />
                <RightFeatureItem icon={Clock} label="FULLY TRANSPARENT" sub="Tracked at every step" bg="bg-orange-100" color="text-orange-600" />
                <RightFeatureItem icon={Heart} label="BETTER COMMUNITY" sub="Together we resolve" bg="bg-pink-100" color="text-pink-600" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Login Modal ───────────────────────────────────────────────────── */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
};
