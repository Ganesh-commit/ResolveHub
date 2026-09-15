import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  const words = ['Triage', 'Dispatch', 'Resolve', 'Accountability'];

  // 000 -> 100 Counter over 2700ms using requestAnimationFrame
  useEffect(() => {
    const duration = 2700;
    const start = performance.now();

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * 100);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    const id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [onComplete]);

  // Rotating words cycling every 900ms
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 900);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-body animate-fade-in">
      {/* Top Left Label */}
      <div className="text-xs text-muted uppercase tracking-[0.3em] font-medium flex items-center gap-2 animate-slide-up">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>ResolvePulse Redressal Protocol</span>
      </div>

      {/* Center: Rotating Words */}
      <div className="flex-1 flex items-center justify-center">
        <div
          key={wordIndex}
          className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/85 text-center animate-role-fade-in transition-all duration-300"
        >
          {words[wordIndex]}
        </div>
      </div>

      {/* Bottom Row: Counter + Progress Bar */}
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <span className="text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums tracking-tighter leading-none">
            {String(count).padStart(3, '0')}
          </span>
        </div>

        {/* Bottom Progress Bar */}
        <div className="h-[3px] w-full bg-stroke/50 rounded-full overflow-hidden">
          <div
            className="h-full accent-gradient transition-all duration-75 origin-left"
            style={{
              transform: `scaleX(${count / 100})`,
              boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
