import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocFromServer, 
  onSnapshot, 
  setDoc, 
  getDocs,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from '@/lib/firebase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateAdminAccess, checkAdminAuthorizationDetailed, AdminValidationDetails } from '@/services/auth/authService';
import type { Streamer, Backsound, LiveStatus, GalleryItem } from '@/types';
import { saveStreamerToDb, deleteStreamerFromDb } from '@/services/streamers/streamerService';
import { saveTrackToDb, deleteTrackFromDb } from '@/services/tracks/trackService';
import { saveSystemConfig } from '@/services/admin/adminService';
import { TIKTOK_USERNAMES } from '@/constants/streamers';
import { useLiveStreamTracker } from '../hooks/useLiveStreamTracker';

interface FirebaseContextType {
  user: any;
  isAdmin: boolean;
  adminAuthDetails: AdminValidationDetails | null;
  recheckAdminAccess: () => Promise<AdminValidationDetails>;
  loading: boolean;
  streamers: Streamer[];
  tracks: Backsound[];
  gallery: GalleryItem[];
  maintenanceMode: boolean;
  announcementActive: boolean;
  announcementEn: string;
  announcementId: string;
  liveStatuses: Record<string, LiveStatus>;
  refreshLiveStatuses: () => void;
  login: () => Promise<User>;
  loginWithCredentials: (u: string, p: string) => Promise<{ success: boolean; error?: string } | boolean>;
  logout: () => Promise<void>;
  updateGlobalConfig: (config: {
    announcement_en: string;
    announcement_id: string;
    announcementActive: boolean;
    maintenanceMode: boolean;
  }) => Promise<void>;
  addStreamerToDb: (streamer: Streamer) => Promise<void>;
  removeStreamerFromDb: (id: string) => Promise<void>;
  addTrackToDb: (track: Backsound) => Promise<void>;
  removeTrackFromDb: (id: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const ADMIN_EMAIL = "muhammadcandra1957@gmail.com";

const DEFAULT_STREAMERS: Streamer[] = [
  { id: 'str-1', name: 'KAEL BLAKE', platform: 'youtube', channelId: 'UCsUhlZAanKWUsZxqbPbjAOw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-2', name: 'KAI BAENARA', platform: 'youtube', channelId: 'UCa1Dz1yPj3ZyL9Nwe9cnI0w', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-3', name: 'SON', platform: 'youtube', channelId: 'UCIy6eevxmIsg_Hwete6KOkQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-4', name: 'LYN STACH', platform: 'youtube', channelId: 'UC93Nk2n6fWQ_8B0vQu2b81Q', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-5', name: 'MAMATCHA', platform: 'youtube', channelId: 'UCuO21nkZB_6HBgcZ0vQqpaw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-6', name: 'TOM KEYT', platform: 'youtube', channelId: 'UCPYq_0HHYSyHf5keHArEnqA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-7', name: 'CIYUNG KOCAK', platform: 'youtube', channelId: 'UCQdJ9LxdDvElCk9Ex80VEaQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-8', name: 'DOEENG', platform: 'youtube', channelId: 'UCFDNsNSeqrsbQdkFqLZmfeQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-9', name: 'EL NEKELINS', platform: 'youtube', channelId: 'UCB3UUwxXfovWYg2s6cGtBng', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-10', name: 'ZASKIACHR', platform: 'youtube', channelId: 'UCFwabDZK9ncWRBGffXIKcJA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-11', name: 'Cutee Piee', platform: 'youtube', channelId: 'UC6Y8i9j9EBv6waC4G', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-12', name: 'Ryeo Quilla', platform: 'youtube', channelId: 'UCn_RIK7MNYfRR79dCj4ZnWg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-14', name: 'N4SRUL', platform: 'youtube', channelId: 'UCNeNWqNExbtfNoQXrpdaOeg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-15', name: 'HUNT.969', platform: 'youtube', channelId: 'UCDImuPELfrIBEynkSMYn0Yw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-16', name: 'IPULSADILA', platform: 'youtube', channelId: 'UCRo_r2XTjJctTxBFpYL5erg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-18', name: 'abanosz', platform: 'youtube', channelId: 'UCMt0OVcI0tCzm6Qtcy3Lfhg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-19', name: 'ALONG', platform: 'youtube', channelId: 'UCIwQP2dkoyj73k0zhD0bnXg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-20', name: 'Mei Mei', platform: 'youtube', channelId: 'UC3dKRhOnbV3uHaIyaLIunvw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-21', name: 'serend', platform: 'youtube', channelId: 'UCarC_kFQQWprXE9qf1tBP_Q', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-22', name: 'Amat Timpas', platform: 'youtube', channelId: 'UCgwkKfbYlX9D-f9JcCa1s8w', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-23', name: 'Claire Jeder', platform: 'youtube', channelId: 'UCLtAoc1vH3m_kE1CCKJgtNw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-24', name: 'Andre Myway', platform: 'youtube', channelId: 'UCIXfS4ZnosIeOxaAX6zbJ2Q', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-25', name: 'Verren', platform: 'youtube', channelId: 'UC9P-ytWeo4EExf-Tp2rQHAQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-26', name: 'Jeje saviora', platform: 'youtube', channelId: 'UCeO0NrDtN3KLLiYmD4j0j3w', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-27', name: 'William Stach', platform: 'youtube', channelId: 'UCjmNn0f3X5s7XG8A_U6ViCA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-28', name: 'Acok Bihun', platform: 'youtube', channelId: 'UCFiUrUEca1IFfocFFnVg8uA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-29', name: 'Berlin Ham', platform: 'youtube', channelId: 'UCvo5--5CW7yrMs9ghSKkpbA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-30', name: 'Moonn', platform: 'youtube', channelId: 'UCN0Ue9Nurrbu1PfIX3yngIQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-31', name: 'Dipsy', platform: 'youtube', channelId: 'UCNq5-MTiR0ifonKMB5Jz6PQ', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-32', name: 'Yupzy', platform: 'youtube', channelId: 'UC-KPIvWETsnGpe-PFZpvzIw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-33', name: 'JNNY RUBY', platform: 'youtube', channelId: 'UCgs2t8NKBxklOn3lxPHtyJw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-35', name: 'YUYUN', platform: 'youtube', channelId: 'UCEf-F-aZs4QGbQ3w_Or09Bg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-36', name: 'AGATHA', platform: 'youtube', channelId: 'UCJyEBSMc2Os6si5gy41809A', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-37', name: 'KURARA', platform: 'youtube', channelId: 'UC2RWBWr3EloEmCqoZ4kHCNA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-39', name: 'CHIYO', platform: 'youtube', channelId: 'UCnqZiRMyNSwHKVWiWTcU0tg', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-40', name: 'Andre Herviant', platform: 'youtube', channelId: 'UCXoXXmVkgjkz86lo-K_gWeA', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-41', name: 'DIBO JEDER', platform: 'youtube', channelId: 'UCncm3pOLWNCFyj6sa5dOsLw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-42', name: 'ZOTA', platform: 'youtube', channelId: 'UChEzBCVwQg3EC7QjsF3iZHw', isFeatured: true, category: 'NSN Community Stream' },
  { id: 'str-43', name: 'YUKENJIEH', platform: 'youtube', channelId: 'UCJRL84R_gTBA28D20RJ5Cdw', isFeatured: true, category: 'NSN Community Stream' }
];


const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'gal-1', src: '/Gallery/gallery1.png', title: 'NSN SQUAD COMMUNITY', tag: 'Community' },
  { id: 'gal-2', src: '/Gallery/gallery2.png', title: 'NSN969 SQUAD MATCH', tag: 'Team Match' },
  { id: 'gal-3', src: '/Gallery/gallery3.png', title: 'NSN HEADQUARTERS', tag: 'Stream Studio' },
  { id: 'gal-4', src: '/Gallery/gallery4.png', title: 'LIVE PRODUCTION ROOM', tag: 'Control Room' },
  { id: 'gal-5', src: '/Gallery/gallery5.png', title: 'CHAMPIONS TROPHY', tag: 'Achievement' },
  { id: 'gal-6', src: '/Gallery/gallery6.png', title: 'LOS SANTOS DRIFT', tag: 'Roleplay' },
  { id: 'gal-7', src: '/Gallery/gallery7.png', title: 'MIDNIGHT PATROL', tag: 'Night Ops' },
  { id: 'gal-8', src: '/Gallery/gallery8.png', title: 'VIP ARMORED CONVOY', tag: 'Special Escort' },
  { id: 'gal-9', src: '/Gallery/gallery9.png', title: 'STREET RACING CLAN', tag: 'Motorsport' },
  { id: 'gal-10', src: '/Gallery/gallery10.png', title: 'FINAL SHOWDOWN', tag: 'Clutch Match' },
  { id: 'gal-11', src: '/Gallery/gallery11.png', title: 'FAMILY MEETUP', tag: 'Gathering' },
  { id: 'gal-12', src: '/Gallery/gallery12.png', title: 'TACTICAL INFILTRATION', tag: 'Operation' },
  { id: 'gal-13', src: '/Gallery/gallery13.png', title: 'VICTORY CELEBRATION', tag: 'Trophy Day' },
  { id: 'gal-14', src: '/Gallery/gallery14.png', title: 'UNDERGROUND VAULT', tag: 'Heist' },
  { id: 'gal-15', src: '/Gallery/gallery15.png', title: 'THE FAMILY REUNION', tag: 'NSN Legacy' }
];

