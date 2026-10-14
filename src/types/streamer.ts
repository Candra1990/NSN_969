import type { PlatformType } from './common';

export interface Streamer {
  id: string;
  name: string;
  platform: PlatformType;
  channelId: string;
  youtubeId?: string;
  tiktokId?: string;
  photoUrl?: string;
  isFeatured?: boolean;
  category?: string;
}

export interface LiveStatus {
  isLive: boolean;
  title?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  thumbnail?: string;
  videoId?: string;
  channelName?: string;
  customStreamUrl?: string;
  lastChecked?: number;
  platform?: string;
  handle?: string;
}
