import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface ComingSoonLayoutProps {
  onClose?: () => void;
  title?: string;
}

export function ComingSoonLayout({ onClose, title }: ComingSoonLayoutProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full h-full min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* 1. Top-Left & Bottom-Right Diagonal Gold Accent Lines */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none opacity-40">
        <div className="absolute top-4 left-[-100px] w-96 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -rotate-45" />
        <div className="absolute top-12 left-[-80px] w-96 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent transform -rotate-45" />
        <div className="absolute top-20 left-[-60px] w-96 h-[1px] bg-gradient-to-r from-transparent via-amber-600/50 to-transparent transform -rotate-45" />
      </div>

      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none opacity-40">
        <div className="absolute bottom-4 right-[-100px] w-96 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transform -rotate-45" />
        <div className="absolute bottom-12 right-[-80px] w-96 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent transform -rotate-45" />
        <div className="absolute bottom-20 right-[-60px] w-96 h-[1px] bg-gradient-to-r from-transparent via-amber-600/50 to-transparent transform -rotate-45" />
      </div>

      {/* 2. Side Dot Matrix Pattern */}
      <div className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 hidden md:grid grid-cols-4 gap-2.5 opacity-25 pointer-events-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={`dot-l-${i}`} className="w-1 h-1 rounded-full bg-amber-400" />
        ))}
      </div>
      <div className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 hidden md:grid grid-cols-4 gap-2.5 opacity-25 pointer-events-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={`dot-r-${i}`} className="w-1 h-1 rounded-full bg-amber-400" />
        ))}
      </div>

      {/* 3. Top Navigation (Back button if onClose provided, no X icon) */}
      {onClose && (
        <div className="absolute top-6 left-6 right-6 flex items-center justify-start z-30">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-amber-500/30 transition-all cursor-pointer text-xs font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>{language === 'en' ? 'BACK' : 'KEMBALI'}</span>
          </button>
        </div>
      )}

      {/* 4. Central Main Card Container */}
      <div className="relative z-20 max-w-lg w-full p-8 sm:p-12 sm:pb-14 rounded-[32px] bg-[#111216]/95 border border-amber-500/30 shadow-[0_0_60px_rgba(217,119,6,0.12)] backdrop-blur-xl flex flex-col items-center text-center space-y-7">
        
        {/* Golden Web Logo Emblem (NSN 969) */}
        <div className="relative flex flex-col items-center group">
          {/* Glow aura behind logo */}
          <div className="absolute -inset-4 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

          {/* Web Logo Image */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center p-1">
            <img
              src="/images/nsn969logo.png"
              alt="NSN969 Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(217,119,6,0.4)] transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Under-badge Light Flare Line */}
          <div className="w-24 h-[1.5px] bg-amber-400 blur-[0.5px] rounded-full shadow-[0_0_12px_#f59e0b] mt-2" />
        </div>

        {/* Headline: COMING SOON / SEGERA HADIR */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <span className="text-white">{language === 'en' ? 'COMING' : 'SEGERA'}</span>
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              {language === 'en' ? 'SOON' : 'HADIR'}
            </span>
          </h1>
        </div>

        {/* Thin Gold Center Line */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent my-1" />

        {/* Sub-headline Text */}
        <p className="text-zinc-400 font-mono text-[11px] sm:text-[12px] tracking-[0.3em] uppercase max-w-xs font-semibold">
          {language === 'en' ? 'SOMETHING GREAT IS ON THE WAY' : 'SESUATU YANG LUAR BIASA SEDANG DIPERSIAPKAN'}
        </p>

        {/* Pill Button / Badge */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="group px-7 py-3 rounded-full border border-amber-500/60 bg-[#0a0b0e] hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-bold tracking-[0.2em] text-xs uppercase flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{language === 'en' ? 'STAY TUNED' : 'SEGERA HADIR'}</span>
          </button>
        </div>

        {title && (
          <p className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase pt-1">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
