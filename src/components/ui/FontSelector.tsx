import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2, ArrowDown, Sparkles } from 'lucide-react';

export interface FontStyle {
  id: string;
  name: string;
  fontFamily: string;
  isItalic: boolean;
  letterSpacing: string;
  fillStyle: string;
  hasStroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  previewStrokeWidth: string;
  gradientColors?: string[];
}

// Premium Font Style presets
export const FONT_STYLES: FontStyle[] = [
  {
    id: 'west_coast_brush',
    name: 'Road Rage',
    fontFamily: '"Road Rage", sans-serif',
    isItalic: false,
    letterSpacing: '0.04em',
    fillStyle: '#ffffff',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 16,
    previewStrokeWidth: '6px'
  },
  {
    id: 'dirt_grunge',
    name: 'Rubik Dirt',
    fontFamily: '"Rubik Dirt", sans-serif',
    isItalic: false,
    letterSpacing: '0.06em',
    fillStyle: '#e5a93c',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'cyber_metal',
    name: 'Cyber Blade',
    fontFamily: '"Metal Mania", sans-serif',
    isItalic: false,
    letterSpacing: '0.08em',
    fillStyle: '#00ffff',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'miami_neon',
    name: 'Marker',
    fontFamily: '"Permanent Marker", sans-serif',
    isItalic: true,
    letterSpacing: '0.04em',
    fillStyle: '#ff007f',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'samurai_blade',
    name: 'Shojumaru',
    fontFamily: '"Shojumaru", sans-serif',
    isItalic: false,
    letterSpacing: '0.05em',
    fillStyle: '#ff0000',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'golden_empire',
    name: 'Cinzel',
    fontFamily: '"Cinzel Decorative", serif',
    isItalic: false,
    letterSpacing: '0.08em',
    fillStyle: '#ffd700',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px',
    gradientColors: ['#ffd700', '#f39c12']
  },
  {
    id: 'street_slang',
    name: 'Lacquer Green',
    fontFamily: '"Lacquer", sans-serif',
    isItalic: false,
    letterSpacing: '0.04em',
    fillStyle: '#39ff14',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'retro_synth',
    name: 'Retro Synth',
    fontFamily: '"Monoton", sans-serif',
    isItalic: false,
    letterSpacing: '0.12em',
    fillStyle: '#00f2fe',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 12,
    previewStrokeWidth: '4px'
  },
  {
    id: 'gothic_outlaw',
    name: 'Unifraktur',
    fontFamily: '"UnifrakturMaguntia", serif',
    isItalic: false,
    letterSpacing: '0.04em',
    fillStyle: '#ffffff',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 12,
    previewStrokeWidth: '4px'
  },
  {
    id: 'rubik_splash',
    name: 'Splash Paint',
    fontFamily: '"Rubik Wet Paint", sans-serif',
    isItalic: false,
    letterSpacing: '0.04em',
    fillStyle: '#ff5e00',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 14,
    previewStrokeWidth: '5px'
  },
  {
    id: 'retro_arcade',
    name: 'Press Start',
    fontFamily: '"Press Start 2P", sans-serif',
    isItalic: false,
    letterSpacing: '0.05em',
    fillStyle: '#f1c40f',
    hasStroke: true,
    strokeColor: '#000000',
    strokeWidth: 12,
    previewStrokeWidth: '4px'
  },
  {
    id: 'vintage_stamp',
    name: 'Special Elite',
    fontFamily: '"Special Elite", monospace',
    isItalic: false,
    letterSpacing: '0.06em',
    fillStyle: '#f4f6f6',
    hasStroke: true,
    strokeColor: '#1a252f',
    strokeWidth: 10,
    previewStrokeWidth: '4px'
  }
];

const GOOGLE_FONTS_API_KEY = 'AIzaSyCdbI0sjx28Ok6xaYVxajS7Ky3jz-ho8XY';

interface GoogleFontItem {
  family: string;
  category: string;
  variants: string[];
}

interface FontSelectorProps {
  language: 'en' | 'id';
  selectedFontStyle: FontStyle;
  setSelectedFontStyle: (style: FontStyle) => void;
}