const DEFAULT_TRACKS: Backsound[] = [
  { id: 'track-1', title: 'NSN969 SIAP TEMPUR', artist: 'Donz', url: '/music/nsn969soung.mp3' },
  { id: 'track-2', title: 'NSN969 MUSIC', artist: 'Analist Magang', url: '/music/nsn969music.mp3' }
];

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthAdmin, setIsAuthAdmin] = useState(false);
  const [adminAuthDetails, setAdminAuthDetails] = useState<AdminValidationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to re-verify admin rights directly on demand (e.g. after owner runs SQL bootstrap)
  const recheckAdminAccess = async (): Promise<AdminValidationDetails> => {
    const result = await checkAdminAuthorizationDetailed();
    setAdminAuthDetails(result);
    setIsAuthAdmin(result.isAdmin);
    setIsAdmin(result.isAdmin);
    return result;
  };

  // Firestore collections states
  const [streamers, setStreamers] = useState<Streamer[]>(DEFAULT_STREAMERS);
  const [tracks, setTracks] = useState<Backsound[]>(DEFAULT_TRACKS);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  

  // App system settings states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [announcementEn, setAnnouncementEn] = useState('');
  const [announcementId, setAnnouncementId] = useState('');

  // Monitor Authentication state via Supabase Auth
  useEffect(() => {
    let isSubscribed = true;

    if (isSupabaseConfigured() && supabase) {
      // 1. Initial session fetch & admin verification
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!isSubscribed) return;
        if (session?.user) {
          console.info('[NSN969 Auth Flow] SESSION EXISTS:', session.user.email);
          setUser(session.user);
          const result = await checkAdminAuthorizationDetailed();
          if (!isSubscribed) return;
          console.info('[NSN969 Auth Flow] SESSION ADMIN ACCESS STATUS:', result.status, result.isAdmin);
          setAdminAuthDetails(result);
          setIsAuthAdmin(result.isAdmin);
          setIsAdmin(result.isAdmin);
          setLoading(false);
        } else {
          console.info('[NSN969 Auth Flow] SESSION EXISTS: FALSE');
          setUser(null);
          setAdminAuthDetails(null);
          setIsAuthAdmin(false);
          setIsAdmin(false);
          setLoading(false);
        }
      }).catch((err) => {
        console.warn('[NSN969 Auth Flow] getSession Error:', err?.message || err);
        if (isSubscribed) setLoading(false);
      });

      // 2. Real-time auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isSubscribed) return;
        if (session?.user) {
          console.info('[NSN969 Auth Flow] AUTH STATE CHANGE:', _event, session.user.email);
          setUser(session.user);
          const result = await checkAdminAuthorizationDetailed();
          if (!isSubscribed) return;
          console.info('[NSN969 Auth Flow] AUTH STATE ADMIN ACCESS STATUS:', result.status, result.isAdmin);
          setAdminAuthDetails(result);
          setIsAuthAdmin(result.isAdmin);
          setIsAdmin(result.isAdmin);
        } else {
          console.info('[NSN969 Auth Flow] AUTH STATE CHANGE: SIGNED_OUT');
          setUser(null);
          setAdminAuthDetails(null);
          setIsAuthAdmin(false);
          setIsAdmin(false);
        }
        setLoading(false);
      });

      return () => {
        isSubscribed = false;
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, []);

  // Sync Global Settings (Supabase First with Supabase Realtime)
  useEffect(() => {
    let isMounted = true;
    let supabaseChannel: any = null;

    const fetchSettingsFromSupabase = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 'global')
            .maybeSingle();

          if (!error && data && isMounted) {
            if (data.maintenance_mode !== undefined) setMaintenanceMode(!!data.maintenance_mode);
            if (data.announcement_active !== undefined) setAnnouncementActive(data.announcement_active);
            if (data.announcement_en !== undefined) setAnnouncementEn(data.announcement_en);
            if (data.announcement_id !== undefined) setAnnouncementId(data.announcement_id);
            if (data.website_settings) {
              try {
                localStorage.setItem('nsn969_website_settings', JSON.stringify(data.website_settings));
              } catch (e) {}
            }
          }
        } catch (err) {
          console.warn('[FirebaseProvider] Supabase system settings fetch warning:', err);
        }
      }
    };

    fetchSettingsFromSupabase();

    if (isSupabaseConfigured() && supabase) {
      const channelId = `system_settings_${Math.random().toString(36).substring(2, 9)}`;
      supabaseChannel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'system_settings' },
          (payload) => {
            const data = payload.new as any;
            if (data && isMounted) {
              if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode);
              if (data.announcement_active !== undefined) setAnnouncementActive(data.announcement_active);
              if (data.announcement_en !== undefined) setAnnouncementEn(data.announcement_en);
              if (data.announcement_id !== undefined) setAnnouncementId(data.announcement_id);
              if (data.website_settings) {
                try {
                  localStorage.setItem('nsn969_website_settings', JSON.stringify(data.website_settings));
                } catch (e) {}
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, []);

  // Sync Streamers List (Supabase Exclusively with Supabase Realtime)
  useEffect(() => {
    let isMounted = true;
    let supabaseChannel: any = null;

    const fetchStreamersFromSupabase = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('streamers')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && isMounted) {
            const mapped: Streamer[] = data.map((item: any) => ({
              id: item.id,
              name: item.name,
              platform: item.platform,
              channelId: item.channel_id || '',
              youtubeId: item.youtube_id || '',
              tiktokId: item.tiktok_id || '',
              photoUrl: item.photo_url || '',
              isFeatured: !!item.is_featured,
              category: item.category || 'NSN Community Stream'
            }));
            setStreamers(mapped);
            return true;
          }
        } catch (err) {
          console.warn('[FirebaseProvider] Supabase streamers fetch warning:', err);
        }
      }
      return false;
    };

    fetchStreamersFromSupabase();

    if (isSupabaseConfigured() && supabase) {
      const channelId = `streamers_${Math.random().toString(36).substring(2, 9)}`;
      supabaseChannel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'streamers' },
          () => {
            fetchStreamersFromSupabase();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, []);

  // Sync Audio Playlist Tracks (Supabase Exclusively with Supabase Realtime)
  useEffect(() => {
    let isMounted = true;
    let supabaseChannel: any = null;

    const fetchTracksFromSupabase = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && isMounted) {
            const mapped: Backsound[] = data.map((item: any) => ({
              id: item.id,
              title: item.title,
              artist: item.artist || '',
              url: item.url
            }));
            setTracks(mapped);
            return true;
          }
        } catch (err) {
          console.warn('[FirebaseProvider] Supabase tracks fetch warning:', err);
        }
      }
      return false;
    };

    fetchTracksFromSupabase();

    if (isSupabaseConfigured() && supabase) {
      const channelId = `tracks_${Math.random().toString(36).substring(2, 9)}`;
      supabaseChannel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tracks' },
          () => {
            fetchTracksFromSupabase();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, []);

  // Sync Gallery Visual Assets (Supabase Exclusively with Supabase Realtime)
  useEffect(() => {
    let isMounted = true;
    let supabaseChannel: any = null;

    const fetchGalleryFromSupabase = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && Array.isArray(data) && data.length > 0 && isMounted) {
            const validItems: GalleryItem[] = data
              .filter((item: any) => item && item.src && typeof item.src === 'string' && item.src.trim().length > 3)
              .map((item: any) => ({
                id: item.id,
                title: item.title || 'NSN969 Visual',
                tag: item.tag || 'Community',
                src: item.src.trim()
              }));

            if (validItems.length >= 5) {
              setGallery(validItems);
              return true;
            } else if (validItems.length > 0) {
              const existingSrcs = new Set(validItems.map(v => v.src));
              const merged = [...validItems, ...DEFAULT_GALLERY.filter(c => !existingSrcs.has(c.src))];
              setGallery(merged);
              return true;
            }
          }
          // Dynamic fallback to backend gallery endpoint
          const res = await fetch('/api/gallery');
          if (res.ok && isMounted) {
            const json = await res.json();
            if (json.gallery && Array.isArray(json.gallery) && json.gallery.length > 0) {
              const valid = json.gallery.filter((g: any) => g && g.src && typeof g.src === 'string' && g.src.trim().length > 3);
              if (valid.length > 0) {
                setGallery(valid);
                return true;
              }
            }
          }
        } catch (err) {
          console.warn('[FirebaseProvider] Supabase gallery fetch warning:', err);
        }
      }
      return false;
    };

    fetchGalleryFromSupabase();

    if (isSupabaseConfigured() && supabase) {
      const channelId = `gallery_${Math.random().toString(36).substring(2, 9)}`;
      supabaseChannel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gallery' },
          () => {
            fetchGalleryFromSupabase();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, []);

  const trackableStreamers = React.useMemo(() => {
    const list: Streamer[] = [];
    streamers.forEach((s) => {
      // 1. YouTube
      const ytId = s.youtubeId || (s.platform === 'youtube' ? s.channelId : undefined);
      if (ytId) {
        list.push({
          ...s,
          id: `${s.id}-youtube`,
          platform: 'youtube',
          channelId: ytId
        });
      }
      // 2. TikTok tracking disabled due to blocks, used only for profile links on dashboard
    });
    return list;
  }, [streamers]);

  // Track whether MultiView screen is currently active
  const [isMultiViewActive, setIsMultiViewActive] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.pathname === '/multiview';
  });

  useEffect(() => {
    const checkActive = () => {
      setIsMultiViewActive(window.location.pathname === '/multiview');
    };
    checkActive();
    window.addEventListener('popstate', checkActive);
    window.addEventListener('navchange', checkActive);
    return () => {
      window.removeEventListener('popstate', checkActive);
      window.removeEventListener('navchange', checkActive);
    };
  }, []);

  // Hook into our customizable real-time live status tracker
  const { statuses: liveStatuses, refresh: refreshLiveStatuses } = useLiveStreamTracker(trackableStreamers, isMultiViewActive);

  // Handle Login and Logout operations
  const login = async () => {
    return await loginWithGoogle();
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase client belum terkonfigurasi di aplikasi.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });

      if (error) {
        let errorMsg = error.message;
        if (errorMsg === 'Invalid login credentials') {
          errorMsg = 'Email atau password yang Anda masukkan tidak valid, atau akun belum terdaftar di Supabase Auth.';
        } else if (errorMsg.includes('Email not confirmed')) {
          errorMsg = 'Email belum dikonfirmasi. Silakan verifikasi akun di Supabase Dashboard.';
        }
        return { success: false, error: errorMsg };
      }

      if (!data.user) {
        return { success: false, error: 'Gagal mendapatkan data user dari Supabase Auth.' };
      }

      // Verify admin role via server-side checks and user_profiles table
      const authResult = await checkAdminAuthorizationDetailed();
      setAdminAuthDetails(authResult);
      if (!authResult.isAdmin) {
        // User logged in to Supabase Auth, but does not have admin privileges in DB
        await supabase.auth.signOut().catch(() => {});
        return {
          success: false,
          error: `Akses Ditolak: ${authResult.message}`
        };
      }

      setUser(data.user);
      setIsAuthAdmin(true);
      setIsAdmin(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Terjadi kesalahan sistem saat menghubungi Supabase Auth.' };
    }
  };

  const logout = async () => {
    setIsAdmin(false);
    setIsAuthAdmin(false);
    setAdminAuthDetails(null);
    setUser(null);
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    await logoutUser().catch(() => {});
  };

  // Admin Write Operations
  const updateGlobalConfig = async (config: {
    announcement_en: string;
    announcement_id: string;
    announcementActive: boolean;
    maintenanceMode: boolean;
  }) => {
    await saveSystemConfig({
      announcement_en: config.announcement_en,
      announcement_id: config.announcement_id,
      announcementActive: config.announcementActive,
      maintenanceMode: config.maintenanceMode
    });
  };

  const addStreamerToDb = async (streamer: Streamer) => {
    await saveStreamerToDb(streamer);
  };

  const removeStreamerFromDb = async (id: string) => {
    await deleteStreamerFromDb(id);
  };

  const addTrackToDb = async (track: Backsound) => {
    await saveTrackToDb(track);
  };

  const removeTrackFromDb = async (id: string) => {
    await deleteTrackFromDb(id);
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      isAdmin,
      adminAuthDetails,
      recheckAdminAccess,
      loading,
      streamers,
      tracks,
      gallery,
      maintenanceMode,
      announcementActive,
      announcementEn,
      announcementId,
      liveStatuses,
      refreshLiveStatuses,
      login,
      loginWithCredentials,
      logout,
      updateGlobalConfig,
      addStreamerToDb,
      removeStreamerFromDb,
      addTrackToDb,
      removeTrackFromDb
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
