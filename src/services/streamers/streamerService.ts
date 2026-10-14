import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Streamer } from '@/types';
import { logActivity } from '@/services/admin/adminService';

export async function saveStreamerToDb(streamer: Streamer) {
  if (!streamer || !streamer.id || !streamer.name || !streamer.platform) {
    throw new Error('Streamer ID, name, and platform are required.');
  }

  const cleanName = streamer.name.trim();
  if (cleanName.length > 100) {
    throw new Error('Streamer name cannot exceed 100 characters.');
  }

  const validPlatforms = ['youtube', 'tiktok', 'twitch', 'facebook', 'other'];
  const platformLower = streamer.platform.toLowerCase();
  if (!validPlatforms.includes(platformLower)) {
    throw new Error(`Invalid platform: ${streamer.platform}. Must be one of: ${validPlatforms.join(', ')}`);
  }

  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('streamers')
    .upsert({
      id: streamer.id,
      name: cleanName,
      platform: platformLower,
      channel_id: streamer.channelId || '',
      youtube_id: streamer.youtubeId || '',
      tiktok_id: streamer.tiktokId || '',
      photo_url: streamer.photoUrl || '',
      is_featured: streamer.isFeatured || false,
      category: streamer.category || 'Streamer',
      status: 'active',
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[StreamerService] Supabase save error:', error);
    logActivity('Save Streamer', `streamer:${cleanName}`, 'error', error.message);
    throw error;
  }

  logActivity('Save Streamer', `streamer:${cleanName}`, 'success', `Saved streamer ${cleanName} (${platformLower})`);
}

export async function deleteStreamerFromDb(id: string) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('streamers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[StreamerService] Supabase delete error:', error);
    logActivity('Delete Streamer', `streamer:${id}`, 'error', error.message);
    throw error;
  }

  logActivity('Delete Streamer', `streamer:${id}`, 'success', `Deleted streamer ID ${id}`);
}
