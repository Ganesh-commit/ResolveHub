import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGrievance } from '../context/GrievanceContext';
import { HlsVideoPlayer } from './HlsVideoPlayer';
import { Copy, Check, Mail } from 'lucide-react';

export const ContactFooterSection: React.FC = () => {
  const {
    setActiveView,
    setIsComplaintModalOpen,
    setIsEmergencyModalOpen,
    showToast
  } = useGrievance();

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  // GSAP infinite marquee animation: xPercent: -50, duration 40s, ease "none", repeat -1
  useEffect(() => {
    if (!marqueeRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        duration: 35,
        ease: 'none',
        repeat: -1
      });
    });

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    const email = 'support@resolvepulse.gov';
    navigator.clipboard.writeText(email);
    setCopied(true);
    showToast('Hotline Copied', `${email} copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const marqueeText = 'INSTANT REDRESSAL • ZERO COMPROMISE • TRANSPARENT AUDIT • 24/7 DISPATCH • ';

  return (
    <footer id="contact" className="relative bg-bg pt-20 md:pt-28 pb-10 overflow-hidden border-t border-stroke/40">
      {/* Vertically Flipped HLS Video with heavier overlay */}
      <HlsVideoPlayer
        src="https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8"
        isFlipped={true}
        overlayOpacity="bg-black/75"
      />

      {/* GSAP Marquee */}
      <div className="relative z-10 w-full overflow-hidden py-4 border-y border-white/5 mb-16 select-none pointer-events-none">
        <div ref={marqueeRef} className="flex whitespace-nowrap will-change-transform">
          <span className="text-3xl sm:text-5xl md:text-6xl font-display italic text-text-primary/20 tracking-wider">
            {marqueeText.repeat(8)}
          </span>
          <span className="text-3xl sm:text-5xl md:text-6xl font-display italic text-text-primary/20 tracking-wider">
            {marqueeText.repeat(8)}
          </span>
        </div>
      </div>

      {/* Center CTA Block */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center mb-20">
        <div className="text-xs text-muted uppercase tracking-[0.3em] font-medium mb-3">
          Direct Supervisory Protocol
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-display italic text-text-primary mb-6">
          Facing an operational breakdown?
        </h2>
        <p className="text-sm sm:text-base text-muted max-w-md mx-auto mb-10 leading-relaxed">
          Log an official redressal ticket or reach the statutory 24/7 supervisory grievance desk immediately.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* File Grievance Pill */}
          <button
            type="button"
            onClick={() => setIsComplaintModalOpen(true)}
            className="relative group rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer p-[2px]"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />
            <span className="relative block rounded-full bg-text-primary text-bg px-8 py-4 font-semibold group-hover:bg-bg group-hover:text-text-primary transition-colors">
              + File Complaint Ticket
            </span>
          </button>

          {/* Email Hotline Button with gradient hover border ring */}
          <button
            type="button"
            onClick={handleCopyEmail}
            className="relative group rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer p-[2px]"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />
            <span className="relative flex items-center gap-2 rounded-full border border-stroke bg-surface/90 text-text-primary px-8 py-4 group-hover:border-transparent transition-colors">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs sm:text-sm">support@resolvepulse.gov</span>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted" />}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-8 border-t border-stroke/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-muted">
        {/* Left: Quick links */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              setActiveView('citizen');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Citizen Tracker
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Admin Command
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-text-primary transition-colors cursor-pointer"
          >
            Knowledge Base
          </button>
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Emergency Desk
          </button>
        </div>

        {/* Right: Pulsing status indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-text-primary">Autonomous Redressal Engine Online</span>
        </div>
      </div>
    </footer>
  );
};
