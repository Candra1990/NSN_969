export interface HeroVideoConfig {
  src: string;
  poster: string;
  title: string;
  enabled: boolean;
}

export interface LogosConfig {
  mainLogo: string;
  tiktokLogo: string;
  heroBackground: string;
  crewBanner: string;
}

export interface GalleryMediaItem {
  id: string;
  src: string;
  title: string;
  tag: string;
}

export interface MediaSettings {
  heroVideo: HeroVideoConfig;
  logos: LogosConfig;
  gallery: GalleryMediaItem[];
  memberAvatars: Record<string, string>;
}

export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  heroVideo: {
    src: '/images/Group_posing_in_white_hoodies_20261008231438.mp4',
    poster: '/images/nsn969latar.png',
    title: 'NSN969 Cinematic Crew Presentation',
    enabled: true
  },
  logos: {
    mainLogo: '/images/nsn969logo.png',
    tiktokLogo: '/images/tiktok_custom_logo.jpg',
    heroBackground: '/images/nsn969latar.png',
    crewBanner: '/images/nsn969_all_members.jpg'
  },
  gallery: [
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
  ],
  memberAvatars: {}
};

const LOCAL_STORAGE_KEY = 'nsn_media_settings_v1';

export function getLocalMediaSettings(): MediaSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_MEDIA_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('[mediaService] Error reading localStorage:', e);
  }
  return DEFAULT_MEDIA_SETTINGS;
}

export function saveLocalMediaSettings(settings: MediaSettings) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('nsn-media-updated', { detail: settings }));
  } catch (e) {
    console.warn('[mediaService] Error saving localStorage:', e);
  }
}

export async function fetchMediaSettings(): Promise<MediaSettings> {
  try {
    const res = await fetch('/api/media');
    if (res.ok) {
      const data = await res.json();
      if (data && data.media) {
        saveLocalMediaSettings(data.media);
        return data.media;
      }
    }
  } catch (e) {
    console.warn('[mediaService] Failed to fetch /api/media, using local cache:', e);
  }
  return getLocalMediaSettings();
}

export async function saveMediaSettingsToApi(settings: MediaSettings): Promise<boolean> {
  saveLocalMediaSettings(settings);
  try {
    const res = await fetch('/api/media/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (e) {
    console.error('[mediaService] Failed to save media settings to server:', e);
    return false;
  }
}

export async function uploadMediaFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data
          })
        });
        if (res.ok) {
          const data = await res.json();
          resolve(data.url);
          return;
        }
      } catch (err) {
        console.warn('[uploadMediaFile] Server upload failed, falling back to base64 data url:', err);
      }
      // If server upload failed, fallback to base64 data url directly
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
