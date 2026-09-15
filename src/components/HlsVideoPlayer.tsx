import React, { useEffect, useRef } from 'react';

interface HlsVideoPlayerProps {
  src?: string;
  overlayOpacity?: string;
  isFlipped?: boolean;
}

export const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({
  src = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
  overlayOpacity = 'bg-black/20',
  isFlipped = false
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: any = null;
    const Hls = (window as any).Hls;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        autoStartLoad: true,
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari, iOS)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 ${
          isFlipped ? 'scale-y-[-1]' : ''
        }`}
      />
      {/* Dark overlay */}
      <div className={`absolute inset-0 ${overlayOpacity} pointer-events-none`} />

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </div>
  );
};
