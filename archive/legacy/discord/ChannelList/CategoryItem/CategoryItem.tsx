import React, { useState } from 'react';
import CustomChannelPreview from '../CustomChannelPreview';
import { ChevronDown, PlusIcon } from '../Icons';
import './CategoryItem.css';

type CategoryItemProps = {
  category: string;
  channels: any[];
  serverName: string;
  currentChannelId: string;
  setCurrentChannelId: (id: string) => void;
  onAddChannelClick?: (category: string) => void;
};

export default function CategoryItem({
  category,
  serverName,
  channels,
  currentChannelId,
  setCurrentChannelId,
  onAddChannelClick,
}: CategoryItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className='mb-2 group/cat'>
      <div className='flex items-center text-[#949ba4] hover:text-[#dbdee1] px-2.5 py-1.5 select-none justify-between h-8'>
        <button
          className='flex items-center flex-1 text-left'
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <div
            className={`${
              isOpen ? 'rotate-0' : '-rotate-90'
            } transition-transform ease-in-out duration-150 mr-1 text-[#949ba4] flex items-center justify-center`}
          >
            <ChevronDown className="h-3 w-3 shrink-0" />
          </div>
          <span className='inline-block uppercase text-[11px] font-bold tracking-widest px-1 text-[#949ba4] group-hover/cat:text-[#dbdee1] font-sans transition-colors'>
            {category}
          </span>
        </button>
        {onAddChannelClick && (
          <button
            className='opacity-0 group-hover/cat:opacity-100 focus:opacity-100 p-0.5 hover:bg-[#35373c] rounded transition duration-150'
            onClick={() => onAddChannelClick(category)}
            title="Tambah Channel"
          >
            <PlusIcon className="h-3.5 w-3.5 text-[#949ba4] hover:text-[#dbdee1]" />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="space-y-0.5 mt-0.5">
          {channels.map((channel) => {
            return (
              <CustomChannelPreview
                key={channel.id}
                channel={channel}
                isActive={channel.id === currentChannelId}
                onClick={() => setCurrentChannelId(channel.id)}
                className='w-full'
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
