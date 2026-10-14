import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { GalleryItem } from '@/types';
import { logActivity } from '@/services/admin/adminService';

export const saveGalleryItemToDb = async (item: GalleryItem): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('gallery')
    .upsert({
      id: item.id,
      title: item.title,
      tag: item.tag || '',
      src: item.src,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[GalleryService] Supabase save error:', error);
    logActivity('Save Gallery Asset', `gallery:${item.title}`, 'error', error.message);
    throw error;
  }

  logActivity('Save Gallery Asset', `gallery:${item.title}`, 'success', `Saved gallery item "${item.title}"`);
};

export const deleteGalleryItemFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Koneksi Supabase belum terkonfigurasi di aplikasi.');
  }

  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[GalleryService] Supabase delete error:', error);
    logActivity('Delete Gallery Asset', `gallery:${id}`, 'error', error.message);
    throw error;
  }

  logActivity('Delete Gallery Asset', `gallery:${id}`, 'success', `Deleted gallery item ID ${id}`);
};

export const addGalleryItemToDb = saveGalleryItemToDb;
export const removeGalleryItemFromDb = deleteGalleryItemFromDb;
