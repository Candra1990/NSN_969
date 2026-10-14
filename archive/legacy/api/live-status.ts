import type { IncomingMessage, ServerResponse } from 'http';

// In-memory cache for live status checks on Vercel Serverless (scoped per cold start instance)
const liveStatusCache = new Map<string, { isLive: boolean; videoId?: string; title?: string; timestamp: number }>();
const BACKEND_CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache duration

async function scrapeYouTubeLive(channelId: string): Promise<{ isLive: boolean; videoId?: string; title?: string }> {
  try {
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

    const liveUrl = `https://www.youtube.com/channel/${channelId}/live`;
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

export default async function handler(req: any, res: any) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Extract channelId query param
    const channelId = req.query?.channelId || new URL(req.url || '', 'http://localhost').searchParams.get('channelId');

    if (!channelId || typeof channelId !== 'string') {
      res.status(400).json({ error: 'channelId is required' });
      return;
    }

    // Check backend in-memory cache first to avoid rate-limiting by YouTube
    const cached = liveStatusCache.get(channelId);
    if (cached && (Date.now() - cached.timestamp < BACKEND_CACHE_TTL)) {
      res.status(200).json({
        isLive: cached.isLive,
        videoId: cached.videoId,
        title: cached.title,
        lastChecked: cached.timestamp,
        cached: true
      });
      return;
    }

    let result: { isLive: boolean; videoId?: string; title?: string } = { isLive: false };
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Use official API if apiKey is explicitly provided and set
    if (apiKey && apiKey !== 'MY_YOUTUBE_API_KEY' && apiKey.trim() !== '') {
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
          result = await scrapeYouTubeLive(channelId);
        }
      } catch (apiErr) {
        result = await scrapeYouTubeLive(channelId);
      }
    } else {
      result = await scrapeYouTubeLive(channelId);
    }

    liveStatusCache.set(channelId, {
      isLive: result.isLive,
      videoId: result.videoId,
      title: result.title,
      timestamp: Date.now()
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Vercel API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
