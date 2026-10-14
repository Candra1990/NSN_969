import React, { useState } from 'react';
import { Settings, LogOut, Mic, MicOff, Headphones, Shield } from 'lucide-react';
import ChannelListMenuRow from '../TopBar/ChannelListMenuRow';

type ChannelListBottomBarProps = {
  currentUser: any;
  onSignOut: () => void;
  onOpenSettings?: () => void;
  isMicMuted?: boolean;
  onToggleMic?: () => void;
};

export default function ChannelListBottomBar({
  currentUser,
  onSignOut,
  onOpenSettings,
  isMicMuted = false,
  onToggleMic,
}: ChannelListBottomBarProps) {
  const [isDeafened, setIsDeafened] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Avatar URL using standard dicebear or backup avatar
  const avatarUrl = currentUser?.avatarSeed 
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.avatarSeed || currentUser.username}&backgroundColor=0f172a,1e293b,334155`
    : `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser?.username || 'user'}`;

  const baseName = currentUser?.displayName || currentUser?.username || 'VoidRft';

  const statusColor = currentUser?.status === 'idle' 
    ? 'bg-[#f0b232]' 
    : currentUser?.status === 'dnd' 
      ? 'bg-[#f23f43]' 
      : 'bg-[#23a55a]';

  const statusText = currentUser?.status === 'idle' 
    ? 'Idle' 
    : currentUser?.status === 'dnd' 
      ? 'Do Not Disturb' 
      : 'Online';

  return (
    <div className='mt-auto px-2 h-[52px] bg-[#232428] w-full flex items-center space-x-1 relative select-none shrink-0'>
      <button
        className='flex flex-1 items-center space-x-2 p-1 rounded hover:bg-[#35373c] transition text-left overflow-hidden cursor-pointer'
        onClick={() => setMenuOpen((currentValue) => !currentValue)}
      >
        {/* Avatar Frame */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt='User avatar'
            className='w-8 h-8 rounded-full bg-zinc-950 object-cover'
          />
          <span className={`absolute bottom-[-1px] right-[-1px] w-3 h-3 rounded-full border-2 border-[#232428] ${statusColor}`} />
        </div>
        
        {/* Username Details */}
        <div className='flex flex-col items-start min-w-0 flex-1 leading-tight'>
          <span className='block w-full text-[#f2f3f5] text-[13px] font-medium truncate leading-none mb-0.5'>
            {baseName}
          </span>
          <span className='text-[11px] text-[#949ba4] leading-none truncate font-normal'>
            {statusText}
          </span>
        </div>
      </button>
      
      {/* Mic Action */}
      <button
        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[#35373c] transition-all cursor-pointer ${
          isMicMuted ? 'text-[#f23f43]' : 'text-[#b5bac1] hover:text-[#dbdee1]'
        }`}
        onClick={onToggleMic}
        title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      
      {/* Headphones Deafen Action */}
      <button
        className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[#35373c] transition-all cursor-pointer ${
          isDeafened ? 'text-[#f23f43]' : 'text-[#b5bac1] hover:text-[#dbdee1]'
        }`}
        onClick={() => setIsDeafened((val) => !val)}
        title={isDeafened ? "Undeafen Audio" : "Deafen Audio"}
      >
        <Headphones className="w-4 h-4" />
      </button>
      
      {/* Settings Gear */}
      <button 
        onClick={onOpenSettings}
        className='w-8 h-8 flex items-center justify-center rounded hover:bg-[#35373c] transition-all text-[#b5bac1] hover:text-[#dbdee1] cursor-pointer'
        title="User Settings"
      >
        <Settings className='w-4 h-4' />
      </button>

      {menuOpen && (
        <div className='absolute bottom-14 left-2 w-52 p-1 bg-[#111214] border border-[#2b2d31] rounded shadow-2xl z-50 animate-fade-in'>
          <button
            className='w-full text-left'
            onClick={() => {
              setMenuOpen(false);
              onSignOut();
            }}
          >
            <ChannelListMenuRow
              name='Keluar Akun'
              icon={<LogOut className="h-4 w-4" />}
              bottomBorder={false}
              red
            />
          </button>
        </div>
      )}
    </div>
  );
}
