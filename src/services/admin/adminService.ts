import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ActivityLog, AdminUser, WebsiteSettingsData } from '@/types/admin';

export interface SystemConfig {
  announcement_id?: string;
  announcement_en?: string;
  announcementActive?: boolean;
  maintenanceMode?: boolean;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

// Activity log store with localStorage & DB persistence
const STORAGE_KEY_LOGS = 'nsn969_activity_logs';

const initialActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    action: 'System Health Audit',
    target: 'Supabase DB',
    actor: 'Super Admin',
    status: 'success',
    details: 'Verified database tables: streamers, tracks, gallery, system_settings.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    action: 'Configuration Sync',
    target: 'system_settings',
    actor: 'System Auto-Sync',
    status: 'info',
    details: 'System settings synced with global defaults.'
  }
];

const loadSavedLogs = (): ActivityLog[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...initialActivityLogs];
};

let sessionLogs: ActivityLog[] = loadSavedLogs();

export const logActivity = (
  action: string,
  target: string,
  status: 'success' | 'warning' | 'error' | 'info' = 'info',
  details?: string,
  actor: string = 'Admin'
) => {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    target,
    actor,
    status,
    details
  };
  sessionLogs = [newLog, ...sessionLogs.slice(0, 99)];
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(sessionLogs));
  } catch (e) {}

  // Write log event to Supabase
  if (isSupabaseConfigured() && supabase) {
    Promise.resolve(
      supabase
        .from('activity_logs')
        .upsert({
          id: newLog.id,
          timestamp: newLog.timestamp,
          action: newLog.action,
          target: newLog.target,
          actor: newLog.actor,
          status: newLog.status,
          details: newLog.details || ''
        })
    )
      .then(({ error }: any) => {
        if (error) console.warn('[AdminService] Supabase logActivity notice:', error.message);
      })
      .catch(() => {});
  }
};

export const fetchActivityLogsFromSupabase = async (): Promise<ActivityLog[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const mapped: ActivityLog[] = data.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          action: d.action,
          target: d.target,
          actor: d.actor,
          status: d.status,
          details: d.details
        }));
        sessionLogs = mapped;
        try {
          localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(sessionLogs));
        } catch (e) {}
        return mapped;
      }
    } catch (e) {
      console.warn('[AdminService] Error fetching activity logs from Supabase:', e);
    }
  }
  return sessionLogs;
};

export const getActivityLogs = (): ActivityLog[] => {
  return sessionLogs;
};

// System Health Diagnostics
export interface SystemHealthReport {
  supabaseConnected: boolean;
  authAuthenticated: boolean;
  currentUserEmail: string | null;
  tableCounts: {
    streamers: number;
    tracks: number;
    gallery: number;
    systemSettings: number;
    communityChannels: number;
    userProfiles: number;
  };
  latencyMs: number;
  lastChecked: string;
}

export const checkSystemHealth = async (): Promise<SystemHealthReport> => {
  const startTime = Date.now();
  let supabaseConnected = false;
  let tableCounts = {
    streamers: 0,
    tracks: 0,
    gallery: 0,
    systemSettings: 0,
    communityChannels: 0,
    userProfiles: 0,
  };
  let currentUserEmail: string | null = null;

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserEmail = user.email || null;
      }

      // Check table user_profiles count
      const { count: profilesCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      if (profilesCount !== null) tableCounts.userProfiles = profilesCount;

      // Check table streamer count
      const { count: streamersCount, error: sErr } = await supabase
        .from('streamers')
        .select('*', { count: 'exact', head: true });
      if (!sErr && streamersCount !== null) {
        supabaseConnected = true;
        tableCounts.streamers = streamersCount;
      }

      // Check table tracks count
      const { count: tracksCount } = await supabase
        .from('tracks')
        .select('*', { count: 'exact', head: true });
      if (tracksCount !== null) tableCounts.tracks = tracksCount;

      // Check table gallery count
      const { count: galleryCount } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true });
      if (galleryCount !== null) tableCounts.gallery = galleryCount;

      // Check table system_settings count
      const { count: settingsCount } = await supabase
        .from('system_settings')
        .select('*', { count: 'exact', head: true });
      if (settingsCount !== null) tableCounts.systemSettings = settingsCount;

      // Check table community_channels count
      const { count: channelsCount } = await supabase
        .from('community_channels')
        .select('*', { count: 'exact', head: true });
      if (channelsCount !== null) tableCounts.communityChannels = channelsCount;

    } catch (err) {
      console.warn('[AdminService] Supabase health check exception:', err);
    }
  }

  const latencyMs = Date.now() - startTime;

  return {
    supabaseConnected,
    authAuthenticated: Boolean(currentUserEmail),
    currentUserEmail,
    tableCounts,
    latencyMs,
    lastChecked: new Date().toISOString()
  };
};

