import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: any, res: any) {
  try {
    // Enable CORS to allow direct calls from frontend
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

    // Extract username or handle from request query params
    let username = req.query?.username || req.query?.handle;

    if (!username) {
      // Fallback query parsing from URL if req.query is empty (depending on routing style)
      const urlObj = new URL(req.url || '', 'http://localhost');
      username = urlObj.searchParams.get('username') || urlObj.searchParams.get('handle');
    }

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'username or handle parameter is required' });
      return;
    }

    const cleanUsername = username.replace('@', '').trim();
    const liveUrl = `https://www.tiktok.com/@${cleanUsername}/live?t=${Date.now()}`;

    console.log(`[TikTok Status API] Scraping live status for @${cleanUsername}`);

    const response = await fetch(liveUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.tiktok.com/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`[TikTok Status API] Rate limited (429) for @${cleanUsername}`);
        res.status(429).json({ isLive: false, error: 'Rate limit error from TikTok', isBlocked: true });
        return;
      }
      res.status(200).json({ isLive: false, status: response.status });
      return;
    }

    const finalUrl = response.url || '';
    if (finalUrl.includes('/login') || finalUrl.includes('/signup') || finalUrl.includes('/unsupported') || finalUrl.includes('verify_robot')) {
      console.warn(`[TikTok Status API] Blocked/Redirected for @${cleanUsername} to ${finalUrl}`);
      res.status(200).json({ isLive: false, isBlocked: true, redirectUrl: finalUrl });
      return;
    }

    const html = await response.text();

    // Check for standard indicators of active live streams on TikTok:
    // 1. room_id checking - must match a valid room ID (digits, not empty string)
    const roomIdMatch = html.match(/"room_id"\s*:\s*"([1-9]\d{10,})"/i) || 
                        html.match(/"roomId"\s*:\s*"([1-9]\d{10,})"/i) || 
                        html.match(/room_id\s*=\s*"?([1-9]\d{10,})"?/i);
    const hasRoomId = !!roomIdMatch;

    // 2. status:4 checking
    const hasStatus4 = html.includes('"status":4') || 
                       html.includes("'status':4") || 
                       /"status"\s*:\s*4/.test(html);

    // 3. Fallbacks / HLS pull URL indicators
    const hasHls = html.includes('hls_pull_url') || html.includes('.m3u8') || html.includes('play_url');
    
    const isLive = (hasRoomId || hasStatus4 || hasHls) && 
                   !html.includes('is offline') && 
                   !html.includes('LIVE_OFFLINE');

    // Security/Captcha check
    const isSecured = html.includes('captcha') || 
                      html.includes('sec.tiktok.com') || 
                      html.includes('VerifyYourself') || 
                      html.includes('g-recaptcha') ||
                      html.length < 1500;

    if (isSecured && !isLive) {
      res.status(200).json({ isLive: false, isBlocked: true, message: 'Captcha/Security block detected' });
      return;
    }

    if (!isLive || html.includes('is offline') || html.includes('LIVE_OFFLINE')) {
      res.status(200).json({ isLive: false });
      return;
    }

    res.status(200).json({
      isLive: true,
      username: cleanUsername,
      hasRoomId,
      hasStatus4
    });

  } catch (err: any) {
    console.error(`[TikTok Status API Exception] @${req.query?.username}:`, err);
    res.status(500).json({ isLive: false, error: err.message });
  }
}
