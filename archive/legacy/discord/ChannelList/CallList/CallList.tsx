import React, { useState } from 'react';
import { ChevronRight, PlusIcon, Speaker } from '../Icons';

type CallListProps = {
  voiceChannels: any[];
  activeVoiceId: string | null;
  onVoiceJoin: (channelId: string) => void;
  onAddVoiceChannel?: () => void;
};

export default function CallList({
  voiceChannels,
  activeVoiceId,
  onVoiceJoin,
  onAddVoiceChannel,
}: CallListProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className='w-full my-2 px-2'>
      <div className='flex text-gray-400 items-center mb-1 justify-between'>
        <button
          className='flex items-center flex-1 text-left'
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <div
            className={`${
              isOpen ? 'rotate-90' : ''
            } transition-all ease-in-out duration-200`}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
          <h2 className='inline-block uppercase text-xs font-bold tracking-wider px-1 text-gray-500 font-mono'>
            Voice Channels
          </h2>
        </button>
        {onAddVoiceChannel && (
          <button 
            onClick={onAddVoiceChannel}
            className="p-0.5 hover:bg-gray-800 rounded transition"
            title="Tambah Saluran Suara"
          >
            <PlusIcon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className='space-y-0.5 mt-0.5'>
          {voiceChannels.map((call) => (
            <button
              key={call.id}
              className={`w-full flex items-center my-0.5 px-2 py-1.5 hover:bg-gray-800 rounded-md transition text-left ${
                call.id === activeVoiceId ? 'bg-emerald-950/40 text-emerald-400 font-semibold border-l-2 border-emerald-500' : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => {
                onVoiceJoin(call.id);
              }}
            >
              <Speaker className='w-4 h-4 text-gray-500 mr-2 flex-shrink-0' />
              <span className='text-sm truncate flex-1 font-sans'>
                {call.emoji ? `${call.emoji} ` : ''}{call.name || 'Channel Preview'}
              </span>
              {call.users && call.users.length > 0 && (
                <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full font-mono scale-90">
                  {call.users.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