// System Announcements & Global Config
export const subscribeSystemConfig = (
  onUpdate: (config: SystemConfig) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (isSupabaseConfigured() && supabase) {
    supabase
      .from('system_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          onUpdate({
            announcement_id: data.announcement_id,
            announcement_en: data.announcement_en,
            announcementActive: data.announcement_active,
            maintenanceMode: data.maintenance_mode,
          });
        }
      });

    const channelId = `system_settings_changes_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            onUpdate({
              announcement_id: data.announcement_id,
              announcement_en: data.announcement_en,
              announcementActive: data.announcement_active,
              maintenanceMode: data.maintenance_mode,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return () => {};
};

export const saveSystemConfig = async (config: SystemConfig): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      id: 'global',
      announcement_id: config.announcement_id || '',
      announcement_en: config.announcement_en || '',
      announcement_active: !!config.announcementActive,
      maintenance_mode: !!config.maintenanceMode,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[AdminService] Supabase config save error:', error);
    logActivity('Update Global Config', 'system_settings', 'error', error.message);
    throw error;
  }

  logActivity('Update Global Config', 'system_settings', 'success', 'Announcement and maintenance mode saved.');
};

// Website Settings Storage
const DEFAULT_WEBSITE_SETTINGS: WebsiteSettingsData = {
  siteName: 'NSN969 MULTIVIEW',
  tagline: 'NO GUTS, NO GLORY',
  contactEmail: 'muhammadcandra1140@gmail.com',
  discordUrl: 'https://discord.gg/nsn969',
  tiktokUrl: 'https://tiktok.com/@nsn969',
  youtubeUrl: 'https://youtube.com/@nsn969',
  heroTitle: 'NSN969 STREAM & MULTIVIEW HUB',
  heroSubtitle: 'Pantau stream favoritmu secara langsung dalam satu tampilan interaktif.',
  enableFeaturedStreamers: true,
  enableAutoMusic: false
};

export const getWebsiteSettings = (): WebsiteSettingsData => {
  try {
    const saved = localStorage.getItem('nsn969_website_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_WEBSITE_SETTINGS;
};

export const saveWebsiteSettings = async (settings: WebsiteSettingsData): Promise<void> => {
  try {
    localStorage.setItem('nsn969_website_settings', JSON.stringify(settings));
  } catch (e) {}

  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      id: 'global',
      website_settings: settings,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[AdminService] Supabase website settings save error:', error);
    logActivity('Update Website Settings', 'system_settings', 'error', error.message);
    throw error;
  }

  logActivity('Update Website Settings', 'system_settings', 'success', `Saved site branding: ${settings.siteName}`);
};

// Fetch real members / users
export const fetchRegisteredMembers = async (): Promise<AdminUser[]> => {
  const members: AdminUser[] = [];
  const seenIds = new Set<string>();

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Fetch real user accounts from public.user_profiles
      const { data: profiles, error: pErr } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!pErr && profiles && profiles.length > 0) {
        profiles.forEach((p) => {
          seenIds.add(p.id);
          members.push({
            id: p.id,
            email: p.email || `${(p.display_name || 'member').toLowerCase().replace(/\s+/g, '')}@nsn969.com`,
            displayName: p.display_name || p.email?.split('@')[0] || 'Member',
            role: p.role || 'member',
            status: 'active',
            createdAt: p.created_at || new Date().toISOString()
          });
        });
      }
    } catch (e) {
      console.warn('[AdminService] Error loading user_profiles from Supabase:', e);
    }

    // 2. Fetch real streamers as members
    try {
      const { data: streamersData, error: sErr } = await supabase
        .from('streamers')
        .select('*')
        .order('name', { ascending: true });

      if (!sErr && streamersData) {
        streamersData.forEach((s) => {
          if (!seenIds.has(s.id)) {
            members.push({
              id: s.id,
              email: `${s.name.toLowerCase().replace(/\s+/g, '')}@nsn969.com`,
              displayName: s.name,
              role: s.is_featured ? 'super_admin' : 'streamer',
              status: s.status === 'active' ? 'active' : 'inactive',
              createdAt: s.updated_at || new Date().toISOString()
            });
          }
        });
      }
    } catch (e) {
      console.warn('[AdminService] Error loading streamers from Supabase:', e);
    }
  }

  // Fallback default admin member if empty
  if (members.length === 0) {
    members.push({
      id: 'usr-admin-1',
      email: 'muhammadcandra1957@gmail.com',
      displayName: 'Super Admin NSN969',
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }

  return members;
};

export const subscribeCommunityChannels = (
  onUpdate: (channels: CommunityChannel[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (isSupabaseConfigured() && supabase) {
    supabase
      .from('community_channels')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data }) => {
        if (data) {
          onUpdate(data.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description,
            type: d.type
          })));
        }
      });

    const channelId = `community_channels_changes_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_channels' },
        () => {
          supabase
            .from('community_channels')
            .select('*')
            .order('position', { ascending: true })
            .then(({ data }) => {
              if (data) {
                onUpdate(data.map(d => ({
                  id: d.id,
                  name: d.name,
                  description: d.description,
                  type: d.type
                })));
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return onSnapshot(
    collection(db, 'community_channels'),
    (snap) => {
      const list: CommunityChannel[] = [];
      snap.forEach((s) => list.push({ id: s.id, ...s.data() } as CommunityChannel));
      onUpdate(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
};

export const createCommunityChannel = async (channel: { name: string; description?: string }): Promise<string> => {
  const cleanId = channel.name.trim().toLowerCase().replace(/\s+/g, '-');
  if (!cleanId) throw new Error('Invalid channel name');

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('community_channels')
      .upsert({
        id: cleanId,
        category_id: 'cat_community',
        name: channel.name.trim(),
        description: (channel.description || '').trim(),
        type: 'text',
        position: 0,
        admin_only: false
      });
    if (error) console.error('[AdminService] Supabase channel create error:', error);
  }

  try {
    await setDoc(doc(db, 'community_channels', cleanId), {
      id: cleanId,
      name: channel.name.trim(),
      description: (channel.description || '').trim(),
      type: 'text'
    });
  } catch (err) {
    console.warn('[AdminService] Firebase channel create error:', err);
  }
  return cleanId;
};

export const deleteCommunityChannel = async (id: string): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('community_channels')
      .delete()
      .eq('id', id);
    if (error) console.error('[AdminService] Supabase channel delete error:', error);
  }

  try {
    await deleteDoc(doc(db, 'community_channels', id));
  } catch (err) {
    console.warn('[AdminService] Firebase channel delete error:', err);
  }
};
