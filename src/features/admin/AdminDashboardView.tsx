import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStreamers } from '@/hooks/useStreamers';
import { useTracks } from '@/hooks/useTracks';
import { useGallery } from '@/hooks/useGallery';
import { AdminSidebar, AdminTabType } from './components/AdminSidebar';
import { AdminTopHeader } from './components/AdminTopHeader';
import { AdminOverview } from './components/AdminOverview';
import { StreamerManager } from './components/StreamerManager';
import { MultiviewManager } from './components/MultiviewManager';
import { MusicManager } from './components/MusicManager';
import { MediaManager } from './components/MediaManager';
import { SystemSettings } from './components/SystemSettings';
import { MembersManager } from './components/MembersManager';
import { WebsiteSettingsManager } from './components/WebsiteSettingsManager';
import { ActivityLogsManager } from './components/ActivityLogsManager';
import { SystemHealthManager } from './components/SystemHealthManager';
import type { LiveStatus } from '@/types';

export function AdminDashboardView() {
  const { logout } = useAuth();
  const { streamers, liveStatuses, refreshLiveStatuses } = useStreamers();
  const { tracks } = useTracks();
  const { gallery } = useGallery();
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const metrics = {
    members: streamers.length,
    live: Object.values(liveStatuses || {}).filter((s: LiveStatus) => s.isLive).length,
    audio: tracks.length,
    visuals: gallery.length
  };

  const counts = {
    streamers: streamers.length,
    tracks: tracks.length,
    gallery: gallery.length
  };

  return (
    <div className="w-full h-screen min-h-[100dvh] flex bg-[#0B0E17] text-white font-sans overflow-hidden select-none">
      {/* 1. Left Fixed Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
        counts={counts}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Main Body Container (Header + Content Scroll Area) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0B0E17] overflow-hidden relative">
        {/* Top Header Bar */}
        <AdminTopHeader
          activeTab={activeTab}
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        />

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative z-10">
          <div className="max-w-7xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <AdminOverview 
                metrics={metrics} 
                onNavigateTab={(tab) => setActiveTab(tab as AdminTabType)} 
              />
            )}
            {activeTab === 'streamers' && (
              <StreamerManager streamers={streamers} onRefresh={refreshLiveStatuses} />
            )}
            {activeTab === 'multiview' && (
              <MultiviewManager streamers={streamers} onRefresh={refreshLiveStatuses} />
            )}
            {activeTab === 'audio' && (
              <MusicManager tracks={tracks} />
            )}
            {activeTab === 'visuals' && (
              <MediaManager />
            )}
            {activeTab === 'announcements' && (
              <SystemSettings />
            )}
            {activeTab === 'members' && (
              <MembersManager />
            )}
            {activeTab === 'settings' && (
              <WebsiteSettingsManager />
            )}
            {activeTab === 'background' && (
              <MediaManager />
            )}
            {activeTab === 'logs' && (
              <ActivityLogsManager />
            )}
            {activeTab === 'system' && (
              <SystemHealthManager />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
