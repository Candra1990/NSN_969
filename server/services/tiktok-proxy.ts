import https from 'https';
import zlib from 'zlib';
import { IncomingMessage } from 'http';

export interface TikTokProxyResult {
  isLive: boolean;
  streamUrl?: string;
  isBlocked?: boolean;
  error?: string;
}

interface HttpsFetchResponse {
  html: string;
  finalUrl: string;
  statusCode?: number;
}

function fetchHtmlWithHttps(urlStr: string, headers: any, redirectCount = 0): Promise<HttpsFetchResponse> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      return reject(new Error('Too many redirects (limit 5)'));
    }

    try {
      const parsedUrl = new URL(urlStr);
      const options: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: headers,
        minVersion: 'TLSv1.2',
        ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORTS:!RC4:!MD5:!PSK',
        rejectUnauthorized: false
      };

      const req = https.request(options, (res: IncomingMessage) => {
        // Handle HTTP Redirects
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
          const redirectTo = res.headers.location;
          if (redirectTo) {
            let nextUrl = redirectTo;
            if (!redirectTo.startsWith('http')) {
              nextUrl = `${parsedUrl.protocol}//${parsedUrl.host}${redirectTo}`;
            }
            return fetchHtmlWithHttps(nextUrl, headers, redirectCount + 1)
              .then(resolve)
              .catch(reject);
          }
        }

        const chunks: Buffer[] = [];
        
        res.on('error', (err) => reject(err));
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const encoding = res.headers['content-encoding'];
          
          const completeRes = (decodedStr: string) => {
            resolve({
              html: decodedStr,
              finalUrl: urlStr,
              statusCode: res.statusCode
            });
          };

          if (encoding === 'gzip') {
            zlib.gunzip(buffer, (err, decoded) => {
              if (err) reject(err);
              else completeRes(decoded.toString('utf-8'));
            });
          } else if (encoding === 'deflate') {
            zlib.inflate(buffer, (err, decoded) => {
              if (err) reject(err);
              else completeRes(decoded.toString('utf-8'));
            });
          } else if (encoding === 'br') {
            zlib.brotliDecompress(buffer, (err, decoded) => {
              if (err) reject(err);
              else completeRes(decoded.toString('utf-8'));
            });
          } else {
            completeRes(buffer.toString('utf-8'));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(8000, () => {
        req.destroy();
        reject(new Error('Request timeout after 8000ms'));
      });

      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function fetchTikTokLiveStream(handle: string): Promise<TikTokProxyResult> {
  const cleanHandle = handle.replace('@', '').trim();
  const liveUrl = `https://www.tiktok.com/@${cleanHandle}/live?t=${Date.now()}`;

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'https://www.tiktok.com/',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Accept-Encoding': 'gzip, deflate, br'
    };

    const response = await fetchHtmlWithHttps(liveUrl, headers);

    if (response.statusCode === 429) {
      
      return { isLive: false, isBlocked: true };
    }

    const finalUrl = response.finalUrl || '';
    if (finalUrl.includes('/login') || finalUrl.includes('/signup') || finalUrl.includes('/unsupported') || finalUrl.includes('verify_robot')) {
      
      return { isLive: false, isBlocked: true };
    }

    const html = response.html;

    // Security block/captcha detection
    const isSecured = html.includes('captcha') || 
                      html.includes('sec.tiktok.com') || 
                      html.includes('VerifyYourself') || 
                      html.includes('g-recaptcha') ||
                      html.includes('please solve the puzzle') ||
                      html.includes('challenge-') ||
                      html.includes('security check') ||
                      html.length < 1500;

    if (isSecured) {
      
      return { isLive: false, isBlocked: true };
    }

    // Extract raw .m3u8 url first to see if there is active stream data on the page
    let streamUrl = "";

    // Look for hls_pull_url (with unescaping unicode slashes \/ or \u002F)
    const hlsPullMatch = html.match(/"hls_pull_url"\s*:\s*"([^"]+)"/);
    if (hlsPullMatch) {
      streamUrl = hlsPullMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
    }

    if (!streamUrl) {
      const streamDataMatch = html.match(/"stream_data"\s*:\s*"([^"]+)"/);
      if (streamDataMatch) {
        try {
          const unescapedStreamData = streamDataMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\u002F/g, '/');
          const hlsMatch = unescapedStreamData.match(/"hls_pull_url"\s*:\s*"([^"]+)"/);
          if (hlsMatch) {
            streamUrl = hlsMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
          }
        } catch (e) {
          console.error('[TikTok Proxy] Error decoding stream_data', e);
        }
      }
    }

    // Core indicators of TikTok Live as specified by request
    // 1. Check for a valid numeric room_id (typically 15-22 digits long) to avoid matching empty initial states like "roomId":""
    const roomIdMatch = html.match(/"room_id"\s*:\s*"([1-9]\d{10,})"/i) || 
                        html.match(/"roomId"\s*:\s*"([1-9]\d{10,})"/i) || 
                        html.match(/room_id\s*=\s*"?([1-9]\d{10,})"?/i);
    const hasRoomId = !!roomIdMatch;

    // Only set isLive if we have a real roomId, OR we successfully extracted a valid HLS stream.
    // This blocks static JS file references (.m3u8, play_url) on general offline pages from giving false positives.
    const isLive = (hasRoomId || (streamUrl && streamUrl.includes('.m3u8'))) && 
                   !html.includes('is offline') && 
                   !html.includes('LIVE_OFFLINE');

    if (!isLive || html.includes('is offline') || html.includes('LIVE_OFFLINE')) {
      return { isLive: false };
    }

    // General pattern matching fallback for .m3u8 inside TikTok script contents only if not found yet
    if (!streamUrl) {
      const escapedM3u8Match = html.match(/https?(?:\\[uU]002[fF]|\/\/)[^\s"'`]+?\.m3u8(?:[^\s"'`]*)/g);
      if (escapedM3u8Match) {
        for (const rawUrl of escapedM3u8Match) {
          const cleanUrl = rawUrl.replace(/\\u002F/g, '/').replace(/\\/g, '');
          if (cleanUrl.includes('.m3u8') && (cleanUrl.includes('pull') || cleanUrl.includes('tiktok') || cleanUrl.includes('byteoversea'))) {
            streamUrl = cleanUrl;
            break;
          }
        }
        if (!streamUrl) {
          streamUrl = escapedM3u8Match[0].replace(/\\u002F/g, '/').replace(/\\/g, '');
        }
      }
    }

    return {
      isLive: true,
      streamUrl: streamUrl || undefined,
      isBlocked: false
    };

  } catch (err: any) {
    console.error(`[TikTok Proxy Exception] @${cleanHandle}:`, err);
    return { isLive: false, error: err.message };
  }
}
