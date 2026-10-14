import React, { useState } from 'react';
import CreateChannelForm from './CreateChannelForm/CreateChannelForm';
import UserBar from './BottomBar/ChannelListBottomBar';
import ChannelListTopBar from './TopBar/ChannelListTopBar';
import CategoryItem from './CategoryItem/CategoryItem';
import CallList from './CallList/CallList';

interface CustomChannelListProps {
  serverName?: string;
  channels: any[];
  currentChannelId: string;
  setCurrentChannelId: (id: string) => void;
  currentUser: any;
  onSignOut: () => void;
  onCreateChannel?: (name: string, category: string, isVoice: boolean) => void;
  availableMembers?: { id: string; name: string; avatarUrl?: string }[];
  isMicMuted?: boolean;
  onToggleMic?: () => void;
  onOpenSettings?: () => void;
}

export default function CustomChannelList({
  serverName = 'Hub Komunitas NSN969',
  channels,
  currentChannelId,
  setCurrentChannelId,
  currentUser,
  onSignOut,
  onCreateChannel,
  availableMembers = [],
  isMicMuted,
  onToggleMic,
  onOpenSettings,
}: CustomChannelListProps) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter text channels & voice channels
  const textChannels = channels.filter(c => c.type !== 'voice');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  // Group text channels by categories (preserving the order in which they appear)
  const categories: string[] = [];
  textChannels.forEach(c => {
    const cat = c.category || 'LAINNYA';
    if (!categories.includes(cat)) {
      categories.push(cat);
    }
  });
  
  const handleAddChannelClick = (category: string) => {
    setSelectedCategory(category);
    setIsCreateFormOpen(true);
  };

  const handleFormSubmit = (name: string, category: string, type: 'text' | 'voice') => {
    if (onCreateChannel) {
      onCreateChannel(name, category, type === 'voice');
    }
  };

  return (
    <div className='w-[240px] bg-[#2b2d31] h-full flex flex-col border-r border-[#1f2023] flex-shrink-0 text-gray-200 select-none'>
      {/* Top bar with server dropdown */}
      <ChannelListTopBar serverName={serverName} />

      {/* Main Channels List Area */}
      <div className='flex-1 overflow-y-auto py-3 space-y-4 custom-scrollbar scroll-smooth text-left'>
        {/* Static Dashboard Link */}
        <div className="mx-2 mb-2">
          <button
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all text-left cursor-pointer ${
              currentChannelId === 'dashboard'
                ? 'bg-gray-800 text-amber-400 font-bold border-l-2 border-amber-500 shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }`}
            onClick={() => setCurrentChannelId('dashboard')}
          >
            <span className="text-lg mr-2 select-none">🌸</span>
            <span className="text-sm font-sans flex-1">
              Dashboard Komunitas
            </span>
            <span className="bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono uppercase tracking-wider">
              MAIN
            </span>
          </button>
        </div>

        {/* Render category channels */}
        {categories.map((category) => (
          <CategoryItem
            key={category}
            category={category}
            serverName={serverName}
            channels={textChannels.filter(c => (c.category || 'LAINNYA') === category)}
            currentChannelId={currentChannelId}
            setCurrentChannelId={setCurrentChannelId}
            onAddChannelClick={handleAddChannelClick}
          />
        ))}

        {/* CallList / Voice Channels Area */}
        <CallList 
          voiceChannels={voiceChannels}
          activeVoiceId={currentChannelId}
          onVoiceJoin={(channelId) => setCurrentChannelId(channelId)}
          onAddVoiceChannel={() => handleAddChannelClick('Saluran Suara')}
        />
      </div>

      {/* Form modal for creating channel */}
      <CreateChannelForm 
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        suggestedCategory={selectedCategory}
        onSubmit={handleFormSubmit}
        availableMembers={availableMembers}
      />

      {/* User settings & status bar at the bottom */}
      <UserBar 
        currentUser={currentUser}
        onSignOut={onSignOut}
        isMicMuted={isMicMuted}
        onToggleMic={onToggleMic}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
