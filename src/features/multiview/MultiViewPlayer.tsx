import { StreamerAvatar } from '@/components/common/StreamerAvatar';
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  Sliders, 
  Settings,
  X, 
  MessageSquare, 
  Heart, 
  Send, 
  CheckCircle,
  Users,
  Grid,
  Plus,
  Link,
  Volume2,
  VolumeX,
  Loader2,
  Play,
  Zap,
  RefreshCw
} from 'lucide-react';
import type { Streamer, LiveStatus } from '@/types';
import { TIKTOK_USERNAMES } from '@/constants/streamers';
import { useLanguage, type Dictionary } from '@/contexts/LanguageProvider';
import { useStreamers } from '@/hooks/useStreamers';
import { useAuth } from '@/hooks/useAuth';
import { ChatOverlay } from '@/features/multiview/ChatOverlay';
import { TikTokLivePlayer } from '@/features/multiview/TikTokLivePlayer';
import { useTheme } from '@/contexts/ThemeProvider';

export const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#ff0000] fill-current shrink-0" aria-hidden="true">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const TikTokLogo = () => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#00f2fe] fill-current shrink-0" aria-hidden="true">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.373-4.509c.288 0 .566.042.829.12V9.387a6.34 6.34 0 0 0-.829-.054A6.34 6.34 0 0 0 3.14 15.67a6.34 6.34 0 0 0 10.82 4.482l.06-.06V11.233a8.214 8.214 0 0 0 5.569 2.164v-3.445a4.78 4.78 0 0 1-2.07-.48l-.067-.038a4.773 4.773 0 0 1-1.843-2.748h4.05v-.004z"/>
      </svg>
    );
  }
  return (
    <img 
      src="/images/tiktok_custom_logo.jpg" 
      alt="TikTok" 
      onError={() => setFailed(true)}
      className="w-3.5 h-3.5 shrink-0 object-contain rounded-sm" 
      referrerPolicy="no-referrer"
    />
  );
};

const getMemberPhotoPath = (name: string): string => {
  const n = name.toLowerCase().trim();
  
  if (n.includes('kael') || n.includes('pahrul') || n.includes('blake')) return 'nsn969blake';
  if (n.includes('hunt')) return 'nsn969hunt';

  let slug = '';
  if (n.includes('kai') || n.includes('baenara')) slug = 'kai';
  else if (n.includes('son') || n.includes('nareyy')) slug = 'son';
  else if (n.includes('lyn')) slug = 'lyn';
  else if (n.includes('mamat') || n.includes('mamatcha')) slug = 'mamat';
  else if (n.includes('tom') || n.includes('keyt')) slug = 'tomkeyt';
  else if (n.includes('ciyung') || n.includes('kocak')) slug = 'ciyung';
  else if (n.includes('doeeng')) slug = 'doeeng';
  else if (n.includes('nekelins') || n.includes('el')) slug = 'el';
  else if (n.includes('zaskia')) slug = 'zaskia';
  else if (n.includes('cutee') || n.includes('pie') || n.includes('cute')) slug = 'cutee';
  else if (n.includes('khaizure') || n.includes('khai') || n.includes('ryeo') || n.includes('quilla')) slug = 'quilla';
  else if (n.includes('n4srul') || n.includes('nasrul')) slug = 'n4srul';
  else if (n.includes('ipulsadila') || n.includes('ipul') || n.includes('adila')) slug = 'ipul';
  else if (n.includes('abanosz') || n.includes('aban')) slug = 'aban';
  else if (n.includes('along') || n.includes('hendy')) slug = 'along';
  else if (n.includes('mei')) slug = 'meimei';
  else if (n.includes('serend')) slug = 'serend';
  else if (n.includes('amat') || n.includes('timpas')) slug = 'amat';
  else if (n.includes('claire') || n.includes('jeder')) slug = 'claire';
  else if (n.includes('andre') || n.includes('myway')) slug = 'andre';
  else if (n.includes('verren') || n.includes('veren') || n.includes('varren')) slug = 'varren';
  else if (n.includes('jeje') || n.includes('saviora')) slug = 'jeje';
  else if (n.includes('william')) slug = 'william';
  else if (n.includes('acok') || n.includes('bihun')) slug = 'acok';
  else if (n.includes('berlin') || n.includes('ham')) slug = 'berlin';
  else if (n.includes('moonn') || n.includes('moon')) slug = 'moon';
  else if (n.includes('dipsy') || n.includes('dipo')) slug = 'dipsy';
  else if (n.includes('jnny') || n.includes('ruby')) slug = 'jnnyruby';
  else if (n.includes('yuyun')) slug = 'yuyun';
  else if (n.includes('agatha')) slug = 'agatha';
  else if (n.includes('kurara')) slug = 'kurara';
  else if (n.includes('chiyo')) slug = 'chiyo';
  else if (n.includes('dibo') || n.includes('jeder')) slug = 'dibochild';
  else if (n.includes('zota')) slug = 'zotaafrz';
  else if (n.includes('yuken') || n.includes('kenjieh')) slug = 'yukenjieh';
  else {
    slug = n.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  }

  return `nsn969${slug}`;
};