// Full 1-to-1 design matching the photo
function FontPillItem({
  name,
  fontFamily,
  category,
  isSelected,
  onClick,
  fillStyle,
  gradientColors,
  hasStroke,
  strokeColor,
  isPremium = true
}: {
  name: string;
  fontFamily: string;
  category?: string;
  isSelected: boolean;
  onClick: () => void;
  fillStyle?: string;
  gradientColors?: string[];
  hasStroke?: boolean;
  strokeColor?: string;
  isPremium?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Avoid re-loading standard local/preset system fonts
    if (fontFamily.includes('Road Rage') || fontFamily.includes('Rubik') || fontFamily.includes('Metal') || fontFamily.includes('Permanent') || fontFamily.includes('Shojumaru') || fontFamily.includes('Cinzel') || fontFamily.includes('Lacquer') || fontFamily.includes('Monoton') || fontFamily.includes('Unifraktur') || fontFamily.includes('Press Start') || fontFamily.includes('Special')) {
      setLoaded(true);
      return;
    }

    const fontId = `gfont-link-${name.toLowerCase().replace(/\s+/g, '-')}`;
    if (document.getElementById(fontId)) {
      setLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@450;700;900&display=swap`;
    
    link.onload = () => setLoaded(true);
    link.onerror = () => setLoaded(true);
    document.head.appendChild(link);
  }, [name, fontFamily]);

  // Render the font name in its actual style colors!
  const textStyle: React.CSSProperties = {
    fontFamily: loaded ? fontFamily : 'sans-serif',
  };

  if (gradientColors && gradientColors.length > 0) {
    textStyle.backgroundImage = `linear-gradient(to bottom, ${gradientColors.join(', ')})`;
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.backgroundClip = 'text';
    textStyle.WebkitTextFillColor = 'transparent';
    textStyle.color = 'transparent';
  } else if (fillStyle) {
    textStyle.color = fillStyle;
  }

  if (hasStroke && strokeColor) {
    textStyle.textShadow = `1.5px 1.5px 0px ${strokeColor}, -1.5px -1.5px 0px ${strokeColor}, 1.5px -1.5px 0px ${strokeColor}, -1.5px 1.5px 0px ${strokeColor}`;
  }

  // Clean, dark, pill layout matching the reference screen exactly
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full aspect-[2.2/1] rounded-2xl flex items-center justify-center p-3 transition-all duration-200 select-none group text-center cursor-pointer ${
        isSelected
          ? 'bg-[#e5a93c]/15 border-2 border-[#e5a93c] scale-[1.03] shadow-[0_4px_20px_rgba(229,169,60,0.15)]'
          : 'bg-[#1b1b1f] border border-transparent hover:bg-[#25252b] hover:border-zinc-800'
      }`}
    >
      {/* Font Family Name display inside in actual style */}
      <span 
        style={textStyle}
        className="text-[14px] font-black tracking-wide leading-none truncate max-w-[85%]"
      >
        {name}
      </span>
    </button>
  );
}

