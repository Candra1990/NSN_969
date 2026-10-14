import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Volume1, VolumeX, ListMusic, Music, Repeat, Shuffle } from 'lucide-react';
import { useTracks } from '@/hooks/useTracks';
import { Backsound } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/contexts/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageProvider';

export function AudioPlayer() {
  const { tracks: dbTracks } = useTracks();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [tracks, setTracks] = useState<Backsound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showTracklist, setShowTracklist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showDeck, setShowDeck] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Audio-reactive states
  const [bassIntensity, setBassIntensity] = useState<number>(0);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dragging volume state references
  const volumeDialRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const initialVolumeRef = useRef<number>(0.85);
  const hasMovedVolumeRef = useRef<boolean>(false);

  // Stop web backsound music whenever intro is playing
  useEffect(() => {
    const handleIntroStart = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };

    window.addEventListener('nsn969:intro-start', handleIntroStart);
    return () => {
      window.removeEventListener('nsn969:intro-start', handleIntroStart);
    };
  }, []);

  // Synchronize dynamic backsounds list with database/API
  useEffect(() => {
    if (dbTracks && dbTracks.length > 0) {
      setTracks(dbTracks);
    } else {
      let active = true;
      const fetchLocalMusic = async () => {
        try {
          const res = await fetch('/api/music');
          if (res.ok) {
            const data = await res.json();
            if (active && data.tracks && data.tracks.length > 0) {
              setTracks(data.tracks);
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch dynamic music files, using fallback.', err);
        }
        if (active) {
          setTracks([
            { id: 'track-1', title: 'NSN969 SIAP TEMPUR', artist: 'Donz', url: '/music/nsn969soung.mp3' },
            { id: 'track-2', title: 'NSN969 MUSIC', artist: 'Analist Magang', url: '/music/nsn969music.mp3' }
          ]);
        }
      };
      fetchLocalMusic();
      return () => {
        active = false;
      };
    }
  }, [dbTracks]);

  const currentTrack = tracks[currentIndex] || tracks[0];

  // Initialize Web Audio API Analyser
  const initWebAudio = useCallback(() => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx || !audioRef.current) return;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128; // gives 64 bins for smooth spectrum
      analyser.smoothingTimeConstant = 0.8;

      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceNodeRef.current = source;
      } catch (err) {
        console.warn('Media element source setup deferred/handled:', err);
      }

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    } catch (err) {
      console.warn('AudioContext init error:', err);
    }
  }, []);

  // Auto-play listener configuration
  useEffect(() => {
    let mounted = true;
    let interactionFired = false;

    const removeListeners = () => {
      window.removeEventListener('click', attemptPlay);
      window.removeEventListener('keydown', attemptPlay);
      window.removeEventListener('touchstart', attemptPlay);
      window.removeEventListener('mousedown', attemptPlay);
    };

    const attemptPlay = () => {
      initWebAudio();
      if (!audioRef.current || !mounted || interactionFired) return;
      audioRef.current.play()
        .then(() => {
          if (mounted) {
            interactionFired = true;
            setIsPlaying(true);
            removeListeners();
          }
        })
        .catch(() => {});
    };

    if (isPlaying && currentTrack?.url) {
      attemptPlay();

      window.addEventListener('click', attemptPlay, { once: false });
      window.addEventListener('keydown', attemptPlay, { once: false });
      window.addEventListener('touchstart', attemptPlay, { once: false });
      window.addEventListener('mousedown', attemptPlay, { once: false });
    }

    return () => {
      mounted = false;
      removeListeners();
    };
  }, [isPlaying, currentTrack?.url, initWebAudio]);

  useEffect(() => {
    let mounted = true;
    if (audioRef.current && currentTrack?.url) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
    return () => {
      mounted = false;
    };
  }, [currentIndex, currentTrack?.url]);

  useEffect(() => {
    let mounted = true;
    if (audioRef.current) {
      if (isPlaying) {
        initWebAudio();
        audioRef.current.play().catch((err) => {
          if (mounted && err?.name !== 'AbortError') {
            console.warn('Playback deferred:', err);
          }
        });
      } else {
        try {
          audioRef.current.pause();
        } catch (_) {}
      }
    }
    return () => {
      mounted = false;
    };
  }, [isPlaying, initWebAudio]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Symmetrical Organic Golden Waveform Canvas Visualizer with Bass Guncangan
  useEffect(() => {
    let animId: number;

    const drawWaveform = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(drawWaveform);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(drawWaveform);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const hasAudio = isPlaying && audioRef.current && !audioRef.current.paused;
      const time = hasAudio ? (audioRef.current.currentTime || Date.now() / 1000) : (Date.now() / 2000);

      let currentBass = 0;
      let hasRealData = false;
      const freqData = new Uint8Array(64);

      if (hasAudio && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
        const sum = freqData.slice(0, 8).reduce((a, b) => a + b, 0);
        if (sum > 10) {
          hasRealData = true;
          currentBass = sum / (8 * 255);
        }
      }

      if (!hasRealData && hasAudio) {
        // Rhythmic synthetic pulse matching 128 BPM
        const beatPhase = (time * 2.133) % 1;
        const kickImpact = Math.pow(Math.max(0, 1 - beatPhase), 2.6);
        currentBass = 0.2 + kickImpact * 0.75;
      }

      setBassIntensity(currentBass);

      // Draw multi-layered glowing golden resonance ribbons (symmetric waveform)
      const layers = [
        { stroke: 'rgba(235, 194, 130, 0.95)', shadow: 'rgba(229, 169, 60, 0.7)', blur: 10, width: 2.2, amp: 1.0, freqMod: 1.0 },
        { stroke: 'rgba(212, 160, 84, 0.75)', shadow: 'rgba(183, 134, 72, 0.5)', blur: 6, width: 1.6, amp: 0.8, freqMod: 1.3 },
        { stroke: 'rgba(175, 120, 52, 0.55)', shadow: 'none', blur: 0, width: 1.2, amp: 0.55, freqMod: 1.7 },
        { stroke: 'rgba(255, 235, 195, 0.4)', shadow: 'rgba(255, 230, 170, 0.6)', blur: 8, width: 1.0, amp: 0.35, freqMod: 2.1 },
      ];

      layers.forEach((layer, layerIdx) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = layer.width;
        if (layer.blur > 0) {
          ctx.shadowColor = layer.shadow;
          ctx.shadowBlur = layer.blur;
        }

        const points = 72;
        // Top boundary of symmetrical wave
        for (let i = 0; i <= points; i++) {
          const x = (i / points) * width;
          // Normalized distance from center (0 at edges, 1 at center)
          const normX = i / points;
          const envelope = Math.sin(normX * Math.PI); // tapering at edges
          
          let waveOffset = 0;
          if (hasAudio) {
            const freqBin = Math.min(63, Math.floor(Math.abs(normX - 0.5) * 2 * 30));
            const freqFactor = hasRealData ? (freqData[freqBin] / 255) : currentBass;
            const primaryHarmonic = Math.sin(normX * 18 * layer.freqMod + time * 7 + layerIdx) * (18 + currentBass * 16);
            const secondaryHarmonic = Math.cos(normX * 32 * layer.freqMod - time * 5) * 7;
            const microFlutter = Math.sin(normX * 60 + time * 14) * 3;
            waveOffset = (primaryHarmonic + secondaryHarmonic + microFlutter) * envelope * layer.amp * (0.6 + freqFactor * 0.7);
          } else {
            // Calm dormant breathing ripple
            waveOffset = Math.sin(normX * 12 + time * 2) * envelope * 4 * layer.amp;
          }

          const y = midY - Math.abs(waveOffset);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Bottom symmetrical reflection
        for (let i = points; i >= 0; i--) {
          const x = (i / points) * width;
          const normX = i / points;
          const envelope = Math.sin(normX * Math.PI);
          
          let waveOffset = 0;
          if (hasAudio) {
            const freqBin = Math.min(63, Math.floor(Math.abs(normX - 0.5) * 2 * 30));
            const freqFactor = hasRealData ? (freqData[freqBin] / 255) : currentBass;
            const primaryHarmonic = Math.sin(normX * 18 * layer.freqMod + time * 7 + layerIdx) * (18 + currentBass * 16);
            const secondaryHarmonic = Math.cos(normX * 32 * layer.freqMod - time * 5) * 7;
            const microFlutter = Math.sin(normX * 60 + time * 14) * 3;
            waveOffset = (primaryHarmonic + secondaryHarmonic + microFlutter) * envelope * layer.amp * (0.6 + freqFactor * 0.7);
          } else {
            waveOffset = Math.sin(normX * 12 + time * 2) * envelope * 4 * layer.amp;
          }

          const y = midY + Math.abs(waveOffset);
          ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();

        // Delicate warm fill between lines
        if (layerIdx === 0 && hasAudio) {
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, 'rgba(197, 138, 62, 0)');
          gradient.addColorStop(0.3, `rgba(229, 169, 60, ${0.05 + currentBass * 0.08})`);
          gradient.addColorStop(0.5, `rgba(255, 210, 125, ${0.08 + currentBass * 0.12})`);
          gradient.addColorStop(0.7, `rgba(229, 169, 60, ${0.05 + currentBass * 0.08})`);
          gradient.addColorStop(1, 'rgba(197, 138, 62, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        ctx.restore();
      });

      // Subtle horizontal centerline
      ctx.save();
      ctx.strokeStyle = 'rgba(197, 138, 62, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(drawWaveform);
    };

    animId = requestAnimationFrame(drawWaveform);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleAudioEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    if (tracks.length > 0) {
      if (isShuffle) {
        const nextIdx = Math.floor(Math.random() * tracks.length);
        setCurrentIndex(nextIdx);
      } else {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
      }
    }
  };

  const togglePlay = () => {
    initWebAudio();
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length > 0) {
      if (isShuffle) {
        const nextIdx = Math.floor(Math.random() * tracks.length);
        setCurrentIndex(nextIdx);
      } else {
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
      }
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (tracks.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(0.85);
    } else {
      setIsMuted(true);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value);
    if (audioRef.current && duration > 0) {
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Draggable Round Rotary Speaker Knob Volume Handler
  // Dragging left decreases volume, dragging right increases volume
  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingVolume(true);
    hasMovedVolumeRef.current = false;
    dragStartXRef.current = e.clientX;
    initialVolumeRef.current = volume;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleVolumePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVolume || dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 2) {
      hasMovedVolumeRef.current = true;
    }
    // Sensitivity: 120px drag represents full 0 -> 1 volume change
    const deltaVolume = deltaX / 120;
    const newVolume = Math.max(0, Math.min(1, initialVolumeRef.current + deltaVolume));
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleVolumePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVolume) return;
    setIsDraggingVolume(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Tap without moving toggles mute
    if (!hasMovedVolumeRef.current) {
      toggleMute();
    }
    dragStartXRef.current = null;
  };

  const stepVolumeDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVol = Math.max(0, Math.round((volume - 0.05) * 100) / 100);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const stepVolumeUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVol = Math.min(1, Math.round((volume + 0.05) * 100) / 100);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercentage = Math.round(effectiveVolume * 100);

  // Volume rotary angle for visual feedback (-135deg to +135deg)
  const knobRotationAngle = -135 + effectiveVolume * 270;

  return (
    <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-3.5 pointer-events-auto select-none font-sans">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* Luxury Bespoke Audio Deck Controller - Rebuilt exactly as shown in reference image */}
      <AnimatePresence>
        {showDeck && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[22.5rem] md:w-[24.5rem] rounded-[30px] p-5.5 space-y-4 overflow-visible relative shadow-[0_30px_70px_rgba(0,0,0,0.95)] border border-[#c58a3e]/30 transition-all select-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, #202227 0%, #151619 50%, #0d0e10 100%)',
              boxShadow: '0 25px 65px rgba(0, 0, 0, 0.92), inset 0 1px 1px rgba(255, 230, 180, 0.15), inset 0 -2px 4px rgba(0,0,0,0.8)'
            }}
          >
            {/* Top Center Bronze Latch / Tab Accent */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-t-lg bg-gradient-to-b from-[#8f632d] to-[#422d13] border-t border-x border-[#d8a356]/40 shadow-sm pointer-events-none" />

            {/* Fine Leather / Perforated Chassis Texture Overlay */}
            <div 
              className="absolute inset-0 rounded-[30px] pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '4px 4px'
              }}
            />

            {/* Header: Glowing Amber LED Dot & Spaced Bronze Monospace Typography */}
            <div className="flex items-center justify-between pb-1 relative z-10">
              <div className="flex items-center gap-2.5">
                {/* Glowing Amber LED Dot */}
                <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0a638] opacity-70"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-[#ffe082] to-[#e69526] shadow-[0_0_8px_#f0a638]"></span>
                </span>
                
                {/* NSN969 AUDIO Typography */}
                <h3 className="text-[12px] font-mono font-bold tracking-[0.25em] text-[#d6a564] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  NSN969 AUDIO
                </h3>
              </div>
            </div>

            {/* Upper Track Info Panel with Spinning Bronze Vinyl & Crescent Aura */}
            <div 
              className="p-3.5 rounded-2xl relative z-10 flex items-center gap-4 border border-[#3e2e1a]/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.03)]"
              style={{
                background: 'linear-gradient(180deg, #121316 0%, #0a0b0d 100%)'
              }}
            >
              {/* Spinning Bronze Vinyl Disc with Outer Golden Crescent Arc */}
              <div 
                onClick={togglePlay}
                title={isPlaying ? "Klik untuk jeda lagu" : "Klik untuk putar lagu"}
                className="relative shrink-0 w-[4.5rem] h-[4.5rem] cursor-pointer flex items-center justify-center group"
              >
                {/* Golden Crescent Arc Hugging Top-Left of Disc */}
                <div 
                  className="absolute -inset-1 rounded-full border-2 border-transparent pointer-events-none transition-all duration-300"
                  style={{
                    borderTopColor: '#f3c77d',
                    borderLeftColor: '#d69e43',
                    filter: 'drop-shadow(0 0 6px rgba(243,199,125,0.65))',
                    transform: 'rotate(-25deg)'
                  }}
                />

                {/* Bronze Metallic Vinyl Disc */}
                <div 
                  className="w-16 h-16 rounded-full relative flex items-center justify-center overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
                  style={{
                    background: 'radial-gradient(circle at center, #2e2113 0%, #7d592b 25%, #473218 45%, #9b723a 65%, #2a1d0f 85%, #150f08 100%)',
                    boxShadow: isPlaying
                      ? `0 4px 18px rgba(0,0,0,0.9), 0 0 ${8 + bassIntensity * 20}px rgba(214,158,67,${0.3 + bassIntensity * 0.4})`
                      : '0 4px 14px rgba(0,0,0,0.85)',
                    transform: isPlaying ? `scale(${1 + bassIntensity * 0.03})` : 'scale(1)',
                    transition: 'transform 0.08s ease-out'
                  }}
                >
                  {/* Concentric Rotating Platter with Radial Sheen */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: 'turntable-spin 3s linear infinite',
                      animationPlayState: isPlaying ? 'running' : 'paused'
                    }}
                  >
                    {/* Micro concentric groove lines */}
                    <div className="absolute inset-1 rounded-full border border-white/[0.08]" />
                    <div className="absolute inset-2 rounded-full border border-black/50" />
                    <div className="absolute inset-3 rounded-full border border-white/[0.07]" />
                    <div className="absolute inset-4 rounded-full border border-black/60" />
                    <div className="absolute inset-5 rounded-full border border-white/[0.06]" />

                    {/* Specular Light Sheen Cones */}
                    <div 
                      className="absolute inset-0 rounded-full pointer-events-none opacity-75"
                      style={{
                        background: 'conic-gradient(from 45deg, rgba(255,230,175,0.3) 0deg, transparent 45deg, rgba(255,230,175,0.1) 90deg, transparent 135deg, rgba(255,230,175,0.3) 180deg, transparent 225deg, rgba(255,230,175,0.1) 270deg, transparent 315deg, rgba(255,230,175,0.3) 360deg)'
                      }}
                    />

                    {/* Ornate Center Insignia Crest */}
                    <div className="absolute inset-[1.15rem] rounded-full bg-gradient-to-tr from-[#3a2814] via-[#855d2b] to-[#deb373] p-[1.5px] shadow-md flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#181109] flex flex-col items-center justify-center border border-black/80">
                        {/* Insignia / Monogram Motif */}
                        <svg className="w-3.5 h-3.5 text-[#e5b978]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Artist details */}
              <div className="min-w-0 flex-1">
                <h4 className="text-[14px] font-bold truncate tracking-wide text-zinc-100 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {currentTrack?.title || 'NSN969 SIAP TEMP'}
                </h4>
                <p className="text-[12px] text-[#bda482] font-serif italic truncate mt-0.5 tracking-wide">
                  {currentTrack?.artist || 'Donz'}
                </p>
              </div>
            </div>

            {/* DECK SPECTRUM & ACTIVE ANALYZER Waveform Screen */}
            <div 
              className="p-3 rounded-2xl border border-[#4a361e]/70 relative z-10 flex flex-col gap-1.5 overflow-hidden transition-all duration-75"
              style={{
                background: 'linear-gradient(180deg, #101114 0%, #08090a 100%)',
                boxShadow: isPlaying 
                  ? `inset 0 0 16px rgba(197, 138, 62, ${0.15 + bassIntensity * 0.25}), 0 0 ${10 + bassIntensity * 20}px rgba(214, 158, 67, ${0.1 + bassIntensity * 0.25})`
                  : 'inset 0 0 12px rgba(0, 0, 0, 0.8)',
                transform: isPlaying ? `translateY(${-bassIntensity * 2}px)` : 'none'
              }}
            >
              {/* Screen Header Labels */}
              <div className="flex items-center justify-between text-[8px] font-mono font-bold text-[#9e7d52] tracking-widest uppercase px-1">
                <span className="flex items-center gap-1.5">
                  DECK SPECTRUM
                  {isPlaying && (
                    <span className="w-1 h-1 rounded-full bg-[#e5a93c] animate-ping" />
                  )}
                </span>
              </div>

              {/* Canvas Waveform Visualizer */}
              <div className="w-full h-14 relative flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={56} 
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Scrubber / Progress Bar & Timestamps */}
            <div className="space-y-1 relative z-10 px-0.5 pt-0.5">
              <div className="relative group flex items-center h-4 cursor-pointer">
                {/* Background Track */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer outline-none transition-all group-hover:h-1.5 relative z-10"
                  style={{
                    background: `linear-gradient(to right, #cf9e58 ${progress}%, #23252a ${progress}%)`
                  }}
                />

                {/* Glowing Cream-Bronze Thumb */}
                <div 
                  className="absolute w-3.5 h-3.5 rounded-full bg-[#f3deb8] border-2 border-[#b57f35] shadow-[0_0_10px_#e5a93c] pointer-events-none z-20 -translate-x-[7px] transition-all duration-75"
                  style={{ left: `${progress}%` }}
                />
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8a7559] tracking-wider px-0.5 font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 227)}</span>
              </div>
            </div>

            {/* Lower Controls Cluster: Turntable Dial Deck + Rotary Speaker Volume + Tracklist Button */}
            <div className="flex items-center justify-between gap-2 pt-2 relative z-10">
              
              {/* Left Unit: Turntable Dial Cluster with Filigree Bezel, Repeat, Shuffle, Prev, Play/Pause, Next */}
              <div className="relative flex items-center">
                {/* Ornate Engraved Outer Ring Frame */}
                <div 
                  className="w-[9.25rem] h-[5.25rem] rounded-full border border-[#4f381f] flex items-center justify-between px-1.5 relative"
                  style={{
                    background: 'radial-gradient(ellipse at center, #17181c 0%, #0e0f11 70%, #08080a 100%)',
                    boxShadow: 'inset 0 1px 2px rgba(255, 230, 180, 0.1), 0 4px 14px rgba(0,0,0,0.85)'
                  }}
                >
                  {/* Subtle filigree engraving pattern overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-[#d8a356]" viewBox="0 0 148 84" fill="none">
                    <circle cx="74" cy="42" r="38" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="74" cy="42" r="32" stroke="currentColor" strokeWidth="0.5" />
                  </svg>

                  {/* Top-Left: Repeat Toggle */}
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    title={isRepeat ? "Ulangi lagu aktif" : "Ulangi lagu mati"}
                    className={`absolute top-1.5 left-5 text-[9px] p-1 transition-all cursor-pointer ${
                      isRepeat ? 'text-[#f0ba6e] drop-shadow-[0_0_4px_#e5a93c]' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <Repeat className="w-3 h-3" />
                  </button>

                  {/* Top-Right: Shuffle Toggle */}
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    title={isShuffle ? "Acak lagu aktif" : "Acak lagu mati"}
                    className={`absolute top-1.5 right-5 text-[9px] p-1 transition-all cursor-pointer ${
                      isShuffle ? 'text-[#f0ba6e] drop-shadow-[0_0_4px_#e5a93c]' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <Shuffle className="w-3 h-3" />
                  </button>

                  {/* Skip Previous Button */}
                  <button
                    onClick={handlePrev}
                    title="Lagu Sebelumnya"
                    className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#22242a] to-[#121316] border border-[#3e2e1a] text-[#bda482] hover:text-[#f0ba6e] active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm relative z-10"
                  >
                    <SkipBack className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Large Central Radial Bronze Play/Pause Dial */}
                  <button
                    onClick={togglePlay}
                    title={isPlaying ? "Jeda" : "Putar"}
                    className="w-13 h-13 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.9)] relative z-20 group"
                    style={{
                      background: 'radial-gradient(circle at 40% 35%, #ffdca0 0%, #ba8339 30%, #684517 65%, #352109 100%)',
                      border: '2px solid #573a16',
                      boxShadow: isPlaying 
                        ? `0 0 16px rgba(229,169,60,0.5), inset 0 1px 2px rgba(255,255,255,0.4)`
                        : 'inset 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                  >
                    {/* Concentric brushed ring */}
                    <div className="absolute inset-1 rounded-full border border-[#f0ba6e]/30 pointer-events-none" />

                    {/* Top & Bottom decorative marker pips */}
                    <div className="absolute top-1 w-1 h-1 rounded-full bg-[#3d270c]" />
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#3d270c]" />

                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-[#2c1c08] fill-current" />
                    ) : (
                      <Play className="w-5 h-5 text-[#2c1c08] fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Skip Next Button */}
                  <button
                    onClick={handleNext}
                    title="Lagu Selanjutnya"
                    className="w-7 h-7 rounded-lg bg-gradient-to-b from-[#22242a] to-[#121316] border border-[#3e2e1a] text-[#bda482] hover:text-[#f0ba6e] active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm relative z-10"
                  >
                    <SkipForward className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Middle-Right Unit: Bespoke Hi-Fi Rotary Volume Dial with Left/Right Horizontal Drag & Quick Step Controls */}
              <div className="flex flex-col items-center relative select-none">
                {/* Horizontal guidance with Left (-) and Right (+) indicators */}
                <div className="flex items-center gap-1.5 relative">
                  {/* Left Step Down Button (Decrease Volume) */}
                  <button
                    type="button"
                    onClick={stepVolumeDown}
                    className="w-5 h-5 rounded-md bg-[#16171b] hover:bg-[#252018] border border-[#3e2e1a] hover:border-[#e5a93c]/50 text-[#bda482] hover:text-[#f0ba6e] active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold leading-none"
                    title={language === 'id' ? 'Turunkan Volume (Geser ke Kiri)' : 'Decrease Volume (Drag Left)'}
                  >
                    −
                  </button>

                  {/* Master Rotary Volume Dial */}
                  <div 
                    ref={volumeDialRef}
                    onPointerDown={handleVolumePointerDown}
                    onPointerMove={handleVolumePointerMove}
                    onPointerUp={handleVolumePointerUp}
                    className={`w-16 h-16 rounded-full relative flex items-center justify-center cursor-ew-resize touch-none select-none transition-all duration-150 ${
                      isDraggingVolume ? 'scale-105' : 'hover:scale-[1.02]'
                    }`}
                    title={language === 'id' 
                      ? 'Geser ke kanan untuk nambah volume, ke kiri untuk turunkan. Klik untuk mute/unmute' 
                      : 'Drag right to increase, drag left to decrease. Click to mute/unmute'}
                  >
                    {/* SVG High-Precision Circular Arc Gauge */}
                    <svg className="w-full h-full transform -rotate-90 pointer-events-none absolute inset-0" viewBox="0 0 64 64">
                      <defs>
                        <linearGradient id="volGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#9e6f2c" />
                          <stop offset="50%" stopColor="#f0ba6e" />
                          <stop offset="100%" stopColor="#ffdca0" />
                        </linearGradient>
                      </defs>
                      {/* Background circular track */}
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="27" 
                        stroke="#261d12" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeDasharray="169.6" 
                        strokeDashoffset="42.4" 
                        strokeLinecap="round" 
                      />
                      {/* Active illuminated volume progress arc */}
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="27" 
                        stroke="url(#volGoldGradient)" 
                        strokeWidth="3.5" 
                        fill="none" 
                        strokeDasharray="169.6" 
                        strokeDashoffset={169.6 - (effectiveVolume * 127.2)} 
                        strokeLinecap="round"
                        className="transition-all duration-75"
                        style={{
                          filter: isDraggingVolume ? 'drop-shadow(0 0 6px #e5a93c)' : 'drop-shadow(0 0 3px rgba(229,169,60,0.5))'
                        }}
                      />
                    </svg>

                    {/* Precision Radial Tick Meter Array (21 refined golden tick indices) */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(21)].map((_, i) => {
                        const angle = -135 + (i / 20) * 270;
                        const isActive = (i / 20) <= effectiveVolume;
                        return (
                          <div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-0.5 h-1.5 -translate-x-1/2 -translate-y-1/2 origin-[center_31px] transition-colors duration-75"
                            style={{
                              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-26px)`,
                              backgroundColor: isActive ? (isDraggingVolume ? '#ffdca0' : '#f0ba6e') : '#2e2316',
                              boxShadow: isActive ? '0 0 3px #e5a93c' : 'none'
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Master Metallic Bronze Rotary Audio Knob */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-75 relative"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, #ecd29b 0%, #a87630 45%, #523712 85%, #231604 100%)',
                        borderColor: isDraggingVolume ? '#f0ba6e' : '#6b4c23',
                        transform: `rotate(${knobRotationAngle}deg)`,
                        boxShadow: isDraggingVolume 
                          ? '0 0 16px rgba(229,169,60,0.7), inset 0 1px 2px rgba(255,255,255,0.4)' 
                          : '0 4px 12px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.2)'
                      }}
                    >
                      {/* Rotary Position Indicator Pip (rotates with knob) */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1.5 rounded-full bg-[#fff0cc] shadow-[0_0_5px_#ffdca0]" />

                      {/* Inner Recessed Core with Speaker Status Icon */}
                      <div 
                        className="w-7 h-7 rounded-full bg-[#161008] border border-[#f0ba6e]/40 flex items-center justify-center pointer-events-none shadow-inner"
                        style={{
                          transform: `rotate(${-knobRotationAngle}deg)`
                        }}
                      >
                        {effectiveVolume === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        ) : effectiveVolume < 0.5 ? (
                          <Volume1 className="w-3.5 h-3.5 text-[#ecd29b]" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-[#ecd29b]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Step Up Button (Increase Volume) */}
                  <button
                    type="button"
                    onClick={stepVolumeUp}
                    className="w-5 h-5 rounded-md bg-[#16171b] hover:bg-[#252018] border border-[#3e2e1a] hover:border-[#e5a93c]/50 text-[#bda482] hover:text-[#f0ba6e] active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-sm text-xs font-bold leading-none"
                    title={language === 'id' ? 'Nambah Volume (Geser ke Kanan)' : 'Increase Volume (Drag Right)'}
                  >
                    +
                  </button>
                </div>

                {/* Dynamic LED Volume Status Pill */}
                <div className="mt-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0b0c0f] border border-[#3e2e1a] shadow-inner">
                  <span className="text-[7.5px] font-mono uppercase tracking-wider text-[#9e7d52] font-semibold">
                    VOL
                  </span>
                  <span className={`text-[9px] font-mono font-black ${
                    effectiveVolume === 0 
                      ? 'text-rose-400' 
                      : isDraggingVolume 
                      ? 'text-[#ffe4b0] drop-shadow-[0_0_4px_#e5a93c]' 
                      : 'text-[#e5a93c]'
                  }`}>
                    {volumePercentage}%
                  </span>
                </div>
              </div>

              {/* Far Right Unit: Rounded Tracklist Button */}
              <button
                onClick={() => setShowTracklist(!showTracklist)}
                title={language === 'en' ? 'Open Playlist' : 'Buka Daftar Lagu'}
                className={`w-11 h-11 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 ${
                  showTracklist
                    ? 'bg-gradient-to-b from-[#2e2315] to-[#1a1309] border-[#e5a93c] text-[#f0ba6e] shadow-[0_0_12px_rgba(229,169,60,0.3)]'
                    : 'bg-gradient-to-b from-[#1b1c21] to-[#0f1013] border-[#3e2e1a] text-[#bda482] hover:text-[#f0ba6e] hover:border-[#5a4225]'
                }`}
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>

            {/* Slide-out List Music Drawer */}
            {showTracklist && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 mt-2 overflow-hidden relative z-10 border-t border-[#3e2e1a]/80"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[8.5px] uppercase font-mono text-[#9e7d52] tracking-[0.2em] font-bold">
                    {language === 'en' ? `PLAYLIST SOUNDTRACKS (${tracks.length})` : `DAFTAR SOUNDTRACK (${tracks.length})`}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#3e2e1a]">
                  {tracks.map((track, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer text-left border ${
                          isCurrent 
                            ? 'bg-[#e5a93c]/15 border-[#e5a93c]/40 text-[#f0ba6e] shadow-sm' 
                            : 'hover:bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <span className={`font-semibold truncate block text-[11px] ${isCurrent ? 'text-[#f0ba6e]' : 'text-zinc-300'}`}>
                            {track.title}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">{track.artist}</span>
                        </div>
                        {isCurrent && isPlaying ? (
                          <span className="flex gap-0.5 items-end h-3 shrink-0 px-1">
                            <span className="w-[1.5px] h-2.5 bg-[#f0ba6e]" style={{ animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) 0s infinite' }} />
                            <span className="w-[1.5px] h-3 bg-[#f0ba6e]" style={{ animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) 0.15s infinite' }} />
                            <span className="w-[1.5px] h-1.5 bg-[#f0ba6e]" style={{ animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) 0.3s infinite' }} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button to Open/Close NSN969 Audio Controller */}
      <motion.button
        id="btn-minimal-audio-trigger"
        onClick={() => setShowDeck(!showDeck)}
        whileHover={{ scale: 1.08, boxShadow: '0 0 25px rgba(229,169,60,0.5)' }}
        whileTap={{ scale: 0.92 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-md border ${
          showDeck 
            ? 'bg-gradient-to-r from-[#ba8339] via-[#e5a93c] to-[#ffdca0] text-[#1b1206] border-[#f0ba6e] shadow-[0_0_22px_rgba(229,169,60,0.6)]' 
            : 'bg-[#121316]/95 text-white border-[#3e2e1a] hover:border-[#e5a93c]/50 hover:text-[#f0ba6e] shadow-[0_8px_30px_rgba(0,0,0,0.9)]'
        }`}
        title={language === 'en' ? 'Open / Close NSN969 Music Controller' : 'Buka / Tutup Pengontrol Musik NSN969'}
      >
        <div className={`flex items-center justify-center ${isPlaying && !showDeck ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
          <Music className="w-5.5 h-5.5" />
        </div>
      </motion.button>

      {/* Turntable Smooth Spin Keyframes */}
      <style>{`
        @keyframes turntable-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
