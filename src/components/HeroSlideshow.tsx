import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Award,
  X,
  Sparkles
} from 'lucide-react';
import { useResolveHub } from '../context/ResolveHubContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface PublicStats {
  complaintsResolved: number | string;
  avgResolutionDays: string;
  departmentsConnected: string;
  slaPassRate: string;
}

const SLIDES = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    alt: 'Vignan University students studying together on campus stairs',
    subtitle: 'Vignan University grievance portal',
    headline: 'Every Concern Heard. Every Complaint Resolved.'
  },
  {
    id: 2,
    image: '/images/hero-2.jpg',
    alt: 'Vignan engineering students reviewing course materials and academic project notes on campus',
    subtitle: 'Vignan University grievance portal',
    headline: 'Every Concern Heard. Every Complaint Resolved.'
  }
];

interface HeroSlideshowProps {
  onOpenTrackModal: () => void;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onOpenTrackModal }) => {
  const { setIsLoginModalOpen } = useResolveHub();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  // Sticky Bottom Bar Dismiss state
  const [stickyBarDismissed, setStickyBarDismissed] = useState(false);

  // Stats state
  const [stats, setStats] = useState<PublicStats>({
    complaintsResolved: 1240,
    avgResolutionDays: '2.4 Days',
    departmentsConnected: '12+',
    slaPassRate: '98%'
  });

  // Touch Swipe coordinates
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsReducedMotion(true);
    }

    // Fetch public stats
    fetch(`${API_BASE}/public/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStats(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // 5-second auto advance loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, isPaused]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide(); // Swiped left -> next slide
    } else if (diff < -50) {
      prevSlide(); // Swiped right -> prev slide
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950">
      
      {/* ── 1. PHOTO SLIDESHOW CONTAINER ───────────────────────────────────── */}
      <div 
        className="relative w-full h-[75vh] min-h-[520px] max-h-[720px] select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-900 ease-in-out ${
                isReducedMotion
                  ? isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  : isActive
                    ? 'opacity-100 z-10 translate-x-0'
                    : 'opacity-0 z-0 translate-x-full'
              }`}
              style={{
                transitionProperty: isReducedMotion ? 'opacity' : 'transform, opacity',
                transitionDuration: '900ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
              />
            </div>
          );
        })}

        {/* Dark Gradient Overlay over bottom half */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 z-20 flex flex-col justify-end pb-12 px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Small pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {SLIDES[currentSlide].subtitle}
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading-playfair text-white tracking-tight leading-tight">
              Every Concern Heard.{' '}
              <span className="text-[#ffc20e]">Every Complaint Resolved.</span>
            </h2>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="shine-sweep-button px-8 py-3.5 bg-[#ffc20e] hover:bg-[#e0a800] text-[#4a1208] font-black text-xs uppercase tracking-widest rounded-full shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer flex items-center gap-2"
              >
                <span>Submit a Complaint</span>
                <ArrowRight className="w-4 h-4 text-[#4a1208]" />
              </button>

              <button
                onClick={onOpenTrackModal}
                className="px-7 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest rounded-full border border-white/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <Search className="w-4 h-4 text-amber-300" />
                <span>Track Status</span>
              </button>
            </div>

          </div>

        </div>

        {/* Previous & Next Arrow Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer hover:scale-110"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer hover:scale-110"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#ffc20e]' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* ── 2. STAT BOXES ROW (JUST BELOW SLIDESHOW) ─────────────────────────── */}
      <div className="w-full bg-[#4a1208] border-t border-b border-rose-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#ffc20e]/40 transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#ffc20e] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-heading-playfair text-white">
              {stats.complaintsResolved}
            </div>
            <div className="text-[11px] font-extrabold text-amber-200/90 uppercase tracking-wider mt-1">
              Complaints Resolved
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#ffc20e]/40 transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#ffc20e] flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-heading-playfair text-white">
              {stats.avgResolutionDays}
            </div>
            <div className="text-[11px] font-extrabold text-amber-200/90 uppercase tracking-wider mt-1">
              Avg Resolution Time
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#ffc20e]/40 transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#ffc20e] flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-heading-playfair text-white">
              {stats.departmentsConnected}
            </div>
            <div className="text-[11px] font-extrabold text-amber-200/90 uppercase tracking-wider mt-1">
              Depts Connected
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#ffc20e]/40 transition-all text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#ffc20e] flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-heading-playfair text-white">
              {stats.slaPassRate}
            </div>
            <div className="text-[11px] font-extrabold text-amber-200/90 uppercase tracking-wider mt-1">
              SLA Pass Rate
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. SLIM STICKY BOTTOM BAR ────────────────────────────────────────── */}
      {!stickyBarDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#4a1208] text-white py-3 px-4 border-t-2 border-[#ffc20e] shadow-2xl flex items-center justify-between animate-slide-up">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold tracking-wide">
              <Sparkles className="w-4 h-4 text-[#ffc20e] animate-pulse" />
              <span>Have a concern? Raise it now.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-1.5 bg-[#ffc20e] hover:bg-[#e0a800] text-[#4a1208] font-black text-xs uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                Submit Complaint
              </button>

              <button
                onClick={() => setStickyBarDismissed(true)}
                className="p-1 rounded-full text-amber-200 hover:text-white hover:bg-rose-900/60 cursor-pointer"
                title="Dismiss"
                aria-label="Dismiss sticky notification bar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
