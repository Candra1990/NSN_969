import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useGallery } from '@/hooks/useGallery';
import { useTheme } from '@/contexts/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageProvider';

export function GalleryCarousel() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { gallery: images } = useGallery();
  
  const [selectedIndex, setSelectedIndex] = useState(1); // Default center focus to COUGAN
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  // Responsive tracker
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Autoplay handler with smooth pausing on user interaction
  useEffect(() => {
    if (isPlaying && !activeImage) {
      autoplayTimer.current = setInterval(() => {
        handleNext();
      }, 4500);
    }
    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
      }
    };
  }, [isPlaying, activeImage, handleNext]);

  // Touch & Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setIsPlaying(false);
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        setIsPlaying(false);
        handleNext();
      }
      if (e.key === 'Escape' && activeImage) {
        setActiveImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, activeImage]);

  // Active indices selector
  const onIndicatorClick = (index: number) => {
    setIsPlaying(false);
    setSelectedIndex(index);
  };

  const handleLightboxPrev = () => {
    if (images.length === 0 || !activeImage) return;
    const currentIndex = images.findIndex((img) => img.src === activeImage);
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    setActiveImage(images[nextIdx].src);
    setSelectedIndex(nextIdx);
  };

  const handleLightboxNext = () => {
    if (images.length === 0 || !activeImage) return;
    const currentIndex = images.findIndex((img) => img.src === activeImage);
    const nextIdx = (currentIndex + 1) % images.length;
    setActiveImage(images[nextIdx].src);
    setSelectedIndex(nextIdx);
  };

  return (
    <section className={`relative w-full py-24 overflow-hidden select-none transition-colors duration-300 ${
      theme === 'light' ? 'bg-zinc-100' : 'bg-black'
    }`} id="gallery">
      {/* 1. Smoke Atmosphere - Deep, dark, and red/gold mystical gradients */}
      <div className={`absolute inset-0 pointer-events-none z-0 animate-pulse duration-[10000ms] ${
        theme === 'light'
          ? 'bg-[radial-gradient(circle_at_center,rgba(229,169,60,0.03)_0%,rgba(99,102,241,0.04)_50%,transparent_100%)]'
          : 'bg-[radial-gradient(circle_at_center,rgba(229,169,60,0.06)_0%,rgba(153,27,27,0.08)_40%,rgba(0,0,0,1)_100%)]'
      }`} />

      {/* 2. Vintage Paper Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] mix-blend-color-burn pointer-events-none z-0 bg-repeat bg-[size:180px_180px]"
        style={{ opacity: 0.1 }}
      />
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }}
      />

      {/* 3. Cinema Edge Shadows / Vignetting */}
      <div className={`absolute inset-0 pointer-events-none z-10 ${
        theme === 'light'
          ? 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(240,240,245,0.4)_100%)]'
          : 'bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.95)_100%)]'
      }`} />

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        {/* Title Group with Gold Border Accents */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: 'easeOut' }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <div className="inline-block relative">
            <h2 className={`text-4xl lg:text-5xl font-serif font-black mb-6 tracking-[0.25em] uppercase drop-shadow-[0_0_20px_rgba(229,169,60,0.4)] relative z-10 ${
              theme === 'light' ? 'text-amber-600' : 'text-[#e5a93c]'
            }`}>
              {language === 'id' ? 'GALERI' : 'GALLERY'}
            </h2>
            {/* Ambient Aura behind header */}
            <div className={`absolute -inset-6 blur-3xl rounded-[50%] -z-10 opacity-70 ${
              theme === 'light' ? 'bg-amber-100/30' : 'bg-red-900/15'
            }`}></div>
          </div>

          <div className="flex items-center justify-center gap-4 mb-4 opacity-80">
            <div className={`h-[1px] w-16 md:w-28 bg-gradient-to-r from-transparent ${
              theme === 'light' ? 'to-amber-500' : 'to-[#e5a93c]'
            }`}></div>
            <div className={`w-2.5 h-2.5 rotate-45 border ${
              theme === 'light' ? 'border-amber-500 bg-white' : 'border-[#e5a93c] bg-black'
            }`}></div>
            <div className={`h-[1px] w-16 md:w-28 bg-gradient-to-l from-transparent ${
              theme === 'light' ? 'to-amber-500' : 'to-[#e5a93c]'
            }`}></div>
          </div>
        </motion.div>

        {/* Carousel Viewport Container */}
        <div className="relative w-full max-w-5xl mx-auto px-2 md:px-12">
          {/* Ancient / Cyber Futuristic Angle Frame Borders */}
          <div className="absolute -top-6 -left-2 md:-left-4 w-12 h-12 border-t-2 border-l-2 border-[#e5a93c]/40 rounded-tl-xl z-0 pointer-events-none"></div>
          <div className="absolute -bottom-6 -right-2 md:-right-4 w-12 h-12 border-b-2 border-r-2 border-[#e5a93c]/40 rounded-br-xl z-0 pointer-events-none"></div>

          {/* Perspective stage layout */}
          <div className="relative w-full h-[360px] sm:h-[450px] flex items-center justify-center overflow-visible">
            {images.map((img, i) => {
              const len = images.length;
              // Wrap indices to display centered infinite layout smoothly
              let offset = i - selectedIndex;
              if (offset < -len / 2) offset += len;
              if (offset > len / 2) offset -= len;

              const isCenter = offset === 0;
              const isVisible = Math.abs(offset) <= 2; // Show active center and adjacent 2 slides on left/right

              if (!isVisible) return null;

              // Compute responsive offsets and 3D skew coordinates
              const spacing = windowWidth < 640 ? 110 : windowWidth < 1024 ? 180 : 260;
              const translateX = offset * spacing;
              const rotateY = offset * -25; // Fold outward to mimic physical luxury frame track
              const zIndex = 20 - Math.abs(offset);
              const scale = isCenter ? 1 : 0.76;
              const opacity = isCenter ? 1 : windowWidth < 640 ? 0.08 : 0.35;

              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    x: translateX,
                    scale: scale,
                    rotateY: rotateY,
                    zIndex: zIndex,
                    opacity: opacity,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 140,
                    damping: 24,
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(e, info) => {
                    const threshold = 40;
                    if (info.offset.x < -threshold) {
                      setIsPlaying(false);
                      handleNext();
                    } else if (info.offset.x > threshold) {
                      setIsPlaying(false);
                      handlePrev();
                    }
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      setIsPlaying(false);
                      setSelectedIndex(i);
                    }
                  }}
                  onMouseEnter={() => setIsPlaying(false)}
                  className={`absolute w-[190px] sm:w-[270px] aspect-[3/4] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing border transition-all duration-500 group ${
                    isCenter 
                      ? 'border-[#e5a93c] shadow-2xl' 
                      : theme === 'light'
                        ? 'border-zinc-200 bg-white/80 hover:border-zinc-300 shadow-md'
                        : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-700/50 shadow-2xl'
                  }`}
                  style={{
                    perspective: 1000,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="absolute inset-0 w-full h-full relative">
                    {/* Grayscale to Vivid Color Transition On Focused Element */}
                    <img
                      src={img.src}
                      alt={img.title}
                      className={`w-full h-full object-cover transition-all duration-700 ease-out select-none pointer-events-none ${
                        isCenter ? 'grayscale-0 contrast-[1.05] brightness-100' : 'grayscale contrast-[1.12] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-90'
                      }`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.dataset.triedFallback) return;
                        target.dataset.triedFallback = 'true';
                        const fallbackNum = (i % 15) + 1;
                        target.src = `/Gallery/gallery${fallbackNum}.png`;
                      }}
                    />

                    {/* Ambient vignette shading on card edges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

                    {/* Classic Film / Aged Scanner Line Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)] pointer-events-none mix-blend-multiply z-10 opacity-70" />

                    {/* Hover Gold Glow Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-20" />

                    {/* Explicit Expand button on focus only */}
                    {isCenter && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (img.src && img.src.trim().length > 3) {
                            setActiveImage(img.src);
                          }
                        }}
                        className="absolute top-4 right-4 bg-black/70 hover:bg-[#e5a93c] text-white hover:text-black backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-[#e5a93c] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 cursor-pointer shadow-lg"
                        title={language === 'id' ? 'Perbesar Foto' : 'Expand Photo'}
                        aria-label={language === 'id' ? 'Perbesar Foto' : 'Expand Photo'}
                      >
                        <Expand className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Controls: Left Arrow, Sliding Slider Pagination Dots, and Right Arrow all situated together at the bottom */}
        <div className="flex items-center justify-center mt-8 gap-4 relative z-30">
          {/* Previous Arrow Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              handlePrev();
            }}
            className="w-10 h-10 rounded-full bg-black/80 hover:bg-[#e5a93c] text-white hover:text-black border border-[#e5a93c]/40 hover:border-[#e5a93c] flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer active:scale-95"
            aria-label="Previous Slide"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Custom Infinite dot slider track */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 border rounded-full ${
            theme === 'light' ? 'bg-zinc-200/50 border-zinc-300' : 'bg-zinc-950/60 border-zinc-900'
          }`}>
            {(() => {
              const maxDots = 7;
              const half = Math.floor(maxDots / 2);
              const total = images.length;

              // Center the active dot in the visible dot track
              let start = selectedIndex - half;
              if (start < 0) start = 0;
              if (start + maxDots > total) start = total - maxDots;
              if (start < 0) start = 0;

              const slicedIndices = Array.from({ length: Math.min(maxDots, total) }, (_, idx) => start + idx);

              return slicedIndices.map((i) => {
                const isActive = i === selectedIndex;
                return (
                   <button
                    key={i}
                    onClick={() => onIndicatorClick(i)}
                    className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${
                      isActive 
                        ? 'w-8 bg-[#e5a93c] shadow-[0_0_12px_rgba(229,169,60,0.65)]' 
                        : theme === 'light'
                          ? 'w-2 bg-zinc-300 hover:bg-zinc-500'
                          : 'w-2 bg-zinc-700/60 hover:bg-zinc-500'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                );
              });
            })()}
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              handleNext();
            }}
            className="w-10 h-10 rounded-full bg-black/80 hover:bg-[#e5a93c] text-white hover:text-black border border-[#e5a93c]/40 hover:border-[#e5a93c] flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer active:scale-95"
            aria-label="Next Slide"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Est. Signature */}
        <div className="mt-16 text-center select-none opacity-45">
          <p className="text-zinc-500 font-serif text-[11px] tracking-[0.5em] uppercase">EST. 2026</p>
        </div>
      </div>

      {/* Lightbox Modal overlay view */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-md cursor-zoom-out"
          >
            {/* Minimalist Close button */}
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition duration-200 cursor-pointer z-50 shadow-lg"
              onClick={() => setActiveImage(null)}
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lightbox Prev Button */}
            <button
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-[#e5a93c] text-white hover:text-black border border-white/20 hover:border-[#e5a93c] transition-all duration-200 cursor-pointer z-50 shadow-2xl active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxPrev();
              }}
              aria-label="Previous Image"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Lightbox Next Button */}
            <button
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-black/80 hover:bg-[#e5a93c] text-white hover:text-black border border-white/20 hover:border-[#e5a93c] transition-all duration-200 cursor-pointer z-50 shadow-2xl active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxNext();
              }}
              aria-label="Next Image"
            >
              <ArrowRight className="w-6 h-6" />
            </button>

            {/* Dynamic Lightbox image frame */}
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden border border-zinc-800/80 shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt="Selected Gallery Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.dataset.triedFallback) {
                    // Close the overlay immediately so it NEVER stays covering the gallery with an error!
                    setActiveImage(null);
                    return;
                  }
                  target.dataset.triedFallback = 'true';
                  if (activeImage) {
                    const match = activeImage.match(/gallery(\d+)\.png/i);
                    const id = match ? parseInt(match[1], 10) : 1;
                    const fallbackId = ((id - 1) % 15) + 1;
                    target.src = `/Gallery/gallery${fallbackId}.png`;
                  } else {
                    setActiveImage(null);
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
