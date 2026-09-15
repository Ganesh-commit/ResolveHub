import React, { useState } from 'react';
import { useGrievance } from '../context/GrievanceContext';
import { X } from 'lucide-react';

export const ParallaxExplorations: React.FC = () => {
  const { setActiveView } = useGrievance();
  const [activeLightbox, setActiveLightbox] = useState<number | null>(null);

  const explorationCards = [
    {
      id: 1,
      tag: 'QUADRANT-C',
      title: 'HVAC Chiller Sensor Telemetry',
      subtitle: 'Continuous thermal scan across server racks & hostel block C',
      img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:-rotate-2'
    },
    {
      id: 2,
      tag: 'NOC-BACKBONE',
      title: '5GHz Wireless Mesh Monitoring',
      subtitle: 'Real-time ping monitor across 48 enterprise access points',
      img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:rotate-3'
    },
    {
      id: 3,
      tag: 'BIO-AUDIT',
      title: 'Drinking Water Purity Station',
      subtitle: 'Electrochemical TDS analysis logging 45 PPM average',
      img: 'https://images.unsplash.com/photo-1584772658145-12cf518c8651?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:-rotate-3'
    },
    {
      id: 4,
      tag: 'MOBILE-UNIT',
      title: 'Rapid Field Technician Van',
      subtitle: 'Equipped with diagnostic oscilloscopes & replacement components',
      img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:rotate-2'
    },
    {
      id: 5,
      tag: 'CENTRAL-DESK',
      title: 'Dispatch Command Lead Station',
      subtitle: '24/7 operator supervision with statutory escalation protocols',
      img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:-rotate-1'
    },
    {
      id: 6,
      tag: 'AUDIT-TRAIL',
      title: 'Cryptographic Ledger Sign-off',
      subtitle: 'Citizen mobile confirmation upon physical verification',
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      rotation: 'md:rotate-3'
    }
  ];

  return (
    <section id="explorations" className="relative bg-bg py-24 border-t border-stroke/40 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Sticky/Pinned Center Content */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs text-muted uppercase tracking-[0.3em] font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Telemetry & Field Response</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-text-primary tracking-tight mb-4">
            Visual <span className="font-display italic text-text-primary">field playground</span>
          </h2>
          <p className="text-sm md:text-base text-muted max-w-md mx-auto mb-6">
            Explore live diagnostic feeds, sensor stations, and field response crews operating across the campus grid.
          </p>

          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-primary border border-stroke hover:border-transparent rounded-full px-6 py-3 transition-all relative group cursor-pointer"
          >
            <span className="absolute -inset-[2px] rounded-full accent-gradient-border opacity-0 group-hover:opacity-100 transition-opacity blur-[1px]" />
            <span className="relative flex items-center gap-1.5">
              <span>Enter Dispatch Command</span>
              <span>↗</span>
            </span>
          </button>
        </div>

        {/* 2-Column Parallax Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-[1000px] mx-auto">
          {/* Column 1 */}
          <div className="space-y-12 md:space-y-20">
            {explorationCards.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveLightbox(item.id)}
                className={`relative group bg-surface border border-stroke rounded-3xl p-5 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer shadow-2xl hover:border-white/20 ${item.rotation}`}
              >
                <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md border border-white/10 text-cyan-300">
                    {item.tag}
                  </div>
                </div>

                <h4 className="text-lg font-normal text-text-primary group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Column 2 (offset down for parallax staggered feel) */}
          <div className="space-y-12 md:space-y-20 md:pt-16">
            {explorationCards.slice(3, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveLightbox(item.id)}
                className={`relative group bg-surface border border-stroke rounded-3xl p-5 overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer shadow-2xl hover:border-white/20 ${item.rotation}`}
              >
                <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 relative">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md border border-white/10 text-emerald-300">
                    {item.tag}
                  </div>
                </div>

                <h4 className="text-lg font-normal text-text-primary group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full bg-surface border border-stroke rounded-3xl p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const card = explorationCards.find((c) => c.id === activeLightbox);
              if (!card) return null;
              return (
                <div>
                  <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4">
                    <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-mono text-xs text-cyan-400 font-bold uppercase">
                    {card.tag}
                  </span>
                  <h3 className="text-2xl font-normal text-text-primary mt-1 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {card.subtitle}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
};