interface StreamCardProps {
  stream: Streamer;
  index: number;
  activeStreamsCount: number;
  liveStatus?: LiveStatus;
  isChatOpen: boolean;
  isMuted: boolean;
  size: 'small' | 'medium' | 'large';
  opacity: number;
  bgOpacity: number;
  onToggleLiveChat: (id: string) => void;
  onToggleMute: (id: string) => void;
  onRemove: (id: string) => void;
  language: string;
  dict: Dictionary;
  isCustom: boolean;
  isActive?: boolean;
}

const StreamCard = memo(function StreamCard({
  stream,
  index,
  activeStreamsCount,
  liveStatus,
  isChatOpen,
  isMuted,
  size,
  opacity,
  bgOpacity,
  onToggleLiveChat,
  onToggleMute,
  onRemove,
  language,
  dict,
  isCustom,
  isActive = true,
}: StreamCardProps) {
  const { theme } = useTheme();
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  const streamHandle = stream.channelId || '';
  const isChannelID = stream.platform === 'youtube' && (streamHandle.startsWith('UC') || streamHandle.length === 24);
  const originParam = typeof window !== 'undefined' && window.location?.origin
    ? `&origin=${encodeURIComponent(window.location.origin)}`
    : '';

  // Prioritize direct video ID when available to eliminate YouTube live_stream?channel redirect delay and buffering
  const effectiveVideoId = (liveStatus?.videoId && liveStatus.isLive) 
    ? liveStatus.videoId 
    : (!isChannelID ? streamHandle : null);

  const youtubeSrc = React.useMemo(() => {
    const base = effectiveVideoId
      ? `https://www.youtube-nocookie.com/embed/${effectiveVideoId}`
      : `https://www.youtube-nocookie.com/embed/live_stream?channel=${streamHandle}`;
    return `${base}?autoplay=1&mute=1&enablejsapi=1&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1${originParam}`;
  }, [effectiveVideoId, streamHandle, originParam]);

  // Synchronize audio cleanly on audio toggle without touching or reloading iframe
  useEffect(() => {
    if (!isIframeLoading) {
      const iframe = document.getElementById(`iframe-player-${stream.id}`) as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        const cmd = isMuted ? 'mute' : 'unMute';
        const vol = isMuted ? 0 : 100;
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), '*');
      }
    }
  }, [isMuted, stream.id, isIframeLoading]);

  // Instantly eliminate video delay and catch up to real-time live head
  const handleSyncToLiveEdge = useCallback(() => {
    const iframe = document.getElementById(`iframe-player-${stream.id}`) as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [999999, true] }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    }
  }, [stream.id]);

  return (
    <div
      id={`stream-block-${stream.id}`}
      className={`relative rounded-[1.25rem] transition-all duration-300 hover:border-[#e5a93c]/40 flex flex-col overflow-hidden border group ${
        theme === 'light'
          ? 'border-zinc-200 bg-white shadow-md'
          : 'border-zinc-900 bg-black shadow-[0_15px_30px_rgba(0,0,0,0.5)]'
      }`}
    >
      
      {/* Modern Header Control Bar */}
      <div className={`w-full h-12 px-4 flex items-center justify-between select-none shrink-0 z-30 border-b ${
        theme === 'light'
          ? 'bg-zinc-50 border-zinc-200'
          : 'bg-[#121215] border-zinc-900/80'
      }`}>
        <div className="flex items-center gap-2 max-w-[60%] min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${liveStatus?.isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
          {stream.platform === 'tiktok' ? <TikTokLogo /> : <YouTubeLogo />}
          <span className={`text-xs font-black uppercase tracking-wider truncate font-sans ${
            theme === 'light' ? 'text-zinc-800' : 'text-white'
          }`}>
            {stream.name}
          </span>
          {stream.platform && (
            <span className="text-[9px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-black/40 border border-zinc-855 shrink-0 uppercase tracking-widest leading-none hidden sm:inline-block">
              {stream.platform}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {isActive && (
            <>
              {/* Anti-Delay Sync Live Button */}
              {stream.platform === 'youtube' && (
                <button
                  type="button"
                  onClick={handleSyncToLiveEdge}
                  className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 border ${
                    theme === 'light'
                      ? 'bg-zinc-100 text-zinc-600 border-zinc-250 hover:text-amber-600 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-amber-400 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                  title={language === 'id' ? 'Sinkronkan Live (Hilangkan Delay)' : 'Sync Live (Fix Delay)'}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </button>
              )}

              {/* Live Chat Toggle Button */}
              <button
                type="button"
                onClick={() => onToggleLiveChat(stream.id)}
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 border ${
                  isChatOpen 
                    ? 'bg-[#e5a93c] text-black border-[#e5a93c] hover:bg-yellow-400 font-extrabold shadow-[0_0_8px_rgba(229,169,60,0.25)]' 
                    : theme === 'light'
                      ? 'bg-zinc-100 text-zinc-650 border-zinc-250 hover:text-zinc-900 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-700 hover:bg-zinc-850'
                }`}
                title={isChatOpen 
                  ? (language === 'id' ? 'Sembunyikan Live Chat' : 'Hide Live Chat') 
                  : (language === 'id' ? 'Tampilkan Live Chat' : 'Show Live Chat')}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Sound Toggle Button (Instant response without reload) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMute(stream.id);
                }}
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 border ${
                  !isMuted 
                    ? 'bg-[#e5a93c] text-black border-[#e5a93c] hover:bg-yellow-400 font-extrabold shadow-[0_0_12px_rgba(229,169,60,0.5)]' 
                    : theme === 'light'
                      ? 'bg-zinc-100 text-zinc-650 border-zinc-250 hover:text-zinc-900 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:text-white hover:border-zinc-700 hover:bg-zinc-855'
                }`}
                title={isMuted 
                  ? (language === 'id' ? 'Aktifkan Suara (Unmute)' : 'Unmute Sound') 
                  : (language === 'id' ? 'Matikan Suara (Mute)' : 'Mute Sound')}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          )}

          {isCustom && (
            <button
              type="button"
              onClick={() => onRemove(stream.id)}
              className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-red-950/45 hover:bg-red-500 text-red-500 hover:text-white border border-red-900/40 hover:border-red-500 transition-all cursor-pointer active:scale-95"
              title={language === 'id' ? 'Hapus Video Stream' : 'Remove Stream'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Native Video Player Shell */}
      <div className="relative aspect-video w-full h-full bg-[#050507] flex items-center justify-center overflow-hidden">
        {stream.platform === 'youtube' ? (
          <>
            {isIframeLoading && (
              <div className="absolute inset-0 w-full h-full bg-[#1e1f22] flex flex-col justify-between p-4 z-20 pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full animate-shimmer shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-32 rounded animate-shimmer" />
                    <div className="h-2.5 w-20 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="flex-1 my-3 w-full rounded-xl animate-shimmer opacity-25" />
                <div className="flex justify-between items-center h-8">
                  <div className="h-2.5 w-24 rounded animate-shimmer" />
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full animate-shimmer" />
                    <div className="w-7 h-7 rounded-full animate-shimmer" />
                  </div>
                </div>
              </div>
            )}
            <iframe
              key={stream.id}
              id={`iframe-player-${stream.id}`}
              src={youtubeSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="eager"
              referrerPolicy="origin"
              onLoad={() => {
                setIsIframeLoading(false);
                // Catch up immediately to live head to eliminate initial buffer delay
                const syncAudioAndLive = () => {
                  const iframe = document.getElementById(`iframe-player-${stream.id}`) as HTMLIFrameElement | null;
                  if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [999999, true] }), '*');
                    const cmd = isMuted ? 'mute' : 'unMute';
                    const vol = isMuted ? 0 : 100;
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), '*');
                  }
                };
                syncAudioAndLive();
                setTimeout(syncAudioAndLive, 400);
                setTimeout(syncAudioAndLive, 1000);
              }}
              className="absolute inset-0 w-full h-full border-0 select-none"
              title={stream.name}
            />
          </>
        ) : (
          <TikTokLivePlayer
            handle={streamHandle}
            isMuted={isMuted}
            streamName={stream.name}
            photoUrl={stream.photoUrl}
          />
        )}

        {isActive && stream.platform === 'youtube' && (
          <ChatOverlay
            chatId={liveStatus?.videoId || stream.channelId}
            isChatOpen={isChatOpen}
            bubbleSize={size}
            bubbleOpacity={opacity / 100}
            bubbleBgOpacity={bgOpacity / 100}
            externalUrl={
              isChannelID
                ? `https://www.youtube-nocookie.com/channel/${streamHandle}/live`
                : `https://www.youtube-nocookie.com/watch?v=${streamHandle}`
            }
          />
        )}
      </div>
    </div>
  );
});

