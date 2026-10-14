export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  actor: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'moderator' | 'streamer' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface WebsiteSettingsData {
  siteName: string;
  tagline: string;
  contactEmail: string;
  discordUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  enableFeaturedStreamers: boolean;
  enableAutoMusic: boolean;
}

export interface MultiviewSourceItem {
  id: string;
  name: string;
  platform: 'youtube' | 'tiktok' | 'twitch' | 'facebook' | 'other';
  channelId: string;
  youtubeId?: string;
  tiktokId?: string;
  photoUrl?: string;
  isFeatured: boolean;
  status: 'active' | 'inactive';
}
