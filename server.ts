import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import { fetchTikTokLiveStream } from './server/services/tiktok-proxy';

dotenv.config();

// In-memory cache store with TTL and in-flight request deduplication
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AdvancedCacheStore<T> {
  private store = new Map<string, CacheItem<T>>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number = 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  set(key: string, data: T, ttlMs?: number): void {
    const now = Date.now();
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  get(key: string): { data: T; ageMs: number; timestamp: number } | null {
    const item = this.store.get(key);
    if (!item) return null;
    const now = Date.now();
    if (now > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return {
      data: item.data,
      ageMs: now - item.timestamp,
      timestamp: item.timestamp
    };
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  getAll(): Record<string, T> {
    const now = Date.now();
    const result: Record<string, T> = {};
    for (const [key, item] of this.store.entries()) {
      if (now <= item.expiresAt) {
        result[key] = item.data;
      } else {
        this.store.delete(key);
      }
    }
    return result;
  }
}

// 60-second default TTL for live status cache (minimum 10s before allowing any external refetch)
const liveStatusCache = new AdvancedCacheStore<{
  isLive: boolean;
  videoId?: string;
  title?: string;
  platform: 'youtube' | 'tiktok';
  timestamp: number;
}>(60 * 1000);

// In-flight request deduplication map to prevent redundant concurrent fetches
const inFlightFetches = new Map<string, Promise<{ isLive: boolean; videoId?: string; title?: string }>>();

// Mapping TikTok usernames for the 31 members/creators of NSN969
const TIKTOK_USERNAMES: Record<string, string> = {
  'str-1': 'pahrul_reyza',
  'str-2': 'rizkiferrrrr',
  'str-3': 'nareyyyyy',
  'str-4': 'arbii._',
  'str-5': 'adjikkk19',
  'str-6': 'tomkeyt969',
  'str-7': 'ciyung.gaming',
  'str-8': 'doeengs',
  'str-9': 'nsudjatimera',
  'str-10': 'stanleyngg',
  'str-11': 'tedisaputra_11',
  'str-12': 'ryeoquilla',
  'str-13': 'eyangsihir',
  'str-14': 'nasrul969_',
  'str-15': 'hunt.969',
  'str-16': 'ipulsadila',
  'str-17': 'bukanherii',
  'str-18': 'abanosz',
  'str-19': 'hendhyramadhanakh',
  'str-20': 'ryona.kho',
  'str-21': 'serendjacqueline',
  'str-22': 'iqball_l3',
  'str-23': 'claireeaja',
  'str-24': 'andremyway',
  'str-25': 'vrn.ren',
  'str-26': 'ic.saviora',
  'str-27': 'willsssss_here',
  'str-28': 'acokbihun',
  'str-29': 'berlin_ham',
  'str-30': 'justcallmoonn',
  'str-31': 'preciyours',
  'str-32': 'yupzy4u'
};

const tiktokLiveStatuses = new Map<string, { isLive: boolean; lastChecked: number }>();
const streamerIds = Object.keys(TIKTOK_USERNAMES);
let currentStreamerIndex = 0;

async function checkTikTokLiveStatus(handle: string): Promise<{ isLive: boolean; isBlocked?: boolean }> {
  const result = await fetchTikTokLiveStream(handle);
  return {
    isLive: result.isLive,
    isBlocked: result.isBlocked
  };
}

// Background checker loop - running staggered check every 10 seconds to satisfy TikTok rate limits
function startTikTokLiveChecker() {
  setInterval(async () => {
    if (streamerIds.length === 0) return;
    
    const streamerId = streamerIds[currentStreamerIndex];
    const username = TIKTOK_USERNAMES[streamerId];
    
    if (username) {
      try {
        const result = await checkTikTokLiveStatus(username);
        
        
        if (!result.isBlocked) {
          tiktokLiveStatuses.set(streamerId, {
            isLive: result.isLive,
            lastChecked: Date.now()
          });
        } else {
          tiktokLiveStatuses.set(streamerId, {
            isLive: false, // Force offline if blocked
            lastChecked: Date.now()
          });
        }
      } catch (err) {
        
        tiktokLiveStatuses.set(streamerId, {
          isLive: false, // Force offline on error
          lastChecked: Date.now()
        });
      }
    }
    
    currentStreamerIndex = (currentStreamerIndex + 1) % streamerIds.length;
  }, 10000); // 10 seconds staggered interval
}

startTikTokLiveChecker();


async function scrapeYouTubeLive(channelId: string): Promise<{ isLive: boolean; videoId?: string; title?: string }> {
  try {
    // Attempt 1: Fetch the embed stream page (only if it is a channel ID, e.g. starts with UC)
    if (channelId.startsWith('UC')) {
      const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
      const embedResponse = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (embedResponse.ok) {
        const html = await embedResponse.text();
        
        // If live stream is currently active, it contains `"isLive":true` and no offline/unplayable signatures
        const isLive = html.includes('"isLive":true') && 
                       !html.includes('LIVE_STREAM_OFFLINE') && 
                       !html.includes('Video unavailable') && 
                       !html.includes('g-recaptcha');
        
        if (isLive) {
          const videoIdMatch = html.match(/"videoId"\s*:\s*"([^"]+)"/) || html.match(/video_id=([^&"]+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : undefined;
          
          let title: string | undefined;
          const titleMatch = html.match(/"title"\s*:\s*"([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
          if (titleMatch) {
            title = titleMatch[1].replace(' - YouTube', '').trim();
          }
          
          return { isLive: true, videoId, title: title || 'Live Stream' };
        }
      }
    }

    // Attempt 2: Fetch the channel /live page tab (supports both channel IDs and handles)
    const liveUrl = channelId.startsWith('@') 
      ? `https://www.youtube.com/${channelId}/live` 
      : `https://www.youtube.com/channel/${channelId}/live`;

    const liveResponse = await fetch(liveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (liveResponse.ok) {
      const finalUrl = liveResponse.url || '';
      if (finalUrl.includes('youtube.com/watch?v=')) {
        const videoIdMatch = finalUrl.match(/[?&]v=([^&#]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : undefined;
        return { isLive: true, videoId, title: 'Live Stream' };
      }

      const html = await liveResponse.text();
      const isLive = html.includes('"isLive":true') && !html.includes('LIVE_STREAM_OFFLINE') && !html.includes('g-recaptcha');
      if (isLive) {
        const videoIdMatch = html.match(/"videoId"\s*:\s*"([^"]+)"/) || html.match(/href="https:\/\/www\.youtube\.com\/watch\?v=([^"]+)"/);
        return {
          isLive: true,
          videoId: videoIdMatch ? videoIdMatch[1] : undefined,
          title: 'Live Stream'
        };
      }
    }

    return { isLive: false };
  } catch (error) {
    console.error(`[Scraper Error] for channel ${channelId}:`, error);
    return { isLive: false };
  }
}

// In-memory cache for mapping videoId to activeLiveChatId to save API quota
const activeLiveChatIdCache = new Map<string, { chatId: string; expiresAt: number }>();

// Multi-API Key Management with automatic failover and quota exhaustion handling
function getYouTubeApiKeys(): string[] {
  const keysStr = process.env.YOUTUBE_API_KEYS || process.env.YOUTUBE_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0 && k !== 'MY_YOUTUBE_API_KEY');
}

let currentApiKeyIndex = 0;
const exhaustedApiKeys = new Set<string>();

function getActiveYouTubeApiKey(): string | null {
  const keys = getYouTubeApiKeys();
  if (keys.length === 0) return null;

  // Filter keys that haven't been marked as exhausted
  const availableKeys = keys.filter(k => !exhaustedApiKeys.has(k));
  if (availableKeys.length === 0) {
    // If all keys marked exhausted, reset if older or return first key to try again
    console.warn('[YouTube API Pool] All keys were marked exhausted. Resetting pool to retry.');
    exhaustedApiKeys.clear();
    return keys[0];
  }

  currentApiKeyIndex = currentApiKeyIndex % availableKeys.length;
  const selectedKey = availableKeys[currentApiKeyIndex];
  // Round-robin index advance
  currentApiKeyIndex = (currentApiKeyIndex + 1) % availableKeys.length;
  return selectedKey;
}

function markYouTubeApiKeyExhausted(key: string) {
  console.warn(`[YouTube API Pool] Marking API key (...${key.slice(-4)}) as exhausted (quota reached).`);
  exhaustedApiKeys.add(key);
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.DEFAULT_APP_PORT || process.env.PORT || '3000');

  // Support safe cross-origin communication inside the AI Studio iframe sandboxed containers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Simple in-memory rate limiter to protect sensitive endpoints
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const createRateLimiter = (maxRequests: number, windowMs: number) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
      const key = `${req.path}_${ip}`;
      const now = Date.now();
      const entry = rateLimitMap.get(key);

      if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (entry.count >= maxRequests) {
        return res.status(429).json({ error: 'Too many requests. Please slow down.' });
      }

      entry.count++;
      return next();
    };
  };

  // Apply rate limits (generously sized for legitimate dashboard polling across 40+ channels)
  app.use('/api/live-status', createRateLimiter(1500, 60000));
  app.use('/api/tiktok', createRateLimiter(300, 60000));
  app.use('/api/tiktok-status', createRateLimiter(300, 60000));

  app.post('/api/login', (req, res) => {
    return res.status(400).json({ 
      success: false, 
      message: 'Direct password login is disabled. Please authenticate via Google / Supabase Auth.' 
    });
  });

  app.post('/api/register', (req, res) => {
    return res.status(400).json({ 
      success: false, 
      message: 'Direct user registration is disabled. Please authenticate via Google / Supabase Auth.' 
    });
  });

  // Dedicated TikTok Live stream extraction Route
  app.get('/api/tiktok', async (req, res) => {
    try {
      const handle = req.query.handle as string;
      if (!handle) {
        return res.status(400).json({ error: 'handle parameter is required' });
      }

      const cleanHandle = handle.replace('@', '').trim();
      const result = await fetchTikTokLiveStream(cleanHandle);
      
      console.log(`[TikTok Extract m3u8] @${cleanHandle} Live: ${result.isLive}, StreamUrl: ${result.streamUrl ? 'Found' : 'Not Found'}`);
      return res.json(result);
    } catch (err: any) {
      console.error(`[TikTok Extract Exception]`, err);
      return res.status(500).json({ isLive: false, error: err.message });
    }
  });

  // Dedicated TikTok Live Status API Route (Server-side)
  app.get('/api/tiktok-live-status', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      const handle = req.query.handle as string;
      if (!handle) {
        return res.status(400).json({ error: 'handle parameter is required' });
      }

      const cleanHandle = handle.replace('@', '').trim();
      const result = await checkTikTokLiveStatus(cleanHandle);
      
      console.log(`[TikTok Dedicated API] @${cleanHandle} Live status check result: ${result.isLive}`);
      return res.json({
        isLive: result.isLive,
        handle: cleanHandle,
        isBlocked: !!result.isBlocked
      });
    } catch (err: any) {
      console.error(`[TikTok Dedicated API Exception]`, err);
      return res.status(500).json({ isLive: false, error: err.message });
    }
  });

  // Dedicated TikTok Live Status API Route supporting username/handle and string checking for room_id and status:4
  app.get('/api/tiktok-status', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    try {
      const username = (req.query.username || req.query.handle) as string;
      if (!username) {
        return res.status(400).json({ error: 'username or handle parameter is required' });
      }

      const cleanUsername = username.replace('@', '').trim();
      const result = await fetchTikTokLiveStream(cleanUsername);
      console.log(`[TikTok Status API] @${cleanUsername} isLive: ${result.isLive} (isBlocked: ${!!result.isBlocked})`);
      
      return res.json({
        isLive: result.isLive,
        username: cleanUsername,
        isBlocked: !!result.isBlocked
      });
    } catch (err: any) {
      console.error(`[TikTok Status API Route Exception]`, err);
      return res.status(500).json({ isLive: false, error: err.message });
    }
  });

  // API Route for YouTube Live Status Proxy (highly reliable scraping + cache)
  app.get('/api/live-status/all', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=15');
    const allStatuses = liveStatusCache.getAll();
    return res.json({
      success: true,
      timestamp: Date.now(),
      count: Object.keys(allStatuses).length,
      statuses: allStatuses
    });
  });

  // Media Settings storage and fallback
  const mediaSettingsPath = path.join(process.cwd(), 'data', 'media-settings.json');

  const defaultMediaSettings = {
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

  const getMediaSettings = () => {
    try {
      if (fs.existsSync(mediaSettingsPath)) {
        const raw = fs.readFileSync(mediaSettingsPath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[Media Settings] Error reading file, using defaults:', e);
    }
    return defaultMediaSettings;
  };

  const saveMediaSettings = (data: any) => {
    try {
      const dir = path.dirname(mediaSettingsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(mediaSettingsPath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('[Media Settings] Error saving file:', e);
      return false;
    }
  };

  // Dedicated Media Endpoints
  app.get('/api/media', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    return res.json({ success: true, media: getMediaSettings() });
  });

  app.post('/api/media/settings', (req, res) => {
    try {
      const updated = req.body;
      const current = getMediaSettings();
      const merged = { ...current, ...updated };
      saveMediaSettings(merged);
      return res.json({ success: true, media: merged });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/media/upload', (req, res) => {
    try {
      const { filename, base64Data } = req.body;
      if (!base64Data || !filename) {
        return res.status(400).json({ error: 'filename and base64Data are required' });
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      
      const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${safeName}`;
      return res.json({ success: true, url: publicUrl, filename: safeName });
    } catch (e: any) {
      console.error('[Media Upload Error]', e);
      return res.status(500).json({ error: e.message });
    }
  });

  // Dynamic Gallery endpoint reading directly from public/Gallery with media-settings fallback
  app.get('/api/gallery', (req, res) => {
    try {
      const galleryDir = path.join(process.cwd(), 'public', 'Gallery');
      if (!fs.existsSync(galleryDir)) {
        const mediaSettings = getMediaSettings();
        return res.json({ success: true, count: mediaSettings.gallery.length, gallery: mediaSettings.gallery });
      }
      const files = fs.readdirSync(galleryDir);
      const imageFiles = files.filter(f => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));

      if (imageFiles.length === 0) {
        const mediaSettings = getMediaSettings();
        return res.json({ success: true, count: mediaSettings.gallery.length, gallery: mediaSettings.gallery });
      }

      // Natural sort (gallery1.png, gallery2.png, ... gallery15.png)
      imageFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      const curatedMeta: Record<string, { title: string; tag: string }> = {
        'gallery1.png': { title: 'NSN SQUAD COMMUNITY', tag: 'Community' },
        'gallery2.png': { title: 'NSN969 SQUAD MATCH', tag: 'Team Match' },
        'gallery3.png': { title: 'NSN HEADQUARTERS', tag: 'Stream Studio' },
        'gallery4.png': { title: 'LIVE PRODUCTION ROOM', tag: 'Control Room' },
        'gallery5.png': { title: 'CHAMPIONS TROPHY', tag: 'Achievement' },
        'gallery6.png': { title: 'LOS SANTOS DRIFT', tag: 'Roleplay' },
        'gallery7.png': { title: 'MIDNIGHT PATROL', tag: 'Night Ops' },
        'gallery8.png': { title: 'VIP ARMORED CONVOY', tag: 'Special Escort' },
        'gallery9.png': { title: 'STREET RACING CLAN', tag: 'Motorsport' },
        'gallery10.png': { title: 'FINAL SHOWDOWN', tag: 'Clutch Match' },
        'gallery11.png': { title: 'FAMILY MEETUP', tag: 'Gathering' },
        'gallery12.png': { title: 'TACTICAL INFILTRATION', tag: 'Operation' },
        'gallery13.png': { title: 'VICTORY CELEBRATION', tag: 'Trophy Day' },
        'gallery14.png': { title: 'UNDERGROUND VAULT', tag: 'Heist' },
        'gallery15.png': { title: 'THE FAMILY REUNION', tag: 'NSN Legacy' }
      };

      const gallery = imageFiles.map((filename, idx) => {
        const meta = curatedMeta[filename.toLowerCase()] || {
          title: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase(),
          tag: 'NSN969 Moment'
        };
        return {
          id: `gal-${idx + 1}`,
          src: `/Gallery/${filename}`,
          title: meta.title,
          tag: meta.tag
        };
      });

      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.json({ success: true, count: gallery.length, gallery });
    } catch (err: any) {
      console.error('[API Gallery] Error reading gallery directory:', err);
      const mediaSettings = getMediaSettings();
      return res.json({ success: true, count: mediaSettings.gallery.length, gallery: mediaSettings.gallery });
    }
  });

  app.get('/api/live-status', async (req, res) => {
    try {
      const { channelId, streamerId } = req.query;
      if (!channelId || typeof channelId !== 'string') {
        return res.status(400).json({ error: 'channelId is required' });
      }

      let cleanStreamerId = '';
      let requestPlatform: 'youtube' | 'tiktok' | 'both' = 'both';

      if (streamerId && typeof streamerId === 'string') {
        if (streamerId.endsWith('-tiktok')) {
          requestPlatform = 'tiktok';
          cleanStreamerId = streamerId.replace('-tiktok', '');
        } else if (streamerId.endsWith('-youtube')) {
          requestPlatform = 'youtube';
          cleanStreamerId = streamerId.replace('-youtube', '');
        } else {
          cleanStreamerId = streamerId;
        }
      }

      const forceRefresh = req.query.force === 'true';

      // Check TikTok status (with inline real-time check fallback if cache is stale/missing)
      if (requestPlatform === 'tiktok') {
        const cachedTikTok = tiktokLiveStatuses.get(cleanStreamerId);
        const handle = TIKTOK_USERNAMES[cleanStreamerId] || '';
        const now = Date.now();
        let shouldCheckInline = false;

        // If no cache, or if cache is older than 30 seconds, or if force query is active, perform on-demand check
        if (forceRefresh || !cachedTikTok || (now - cachedTikTok.lastChecked > 30000)) {
          shouldCheckInline = true;
        }

        if (shouldCheckInline && handle) {
          try {
            console.log(`[TikTok API Route] Performing on-demand real-time check for ${cleanStreamerId} (@${handle}) (forceRefresh: ${forceRefresh})`);
            const result = await checkTikTokLiveStatus(handle);
            if (!result.isBlocked) {
              tiktokLiveStatuses.set(cleanStreamerId, {
                isLive: result.isLive,
                lastChecked: now
              });
            } else {
              // On block/captcha, refresh the timestamp to cool down but force offline to avoid stuck-live bug
              console.warn(`[TikTok API Route] Challenge or block detected checking @${handle}. Setting status to offline.`);
              tiktokLiveStatuses.set(cleanStreamerId, {
                isLive: false,
                lastChecked: now
              });
            }
          } catch (err) {
            console.error(`[TikTok API Route] Failed checking on-demand for @${handle}:`, err);
          }
        }

        const freshCached = tiktokLiveStatuses.get(cleanStreamerId);
        const isLive = freshCached ? freshCached.isLive : false;
        
        res.setHeader('X-Cache', shouldCheckInline ? 'MISS' : 'HIT');
        return res.json({
          isLive,
          videoId: undefined,
          title: isLive ? 'Live di TikTok' : undefined,
          platform: 'tiktok',
          handle,
          lastChecked: freshCached ? freshCached.lastChecked : now,
          cached: !shouldCheckInline
        });
      }

      // Check backend in-memory cache first to avoid rate-limiting by YouTube
      const cacheResult = liveStatusCache.get(channelId);
      // If cached and fresh (or checked within last 10 seconds), always serve cache
      if (cacheResult && (!forceRefresh || cacheResult.ageMs < 10000)) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Age', Math.floor(cacheResult.ageMs / 1000).toString());
        return res.json({
          isLive: cacheResult.data.isLive,
          videoId: cacheResult.data.videoId,
          title: cacheResult.data.title,
          platform: 'youtube',
          lastChecked: cacheResult.timestamp,
          cached: true
        });
      }

      // Deduplicate in-flight fetches for the same channel
      let fetchPromise = inFlightFetches.get(channelId);
      if (!fetchPromise) {
        fetchPromise = (async () => {
          let result: { isLive: boolean; videoId?: string; title?: string } = { isLive: false };

          // Use official API if apiKey is explicitly provided and set
          const apiKey = getActiveYouTubeApiKey();
          if (apiKey) {
            try {
              const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&channelId=${channelId}&key=${apiKey}`;
              const response = await fetch(url);
              
              if (response.ok) {
                const data = await response.json();
                const items = data.items || [];
                if (items.length > 0) {
                  result = {
                    isLive: true,
                    videoId: items[0].id?.videoId,
                    title: items[0].snippet?.title || 'Live Stream'
                  };
                }
              } else {
                if (response.status === 403 || response.status === 429) {
                  markYouTubeApiKeyExhausted(apiKey);
                }
                console.warn(`[YouTube Proxy API] Status API returned ${response.status} for channel ${channelId}. Falling back to scraping.`);
                result = await scrapeYouTubeLive(channelId);
              }
            } catch (apiErr) {
              console.warn('[YouTube API Exception] falling back to scraping:', apiErr);
              result = await scrapeYouTubeLive(channelId);
            }
          } else {
            // No API Key, use real-time high-fidelity scraper directly
            result = await scrapeYouTubeLive(channelId);
          }

          return result;
        })();

        inFlightFetches.set(channelId, fetchPromise);
      }

      let fetchResult: { isLive: boolean; videoId?: string; title?: string };
      try {
        fetchResult = await fetchPromise;
      } finally {
        inFlightFetches.delete(channelId);
      }

      // Save to server-side cache (60 seconds TTL)
      liveStatusCache.set(channelId, {
        isLive: fetchResult.isLive,
        videoId: fetchResult.videoId,
        title: fetchResult.title,
        platform: 'youtube',
        timestamp: Date.now()
      }, 60 * 1000);

      res.setHeader('X-Cache', 'MISS');
      return res.json({
        isLive: fetchResult.isLive,
        videoId: fetchResult.videoId,
        title: fetchResult.title,
        platform: 'youtube',
        lastChecked: Date.now(),
        cached: false
      });
    } catch (e) {
      console.error('Error fetching live status in proxy:', e);
      // Fall back to stale cache if available
      const stale = liveStatusCache.get(req.query.channelId as string);
      if (stale) {
        return res.json({
          isLive: stale.data.isLive,
          videoId: stale.data.videoId,
          title: stale.data.title,
          platform: 'youtube',
          lastChecked: stale.timestamp,
          cached: true
        });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // API Route to return active TikTok status dictionary
  app.get('/api/tiktok/check-active-lives', (req, res) => {
    try {
      const activeMap: Record<string, { isLive: boolean; handle: string; lastChecked: number }> = {};
      for (const [streamerId, info] of tiktokLiveStatuses.entries()) {
        activeMap[streamerId] = {
          isLive: info.isLive,
          handle: TIKTOK_USERNAMES[streamerId] || '',
          lastChecked: info.lastChecked
        };
      }
      return res.json({ activeLives: activeMap });
    } catch (err: any) {
      console.error('Error in check-active-lives:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // API Route to resolve TikTok short URL or extract TikTok handle from URL
  app.get('/api/resolve-tiktok', async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        return res.status(400).json({ error: 'url query parameter is required' });
      }

      console.log(`[TikTok Resolver] Resolving URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });

      const finalUrl = response.url;
      console.log(`[TikTok Resolver] Resolved final URL: ${finalUrl}`);

      let handle = '';
      if (finalUrl.includes('tiktok.com')) {
        if (finalUrl.includes('/@')) {
          handle = finalUrl.split('/@')[1]?.split('/')[0]?.split('?')[0] || '';
        } else {
          const parts = finalUrl.split('?')[0].split('/');
          const atPart = parts.find(p => p.startsWith('@'));
          if (atPart) {
            handle = atPart.replace('@', '');
          } else {
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart !== 'live') {
              handle = lastPart;
            } else if (parts[parts.length - 2]) {
              handle = parts[parts.length - 2];
            }
          }
        }
      }

      if (handle) {
        handle = handle.replace('@', '').trim();
      }

      return res.json({
        originalUrl: url,
        finalUrl: finalUrl,
        handle: handle || null
      });
    } catch (e) {
      console.error('Error resolving TikTok URL:', e);
      return res.status(500).json({ error: 'Failed to resolve TikTok URL' });
    }
  });

  // API Route to extract TikTok .m3u8 live stream source from handle
  app.get('/api/tiktok-stream', async (req, res) => {
    try {
      const handle = req.query.handle as string;
      if (!handle) {
        return res.status(400).json({ error: 'handle parameter is required' });
      }

      const cleanHandle = handle.replace('@', '').trim();
      const livePageUrl = `https://www.tiktok.com/@${cleanHandle}/live`;
      console.log(`[TikTok Stream API] Scraping live stream source for @${cleanHandle}`);

      const response = await fetch(livePageUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': 'https://www.tiktok.com/',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        console.warn(`[TikTok Stream API] TikTok returned HTTP status ${response.status}`);
        return res.status(response.status).json({ error: `TikTok returned status ${response.status}`, isLive: false });
      }

      const html = await response.text();
      let streamUrl = '';

      // Match 1: hls_pull_url inside scripts
      const hlsPullUrlMatch = html.match(/"hls_pull_url"\s*:\s*"([^"]+)"/);
      if (hlsPullUrlMatch) {
        streamUrl = hlsPullUrlMatch[1];
      } else {
        // Match 2: play_url
        const playUrlMatch = html.match(/"play_url"\s*:\s*"([^"]+)"/);
        if (playUrlMatch) {
          streamUrl = playUrlMatch[1];
        } else {
          // Match 3: Look for general backslash escaped m3u8 path
          const m3u8MatchEscaped = html.match(/(https?:\\[\/][\/][^"'\s,\\\n]+\.m3u8[^"'\s,\\\n]*)/i);
          if (m3u8MatchEscaped) {
            streamUrl = m3u8MatchEscaped[1];
          } else {
            // Match 4: Look for direct m3u8 path
            const m3u8MatchDirect = html.match(/(https?:\/\/[^"'\s,\\\n]+\.m3u8[^"'\s,\\\n]*)/i);
            if (m3u8MatchDirect) {
              streamUrl = m3u8MatchDirect[1];
            }
          }
        }
      }

      if (streamUrl) {
        // Unescape backslashes, unicode slash, etc. safely without complex regex compiler issues
        streamUrl = streamUrl
          .split('\\u002F').join('/')
          .split('\\u002f').join('/')
          .split('\\/').join('/')
          .split('&amp;').join('&');
        
        console.log(`[TikTok Stream API] Extracted m3u8 stream URL: ${streamUrl}`);
        return res.json({
          isLive: true,
          streamUrl: streamUrl,
          handle: cleanHandle
        });
      }

      // Check if user is offline
      const isOfflineText = html.includes('is offline') || html.includes('room_status') || !html.includes('LIVE');
      console.log(`[TikTok Stream API] No stream URL found for @${cleanHandle}. isOfflineText: ${isOfflineText}`);

      return res.json({
        isLive: false,
        streamUrl: null,
        handle: cleanHandle,
        reason: isOfflineText ? 'offline' : 'not_found'
      });

    } catch (e: any) {
      console.error('Error extracting TikTok live stream:', e);
      return res.status(500).json({ error: e.message || 'Failed to extract TikTok live stream' });
    }
  });

  // API Route for YouTube Live Chat Messages (Official YouTube Data API v3 only, no mock data)
  app.get('/api/chat', async (req, res) => {
    try {
      const inputId = ((req.query.videoId || req.query.chatId) as string)?.trim();
      const pageToken = req.query.pageToken as string | undefined;

      if (!inputId || inputId === 'undefined' || inputId === 'null') {
        return res.status(400).json({ error: 'videoId query parameter is required', items: [] });
      }

      const apiKey = getActiveYouTubeApiKey();
      if (!apiKey) {
        return res.status(401).json({
          error: 'YOUTUBE_API_KEY is missing. Real-time chat requires a valid YouTube Data API v3 Key.',
          items: []
        });
      }

      let activeVideoId = inputId;
      const isYtVideoId = /^[a-zA-Z0-9_-]{11}$/.test(activeVideoId);

      // If it's a channel ID or handle, resolve to active live videoId
      if (!isYtVideoId) {
        const liveRes = await scrapeYouTubeLive(activeVideoId);
        if (liveRes.isLive && liveRes.videoId) {
          activeVideoId = liveRes.videoId;
        } else {
          return res.status(404).json({
            error: 'No active live stream found for this channel/handle.',
            items: []
          });
        }
      }

      let activeLiveChatId = '';

      // 1. Check in-memory cache for activeLiveChatId
      const cached = activeLiveChatIdCache.get(activeVideoId);
      if (cached && Date.now() < cached.expiresAt) {
        activeLiveChatId = cached.chatId;
      } else {
        // 2. Resolve activeVideoId to activeLiveChatId via YouTube Data API v3
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?id=${activeVideoId}&part=liveStreamingDetails&key=${apiKey}`;
        const videoResponse = await fetch(videoUrl);

        if (!videoResponse.ok) {
          const errorData = await videoResponse.json().catch(() => ({}));
          console.error('[YouTube API Error] Failed to fetch video details:', errorData);
          if (videoResponse.status === 403 || videoResponse.status === 429) {
            markYouTubeApiKeyExhausted(apiKey);
          }
          return res.status(videoResponse.status).json({
            error: 'Failed to fetch video details. Check API Key and Quota.',
            details: errorData,
            items: []
          });
        }

        const videoData = await videoResponse.json();
        const liveDetails = videoData.items?.[0]?.liveStreamingDetails;

        if (liveDetails?.activeLiveChatId) {
          activeLiveChatId = liveDetails.activeLiveChatId;
          // Cache chatId for 60 minutes
          activeLiveChatIdCache.set(activeVideoId, {
            chatId: activeLiveChatId,
            expiresAt: Date.now() + 60 * 60 * 1000
          });
        } else {
          return res.status(404).json({
            error: 'No active live chat found for this video. Stream might be offline or chat is disabled.',
            items: []
          });
        }
      }

      // 3. Fetch chat messages from YouTube Data API v3
      let chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${activeLiveChatId}&part=snippet,authorDetails&key=${apiKey}`;
      if (pageToken) {
        chatUrl += `&pageToken=${pageToken}`;
      }

      const chatResponse = await fetch(chatUrl);

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json().catch(() => ({}));
        console.error('[YouTube Chat API Error] Failed to fetch messages:', errorData);

        if (chatResponse.status === 403 || chatResponse.status === 429) {
          markYouTubeApiKeyExhausted(apiKey);
          if ((errorData as any)?.error?.errors?.[0]?.reason === 'quotaExceeded') {
            return res.status(429).json({
              error: 'YouTube API quota exceeded. Please wait until tomorrow.',
              items: []
            });
          }
        }

        return res.status(chatResponse.status).json({
          error: 'Failed to fetch chat messages',
          details: errorData,
          items: []
        });
      }

      const chatData = await chatResponse.json();

      return res.json({
        nextPageToken: chatData.nextPageToken || undefined,
        pollingIntervalMillis: chatData.pollingIntervalMillis || 5000,
        items: chatData.items || []
      });

    } catch (err) {
      console.error('Error loading chat overlay data:', err);
      return res.status(500).json({ error: 'Internal server error', items: [] });
    }
  });

  // Dynamic endpoint to scan music directories for on-the-fly tracks loading
  app.get('/api/music', (req, res) => {
    try {
      const musicDirs = [
        path.join(process.cwd(), 'public', 'music'),
        path.join(process.cwd(), 'dist', 'music')
      ];
      let mp3Files: string[] = [];
      
      for (const dir of musicDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const mp3s = files.filter(file => file.toLowerCase().endsWith('.mp3'));
          if (mp3s.length > 0) {
            mp3Files = mp3s;
            break;
          }
        }
      }

      const tracks = mp3Files.map((file, index) => {
        // Humanize file name: strip extension, convert underscores and dashes to capitalized title format
        const cleanName = file
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        
        let title = cleanName;
        let artist = 'NSN Premium Sound';

        if (file.toLowerCase() === 'nsn969soung.mp3' || cleanName === 'Nsn969soung') {
          title = 'NSN969 SIAP TEMPUR';
          artist = 'Donz';
        } else if (file.toLowerCase() === 'nsn969music.mp3' || cleanName === 'Nsn969music') {
          title = 'NSN969 MUSIC';
          artist = 'Analist Magang';
        }

        return {
          id: `local-track-${index}`,
          title,
          artist,
          url: `/music/${file}`
        };
      });

      return res.json({ tracks });
    } catch (e) {
      console.error('Error reading music folder:', e);
      return res.status(500).json({ tracks: [] });
    }
  });

  // Serve member photos, gallery, images, and music assets from public directories
  app.use('/member', express.static(path.join(process.cwd(), 'public', 'member')));
  app.use('/gallery', express.static(path.join(process.cwd(), 'public', 'gallery')));
  app.use('/images', express.static(path.join(process.cwd(), 'public', 'images')));
  app.use('/music', express.static(path.join(process.cwd(), 'public', 'music')));
  app.use('/videos', express.static(path.join(process.cwd(), 'public', 'videos')));
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Serve static assets or mount Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NSN969 Multi-View server running on http://localhost:${PORT}`);
  });
}

startServer();