export default function FontSelector({ language, selectedFontStyle, setSelectedFontStyle }: FontSelectorProps) {
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [googleFonts, setGoogleFonts] = useState<GoogleFontItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  // Toggle class to hide Navbar when font modal is open
  useEffect(() => {
    if (isFontModalOpen) {
      document.body.classList.add('font-modal-open');
    } else {
      document.body.classList.remove('font-modal-open');
    }
    return () => {
      document.body.classList.remove('font-modal-open');
    };
  }, [isFontModalOpen]);

  // Categorized pills matching the Top Bar scrolling elements in your image
  const [activeCategory, setActiveCategory] = useState<'trending' | 'sepakbola' | 'classic' | 'new' | 'handwriting' | 'sans-serif' | 'serif' | 'monospace'>('trending');

  // Trigger Google Fonts sync only once opened
  useEffect(() => {
    if (!isFontModalOpen || googleFonts.length > 0) return;

    const fetchGoogleFonts = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );
        if (!response.ok) throw new Error('API key or rate limit failure');
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setGoogleFonts(data.items);
        } else {
          throw new Error('Invalid schema');
        }
      } catch (err) {
        console.error('Google fonts fetch failure:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoogleFonts();
  }, [isFontModalOpen, googleFonts.length]);

  // Reset pagination count on search or category filter change
  useEffect(() => {
    setVisibleCount(36);
  }, [fontSearchQuery, activeCategory]);

  const selectGoogleFont = (family: string) => {
    const newStyle: FontStyle = {
      id: `gfont_${family.toLowerCase().replace(/\s+/g, '_')}`,
      name: family,
      fontFamily: `"${family}", sans-serif`,
      isItalic: false,
      letterSpacing: '0.04em',
      fillStyle: '#ffffff',
      hasStroke: true,
      strokeColor: '#000000',
      strokeWidth: 12,
      previewStrokeWidth: '4px',
      gradientColors: ['#ffffff', '#e5a93c']
    };

    // Link dynamic import to head
    const fontId = `gfont-link-${family.toLowerCase().replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@450;700;900&display=swap`;
      document.head.appendChild(link);
    }

    setSelectedFontStyle(newStyle);
    setIsFontModalOpen(false);
    setFontSearchQuery('');
  };

  // Map category values to filtering categories
  const filteredFonts = useMemo(() => {
    if (activeCategory === 'trending') {
      // Top Popular Google Fonts as Trending
      return googleFonts.filter((f) => {
        if (fontSearchQuery && !f.family.toLowerCase().includes(fontSearchQuery.toLowerCase())) return false;
        return true;
      });
    }

    if (activeCategory === 'sepakbola') {
      // Sporty, bold display fonts
      return googleFonts.filter((f) => {
        if (fontSearchQuery && !f.family.toLowerCase().includes(fontSearchQuery.toLowerCase())) return false;
        return f.category === 'display' || f.category === 'sans-serif';
      });
    }

    if (activeCategory === 'classic') {
      // Elegant serif/classical fonts
      return googleFonts.filter((f) => {
        if (fontSearchQuery && !f.family.toLowerCase().includes(fontSearchQuery.toLowerCase())) return false;
        return f.category === 'serif';
      });
    }

    if (activeCategory === 'new') {
      // Latest/Alternative fonts
      return googleFonts.filter((f) => {
        if (fontSearchQuery && !f.family.toLowerCase().includes(fontSearchQuery.toLowerCase())) return false;
        return f.category === 'display';
      });
    }

    return googleFonts.filter((f) => {
      if (fontSearchQuery && !f.family.toLowerCase().includes(fontSearchQuery.toLowerCase())) return false;
      return f.category.toLowerCase() === activeCategory;
    });
  }, [googleFonts, fontSearchQuery, activeCategory]);

  return (
    <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-900">
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
        {language === 'en' ? '2. SELECT TYPOGRAPHY STYLE' : '2. PILIH GAYA TIPOGRAFI'}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FONT_STYLES.slice(0, 6).map((style) => {
          const isSelected = selectedFontStyle.id === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedFontStyle(style)}
              style={{
                fontFamily: style.fontFamily,
                fontStyle: style.isItalic ? 'italic' : 'normal',
                ...(style.gradientColors && style.gradientColors.length > 0 ? {
                  backgroundImage: `linear-gradient(to bottom, ${style.gradientColors.join(', ')})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                } : {
                  backgroundImage: 'none',
                  backgroundClip: 'unset',
                  WebkitBackgroundClip: 'unset',
                  WebkitTextFillColor: 'unset',
                  color: style.fillStyle || '#ffffff'
                })
              }}
              className={`py-3 px-1 text-xs tracking-wide uppercase transition-all text-center bg-transparent border-0 cursor-pointer block select-none focus:outline-none ${
                isSelected
                  ? 'font-black scale-105 drop-shadow-[0_2px_8px_rgba(229,169,60,0.35)]'
                  : 'opacity-55 hover:opacity-100 hover:scale-105 filter grayscale hover:grayscale-0'
              }`}
            >
              {style.name}
            </button>
          );
        })}
      </div>

      {/* Open Custom Font Hub */}
      <button
        type="button"
        onClick={() => setIsFontModalOpen(true)}
        className="w-full mt-2 py-3 bg-zinc-900/40 hover:bg-zinc-900/80 border border-dashed border-zinc-850 hover:border-amber-500/50 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-500 rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-amber-500" />
        <span>{language === 'en' ? 'OPEN FONT VAULT' : 'BUKA GUDANG FONT'}</span>
      </button>

      {/* FULL-WIDTH Fullscreen Layout identical to the screenshot */}
      {isFontModalOpen && (
        <div className="fixed inset-0 z-[10050] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-0 select-none animate-in fade-in duration-200">
          
          {/* Top Bar with Magnifying Search Box & Category Tabs */}
          <div className="w-full bg-[#121214] border-b border-zinc-900/60 py-3.5 px-4 sm:px-6 md:px-8 shrink-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              
              {/* Search bar & Category Scroll View */}
              <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-none">
                
                {/* Search Bar matching image */}
                <div className="relative flex items-center bg-[#1b1b1f] border border-transparent focus-within:border-zinc-800 rounded-full px-3.5 py-2 w-48 shrink-0">
                  <Search className="w-3.5 h-3.5 text-zinc-400 mr-2" />
                  <input
                    type="text"
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    className="bg-transparent text-white font-mono text-xs outline-none w-full placeholder-zinc-500"
                    placeholder={language === 'en' ? 'Search font...' : 'Cari font...'}
                  />
                  {fontSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFontSearchQuery('')}
                      className="text-[10px] font-mono text-zinc-500 hover:text-white ml-1 cursor-pointer uppercase font-black"
                    >
                      [x]
                    </button>
                  )}
                </div>

                {/* Horizontal Category Scroll View matching image layout */}
                <div className="flex items-center gap-1.5 whitespace-nowrap py-1">
                  {[
                    { id: 'trending', label: language === 'en' ? 'Sedang tren' : 'Sedang tren' },
                    { id: 'sepakbola', label: language === 'en' ? 'Sepak bola ⚽' : 'Sepak bola ⚽' },
                    { id: 'classic', label: language === 'en' ? 'Klasik' : 'Klasik' },
                    { id: 'new', label: language === 'en' ? 'BARU' : 'BARU' },
                    { id: 'handwriting', label: language === 'en' ? 'Tulis Tangan' : 'Tulis Tangan' },
                    { id: 'sans-serif', label: 'Sans Serif' },
                    { id: 'serif', label: 'Serif' },
                    { id: 'monospace', label: 'Monospace' }
                  ].map((tab) => {
                    const isTabActive = activeCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategory(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                          isTabActive
                            ? 'bg-[#2a2a2e] text-white'
                            : 'text-zinc-500 hover:text-zinc-350 bg-transparent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Minimal Circle Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsFontModalOpen(false);
                  setFontSearchQuery('');
                }}
                className="w-9 h-9 bg-[#1b1b1f] hover:bg-[#25252b] text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* Grid Content body - scrollable and optimized to utilize full viewport */}
          <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 md:px-8 py-6 bg-[#121214]">
            <div className="max-w-7xl mx-auto">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-28 gap-3 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <span>{language === 'en' ? 'Syncing Font Database...' : 'Menyinkronkan Database Font...'}</span>
                </div>
              ) : hasError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    {language === 'en' ? 'Failed to fetch Google fonts list' : 'Gagal memuat daftar font Google'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGoogleFonts([])}
                    className="px-5 py-2.5 bg-zinc-900 text-xs font-mono uppercase tracking-widest text-amber-500 hover:bg-zinc-800 rounded-xl"
                  >
                    {language === 'en' ? 'RETRY' : 'COBA LAGI'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Grid of fonts matching layout perfectly */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                    
                    {/* GTA V Default Preset fonts always pinned first in 'trending' category */}
                    {activeCategory === 'trending' && !fontSearchQuery && (
                      <>
                        {FONT_STYLES.map((preset) => (
                          <FontPillItem
                            key={preset.id}
                            name={preset.name}
                            fontFamily={preset.fontFamily}
                            isSelected={selectedFontStyle.id === preset.id}
                            onClick={() => {
                              setSelectedFontStyle(preset);
                              setIsFontModalOpen(false);
                            }}
                            fillStyle={preset.fillStyle}
                            gradientColors={preset.gradientColors}
                            hasStroke={preset.hasStroke}
                            strokeColor={preset.strokeColor}
                            isPremium={true}
                          />
                        ))}
                      </>
                    )}

                    {/* Dynamic Google Fonts list */}
                    {filteredFonts.slice(0, visibleCount).map((font) => (
                      <FontPillItem
                        key={font.family}
                        name={font.family}
                        fontFamily={`"${font.family}", sans-serif`}
                        category={font.category}
                        isSelected={selectedFontStyle.name === font.family}
                        onClick={() => selectGoogleFont(font.family)}
                        fillStyle="#ffffff"
                        gradientColors={['#ffffff', '#e5a93c']}
                        hasStroke={true}
                        strokeColor="#000000"
                        isPremium={true}
                      />
                    ))}
                  </div>

                  {/* Load More Button to keep layout optimized */}
                  {visibleCount < filteredFonts.length && (
                    <div className="flex justify-center pt-4 pb-12">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 36)}
                        className="px-6 py-3 bg-[#1b1b1f] hover:bg-[#25252b] border border-zinc-900 hover:border-zinc-850 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white rounded-xl transition duration-300 cursor-pointer"
                      >
                        {language === 'en' ? 'LOAD MORE FONTS' : 'TAMPILKAN FONT LAINNYA'}
                      </button>
                    </div>
                  )}

                  {filteredFonts.length === 0 && (
                    <div className="text-center py-20 text-zinc-600 font-mono text-xs uppercase tracking-wider">
                      {language === 'en' ? 'No matching fonts found' : 'Tidak ada font yang cocok'}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Styled status bottom label */}
          <div className="w-full bg-[#121214] border-t border-zinc-900/60 py-3.5 px-4 text-center shrink-0">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              {language === 'en' ? 'Click to select and apply style instantly to active stamps' : 'Klik untuk memilih dan menerapkan gaya langsung ke stempel aktif'}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