export interface MultiViewPlayerProps {
  isActive?: boolean;
}

export function MultiViewPlayer({ isActive = true }: MultiViewPlayerProps = {}) {
  const { dict, language } = useLanguage();
  const { streamers, liveStatuses, addStreamerToDb } = useStreamers();
  const { isAdmin } = useAuth();
  const { theme } = useTheme();

  // Create separated Options for each member's YouTube only (live members sorted first for fast manual selection)
  const streamerOptions = React.useMemo(() => {
    const list: Streamer[] = [];
    streamers.forEach(s => {
      // 1. YouTube option only
      const ytId = s.youtubeId || (s.platform === 'youtube' ? s.channelId : undefined);
      if (ytId) {
        list.push({
          ...s,
          id: `${s.id}-youtube`,
          platform: 'youtube',
          channelId: ytId
        });
      }
    });
    return list.sort((a, b) => {
      const aLive = !!(liveStatuses && (liveStatuses[a.id]?.isLive || liveStatuses[a.id.replace('-youtube', '')]?.isLive));
      const bLive = !!(liveStatuses && (liveStatuses[b.id]?.isLive || liveStatuses[b.id.replace('-youtube', '')]?.isLive));
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [streamers, liveStatuses]);

  // Maintain activeStreams state across view navigation so background audio keeps playing
  const [activeStreams, setActiveStreams] = useState<Streamer[]>(() => {
    try {
      const saved = sessionStorage.getItem('nsn_active_streams');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Comparison helper for active stream lists to prevent infinite loops and stale closures
  const areStreamsEqual = (a: Streamer[], b: Streamer[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].id !== b[i].id ||
        a[i].name !== b[i].name ||
        a[i].channelId !== b[i].channelId ||
        a[i].platform !== b[i].platform ||
        a[i].isFeatured !== b[i].isFeatured ||
        a[i].photoUrl !== b[i].photoUrl
      ) {
        return false;
      }
    }
    return true;
  };

  // Sync active streams with any database updates
  useEffect(() => {
    if (streamers.length === 0) return;

    setActiveStreams(prev => {
      if (prev.length === 0) return prev;

      const syncedList = prev
        .filter(item => item.platform !== 'tiktok')
        .map(item => {
          const cleanId = item.id.replace('-youtube', '').replace('-tiktok', '');
          const fresh = streamers.find(s => s.id === cleanId || s.id === item.id);
          if (fresh) {
            return {
              ...fresh,
              id: item.id,
              platform: item.platform,
              channelId: item.channelId,
              isFeatured: fresh.isFeatured,
              photoUrl: fresh.photoUrl
            };
          }
          return item;
        });

      if (areStreamsEqual(prev, syncedList)) {
        return prev;
      }
      return syncedList;
    });
  }, [streamers]);

  // Save active streams to sessionStorage whenever updated
  useEffect(() => {
    if (activeStreams.length > 0) {
      sessionStorage.setItem('nsn_active_streams', JSON.stringify(activeStreams));
    } else {
      sessionStorage.removeItem('nsn_active_streams');
    }
  }, [activeStreams]);

  // Layout parameters states
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [opacity, setOpacity] = useState<number>(100);
  const [bgOpacity, setBgOpacity] = useState<number>(100);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Automatically keep settings hidden each time multiview view is opened/activated
  useEffect(() => {
    if (isActive) {
      setShowSettings(false);
    }
  }, [isActive]);

  // Custom Stream states
  const [customStreamName, setCustomStreamName] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Custom interactive chats dictionary mapping streamer id -> chat states (synchronized with sessionStorage)
  const [openChats, setOpenChats] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = sessionStorage.getItem('nsn_open_chats');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  const [mutedStreams, setMutedStreams] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = sessionStorage.getItem('nsn_muted_streams');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Track and save changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('nsn_open_chats', JSON.stringify(openChats));
  }, [openChats]);

  useEffect(() => {
    sessionStorage.setItem('nsn_muted_streams', JSON.stringify(mutedStreams));
  }, [mutedStreams]);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddCustomStream = async () => {
    if (!customStreamUrl.trim() || isResolving) return;
    setIsResolving(true);
    let platform: 'youtube' | 'tiktok' = 'youtube';
    let handle = customStreamUrl.trim();
    const originalUrl = customStreamUrl.trim();

    // 1. If it's a mobile TikTok link or unresolved custom URL path, resolve on server first
    if (originalUrl.includes('tiktok.com') && (originalUrl.includes('vt.tiktok.com') || !originalUrl.includes('/@'))) {
      try {
        const res = await fetch(`/api/resolve-tiktok?url=${encodeURIComponent(originalUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.handle) {
            handle = data.handle;
            platform = 'tiktok';
          }
        }
      } catch (e) {
        console.warn("Failed resolving TikTok shortcut server-side:", e);
      }
    }

    // 2. Client-side secondary cleanups / fallback parsing
    try {
      if (handle.startsWith('@') && !handle.includes('http')) {
        platform = 'tiktok';
        handle = handle.replace('@', '');
      } else if (handle.includes('tiktok.com')) {
        platform = 'tiktok';
        if (handle.includes('/@')) {
          handle = handle.split('/@')[1]?.split('/')[0]?.split('?')[0] || handle;
        } else {
          const parts = handle.trim().split('/');
          const filteredParts = parts.filter(Boolean);
          const lastPart = filteredParts[filteredParts.length - 1];
          if (lastPart) {
            handle = lastPart.split('?')[0];
          }
        }
      } else if (handle.includes('youtube.com') || handle.includes('youtu.be')) {
        platform = 'youtube';
        if (handle.includes('v=')) {
          handle = handle.split('v=')[1]?.split('&')[0];
        } else if (handle.includes('youtu.be/')) {
          handle = handle.split('youtu.be/')[1]?.split('?')[0];
        } else if (handle.includes('youtube.com/live/')) {
          handle = handle.split('youtube.com/live/')[1]?.split('?')[0];
        } else if (handle.includes('/channel/') || handle.includes('/@')) {
          const parts = handle.split('/');
          handle = parts[parts.length - 1]; 
        }
      } else if (handle.startsWith('@')) {
        platform = 'tiktok';
        handle = handle.replace('@', '');
      }
    } catch (e) {
      console.warn("Failed to parse URL client-side:", e);
    }

    if (handle) {
      handle = handle.replace('@', '').trim();
    }

    const newStreamId = `custom-${Date.now()}`;
    const newStream: Streamer = {
      id: newStreamId,
      name: customStreamName.trim() || (platform === 'tiktok' ? `@${handle}` : 'Custom Stream'),
      platform,
      channelId: handle || originalUrl,
      isFeatured: false
    };

    setActiveStreams(prev => [...prev, newStream]);
    setOpenChats(prev => ({ ...prev, [newStreamId]: false }));
    setMutedStreams(prev => ({ ...prev, [newStreamId]: false }));
    setCustomStreamName('');
    setCustomStreamUrl('');
    setIsResolving(false);
    showToast(`Added custom stream: ${newStream.name}`);
  };

  const handleToggleStreamPill = (streamer: Streamer) => {
    const isActive = activeStreams.some(s => s.id === streamer.id);
    if (isActive) {
      setActiveStreams(prev => prev.filter(s => s.id !== streamer.id));
      setOpenChats(prev => {
        const copy = { ...prev };
        delete copy[streamer.id];
        return copy;
      });
      setMutedStreams(prev => {
        const copy = { ...prev };
        delete copy[streamer.id];
        return copy;
      });
    } else {
      // Yg tidak lagi live member nya tidak bisa di pijit siaran aktif nya, hanya khusus yg lagi live streaming bisa di pijit!
      const liveStatus = liveStatuses ? (liveStatuses[streamer.id] || liveStatuses[streamer.id.replace('-youtube', '')]) : null;
      const isLive = !!liveStatus?.isLive;
      if (!isLive) {
        return; // Member yang tidak live streaming tidak bisa diaktifkan
      }

      setActiveStreams(prev => [...prev, streamer]);
      // Live chat icon starts closed by default so user can open manually via chat icon in multiview
      setOpenChats(prev => ({ ...prev, [streamer.id]: false }));
      // Unmute only if this is the first active stream; subsequent streams start muted to preserve network bandwidth and prevent audio conflict (user can tap speaker to unmute)
      const shouldUnmute = activeStreams.length === 0;
      setMutedStreams(prev => ({ ...prev, [streamer.id]: !shouldUnmute }));
    }
  };

  const handleSyncAllStreams = useCallback(() => {
    activeStreams.forEach(s => {
      const iframe = document.getElementById(`iframe-player-${s.id}`) as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [999999, true] }), '*');
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      }
    });
  }, [activeStreams]);

  const showToast = useCallback((msg: string) => {
    // Notifications disabled by user request
  }, []);

  const handleToggleLiveChat = useCallback((streamId: string) => {
    setOpenChats(prev => {
      const isOpening = !prev[streamId];
      return { ...prev, [streamId]: isOpening };
    });
  }, []);

  const handleToggleMute = useCallback((streamId: string) => {
    setMutedStreams(prev => {
      // If true, currently muted -> toggle to false (unmute)
      // If false or undefined, currently unmuted -> toggle to true (mute)
      const isCurrentlyMuted = prev[streamId] === true;
      const nextMuted = !isCurrentlyMuted;

      // PostMessage directly to the iframe without triggering playVideo or reload
      const iframe = document.getElementById(`iframe-player-${streamId}`) as HTMLIFrameElement | null;
      if (iframe?.contentWindow) {
        const command = nextMuted ? 'mute' : 'unMute';
        const volume = nextMuted ? 0 : 100;
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: command,
          args: []
        }), '*');

        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volume]
        }), '*');
      }
      return { ...prev, [streamId]: nextMuted };
    });
  }, []);

  const handleLikeSubscribe = (streamerName: string) => {
    showToast(`Liked & Subscribed to ${streamerName}! Dukungan terkirim! ❤️`);
  };

  const isCustomStream = (streamId: string) => {
    if (streamId.startsWith('custom-')) return true;
    const cleanId = streamId.replace('-youtube', '').replace('-tiktok', '');
    return !streamers.some(s => s.id === cleanId || s.id === streamId);
  };

  const handleRemoveCustomStream = useCallback((streamId: string) => {
    setActiveStreams(prev => prev.filter(s => s.id !== streamId));
    setOpenChats(prev => {
      const copy = { ...prev };
      delete copy[streamId];
      return copy;
    });
    setMutedStreams(prev => {
      const copy = { ...prev };
      delete copy[streamId];
      return copy;
    });
  }, []);

  // Compute dynamic layouts for grid (locked styling as size controls chat)
  const getGridClasses = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-4xl mx-auto gap-5';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 gap-5';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3 gap-5';
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5';
    if (count === 5) return 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5';
    if (count === 6) return 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-5';
    if (count === 7) return 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-5';
    if (count === 8) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5';
    if (count === 9) return 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-5';
    if (count === 10) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5';
  };

  const getChatSizeClasses = (sz: 'small' | 'medium' | 'large') => {
    if (sz === 'small') return 'w-[32%] min-w-[170px] max-w-[230px]';
    if (sz === 'medium') return 'w-[48%] min-w-[230px] max-w-[310px]';
    return 'w-[68%] min-w-[280px] max-w-[420px]';
  };

  const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div id="multiview-command-hub" className="space-y-6 sm:space-y-8 select-none">
      
      {/* Top Banner Header Block (As in screenshot) */}
      <div className="space-y-2 pb-2">
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none font-sans ${
          theme === 'light' ? 'text-zinc-900' : 'text-white'
        }`}>
          {dict.multiview.title}
        </h1>
        <p className={`text-xs font-medium font-sans ${
          theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          {dict.multiview.monitorSubtitle}
        </p>
      </div>

      {/* Select Streams Container Box (As in screenshot, perfectly redesigned) */}
      <div className={`rounded-[1.25rem] p-5 md:p-6 shadow-xl space-y-5 transition-colors duration-300 border ${
        theme === 'light'
          ? 'bg-white border-zinc-200 text-zinc-800'
          : 'bg-[#0c0c0e]/95 border-zinc-900 text-white'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3.5 ${
          theme === 'light' ? 'border-zinc-200' : 'border-zinc-900'
        }`}>
          <div className={`flex items-center gap-2 ${
            theme === 'light' ? 'text-zinc-800' : 'text-white'
          }`}>
            <Users className="w-4.5 h-4.5 text-zinc-400" />
            <h2 className="text-sm font-bold tracking-wide select-none">
              {dict.multiview.activeStreams} ({activeStreams.length}/{streamerOptions.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeStreams.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAllStreams}
                  className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 hover:text-amber-300 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                  title={language === 'id' ? 'Sinkronkan semua streaming ke siaran terkini tanpa delay' : 'Sync all active streams to live edge'}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{language === 'id' ? 'SINKRONKAN' : 'SYNC ALL'}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStreams([]);
                    setOpenChats({});
                    setMutedStreams({});
                    sessionStorage.removeItem('nsn_active_streams');
                    sessionStorage.removeItem('nsn_open_chats');
                    sessionStorage.removeItem('nsn_muted_streams');
                    showToast(language === 'id' ? "Berhasil mengosongkan semua streaming" : "Cleared all active streams");
                  }}
                  className="bg-red-950/45 hover:bg-red-900 border border-red-900/35 text-red-500 hover:text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                >
                  {language === 'id' ? 'KOSONGKAN' : 'CLEAR ALL'}
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowSettings(!showSettings);
              }}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 border flex items-center gap-1.5 ${
                showSettings
                  ? 'bg-[#e5a93c] text-black border-[#e5a93c] font-black shadow-[0_0_12px_rgba(229,169,60,0.3)]'
                  : theme === 'light'
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{showSettings ? dict.multiview.hideSettings : dict.multiview.showSettings}</span>
            </button>
          </div>
        </div>

        {/* Member grid layout: strictly 2 columns on mobile/HP, fluid auto-fill according to monitor screen width on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(205px,1fr))] gap-2 sm:gap-2.5 pt-1">
          {streamerOptions.map((streamer) => {
            const liveStatus = liveStatuses ? (liveStatuses[streamer.id] || liveStatuses[streamer.id.replace('-youtube', '')]) : null;
            const isLive = liveStatus ? liveStatus.isLive : false;
            const isActive = activeStreams.some(s => s.id === streamer.id);
            const isTikTok = streamer.platform === 'tiktok';
            const canClick = isLive || isActive;

            return (
              <button
                key={streamer.id}
                type="button"
                disabled={!canClick}
                onClick={() => {
                  if (canClick) {
                    handleToggleStreamPill(streamer);
                  }
                }}
                className={`w-full flex items-center justify-between gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-[11px] leading-none uppercase transition-all duration-300 select-none border tracking-wide font-black ${
                  !canClick
                    ? theme === 'light'
                      ? 'cursor-not-allowed bg-zinc-100/90 border-zinc-300/80 pointer-events-none shadow-none'
                      : 'cursor-not-allowed bg-zinc-900/70 border-zinc-800/80 pointer-events-none shadow-none'
                    : isActive
                    ? 'bg-[#e5a93c] text-black border-[#e5a93c] font-black shadow-[0_0_18px_rgba(229,169,60,0.45)] cursor-pointer active:scale-95'
                    : isLive
                    ? isTikTok
                      ? 'bg-[#121215] text-[#00f2fe] border-[#00f2fe]/60 hover:border-[#00f2fe] hover:bg-[#1a1a24] shadow-[0_0_14px_rgba(0,242,254,0.35)] font-black hover:scale-[1.03] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)] cursor-pointer active:scale-95'
                      : 'bg-[#121215] text-red-500 border-red-500/60 hover:border-red-500 hover:bg-[#1f1214] shadow-[0_0_14px_rgba(239,68,68,0.35)] font-black hover:scale-[1.03] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] cursor-pointer active:scale-95'
                    : ''
                }`}
                title={
                  isActive 
                    ? `${dict.multiview.hide} ${streamer.name} (${streamer.platform.toUpperCase()})` 
                    : isLive 
                    ? `${dict.multiview.add} ${streamer.name} (${streamer.platform.toUpperCase()} LIVE)` 
                    : `${streamer.name} (${language === 'id' ? 'Tidak Sedang Live / Offline' : 'Currently Offline'})`
                }
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
                  {/* Brand Logo on the left of name - keep faded if offline */}
                  <span className={!canClick ? 'opacity-35 grayscale shrink-0' : 'shrink-0'}>
                    {isTikTok ? <TikTokLogo /> : <YouTubeLogo />}
                  </span>

                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-black animate-ping'
                      : isLive 
                      ? isTikTok ? 'bg-[#00f2fe] animate-pulse shadow-[0_0_6px_#00f2fe]' : 'bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]' 
                      : 'bg-zinc-600/50'
                  }`} />

                  {/* Member name: crisp white for offline so it is clearly readable */}
                  <span className={`truncate ${
                    isActive
                      ? 'text-black font-black'
                      : isLive 
                      ? `animate-pulse font-black ${isTikTok ? 'text-[#00f2fe] drop-shadow-[0_0_10px_rgba(0,242,254,0.95)]' : 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.95)]'}` 
                      : theme === 'light'
                      ? 'text-zinc-900 font-bold'
                      : 'text-white font-bold'
                  }`}>
                    {streamer.name}
                  </span>
                </div>

                {isLive && !isActive && (
                  <span className={`text-[7.5px] font-mono font-extrabold shrink-0 ml-1 animate-pulse ${isTikTok ? 'text-[#00f2fe]' : 'text-red-500'}`}>
                    LIVE
                  </span>
                )}

                {!isLive && !isActive && (
                  <span className="text-[7.5px] font-mono text-zinc-500 dark:text-zinc-500/80 shrink-0 ml-1 uppercase tracking-wider font-semibold opacity-60">
                    {language === 'id' ? 'TIDAK LIVE' : 'OFFLINE'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Stream Link Section */}
        <div className={`pt-4 mt-2 flex flex-col sm:flex-row items-center gap-3 border-t ${
          theme === 'light' ? 'border-zinc-200' : 'border-zinc-900/60'
        }`}>
           <input 
             type="text" 
             placeholder={dict.multiview.placeholderName || "Stream Name"}
             value={customStreamName}
             disabled={isResolving}
             onChange={e => setCustomStreamName(e.target.value)}
             className={`text-xs px-4 py-3 rounded-xl w-full sm:w-1/3 focus:outline-none focus:border-[#e5a93c] disabled:opacity-50 border ${
               theme === 'light'
                 ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                 : 'bg-black/50 border-zinc-800 text-white placeholder:text-zinc-500'
             }`}
           />
           <div className="relative w-full sm:w-1/2">
             <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
             <input 
               type="text" 
               placeholder={dict.multiview.placeholderHandle || "TikTok or YouTube Live URL"}
               value={customStreamUrl}
               disabled={isResolving}
               onChange={e => setCustomStreamUrl(e.target.value)}
               className={`text-xs pl-10 pr-4 py-3 rounded-xl w-full focus:outline-none focus:border-[#e5a93c] disabled:opacity-50 border ${
                 theme === 'light'
                   ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                   : 'bg-black/50 border-zinc-800 text-white placeholder:text-zinc-500'
               }`}
               onKeyDown={(e) => e.key === 'Enter' && handleAddCustomStream()}
             />
           </div>
           <button 
             onClick={handleAddCustomStream}
             disabled={!customStreamUrl.trim() || isResolving}
             className={`w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer px-5 py-3 rounded-xl border ${
               theme === 'light'
                 ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-850 border-zinc-250 shadow-sm'
                 : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
             }`}
           >
             {isResolving ? (
               <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e5a93c]" />
             ) : (
               <Plus className="w-3.5 h-3.5" />
             )}
             {isResolving ? "RESOLVING..." : dict.multiview.addLink}
           </button>
        </div>





        {/* Live Chat Overlay config panel for sizes and opacities */}
        {showSettings && (
          <div className={`pt-5 space-y-5 select-none animate-in fade-in duration-300 border-t ${
            theme === 'light' ? 'border-zinc-200' : 'border-zinc-900/60'
          }`}>
            {/* First Row: View & Chat Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Size interactive segmented node selection */}
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider font-mono shrink-0">{dict.multiview.size}:</span>
                <div className={`flex items-center rounded-xl p-1 border ${
                  theme === 'light'
                    ? 'bg-zinc-100 border-zinc-200'
                    : 'bg-[#121215] border-zinc-900'
                }`}>
                  {(['small', 'medium', 'large'] as const).map((sz) => {
                    const isActive = size === sz;
                    const label = sz === 'small' 
                      ? (language === 'id' ? 'Kecil' : 'Small')
                      : sz === 'medium'
                      ? (language === 'id' ? 'Sedang' : 'Medium')
                      : (language === 'id' ? 'Besar' : 'Large');
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSize(sz)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? theme === 'light'
                              ? 'bg-white text-zinc-900 font-black shadow-sm border border-zinc-200'
                              : 'bg-zinc-800 text-white font-black shadow-inner shadow-black/40'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Opacity slider control */}
              <div className="flex items-center gap-3 justify-between">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider font-mono shrink-0">{dict.multiview.opacity}:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className={`w-full accent-[#e5a93c] h-2 rounded-lg cursor-pointer mx-1.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e5a93c] [&::-webkit-slider-thumb]:border-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#e5a93c] [&::-moz-range-thumb]:border-none ${
                    theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-900'
                  }`}
                />
                <span className={`text-xs font-mono font-bold shrink-0 w-8 text-right ${
                  theme === 'light' ? 'text-zinc-800' : 'text-white'
                }`}>{opacity}%</span>
              </div>

              {/* BG Opacity slider control */}
              <div className="flex items-center gap-3 justify-between">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider font-mono shrink-0">{dict.multiview.bgOpacity}:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(Number(e.target.value))}
                  className={`w-full accent-[#e5a93c] h-2 rounded-lg cursor-pointer mx-1.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e5a93c] [&::-webkit-slider-thumb]:border-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#e5a93c] [&::-moz-range-thumb]:border-none ${
                    theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-900'
                  }`}
                />
                <span className={`text-xs font-mono font-bold shrink-0 w-8 text-right ${
                  theme === 'light' ? 'text-zinc-800' : 'text-white'
                }`}>{bgOpacity}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Display block layout */}
      {activeStreams.length > 0 ? (
        <div id="grid-canvas-container" className="w-full transition-all duration-300">
          <div className={`grid ${getGridClasses(activeStreams.length)} transition-all duration-300`}>
            {activeStreams.map((stream, index) => {
              const liveStatus = liveStatuses ? liveStatuses[stream.id] : null;
              const isChatOpen = !!openChats[stream.id];
              // Speaker auto aktif (unmuted by default so live audio is heard immediately)
              const isMuted = mutedStreams[stream.id] === true;

              return (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  index={index}
                  activeStreamsCount={activeStreams.length}
                  liveStatus={liveStatus}
                  isChatOpen={isChatOpen}
                  isMuted={isMuted}
                  size={size}
                  opacity={opacity}
                  bgOpacity={bgOpacity}
                  onToggleLiveChat={handleToggleLiveChat}
                  onToggleMute={handleToggleMute}
                  onRemove={handleRemoveCustomStream}
                  language={language}
                  dict={dict}
                  isCustom={isCustomStream(stream.id)}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </div>
      ) : (
        /* Perfectly centered dashboard grid placeholder when no streams are enabled */
        <div className={`flex flex-col items-center justify-center text-center rounded-3xl p-12 py-20 min-h-[400px] border transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white border-zinc-200 shadow-sm'
            : 'bg-[#070709]/60 border-zinc-900'
        }`}>
          <div className="w-20 h-20 rounded-full bg-[#e5a93c]/5 border border-[#e5a93c]/20 flex items-center justify-center text-[#e5a93c] animate-pulse mb-6">
            <Grid className="w-10 h-10" />
          </div>
          <h3 className={`text-lg font-bold tracking-widest uppercase font-serif ${
            theme === 'light' ? 'text-zinc-900' : 'text-white'
          }`}>{dict.multiview.commandDeckUnoccupied}</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm font-medium leading-relaxed font-sans px-4">
            {dict.multiview.commandDeckSubtitle}
          </p>
        </div>
      )}

    </div>
  );
}
