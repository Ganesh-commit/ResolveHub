import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Image as ImageIcon } from 'lucide-react';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    image: '/carousel/slide1.webp',
    title: 'Welcome to ResolveHub Campus Portal',
    subtitle: 'Streamlining communication between university students and campus administration.',
    tag: 'UNIVERSITY CAMPUS'
  },
  {
    id: 2,
    image: '/carousel/slide2.webp',
    title: 'Safe, Inclusive & Modern Learning Environment',
    subtitle: 'Dedicated to student welfare, rapid issue resolution, and continuous improvement.',
    tag: 'CAMPUS HERITAGE'
  },
  {
    id: 3,
    image: '/carousel/slide3.png',
    title: 'Every Concern Heard. Every Complaint Resolved.',
    subtitle: 'Smart categorization, confidential reporting, direct department routing & real-time tracking.',
    tag: 'DIRECT RESOLUTION'
  }
];

export const CampusImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Automatically move every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <div className="w-full my-6">
      <div 
        className="relative w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/80 group bg-slate-900"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        {/* Slides Container */}
        <div 
          className="w-full h-full flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="w-full h-full flex-shrink-0 relative overflow-hidden bg-slate-950"
            >
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover object-center transition-transform duration-1000 scale-105 group-hover:scale-100"
              />
              
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              
              {/* Caption Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white z-10">
                <div className="max-w-3xl space-y-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow-xs">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {slide.tag}
                  </span>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-md font-heading text-white">
                    {slide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed drop-shadow-xs">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Previous Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Bar: Indicators & Pause/Play */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 flex items-center gap-3 z-20 bg-slate-950/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
          {/* Pause / Play button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause auto-slide' : 'Start auto-slide'}
            className="text-white hover:text-emerald-400 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause auto-slide' : 'Start auto-slide'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === index 
                    ? 'w-7 h-2.5 bg-emerald-400' 
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
