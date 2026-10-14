import React from 'react';
import { Hash, Volume2, Lock } from 'lucide-react';

interface CustomChannelPreviewProps {
  channel: any;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function CustomChannelPreview({ channel, isActive, onClick, className }: CustomChannelPreviewProps) {
  const isUnread = channel.unread && channel.unread > 0;
  const isVoice = channel.type === 'voice';

  // Format channel name based on emojis and layout seen in screenshots
  let displayName = channel.name || '';
  if (channel.id === 'rules') {
    displayName = 'Rules';
  }

  return (
    <div className={`relative flex items-center group w-full ${className || ''}`}>
      {/* Left-side unread indicator half-pill */}
      {isUnread && !isActive && (
        <div className="absolute left-[-2px] w-1 h-2 bg-white rounded-r-full transition-all duration-200" />
      )}
      {isActive && (
        <div className="absolute left-[-2px] w-1 h-5 bg-white rounded-r-full transition-all duration-200" />
      )}

      <button
        className={`w-full flex items-center mx-2 px-2 py-1.5 rounded-md transition-all text-left cursor-pointer ${
          isActive 
            ? 'bg-[#35373c] text-white font-semibold' 
            : isUnread 
              ? 'text-zinc-100 font-bold hover:bg-[#2e3035]' 
              : 'text-[#949ba4] hover:text-zinc-200 hover:bg-[#2e3035]/60'
        }`}
        onClick={onClick}
      >
        {/* Left Icon (Hash, Volume2, or Lock) */}
        {channel.locked ? (
          <Lock className="w-4 h-4 text-[#949ba4] mr-1.5 shrink-0" />
        ) : isVoice ? (
          <Volume2 className="w-4 h-4 text-[#949ba4] mr-1.5 shrink-0" />
        ) : (
          <Hash className="w-4 h-4 text-[#949ba4] mr-1.5 shrink-0" />
        )}

        {/* Emojis & Text */}
        <span className="text-[13px] tracking-wide truncate flex-1 font-sans flex items-center gap-1.5">
          {channel.emoji && <span className="select-none">{channel.emoji}</span>}
          {channel.id === 'rules' ? (
            <span>Rules</span>
          ) : (
            <span>{displayName}</span>
          )}
        </span>

        {/* Unread badge count */}
        {isUnread ? (
          <span className="ml-auto bg-[#f23f43] text-white text-[10.5px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-sans shadow-sm shrink-0 scale-90">
            {channel.unread}
          </span>
        ) : channel.id === 'live-now-on-kick' ? (
          <span className="ml-auto bg-[#00e5ff]/20 text-[#00e5ff] text-[9px] font-black px-1.5 py-0.5 rounded border border-[#00e5ff]/20 font-mono tracking-widest leading-none shrink-0 uppercase scale-90">
            NEW
          </span>
        ) : null}
      </button>
    </div>
  );
}
