import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FastForward, Volume2, VolumeX } from 'lucide-react';

interface VideoOpeningProps {
  /**
   * Video source URL. Defaults to '/videos/intro.mp4'.
   */
  src?: string;
  /**
   * Optional callback triggered when intro finishes or is skipped.
   */
  onComplete?: () => void;
  /**
   * If true, forces intro to play.
   */
  forcePlay?: boolean;
}

export const VideoOpening: React.FC<VideoOpeningProps> = ({
  src = '/videos/intro.mp4',
  onComplete,
  forcePlay = false,
}) => {
  // Always true on every page refresh/open as requested
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (forcePlay) return true;
    try {
      if (localStorage.getItem('nsn969_intro_disabled') === 'true') {
        return false;
      }
      return true; // Always show on refresh
    } catch {
      return true;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showSkipButton, setShowSkipButton] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stop web background music and notify system when intro starts
  useEffect(() => {
    if (!isVisible) return;

    window.dispatchEvent(new CustomEvent('nsn969:intro-start'));

    // Pause any web audio elements on document
    document.querySelectorAll('audio').forEach((el) => {
      try {
        el.pause();
        el.currentTime = 0;
      } catch (_) {}
    });
  }, [isVisible]);

  // Mark intro as completed and trigger smooth fade out
  const handleFinish = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);

    // Notify that intro has ended so web can resume
    window.dispatchEvent(new CustomEvent('nsn969:intro-end'));

    fadeTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 600); // 600ms smooth fade transition
  }, [isFadingOut, onComplete]);

  // Handle immediate skip
  const handleSkip = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleFinish();
  }, [handleFinish]);

  // Toggle audio mute/unmute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1;
        // ensure video is playing if unmuted
        videoRef.current.play().catch(() => {});
      }
      setIsMuted(nextMuted);
    }
  };

  // Prevent body scrolling while intro is active
  useEffect(() => {
    if (!isVisible) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isVisible]);

  // Keyboard shortcut listener (Escape or Space to skip)
  useEffect(() => {
    if (!isVisible || isFadingOut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isFadingOut, handleSkip]);

  // User click / touch anywhere on screen will ensure video plays and unmutes audio
  const handleContainerClick = () => {
    if (!videoRef.current) return;
    
    // If paused, trigger play
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }

    // If muted, attempt unmute so user gets the audio experience
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      setIsMuted(false);
    }
  };

  // Listen for global custom event to replay intro on demand (e.g. from admin or settings)
  useEffect(() => {
    const handleReplayIntro = () => {
      setIsVisible(true);
      setIsFadingOut(false);
      setShowSkipButton(true);
      window.dispatchEvent(new CustomEvent('nsn969:intro-start'));
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        // Attempt play unmuted first
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        videoRef.current.play()
          .then(() => {
            setIsMuted(false);
            setIsPlaying(true);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      }
    };

    window.addEventListener('nsn969:play-intro', handleReplayIntro);
    return () => window.removeEventListener('nsn969:play-intro', handleReplayIntro);
  }, []);

  // Safe and robust autoplay routine
  useEffect(() => {
    if (!isVisible) return;

    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    // Start with muted by default to guarantee browser autoplay permission
    video.muted = true;
    setIsMuted(true);

    const startPlayback = async () => {
      try {
        await video.play();
        if (isMounted) {
          setIsPlaying(true);
          // Try to unmute once playback has securely started
          try {
            video.muted = false;
            video.volume = 1;
            setIsMuted(false);
          } catch {
            // Autoplay unmuted not allowed yet without user interaction
            video.muted = true;
            setIsMuted(true);
          }
        }
      } catch (err) {
        console.warn('[VideoOpening] Autoplay waiting for interaction:', err);
        // Do not close the intro! Keep it ready to play on first user interaction.
      }
    };

    // If video is already ready, play immediately; otherwise listen for ready events
    if (video.readyState >= 2) {
      startPlayback();
    } else {
      const onCanPlay = () => {
        startPlayback();
        video.removeEventListener('canplay', onCanPlay);
      };
      video.addEventListener('canplay', onCanPlay);
    }

    return () => {
      isMounted = false;
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      id="nsn969-video-opening"
      onClick={handleContainerClick}
      className={`fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] bg-black select-none overflow-hidden transition-opacity duration-600 ease-out flex items-center justify-center cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Video Opening"
    >
      {/* Fullscreen Video Element - Synchronous direct src for instant load */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover pointer-events-none"
        playsInline
        autoPlay
        muted={isMuted}
        preload="auto"
        onPlaying={() => setIsPlaying(true)}
        onEnded={handleFinish}
        onError={() => {
          console.warn('[VideoOpening] Source error, attempting fallback source.');
          if (videoRef.current && videoRef.current.src !== '/intro.mp4') {
            videoRef.current.src = '/intro.mp4';
            videoRef.current.load();
            videoRef.current.play().catch(() => {});
          }
        }}
      >
        <source src={src} type="video/mp4" />
        <source src="/videos/intro.mp4" type="video/mp4" />
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* Pojok Kanan Atas: Icon Speaker Audio Toggle Only */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-40 pointer-events-auto">
        <button
          onClick={toggleMute}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.7)] group"
          title={isMuted ? 'Nyalakan Suara (Unmute)' : 'Matikan Suara (Mute)'}
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white/80 group-hover:text-white transition-transform group-hover:scale-105" />
          ) : (
            <Volume2 className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-transform group-hover:scale-105" />
          )}
        </button>
      </div>

      {/* Pojok Kanan Bawah: Icon Skip Button Only */}
      <div
        className={`absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 pointer-events-auto transition-opacity duration-300 ${
          showSkipButton ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={handleSkip}
          className="px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-white/50 text-white text-xs sm:text-sm font-semibold tracking-wider flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.7)] group"
          title="Lewati Intro"
          aria-label="Skip Intro"
        >
          <span>Skip</span>
          <FastForward className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
