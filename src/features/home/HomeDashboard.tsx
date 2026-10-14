import { useState } from 'react';
import { useLanguage, type Dictionary } from '@/contexts/LanguageProvider';
import { useStreamers } from '@/hooks/useStreamers';
import { useAdminConfig } from '@/hooks/useAdminConfig';
import { useMedia } from '@/hooks/useMedia';
import { useTheme } from '@/contexts/ThemeProvider';
import type { Streamer, LiveStatus } from '@/types';
import { TIKTOK_USERNAMES } from '@/constants/streamers';
import { GalleryCarousel } from '@/components/common/GalleryCarousel';
import { MemberIllustration } from '@/components/common/MemberIllustration';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

// Cache buster initialized once on load to prevent stale browser assets when pushed to GitHub
const MEM_CACHE_BUSTER = Date.now();

function MemberCard({ 
  str, 
  dict, 
  handleLaunchStream, 
  getFamilyRank, 
  ytStatus, 
  ttStatus,
  customPhotoUrl 
}: {
  str: Streamer;
  dict: Dictionary;
  handleLaunchStream: (str: Streamer, platform: 'youtube' | 'tiktok') => void;
  getFamilyRank: (name: string) => string;
  ytStatus?: LiveStatus;
  ttStatus?: LiveStatus;
  customPhotoUrl?: string;
  key?: string | number;
}) {
  const { theme } = useTheme();
  const [imgExt, setImgExt] = useState<string>('png');
  const [imgFailed, setImgFailed] = useState(false);
  const isYtLive = ytStatus ? ytStatus.isLive : false;
  const isTtLive = ttStatus ? ttStatus.isLive : false;
  
  // Custom helper to generate identical large brush text as seen in screenshot
  const getCardOverlayText = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n.includes('pahrul') || n.includes('kael')) return 'KAEL';
    if (n.includes('abanosz')) return 'ABANOSZ';
    if (n.includes('hendy') || n.includes('along')) return 'ALONG';
    if (n.includes('rizki') || n.includes('kai')) return 'KAI';
    if (n.includes('nareyy') || n.includes('son')) return 'SON';
    return name.split(' ')[0].toUpperCase();
  };

  const overlayText = getCardOverlayText(str.name);

  const fallbackSvg = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(str.name)}&backgroundColor=0d0e12`;
  const filepath = customPhotoUrl || str.photoUrl || fallbackSvg;

  const handleImgError = () => {
    setImgFailed(true);
  };

  const tiktokUsername = str.tiktokId || TIKTOK_USERNAMES[str.id] || (str.platform === 'tiktok' ? str.channelId : undefined);
  const youtubeUrl = str.channelId.startsWith('@')
    ? `https://www.youtube.com/${str.channelId}`
    : (str.channelId.startsWith('UC') || str.channelId.length === 24
      ? `https://www.youtube.com/channel/${str.channelId}`
      : `https://www.youtube.com/watch?v=${str.channelId}`);
  const tiktokUrl = tiktokUsername ? `https://www.tiktok.com/@${tiktokUsername.replace('@', '')}` : '#';

  // Resolve active stream configurations recursively for single "WATCH STREAM" button
  let btnBgClass = theme === 'light'
    ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 opacity-50 cursor-not-allowed'
    : 'bg-[#0f0f15]/40 text-zinc-650/40 border border-zinc-900 opacity-40 cursor-not-allowed';
  let btnOnClick = () => {};
  let btnDisabled = true;
  let btnTitle = `${str.name} is offline`;

  if (isYtLive) {
    btnBgClass = 'bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.35)] animate-pulse cursor-pointer border-transparent';
    btnOnClick = () => handleLaunchStream(str, 'youtube');
    btnDisabled = false;
    btnTitle = dict.home.watchLive ? `${dict.home.watchLive}: ${str.name}` : `Watch ${str.name}'s YouTube Live`;
  } else if (isTtLive) {
    btnBgClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] animate-pulse cursor-pointer border-transparent';
    btnOnClick = () => handleLaunchStream(str, 'tiktok');
    btnDisabled = false;
    btnTitle = dict.home.watchLive ? `${dict.home.watchLive}: ${str.name}` : `Watch ${str.name}'s TikTok Live`;
  }

  return (
    <div
      id={`member-board-card-${str.id}`}
      className={`group rounded-[1.2rem] sm:rounded-[1.6rem] border overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.012] ${
        theme === 'light'
          ? 'border-zinc-200 bg-white hover:border-[#e5a93c] shadow-md hover:shadow-xl'
          : 'border-zinc-900 bg-[#07070a] hover:border-[#e5a93c]/50 shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Visual Frame - full height photo centered exactly like screenshots */}
      <div className="relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden bg-black select-none shrink-0 flex items-center justify-center">
        
        {/* Isolated Real-time Pulsing Live Status Badges */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-25 flex flex-col gap-1.5 select-none items-end">
          {isYtLive && (
            <div id={`live-badge-yt-${str.id}`} className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-red-500/40 select-none">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444] block" />
              <span className="text-[7.5px] sm:text-[9px] font-sans font-black tracking-widest uppercase text-red-500 leading-none">
                YT LIVE
              </span>
            </div>
          )}
          {isTtLive && (
            <div id={`live-badge-tt-${str.id}`} className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-teal-500/50 select-none">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_#14b8a6] block" />
              <span className="text-[7.5px] sm:text-[9px] font-sans font-black tracking-widest uppercase text-teal-400 leading-none">
                TT LIVE
              </span>
            </div>
          )}
        </div>

        {!imgFailed ? (
          <img
            src={filepath}
            alt={str.name}
            onError={handleImgError}
            className="w-full h-full object-cover z-10 transition-transform duration-500 group-hover:scale-[1.025]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <MemberIllustration name={str.name} />
        )}

        {/* Dynamic vignette shadow layer to frame text cleanly */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-15 pointer-events-none" />

        {/* Left aligned title and role directly over the bottom of the image - no outer box */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 z-20 space-y-0.5 select-none text-left pointer-events-none">
          <h3 className="text-xs sm:text-base md:text-xl font-black text-white tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.92)] font-sans truncate">
            {str.name}
          </h3>
          <span className="text-[9px] sm:text-xs font-sans font-black text-[#e5a93c] tracking-[0.08em] uppercase block drop-shadow-[0_1.5px_6px_rgba(0,0,0,0.92)] truncate">
            {getFamilyRank(str.name)}
          </span>
        </div>
      </div>

      {/* Spaced double actions row underneath photo as requested */}
      <div className={`p-2.5 sm:p-4 border-t flex flex-col gap-2 sm:gap-3 select-none shrink-0 transition-colors duration-300 ${
        theme === 'light' ? 'bg-zinc-50/70 border-zinc-200' : 'bg-[#0a0a0d] border-zinc-900/40'
      }`}>
        
        {/* WATCH LIVE TRIGGER */}
        <button
          onClick={btnOnClick}
          disabled={btnDisabled}
          className={`w-full py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 text-center leading-none flex items-center justify-center gap-1.5 ${btnBgClass}`}
          title={btnTitle}
        >
          <span>{dict.home.watchLive}</span>
        </button>

        {/* SOCIAL CHANNELS */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`py-1.5 sm:py-2.5 text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer text-center leading-none flex items-center justify-center gap-1 ${
              theme === 'light'
                ? 'bg-zinc-100 hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-zinc-600 hover:text-red-650'
                : 'bg-[#111115] hover:bg-red-950/30 border border-zinc-900 hover:border-red-900/40 text-zinc-400 hover:text-red-400'
            }`}
            title={`Go to ${str.name}'s YouTube channel`}
          >
            YOUTUBE
          </a>
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`py-1.5 sm:py-2.5 text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 cursor-pointer text-center leading-none flex items-center justify-center gap-1 ${
              theme === 'light'
                ? 'bg-zinc-100 hover:bg-teal-50 border border-zinc-200 hover:border-teal-300 text-zinc-600 hover:text-teal-600'
                : 'bg-[#111115] hover:bg-teal-950/30 border border-zinc-900 hover:border-teal-900/40 text-zinc-400 hover:text-teal-400'
            }`}
            title={`Go to ${str.name}'s TikTok profile`}
          >
            TIKTOK
          </a>
        </div>

      </div>
    </div>
  );
}

