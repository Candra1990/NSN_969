import { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseProvider';
import type { GalleryItem } from '@/types';
import { FULL_CURATED_GALLERY } from '@/constants/gallery';
import { getLocalMediaSettings, MediaSettings } from '@/services/media/mediaService';

export function useGallery() {
  const { gallery: fbGallery } = useFirebase();
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const local = getLocalMediaSettings();
    if (local && local.gallery && local.gallery.length >= 5) {
      return local.gallery;
    }
    if (fbGallery && Array.isArray(fbGallery) && fbGallery.length >= 5) {
      const valid = fbGallery.filter(g => g && g.src && typeof g.src === 'string' && g.src.trim().length > 3);
      if (valid.length >= 5) return valid;
    }
    return FULL_CURATED_GALLERY;
  });

  useEffect(() => {
    const handleMediaUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MediaSettings>;
      if (customEvent.detail && customEvent.detail.gallery && customEvent.detail.gallery.length > 0) {
        setGallery(customEvent.detail.gallery);
      }
    };
    window.addEventListener('nsn-media-updated', handleMediaUpdate);
    return () => window.removeEventListener('nsn-media-updated', handleMediaUpdate);
  }, []);

  useEffect(() => {
    if (fbGallery && Array.isArray(fbGallery) && fbGallery.length > 0) {
      const valid = fbGallery.filter(g => g && g.src && typeof g.src === 'string' && g.src.trim().length > 3);
      if (valid.length >= 5) {
        setGallery(valid);
      } else if (valid.length > 0) {
        const existing = new Set(valid.map(v => v.src));
        setGallery([...valid, ...FULL_CURATED_GALLERY.filter(c => !existing.has(c.src))]);
      } else {
        setGallery(FULL_CURATED_GALLERY);
      }
    }
  }, [fbGallery]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/gallery')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch gallery');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.gallery && Array.isArray(data.gallery) && data.gallery.length > 0) {
          const valid = data.gallery.filter((g: any) => g && g.src && typeof g.src === 'string' && g.src.trim().length > 3);
          if (valid.length >= 5) {
            setGallery(valid);
          }
        }
      })
      .catch(() => {
        // Fallback to existing gallery
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { gallery };
}
