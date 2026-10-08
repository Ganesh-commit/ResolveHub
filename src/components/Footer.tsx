import React, { useState } from 'react';
import { 
  MapPin, 
  Mail, 
  PhoneCall, 
  ShieldCheck, 
  HelpCircle,
  Globe,
  Share2,
  MessageSquare,
  Compass,
  ExternalLink,
  X,
  Send
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

export const Footer: React.FC = () => {
  const { setIsLoginModalOpen, setActiveView } = useResolveHub();
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMsg('');
      setSupportModalOpen(false);
    }, 2000);
  };

  const handleNavClick = (view: 'home' | 'about' | 'faq' | 'login') => {
    if (view === 'login') {
      setIsLoginModalOpen(true);
    } else {
      setActiveView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="w-full bg-[#4a1208] text-amber-100/90 pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-rose-950/60 relative z-20">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-rose-900/50">
        
        {/* Left Column: Brand & Description */}
        <div className="md:col-span-4 space-y-4">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#8a2410] text-white flex items-center justify-center font-black text-xl border-2 border-[#ffc20e] shadow-md group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-heading-playfair leading-none">
                Vignan's <span className="text-[#ffc20e]">ResolveHub</span>
              </h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200/70 mt-1">
                Grievance Resolution Portal
              </p>
            </div>
          </div>

          <p className="text-xs text-rose-200/80 leading-relaxed font-normal">
            Vignan University's official digital portal for transparent, SLA-backed grievance resolution across academics, hostels, transport, finance, and campus facilities.
          </p>

          {/* Social Icons Placeholders */}
          <div className="pt-2 flex items-center gap-2.5">
            {[
              { icon: Globe, label: 'University Portal' },
              { icon: Share2, label: 'Official Network' },
              { icon: MessageSquare, label: 'Community Desk' },
              { icon: Compass, label: 'Campus Services' },
              { icon: ExternalLink, label: 'Student Cell' }
            ].map((s, i) => {
              const IconComp = s.icon;
              return (
                <a
                  key={i}
                  href="#social-placeholder"
                  onClick={(e) => { e.preventDefault(); alert(`Vignan ${s.label} official page link placeholder.`); }}
                  className="w-8 h-8 rounded-full bg-rose-950/80 hover:bg-[#ffc20e] hover:text-[#4a1208] text-rose-200 flex items-center justify-center transition-all cursor-pointer border border-rose-900/60"
                  aria-label={s.label}
                  title={s.label}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <h4 className="text-xs font-black text-white font-heading-playfair uppercase tracking-widest border-b border-rose-900/60 pb-2.5">
            Quick Links
          </h4>
          <div className="space-y-2 font-medium">
            <button 
              onClick={() => handleNavClick('home')} 
              className="block footer-link-nudge text-rose-200/90 hover:text-[#ffc20e] cursor-pointer"
            >
              • Home
            </button>
            <button 
              onClick={() => handleNavClick('about')} 
              className="block footer-link-nudge text-rose-200/90 hover:text-[#ffc20e] cursor-pointer"
            >
              • About Us
            </button>
            <button 
              onClick={() => alert('Terms of Use placeholder: ResolveHub adheres to Vignan University Academic & Student Discipline Code.')} 
              className="block footer-link-nudge text-rose-200/90 hover:text-[#ffc20e] cursor-pointer"
            >
              • Terms of Use
            </button>
            <button 
              onClick={() => alert('Privacy Policy placeholder: Student identity is shielded in Anonymous Mode and stored under SSL encryption.')} 
              className="block footer-link-nudge text-rose-200/90 hover:text-[#ffc20e] cursor-pointer"
            >
              • Privacy Policy
            </button>
            <button 
              onClick={() => handleNavClick('faq')} 
              className="block footer-link-nudge text-rose-200/90 hover:text-[#ffc20e] cursor-pointer"
            >
              • Help & FAQ
            </button>
            <button 
              onClick={() => handleNavClick('login')} 
              className="block footer-link-nudge text-[#ffc20e] font-bold cursor-pointer"
            >
              • Portal Login
            </button>
          </div>
        </div>

        {/* Contact Details Column */}
        <div className="md:col-span-3 space-y-3 text-xs">
          <h4 className="text-xs font-black text-white font-heading-playfair uppercase tracking-widest border-b border-rose-900/60 pb-2.5">
            University Office Contact
          </h4>
          <div className="space-y-2.5 text-rose-200/90">
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#ffc20e] shrink-0 mt-0.5" />
              <span>Vadlamudi, Guntur District, Andhra Pradesh - 522213</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#ffc20e] shrink-0" />
              <span>grievance@vignan.ac.in</span>
            </p>
            <p className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-[#ffc20e] shrink-0" />
              <span>+91-863-2344700 (Ext. 101)</span>
            </p>
            <p className="text-[11px] text-amber-200/70 pt-1 font-mono">
              Office Hours: Mon - Sat (9:00 AM - 5:00 PM)
            </p>
          </div>
        </div>

        {/* Support Button Column */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xs font-black text-white font-heading-playfair uppercase tracking-widest border-b border-rose-900/60 pb-2.5">
            Assistance
          </h4>
          <p className="text-[11px] text-rose-200/70 leading-relaxed">
            Need urgent help filing a grievance ticket?
          </p>
          <button
            onClick={() => setSupportModalOpen(true)}
            className="w-full py-3 bg-white hover:bg-rose-50 text-[#4a1208] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-[#8a2410]" />
            <span>Support</span>
          </button>
        </div>

      </div>

      {/* Bottom Copyright Divider */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-rose-300/60 font-sans">
        <div>
          © 2026 Vignan Foundation for Science, Technology & Research (Deemed to be University). All rights reserved.
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ENTERPRISE RBAC & SLA PROTECTION ACTIVE</span>
        </div>
      </div>

      {/* Support Request Modal Overlay */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-slide-up">
            <button
              onClick={() => setSupportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black font-heading-playfair text-[#8a2410] mb-1">
              Contact ResolveHub Support Desk
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Send a message directly to the Grievance Control Desk.
            </p>

            {supportSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-800 space-y-1">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>Support Request Sent!</p>
                <p className="text-[11px] text-emerald-600 font-normal">Our campus desk will respond to your email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <textarea
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  placeholder="Type your support query or issue description..."
                  required
                  rows={4}
                  className="w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:bg-white focus:border-[#8a2410] outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#8a2410] hover:bg-[#6f1b0c] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Send Support Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
