import React, { useState } from 'react';
import { ChevronDown, X, Compass, Search, Flame } from 'lucide-react';
import ChannelListMenuRow from './ChannelListMenuRow';
import { menuItems } from './menuItems';

export default function ChannelListTopBar({
  serverName,
}: {
  serverName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='w-full relative flex flex-col bg-[#1e1f22] select-none shrink-0'>
      {/* Server Header Dropdown */}
      <button
        className={`flex w-full items-center justify-between px-3.5 py-2.5 border-b border-[#1f2023] transition-colors cursor-pointer ${
          menuOpen ? 'bg-[#35373c]' : 'bg-transparent hover:bg-zinc-800/40'
        }`}
        onClick={() => setMenuOpen((currentValue) => !currentValue)}
      >
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-100 font-extrabold text-[13.5px] uppercase tracking-wide font-sans truncate">
              NSN COMMUNITY
            </span>
            <span className="text-pink-400 text-xs shrink-0">🏠</span>
          </div>
          <span className="text-[10.5px] text-[#949ba4] font-medium font-sans">
            393 Members • Community
          </span>
        </div>
        {menuOpen ? (
          <X className="h-4 w-4 text-zinc-300 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-300 shrink-0" />
        )}
      </button>

      {/* Menu Options Dropdown */}
      {menuOpen && (
        <div className='absolute left-2 right-2 top-13 p-1.5 bg-[#111214] border border-[#2b2d31] rounded-md shadow-2xl z-50 animate-fade-in'>
          <div className='w-full space-y-0.5'>
            {menuItems.map((option) => (
              <button
                key={option.name}
                className='w-full text-left'
                onClick={() => setMenuOpen(false)}
              >
                <ChannelListMenuRow {...option} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Golden Banner Header Image */}
      <div className="w-full h-24 relative overflow-hidden bg-[#0d0e11] flex items-center justify-center border-b border-[#1f2023]">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />
        <img
          src="/images/nsn969logo.png"
          alt="NSN 969 Banner"
          className="h-20 w-auto object-contain z-10 filter drop-shadow-[0_2px_10px_rgba(217,119,6,0.35)]"
          referrerPolicy="no-referrer"
        />
        {/* Abstract golden luxury background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#0a0b0d_25%,transparent_25%),linear-gradient(-45deg,#0a0b0d_25%,transparent_25%)] bg-[size:10px_10px] opacity-20" />
      </div>

      {/* Boost Goal Bar */}
      <div className="px-2 mt-2">
        <div className="bg-[#2b2d31] hover:bg-[#35373c] border border-zinc-800/40 rounded-lg p-1.5 flex items-center justify-between cursor-pointer transition-all duration-200">
          <div className="flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Flame className="w-2.5 h-2.5 fill-white stroke-none" />
              Boost Goal
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-zinc-300 text-[10.5px] font-semibold font-mono">
            <span>19/36 Boosts</span>
            <ChevronDown className="w-3.5 h-3.5 rotate-270 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Browse Channels Button */}
      <div className="px-2 mt-2 pb-1 border-b border-zinc-800/40">
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-all text-left cursor-pointer">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold font-sans">Browse Channels</span>
          </div>
        </button>
      </div>
    </div>
  );
}
