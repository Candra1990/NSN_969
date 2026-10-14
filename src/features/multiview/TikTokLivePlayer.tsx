import React, { useState } from 'react';
import { ExternalLink, Sparkles, Play } from 'lucide-react';
import { MemberIllustration } from '@/components/common/MemberIllustration';

interface TikTokLivePlayerProps {
  handle: string;
  isMuted: boolean;
  streamName: string;
  photoUrl?: string;
}

export function TikTokLivePlayer({ handle, isMuted, streamName, photoUrl }: TikTokLivePlayerProps) {
  const cleanHandle = handle.replace('@', '').trim();
  const [imgFailed, setImgFailed] = useState(false);

  const tiktokLiveUrl = `https://www.tiktok.com/@${cleanHandle}/live`;

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050508] flex flex-col items-center justify-center select-none overflow-hidden text-center p-4 border border-zinc-900/60 rounded-xl relative group">
      {/* Decorative sci-fi grid layer */}
      <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
      
      {/* Dynamic ambient diagonal lighting with TikTok color accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-[#00f2fe]/10 via-[#fe0979]/5 to-transparent rounded-full blur-[80px] pointer-events-none z-0 animate-pulse duration-[6000ms]" />

      {/* Retro laser scans visual bar overlay */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f2fe]/80 to-transparent shadow-[0_0_10px_rgba(0,242,254,0.6)] animate-bounce pointer-events-none z-10" style={{ animationDuration: '4s' }} />

      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full py-2 max-w-sm">
        
        {/* TOP BADGE PANEL: TIKTOK LIVE STREAM Pulsing Badge */}
        <div className="flex flex-col items-center space-y-1 mt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 border border-zinc-855 shadow-[0_0_15px_rgba(0,242,254,0.15)] animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe0979] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fe0979]"></span>
            </span>
            <span className="text-[10px] font-sans font-black tracking-[0.18em] text-white uppercase flex items-center gap-1 leading-none">
              <span className="text-[#00f2fe]">TIKTOK</span>
              <span className="text-[#fe0979]">LIVE</span>
              <span>STREAM</span>
            </span>
          </div>
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
            EXTERNAL PLAYER STANDBY
          </span>
        </div>

        {/* CENTER CONTENT: Streamer Frame & Glowing Brackets */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Cyber Camera Brackets (Corners) */}
          <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-[#00f2fe]/60 pointer-events-none" />
          <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-[#00f2fe]/60 pointer-events-none" />
          <div className="absolute -bottom-3 -left-3 w-4 h-4 border-b-2 border-l-2 border-[#fe0979]/60 pointer-events-none" />
          <div className="absolute -bottom-3 -right-3 w-4 h-4 border-b-2 border-r-2 border-[#fe0979]/60 pointer-events-none" />

          {/* Glowing Outer Ring */}
          <div className="absolute inset-[-6px] rounded-full border border-dashed border-[#00f2fe]/30 animate-spin" style={{ animationDuration: '30s' }} />
          
          <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#00f2fe] via-purple-600 to-[#fe0979] shadow-[0_0_25px_rgba(0,242,254,0.35)] overflow-hidden">
            <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center">
              {imgFailed || !photoUrl ? (
                <div className="w-full h-full scale-105">
                  <MemberIllustration name={streamName} />
                </div>
              ) : (
                <img
                  src={photoUrl}
                  alt={streamName}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              )}
            </div>
          </div>

          {/* Absolute floating 'LIVE' micro-badge */}
          <div className="absolute -bottom-2 px-2.5 py-0.5 rounded bg-[#fe0979] text-[8px] font-black text-white uppercase tracking-wider shadow-md leading-none">
            LIVE
          </div>
        </div>

        {/* BOTTOM METADATA SECTION & CTAs */}
        <div className="w-full space-y-2.5 px-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-sans font-black text-white uppercase tracking-wide leading-tight">
              {streamName || cleanHandle}
            </h3>
            <p className="text-[9px] font-mono tracking-wider text-zinc-500">
              @{cleanHandle}
            </p>
          </div>

          <p className="text-[10px] text-zinc-450 font-sans leading-relaxed max-w-[270px] mx-auto">
            TikTok membatasi pemutaran embed pihak ketiga. Silakan saksikan siaran langsung ini secara lancar di platform resmi TikTok!
          </p>

          <div className="pt-0.5 flex items-center justify-center gap-3">
            <a
              href={tiktokLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00f2fe] via-purple-600 to-[#fe0979] text-white text-[10px] font-sans font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_5px_15px_rgba(0,242,254,0.3)] hover:shadow-[0_8px_25px_rgba(254,9,121,0.55)] hover:scale-[1.04] active:scale-95 cursor-pointer leading-none"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>BUKA TIKTOK LIVE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-1 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
            <Sparkles className="w-2.5 h-2.5 text-[#00f2fe]" />
            <span>EXTERNAL RELAY SYSTEM ACTIVE</span>
          </div>
        </div>

      </div>
    </div>
  );
}
