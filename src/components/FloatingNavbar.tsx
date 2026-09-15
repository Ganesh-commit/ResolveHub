import React, { useState, useEffect } from 'react';
import { useGrievance } from '../context/GrievanceContext';

interface FloatingNavbarProps {
  activeSection?: string;
  onNavigateSection?: (id: string) => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  activeSection = 'hero',
  onNavigateSection
}) => {
  const {
    setActiveView,
    setIsComplaintModalOpen,
    tickets
  } = useGrievance();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeCount = tickets.filter((t) => t.status !== 'resolved').length;

  const handleNavClick = (sectionId: string) => {
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none select-none">
      <div
        className={`inline-flex items-center rounded-full backdrop-blur-md border border-white/10 bg-surface/90 px-2 py-1.5 sm:py-2 pointer-events-auto transition-all duration-300 ${
          isScrolled ? 'shadow-xl shadow-black/40 border-white/20' : ''
        }`}
      >
        {/* 1. Logo: 9x9 circle with accent gradient border, inner bg-bg circle with RP */}
        <button
          type="button"
          onClick={() => {
            setActiveView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="ResolvePulse Home"
          className="relative w-9 h-9 rounded-full p-[1.5px] accent-gradient group transition-transform duration-300 hover:scale-110 cursor-pointer shrink-0"
        >
          <div className="w-full h-full bg-bg rounded-full flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <span className="font-display italic text-[13px] text-text-primary font-bold tracking-tight">
              RP
            </span>
          </div>
        </button>

        {/* 2. Divider */}
        <div className="w-px h-5 bg-stroke mx-1.5 hidden sm:block" />

        {/* 3. Nav Links */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => handleNavClick('hero')}
            className={`text-xs sm:text-sm rounded-full px-2.5 sm:px-4 py-1.5 transition-all cursor-pointer ${
              activeSection === 'hero'
                ? 'text-text-primary bg-stroke/60 font-medium'
                : 'text-muted hover:text-text-primary hover:bg-stroke/40'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('works')}
            className={`text-xs sm:text-sm rounded-full px-2.5 sm:px-4 py-1.5 transition-all cursor-pointer ${
              activeSection === 'works'
                ? 'text-text-primary bg-stroke/60 font-medium'
                : 'text-muted hover:text-text-primary hover:bg-stroke/40'
            }`}
          >
            Domains
          </button>

          <button
            type="button"
            onClick={() => setActiveView('citizen')}
            className="text-xs sm:text-sm rounded-full px-2.5 sm:px-4 py-1.5 text-muted hover:text-text-primary hover:bg-stroke/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Track</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-mono font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="text-xs sm:text-sm rounded-full px-2.5 sm:px-4 py-1.5 text-muted hover:text-text-primary hover:bg-stroke/40 transition-all cursor-pointer hidden md:inline-flex"
          >
            Command
          </button>
        </div>

        {/* 4. Divider */}
        <div className="w-px h-5 bg-stroke mx-1.5" />

        {/* 5. "File Grievance ↗" Action Button with accent gradient hover ring */}
        <button
          type="button"
          onClick={() => setIsComplaintModalOpen(true)}
          className="relative group cursor-pointer text-xs sm:text-sm rounded-full p-[1px] transition-transform hover:scale-[1.03]"
        >
          {/* Accent gradient ring on hover */}
          <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]" />
          <span className="relative flex items-center gap-1 bg-surface hover:bg-surface/80 border border-white/15 group-hover:border-transparent rounded-full px-3 sm:px-4 py-1.5 text-text-primary font-medium transition-colors">
            <span>File Grievance</span>
            <span className="text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </span>
        </button>
      </div>
    </nav>
  );
};
