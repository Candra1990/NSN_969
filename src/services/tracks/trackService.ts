import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Backsound } from '@/types';
import { logActivity } from '@/services/admin/adminService';

export const saveTrackToDb = async (track: Backsound): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('tracks')
    .upsert({
      id: track.id,
      title: track.title,
      artist: track.artist || '',
      url: track.url,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[TrackService] Supabase save error:', error);
    logActivity('Save Audio Track', `track:${track.title}`, 'error', error.message);
    throw error;
  }

  logActivity('Save Audio Track', `track:${track.title}`, 'success', `Saved audio track "${track.title}" by ${track.artist || 'Unknown'}`);
};

export const deleteTrackFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[TrackService] Supabase delete error:', error);
    logActivity('Delete Audio Track', `track:${id}`, 'error', error.message);
    throw error;
  }

  logActivity('Delete Audio Track', `track:${id}`, 'success', `Deleted audio track ID ${id}`);
};

export const addTrackToDb = saveTrackToDb;
export const removeTrackFromDb = deleteTrackFromDb;