interface HomeDashboardProps {
  onSelectStream: (streamer: Streamer) => void;
  setView: (view: 'home' | 'multiview' | 'gmail' | 'admin') => void;
}

export function HomeDashboard({ onSelectStream, setView }: HomeDashboardProps) {
  const { dict, language } = useLanguage();
  const { theme } = useTheme();
  const { streamers, liveStatuses } = useStreamers();
  const { announcementActive, announcementEn, announcementId } = useAdminConfig();
  const { heroVideo, memberAvatars } = useMedia();
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPhotoOnlyMode, setIsPhotoOnlyMode] = useState(false);

  const announcementText = language === 'en' ? announcementEn : announcementId;

  const handleLaunchStream = (str: Streamer, platform: 'youtube' | 'tiktok') => {
    let launchStr = { ...str };
    launchStr.platform = platform;
    if (platform === 'tiktok') {
      const tiktokUsername = TIKTOK_USERNAMES[str.id] || str.channelId;
      launchStr.channelId = tiktokUsername;
    }

    // Add to active streams and warp view in sessionStorage for the active player grid
    const savedActive = sessionStorage.getItem('nsn_active_streams');
    let activeList: Streamer[] = [];
    if (savedActive) {
      try {
        activeList = JSON.parse(savedActive);
      } catch (e) {
        console.error(e);
      }
    }
    
    // Add if not already active
    if (!activeList.some(s => s.channelId === launchStr.channelId && s.platform === launchStr.platform)) {
      if (activeList.length >= 6) {
        activeList.pop(); // Shift oldest stream
      }
      activeList.unshift(launchStr);
      sessionStorage.setItem('nsn_active_streams', JSON.stringify(activeList));
    }

    onSelectStream(launchStr);
    setView('multiview');
  };

  // Maps proper high-fidelity Cougan ranks shown in user design screenshots
  const getFamilyRank = (name: string): string => {
    const n = name.toLowerCase().trim();
    if (n.includes('kael') || n.includes('blake')) return 'OG';
    if (n.includes('pahrul')) return language === 'en' ? 'LEADER' : 'KETUA / LEADER';
    if (n.includes('abanosz')) return 'ELDER COUNCIL';
    if (n.includes('hendy') || n.includes('along')) return language === 'en' ? 'VICE LEADER' : 'WAKIL KETUA';
    return language === 'en' ? 'FAMILY MEMBER' : 'ANGGOTA KELUARGA';
  };

  return (
    <div id="home-sectors-deck" className="space-y-8 pb-12">
      
      {/* Cinematic Cover Hero Module */}
      <div className={`relative rounded-[2.5rem] min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] w-full flex flex-col justify-between items-center p-6 sm:p-10 md:p-14 overflow-hidden border shadow-2xl text-center transition-all duration-300 ${
        theme === 'light' ? 'border-zinc-200' : 'border-zinc-900'
      }`}>
        {/* Background Crew Cinematic Video overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroVideo.enabled && !videoFailed ? (
            <video
              key={heroVideo.src}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoFailed(true)}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            >
              <source src={heroVideo.src} type="video/mp4" />
              <source src="/images/Group_posing_in_white_hoodies_20261008231438.mp4" type="video/mp4" />
              <source src="/videos/Group_posing_in_white_hoodies_20261008231438.mp4" type="video/mp4" />
              <source src="/Group_posing_in_white_hoodies_20261008231438.mp4" type="video/mp4" />
            </video>
          ) : (
            <img
              src={heroVideo.poster || '/images/nsn969latar.png'}
              alt="NSN969 Backdrop"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          {/* Soft gradient overlays so ALL members are clearly visible and vibrant */}
          <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isPhotoOnlyMode 
              ? 'bg-transparent opacity-0' 
              : 'bg-gradient-to-t from-black/85 via-black/15 to-black/60 opacity-90'
          }`} />
          <div className={`absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none transition-opacity duration-300 ${
            isPhotoOnlyMode ? 'opacity-0' : 'opacity-100'
          }`} />
        </div>

        {/* Sleek Corner Eye Button to Toggle Clear Photo View */}
        <button
          type="button"
          onClick={() => setIsPhotoOnlyMode(!isPhotoOnlyMode)}
          title={isPhotoOnlyMode 
            ? (language === 'id' ? 'Tampilkan Teks' : 'Show Text') 
            : (language === 'id' ? 'Sembunyikan Teks & Perjelas Foto' : 'Hide Text & Clear View')}
          aria-label={isPhotoOnlyMode 
            ? (language === 'id' ? 'Tampilkan Teks' : 'Show Text') 
            : (language === 'id' ? 'Perjelas Foto' : 'Clear View')}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-all duration-200 shadow-md active:scale-90 cursor-pointer"
        >
          {isPhotoOnlyMode ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e5a93c]" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 hover:text-[#e5a93c]" />}
        </button>

        {/* Center Main Info Deck */}
        <div className={`relative z-10 w-full max-w-2xl my-auto space-y-6 select-none transition-all duration-500 flex flex-col items-center ${
          isPhotoOnlyMode ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}>
          <div className="space-y-4 flex flex-col items-center w-full relative">
            {/* Subtle glow behind the main text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#e5a93c]/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="space-y-2 flex flex-col items-center w-full relative z-10">
              <div className="w-full relative py-5 my-1 max-w-sm sm:max-w-xl flex flex-col items-center">
                {/* Top decorative line */}
                <div className="absolute top-0 left-0 w-full flex justify-center items-center gap-2">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#e5a93c]/80 to-transparent w-full" />
                  <div className="w-2 h-2 rotate-45 bg-[#e5a93c] shrink-0 blur-[1px]" />
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#e5a93c]/80 to-transparent w-full" />
                </div>

                <h1 className="font-serif text-[2.2rem] sm:text-[3.2rem] md:text-[3.8rem] font-black tracking-[0.05em] text-center uppercase leading-[1.05] bg-gradient-to-b from-white via-white to-zinc-300 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(0,0,0,0.85)] flex flex-col items-center">
                  {language === 'id' ? (
                    <>
                      <span className="text-[1.2rem] sm:text-[1.6rem] md:text-[2rem] tracking-[0.1em] text-[#e5a93c] block mb-1 font-serif bg-none text-transparent bg-clip-text bg-gradient-to-r from-[#e5a93c] to-yellow-200 drop-shadow-[0_0_15px_rgba(229,169,60,0.5)]">
                        KELUARGA BESAR
                      </span>
                      NSN969
                    </>
                  ) : (
                    <>
                      <span className="text-[1.2rem] sm:text-[1.6rem] md:text-[2rem] tracking-[0.1em] text-[#e5a93c] block mb-1 font-serif bg-none text-transparent bg-clip-text bg-gradient-to-r from-[#e5a93c] to-yellow-200 drop-shadow-[0_0_15px_rgba(229,169,60,0.5)]">
                        THE IMPERIAL
                      </span>
                      NSN969
                    </>
                  )}
                </h1>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 w-full flex justify-center items-center gap-2">
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#e5a93c]/80 to-transparent w-full" />
                  <div className="w-2 h-2 rotate-45 bg-[#e5a93c] shrink-0 blur-[1px]" />
                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[#e5a93c]/80 to-transparent w-full" />
                </div>
              </div>

              {/* Tagline / Creed text */}
              <p className="text-[0.75rem] sm:text-xs md:text-sm font-medium tracking-wide text-zinc-300/90 text-center max-w-lg px-4 leading-relaxed font-sans drop-shadow-md italic">
                "{dict.home.motto || (language === 'id' ? 'Loyalitas adalah mata uang kami. Persaudaraan adalah fondasi kami. Mengudara tanpa kompromi.' : 'Loyalty is our currency. Brotherhood is our foundation. Broadcasting without compromise.')}"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar (Tonton Multiview & Kenali Keluarga) */}
        <div className={`relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-md pt-4 px-2 transition-all duration-500 ${
          isPhotoOnlyMode ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}>
          <button
            id="btn-hero-launch-player"
            onClick={() => setView('multiview')}
            className="w-full sm:w-auto px-10 py-3.5 bg-[#e5a93c] hover:bg-yellow-400 text-black text-xs font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_8px_25px_rgba(229,169,60,0.4)] hover:scale-102 active:scale-95 cursor-pointer leading-none font-sans"
          >
            {dict.home.watchMultiview}
          </button>
          <button
            id="btn-hero-anchor-history"
            onClick={() => {
              document.getElementById('family-members-board')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-10 py-3.5 border border-white/25 hover:border-white bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-102 active:scale-95 cursor-pointer leading-none font-sans"
          >
            {dict.home.meetTheFamily}
          </button>
        </div>
      </div>

      {/* GALLERY SECTOR */}
      <div 
        id="home-gallery-carousel" 
        className="w-full scroll-mt-20"
      >
        <GalleryCarousel />
      </div>

      {/* THE FAMILY MEMBERS BOARD - Structured with interactive POV & Jabatan filters */}
      <div id="family-members-board" className="space-y-6 pt-4 scroll-mt-20">
        
        {/* Section Heading & Description */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none border-b pb-4 transition-all duration-300 ${
          theme === 'light' ? 'border-zinc-250' : 'border-zinc-900/80'
        }`}>
          <div className="space-y-2">
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none font-sans transition-colors duration-300 ${
              theme === 'light' ? 'text-zinc-900' : 'text-white'
            }`}>
              {dict.home.familyMembersTitle}
            </h2>
            <p className={`text-xs font-medium font-sans leading-relaxed transition-colors duration-300 ${
              theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              {dict.home.familyMembersSubtitle}
            </p>
          </div>
        </div>

        {/* Member Grid: 1 member per row on mobile/HP for clean and comfortable vertical viewing, fluid responsive auto-fill on desktop */}
        <div className="grid grid-cols-1 max-w-md mx-auto sm:max-w-none sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 sm:gap-4 md:gap-5 pt-4">
          {streamers.map((str) => (
            <MemberCard
              key={str.id}
              str={str}
              dict={dict}
              ytStatus={liveStatuses ? liveStatuses[str.id + '-youtube'] : undefined}
              ttStatus={liveStatuses ? liveStatuses[str.id + '-tiktok'] : undefined}
              customPhotoUrl={memberAvatars[str.id]}
              handleLaunchStream={handleLaunchStream}
              getFamilyRank={getFamilyRank}
            />
          ))}
        </div>

      </div>

    </div>
  );
}
