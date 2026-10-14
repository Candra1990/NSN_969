import { useState, useEffect } from 'react';
import { 
  MediaSettings, 
  DEFAULT_MEDIA_SETTINGS, 
  getLocalMediaSettings, 
  fetchMediaSettings, 
  saveMediaSettingsToApi 
} from '@/services/media/mediaService';

export function useMedia() {
  const [media, setMedia] = useState<MediaSettings>(getLocalMediaSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchMediaSettings().then(data => {
      if (mounted && data) {
        setMedia(data);
      }
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MediaSettings>;
      if (customEvent.detail) {
        setMedia(customEvent.detail);
      }
    };

    window.addEventListener('nsn-media-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('nsn-media-updated', handleUpdate);
    };
  }, []);

  const updateMedia = async (newSettings: MediaSettings) => {
    setLoading(true);
    try {
      setMedia(newSettings);
      await saveMediaSettingsToApi(newSettings);
    } finally {
      setLoading(false);
    }
  };

  return {
    media,
    loading,
    updateMedia,
    heroVideo: media.heroVideo,
    logos: media.logos,
    gallery: media.gallery,
    memberAvatars: media.memberAvatars
  };
}
