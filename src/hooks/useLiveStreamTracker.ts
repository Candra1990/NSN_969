import { useState, useEffect, useCallback, useRef } from 'react';
import { Streamer, LiveStatus } from '@/types';

const CACHE_KEY = 'nsn969_live_statuses_cache';
const CACHE_TTL_MS = 120 * 1000; // 2 minutes cache TTL for stable polling
const POLLING_INTERVAL_MS = 120 * 1000; // Poll every 2 minutes (120 seconds) in background

interface CacheData {
  statuses: Record<string, LiveStatus>;
}

export function useLiveStreamTracker(streamers: Streamer[], isActive: boolean = true) {
  const [statuses, setStatuses] = useState<Record<string, LiveStatus>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const statusesRef = useRef<Record<string, LiveStatus>>(statuses);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);

  // Load cached statuses from LocalStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CacheData;
        if (parsed && typeof parsed.statuses === 'object') {
          setStatuses(parsed.statuses);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached live statuses:', e);
    }
  }, []);

  // Write status update to cache and state
  const saveToCacheAndState = useCallback((newStatuses: Record<string, LiveStatus>) => {
    if (!isMountedRef.current) return;
    setStatuses(newStatuses);
    try {
      const cachePayload: CacheData = {
        statuses: newStatuses
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));
    } catch (e) {
      console.error('Failed to write live statuses cache:', e);
    }
  }, []);

  // Main status verification query for a specific streamer channel
  const fetchChannelStatus = useCallback(async (channelId: string, streamerId: string, currentCache?: LiveStatus, force = false): Promise<LiveStatus> => {
    const now = Date.now();
    
    // Conforming strictly to client-side caching mechanism (TTL Check) except when forced
    if (!force && currentCache && now - currentCache.lastChecked < CACHE_TTL_MS) {
      return currentCache;
    }

    try {
      const res = await fetch(`/api/live-status?channelId=${encodeURIComponent(channelId)}&streamerId=${encodeURIComponent(streamerId)}&force=${force ? 'true' : 'false'}&t=${now}`, {
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but received ${contentType}`);
      }
      const data = await res.json();
      return {
        isLive: !!data.isLive,
        videoId: data.videoId,
        title: data.title,
        viewerCount: data.viewerCount,
        thumbnail: data.thumbnail,
        platform: data.platform || 'youtube',
        handle: data.handle,
        lastChecked: now
      };
    } catch (_e) {
      // Fallback cleanly on error without spamming the console
      return {
        isLive: false,
        platform: currentCache?.platform || 'youtube',
        lastChecked: now
      };
    }
  }, []);

  // Trigger scanning across all channels
  const updateAllStatuses = useCallback(async (force = false) => {
    if (streamers.length === 0) {
      setLoading(false);
      return;
    }

    const currentStatuses = statusesRef.current;
    const now = Date.now();
    const updated: Record<string, LiveStatus> = { ...currentStatuses };
    let hasChanged = false;

    // First attempt: Bulk fetch from server-side cache in a single HTTP request
    try {
      const bulkRes = await fetch(`/api/live-status/all?t=${now}`);
      if (bulkRes.ok) {
        const bulkData = await bulkRes.json();
        if (bulkData.statuses && typeof bulkData.statuses === 'object') {
          let bulkMatched = 0;
          streamers.forEach((streamer) => {
            const cachedInfo = bulkData.statuses[streamer.channelId];
            if (cachedInfo) {
              bulkMatched++;
              const oldStatus = currentStatuses[streamer.id];
              if (!oldStatus || oldStatus.isLive !== cachedInfo.isLive || oldStatus.videoId !== cachedInfo.videoId) {
                hasChanged = true;
              }
              updated[streamer.id] = {
                isLive: !!cachedInfo.isLive,
                videoId: cachedInfo.videoId,
                title: cachedInfo.title,
                platform: cachedInfo.platform || 'youtube',
                lastChecked: cachedInfo.timestamp || now
              };
            }
          });

          // If bulk response covered streamers, save and finish early
          if (bulkMatched > 0 && !force) {
            if (!isMountedRef.current) return;
            if (hasChanged || Object.keys(currentStatuses).length === 0) {
              saveToCacheAndState(updated);
            }
            setLoading(false);
            return;
          }
        }
      }
    } catch (_bulkErr) {
      // Fall through to chunked fetch if bulk endpoint is not yet populated
    }

    // Process channels in small concurrency chunks (5 at a time) to prevent network saturation
    const chunkSize = 5;
    const results: Array<{ id: string; status: LiveStatus }> = [];

    for (let i = 0; i < streamers.length; i += chunkSize) {
      const chunk = streamers.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (streamer) => {
        const current = currentStatuses[streamer.id];
        if (force || !current || now - current.lastChecked >= CACHE_TTL_MS) {
          const result = await fetchChannelStatus(streamer.channelId, streamer.id, current, force);
          return { id: streamer.id, status: result };
        }
        return { id: streamer.id, status: current };
      });

      const chunkResults = await Promise.allSettled(chunkPromises);
      chunkResults.forEach((res) => {
        if (res.status === 'fulfilled') {
          results.push(res.value);
        }
      });
    }

    results.forEach((res) => {
      if (res.status) {
        // Detect actual changes to trigger optimized state update
        const oldStatus = currentStatuses[res.id];
        if (!oldStatus || oldStatus.isLive !== res.status.isLive || oldStatus.videoId !== res.status.videoId) {
          hasChanged = true;
        }
        updated[res.id] = res.status;
      }
    });

    if (!isMountedRef.current) return;
    if (hasChanged || Object.keys(currentStatuses).length === 0) {
      saveToCacheAndState(updated);
    }
    setLoading(false);
  }, [streamers, fetchChannelStatus, saveToCacheAndState]);

  // Initial scanning hook trigger
  useEffect(() => {
    if (!isActive) return;
    updateAllStatuses(false);
  }, [streamers, isActive]);

  // Background Polling Tracker (with full cleanup context)
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      updateAllStatuses(false);
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [updateAllStatuses, isActive]);

  const refreshAction = useCallback(() => {
    setLoading(true);
    return updateAllStatuses(true);
  }, [updateAllStatuses]);

  return {
    statuses,
    loading,
    refresh: refreshAction
  };
}
