import React from 'react';

export const CivicCommunityBg: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Image Base */}
      <div 
        className="absolute inset-0 bg-cover bg-bottom opacity-25 mix-blend-multiply transition-opacity duration-700"
        style={{ backgroundImage: `url('/civic_community_bg.png')` }}
      />

      {/* Warm Sunlight Soft Glow Top Gradient */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-amber-100/60 via-amber-50/20 to-transparent blur-3xl rounded-full" />
      
      {/* City Skyline Background SVG Layer */}
      <svg
        className="absolute bottom-0 w-full h-[650px] text-slate-900"
        preserveAspectRatio="xMidYMax slice"
        viewBox="0 0 1440 650"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffdfa" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#fef3c7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>

          <linearGradient id="accentPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft Sky Background Overlay */}
        <rect width="1440" height="650" fill="url(#skyGrad)" />

        {/* Far Background City Skyline (Subtle silhouetted pastel buildings) */}
        <g opacity="0.18">
          <rect x="220" y="320" width="45" height="180" rx="3" fill="#64748b" />
          <rect x="275" y="280" width="60" height="220" rx="4" fill="#94a3b8" />
          <rect x="345" y="340" width="40" height="160" rx="2" fill="#cbd5e1" />
          <rect x="1050" y="290" width="70" height="210" rx="4" fill="#94a3b8" />
          <rect x="1130" y="330" width="50" height="170" rx="3" fill="#cbd5e1" />
          <rect x="1190" y="310" width="65" height="190" rx="3" fill="#64748b" />
        </g>

        {/* Sun Rays Effect */}
        <g opacity="0.12" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 6">
          <line x1="720" y1="40" x2="300" y2="400" />
          <line x1="720" y1="40" x2="500" y2="480" />
          <line x1="720" y1="40" x2="940" y2="480" />
          <line x1="720" y1="40" x2="1140" y2="400" />
        </g>

        {/* LEFT SIDE: Welcoming Public Municipal / Community Building */}
        <g id="left-civic-building" transform="translate(-40, 130) scale(0.75)">
          {/* Main Building Frame */}
          <rect x="40" y="290" width="280" height="260" rx="16" fill="url(#buildingGrad)" stroke="#e2e8f0" strokeWidth="2" />
          
          {/* Portico / Roof Trim */}
          <path d="M30 290 L180 210 L330 290 Z" fill="url(#roofGrad)" />
          
          {/* Columns */}
          <rect x="75" y="340" width="16" height="190" rx="3" fill="#e2e8f0" />
          <rect x="135" y="340" width="16" height="190" rx="3" fill="#e2e8f0" />
          <rect x="205" y="340" width="16" height="190" rx="3" fill="#e2e8f0" />
          <rect x="265" y="340" width="16" height="190" rx="3" fill="#e2e8f0" />

          {/* Arched Windows */}
          <path d="M85 360 A 18 18 0 0 1 121 360 V 400 H 85 Z" fill="#38bdf8" fillOpacity="0.25" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M215 360 A 18 18 0 0 1 251 360 V 400 H 215 Z" fill="#38bdf8" fillOpacity="0.25" stroke="#cbd5e1" strokeWidth="1.5" />
          
          {/* Main Entrance Double Doors */}
          <rect x="148" y="440" width="64" height="90" rx="6" fill="#15803d" fillOpacity="0.9" />
          <rect x="153" y="446" width="24" height="78" rx="3" fill="#ffffff" fillOpacity="0.3" />
          <rect x="183" y="446" width="24" height="78" rx="3" fill="#ffffff" fillOpacity="0.3" />

          {/* Clock / Emblem on Pediment */}
          <circle cx="180" cy="255" r="16" fill="#ffffff" stroke="#15803d" strokeWidth="2.5" />
          <path d="M180 245 V 255 H 186" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

          {/* Sign on Left Building */}
          <g transform="translate(75, 305)">
            <rect x="0" y="0" width="210" height="34" rx="6" fill="#15803d" stroke="#dcfce7" strokeWidth="1.5" />
            <text x="105" y="13" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.8">
              UNIVERSITY ADMINISTRATION &
            </text>
            <text x="105" y="25" textAnchor="middle" fill="#fef08a" fontSize="7.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="0.8">
              STUDENT WELFARE HUB
            </text>
          </g>
        </g>

        {/* RIGHT SIDE: Wooden Notice Board */}
        <g id="right-notice-board" transform="translate(1250, 150) scale(0.75)">
          {/* Wooden Posts */}
          <rect x="25" y="100" width="12" height="110" rx="2" fill="url(#woodGrad)" />
          <rect x="165" y="100" width="12" height="110" rx="2" fill="url(#woodGrad)" />

          {/* Board Frame */}
          <rect x="0" y="0" width="200" height="120" rx="8" fill="#b45309" stroke="#78350f" strokeWidth="3" />
          {/* Board Inner Cork Texture */}
          <rect x="8" y="8" width="184" height="104" rx="5" fill="#fef3c7" />

          {/* Pinned Note 1 */}
          <g transform="translate(18, 16) rotate(-2)">
            <rect x="0" y="0" width="165" height="88" rx="4" fill="#ffffff" stroke="#fcd34d" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
            {/* Red Push Pin */}
            <circle cx="82" cy="7" r="4" fill="#ef4444" />
            
            {/* Handwritten-Style Text for Campus */}
            <text x="82" y="28" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="700" fontFamily="Outfit, sans-serif">
              Your Voice Builds
            </text>
            <text x="82" y="48" textAnchor="middle" fill="#15803d" fontSize="12" fontWeight="800" fontFamily="Outfit, sans-serif">
              a Better Campus
            </text>
            <text x="82" y="68" textAnchor="middle" fill="#4f46e5" fontSize="12" fontWeight="800" fontFamily="Outfit, sans-serif">
              Community
            </text>
          </g>
        </g>

        {/* GROUND / PATHWAY & PARK ELEMENTS */}
        {/* Soft Curving Pathway */}
        <path
          d="M 600 650 C 650 560, 520 520, 480 490 C 440 460, 400 480, 360 540 L 320 650 Z"
          fill="#f1f5f9"
          opacity="0.75"
        />
        <path
          d="M 600 650 C 650 560, 520 520, 480 490"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Grass / Lawn Layers */}
        <path d="M 0 520 Q 360 480 720 520 T 1440 500 V 650 H 0 Z" fill="#dcfce7" fillOpacity="0.45" />
        <path d="M 0 550 Q 400 520 800 560 T 1440 540 V 650 H 0 Z" fill="#bbf7d0" fillOpacity="0.55" />

        {/* TREES & GREENERY (Pastel round canopy trees) */}
        {/* Left Park Trees */}
        <g id="left-trees">
          {/* Tree 1 */}
          <rect x="335" y="420" width="14" height="80" rx="3" fill="#78350f" />
          <circle cx="342" cy="400" r="38" fill="#86efac" fillOpacity="0.8" />
          <circle cx="325" cy="415" r="28" fill="#4ade80" fillOpacity="0.85" />
          <circle cx="360" cy="410" r="26" fill="#22c55e" fillOpacity="0.8" />

          {/* Bush near building */}
          <path d="M 30 520 Q 50 480 80 520 Q 110 470 140 520 Z" fill="#4ade80" opacity="0.7" />
        </g>

        {/* Right Park Trees */}
        <g id="right-trees">
          {/* Tree 2 */}
          <rect x="1110" y="410" width="16" height="100" rx="3" fill="#78350f" />
          <circle cx="1118" cy="385" r="45" fill="#a7f3d0" fillOpacity="0.85" />
          <circle cx="1090" cy="405" r="32" fill="#34d399" fillOpacity="0.8" />
          <circle cx="1145" cy="400" r="30" fill="#10b981" fillOpacity="0.8" />

          {/* Tree 3 */}
          <rect x="1040" y="440" width="12" height="70" rx="2" fill="#78350f" />
          <circle cx="1046" cy="425" r="32" fill="#6ee7b7" fillOpacity="0.8" />
        </g>

        {/* STREET LAMPS (Pastel classic civic streetlamps) */}
        {/* Left Lamp */}
        <g id="street-lamp-left" transform="translate(380, 440)">
          <rect x="6" y="20" width="6" height="70" rx="2" fill="#475569" />
          <circle cx="9" cy="20" r="7" fill="#fef08a" filter="url(#softGlow)" />
          <path d="M 2 20 L 16 20 L 13 10 L 5 10 Z" fill="#334155" />
          {/* Lamp Light Glow Cone */}
          <polygon points="9,20 -15,90 33,90" fill="#fef08a" opacity="0.15" />
        </g>

        {/* Right Lamp */}
        <g id="street-lamp-right" transform="translate(1010, 440)">
          <rect x="6" y="20" width="6" height="70" rx="2" fill="#475569" />
          <circle cx="9" cy="20" r="7" fill="#fef08a" filter="url(#softGlow)" />
          <path d="M 2 20 L 16 20 L 13 10 L 5 10 Z" fill="#334155" />
          {/* Lamp Light Glow Cone */}
          <polygon points="9,20 -15,90 33,90" fill="#fef08a" opacity="0.15" />
        </g>

        {/* PARK BENCHES */}
        {/* Left Bench */}
        <g id="bench-left" transform="translate(410, 495)">
          <rect x="0" y="0" width="48" height="6" rx="2" fill="#92400e" />
          <rect x="0" y="9" width="48" height="6" rx="2" fill="#92400e" />
          <rect x="6" y="15" width="4" height="15" fill="#334155" />
          <rect x="38" y="15" width="4" height="15" fill="#334155" />
        </g>

        {/* Right Bench */}
        <g id="bench-right" transform="translate(950, 495)">
          <rect x="0" y="0" width="48" height="6" rx="2" fill="#92400e" />
          <rect x="0" y="9" width="48" height="6" rx="2" fill="#92400e" />
          <rect x="6" y="15" width="4" height="15" fill="#334155" />
          <rect x="38" y="15" width="4" height="15" fill="#334155" />
        </g>
      </svg>
    </div>
  );
};
