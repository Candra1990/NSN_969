import React, { useState, useRef } from 'react';
import { 
  Film, 
  FileImage, 
  Upload, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Shield, 
  FolderArchive, 
  Users, 
  Copy, 
  ExternalLink,
  Play,
  Pause,
  AlertCircle,
  X,
  Sparkles,
  FastForward
} from 'lucide-react';
import { useMedia } from '@/hooks/useMedia';
import { useStreamers } from '@/hooks/useStreamers';
import { 
  MediaSettings, 
  DEFAULT_MEDIA_SETTINGS, 
  uploadMediaFile, 
  GalleryMediaItem 
} from '@/services/media/mediaService';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { ConfirmModal } from './ConfirmModal';

import { useLanguage } from '@/contexts/LanguageProvider';

type SubTab = 'video' | 'gallery' | 'branding' | 'members' | 'browser';

export function MediaManager() {
  const { language } = useLanguage();
  const isId = language === 'id';
  const { media, updateMedia } = useMedia();
  const { streamers } = useStreamers();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('video');
  const [localSettings, setLocalSettings] = useState<MediaSettings>(media);
  const [loading, setLoading] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);

  // Gallery Edit/Add Modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryMediaItem | null>(null);
  const [galleryFormData, setGalleryFormData] = useState<GalleryMediaItem>({
    id: '',
    src: '',
    title: '',
    tag: 'Community'
  });

  // Lightbox Preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Delete Confirm
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync when media changes
  React.useEffect(() => {
    setLocalSettings(media);
  }, [media]);

  // Save changes to Server & Local
  const handleSaveAll = async (settingsToSave = localSettings) => {
    setLoading(true);
    try {
      await updateMedia(settingsToSave);
      showToast('success', 'Semua pengaturan media berhasil disimpan ke server!');
    } catch (e: any) {
      showToast('error', e?.message || 'Gagal menyimpan media.');
    } finally {
      setLoading(false);
    }
  };

  // Generic File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetCallback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      showToast('info', `Mengunggah file "${file.name}"...`);
      const url = await uploadMediaFile(file);
      targetCallback(url);
      showToast('success', `File "${file.name}" berhasil diunggah!`);
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal mengunggah file.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Copy URL to Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'URL berhasil disalin ke clipboard!');
  };

  // --- Sub-Tab 1: Hero Video ---
  const renderHeroVideoTab = () => {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-500" />
                Hero Cinematic Background Video
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Atur video latar belakang berulang (loop) di halaman utama website.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl text-xs font-bold text-gray-300">
                <input
                  type="checkbox"
                  checked={localSettings.heroVideo.enabled}
                  onChange={e => {
                    const updated = {
                      ...localSettings,
                      heroVideo: { ...localSettings.heroVideo, enabled: e.target.checked }
                    };
                    setLocalSettings(updated);
                    handleSaveAll(updated);
                  }}
                  className="rounded bg-gray-800 border-gray-700 text-amber-500 focus:ring-0"
                />
                <span>Aktifkan Video</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = {
                    ...localSettings,
                    heroVideo: { ...DEFAULT_MEDIA_SETTINGS.heroVideo }
                  };
                  setLocalSettings(updated);
                  handleSaveAll(updated);
                  showToast('info', 'Video direset ke default.');
                }}
                className="px-3.5 py-2 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            </div>
          </div>

          {/* Video Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Judul Media Video
                </label>
                <input
                  type="text"
                  value={localSettings.heroVideo.title}
                  onChange={e => setLocalSettings({
                    ...localSettings,
                    heroVideo: { ...localSettings.heroVideo, title: e.target.value }
                  })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  URL / Path File Video (MP4 / WebM)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings.heroVideo.src}
                    onChange={e => setLocalSettings({
                      ...localSettings,
                      heroVideo: { ...localSettings.heroVideo, src: e.target.value }
                    })}
                    placeholder="/images/Group_posing_in_white_hoodies_20261008231438.mp4 atau https://..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-amber-500 transition-colors"
                  />
                  <label className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-500/20 active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>Upload MP4</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={e => handleFileUpload(e, (url) => {
                        const updated = {
                          ...localSettings,
                          heroVideo: { ...localSettings.heroVideo, src: url }
                        };
                        setLocalSettings(updated);
                        handleSaveAll(updated);
                      })}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Foto Poster Cadangan (Bila Video Loading/Mati)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings.heroVideo.poster}
                    onChange={e => setLocalSettings({
                      ...localSettings,
                      heroVideo: { ...localSettings.heroVideo, poster: e.target.value }
                    })}
                    placeholder="/images/nsn969latar.png"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-amber-500 transition-colors"
                  />
                  <label className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 border border-gray-700">
                    <Upload className="w-4 h-4" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, (url) => {
                        const updated = {
                          ...localSettings,
                          heroVideo: { ...localSettings.heroVideo, poster: url }
                        };
                        setLocalSettings(updated);
                        handleSaveAll(updated);
                      })}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi Video</span>
              </button>
            </div>

            {/* Video Live Preview Box */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Live Preview Player
              </span>
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800 relative shadow-2xl flex items-center justify-center">
                <video
                  key={localSettings.heroVideo.src}
                  src={localSettings.heroVideo.src}
                  poster={localSettings.heroVideo.poster}
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Format yang didukung: MP4, WebM, Direct Link URL, atau file yang diunggah ke server.
              </p>
            </div>
          </div>
        </div>

        {/* Video Opening / Intro Cinematic Card */}
        <div className="p-6 bg-gradient-to-br from-[#0f1422] to-[#111827] border border-amber-500/20 rounded-3xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Video Opening / Intro Cinematic Fullscreen
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Video pembuka cinematic otomatis menutupi seluruh layar saat pengunjung pertama kali membuka website NSN969.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('nsn969:play-intro'));
                  showToast('info', 'Memutar Video Opening...');
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Putar Video Opening</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('nsn969_intro_seen');
                  localStorage.removeItem('nsn969_intro_disabled');
                  showToast('success', 'Status intro telah direset. Intro akan tampil saat web dimuat ulang!');
                }}
                className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Reset sesi agar intro tampil lagi pada kunjungan berikutnya"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sesi Kunjungan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3">
              <span className="font-bold text-amber-400 uppercase tracking-wider block text-[11px]">
                Fitur Video Opening NSN969
              </span>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Autoplay Fullscreen:</strong> Menutupi seluruh layar secara responsif di Desktop & HP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Tombol Skip:</strong> Tombol "Lewati Intro" di pojok kanan bawah dengan animasi fade-in & tombol ESC.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Smooth Fade Out:</strong> Transisi halus saat video selesai sebelum memunculkan aplikasi utama.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1x Per Sesi:</strong> Tersimpan di storage agar tidak mengganggu navigasi berulang pengunjung.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 space-y-3 flex flex-col justify-between">
              <div>
                <span className="font-bold text-gray-300 uppercase tracking-wider block text-[11px] mb-2">
                  File Video Intro Saat Ini
                </span>
                <code className="block p-3 rounded-xl bg-gray-950 border border-gray-800 text-amber-400 font-mono text-xs select-all break-all">
                  /videos/intro.mp4
                </code>
                <p className="text-[11px] text-gray-500 mt-2">
                  Anda dapat mengganti file video intro dengan mengunggah video MP4 Anda sendiri atau meletakkannya di folder <code className="text-gray-400">public/videos/intro.mp4</code>.
                </p>
              </div>

              <div className="pt-2">
                <label className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-gray-700 active:scale-98">
                  <Upload className="w-4 h-4" />
                  <span>Upload Video Intro Baru (MP4)</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    onChange={e => handleFileUpload(e, (url) => {
                      showToast('success', `Video intro baru berhasil diunggah: ${url}`);
                    })}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Sub-Tab 2: Galeri Foto ---
  const renderGalleryTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <FileImage className="w-7 h-7 text-purple-400" />
              Galeri Foto Komunitas ({localSettings.gallery.length} Foto)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Seluruh 15 foto galeri yang sebelumnya ada di folder web kini tersimpan di database admin panel. Anda dapat mengubah, mengunggah foto baru, atau mengganti tautan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingGalleryItem(null);
                setGalleryFormData({
                  id: `gal-${Date.now()}`,
                  src: '',
                  title: '',
                  tag: 'Community'
                });
                setGalleryModalOpen(true);
              }}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto</span>
            </button>

            <button
              onClick={() => {
                const updated = {
                  ...localSettings,
                  gallery: [...DEFAULT_MEDIA_SETTINGS.gallery]
                };
                setLocalSettings(updated);
                handleSaveAll(updated);
                showToast('info', 'Galeri direset ke 15 foto default.');
              }}
              className="px-4 py-3 rounded-2xl border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 15 Foto</span>
            </button>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {localSettings.gallery.map((item, idx) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-xl flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="relative aspect-video bg-black/60 overflow-hidden">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to stylized vector SVG placeholder
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(item.title)}&backgroundColor=0d0e12`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setPreviewUrl(item.src);
                      setPreviewTitle(item.title);
                    }}
                    className="p-2.5 bg-black/70 hover:bg-black text-white rounded-xl transition-colors cursor-pointer"
                    title="Lihat Pratinjau Fullscreen"
                  >
                    <Eye className="w-4 h-4 text-purple-400" />
                  </button>
                  <label
                    className="p-2.5 bg-black/70 hover:bg-black text-white rounded-xl transition-colors cursor-pointer"
                    title="Ganti / Upload Foto Ini"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, (url) => {
                        const nextGallery = localSettings.gallery.map(g => g.id === item.id ? { ...g, src: url } : g);
                        const updated = { ...localSettings, gallery: nextGallery };
                        setLocalSettings(updated);
                        handleSaveAll(updated);
                      })}
                    />
                  </label>
                </div>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-purple-300 text-[9px] font-mono font-bold uppercase tracking-wider border border-purple-500/30">
                  #{idx + 1} {item.tag}
                </span>
              </div>

              <div className="p-3.5 bg-gray-900/90 flex items-center justify-between gap-2 border-t border-gray-800/80">
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-white text-xs truncate tracking-wide">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 font-mono truncate">{item.src}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingGalleryItem(item);
                      setGalleryFormData({ ...item });
                      setGalleryModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Data"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingGalleryId(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-Tab 3: Branding & Logo ---
  const renderBrandingTab = () => {
    const brandAssets = [
      {
        key: 'mainLogo' as keyof typeof localSettings.logos,
        label: 'Logo Utama NSN969',
        desc: 'Muncul di header navbar, obrolan komunitas, dan identitas resmi.',
        value: localSettings.logos.mainLogo,
        defaultVal: DEFAULT_MEDIA_SETTINGS.logos.mainLogo,
        aspect: 'aspect-square max-w-[120px]'
      },
      {
        key: 'tiktokLogo' as keyof typeof localSettings.logos,
        label: 'Logo Khusus TikTok',
        desc: 'Ikon platform TikTok resmi di multiview selector.',
        value: localSettings.logos.tiktokLogo,
        defaultVal: DEFAULT_MEDIA_SETTINGS.logos.tiktokLogo,
        aspect: 'aspect-square max-w-[120px]'
      },
      {
        key: 'heroBackground' as keyof typeof localSettings.logos,
        label: 'Latar Belakang / Banner Utama (Latar)',
        desc: 'Poster cover dan backdrop hero website.',
        value: localSettings.logos.heroBackground,
        defaultVal: DEFAULT_MEDIA_SETTINGS.logos.heroBackground,
        aspect: 'aspect-video max-w-[240px]'
      },
      {
        key: 'crewBanner' as keyof typeof localSettings.logos,
        label: 'Foto Seluruh Anggota (All Members)',
        desc: 'Visual foto beramai-ramai keluarga besar NSN969.',
        value: localSettings.logos.crewBanner,
        defaultVal: DEFAULT_MEDIA_SETTINGS.logos.crewBanner,
        aspect: 'aspect-video max-w-[240px]'
      }
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-500" />
            Logo & Visual Identitas Resmi
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Kelola logo, poster latar, dan visual branding website langsung dari Admin Panel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brandAssets.map(asset => (
            <div
              key={asset.key}
              className="p-6 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-extrabold text-white">{asset.label}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{asset.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...localSettings,
                        logos: { ...localSettings.logos, [asset.key]: asset.defaultVal }
                      };
                      setLocalSettings(updated);
                      handleSaveAll(updated);
                      showToast('info', `${asset.label} direset ke default.`);
                    }}
                    className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Reset Default"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview Box */}
                <div className="w-full flex items-center justify-center p-4 bg-black/60 border border-gray-800 rounded-2xl min-h-[140px]">
                  <img
                    src={asset.value}
                    alt={asset.label}
                    className={`object-contain max-h-[120px] rounded-lg shadow-md ${asset.aspect}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(asset.key)}&backgroundColor=0d0e12`;
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    URL / Path File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={asset.value}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        logos: { ...localSettings.logos, [asset.key]: e.target.value }
                      })}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-amber-500 transition-colors"
                    />
                    <label className="px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, (url) => {
                          const updated = {
                            ...localSettings,
                            logos: { ...localSettings.logos, [asset.key]: url }
                          };
                          setLocalSettings(updated);
                          handleSaveAll(updated);
                        })}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={loading}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-amber-500" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Sub-Tab 4: Foto Profil Member ---
  const renderMembersTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            Foto Profil & Avatar Anggota ({streamers.length} Anggota)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Ubah atau unggah foto khusus untuk masing-masing streamer NSN969.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {streamers.map(str => {
            const currentAvatar = localSettings.memberAvatars[str.id] || str.photoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(str.name)}&backgroundColor=0d0e12`;

            return (
              <div
                key={str.id}
                className="p-4 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black overflow-hidden border border-gray-700 shrink-0">
                    <img
                      src={currentAvatar}
                      alt={str.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(str.name)}&backgroundColor=0d0e12`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-white text-xs truncate uppercase tracking-wider">{str.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{str.platform}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="URL Foto..."
                      value={localSettings.memberAvatars[str.id] || ''}
                      onChange={e => setLocalSettings({
                        ...localSettings,
                        memberAvatars: { ...localSettings.memberAvatars, [str.id]: e.target.value }
                      })}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none focus:border-blue-500 font-mono"
                    />
                    <label className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer shrink-0" title="Upload Foto Baru">
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileUpload(e, (url) => {
                          const updated = {
                            ...localSettings,
                            memberAvatars: { ...localSettings.memberAvatars, [str.id]: url }
                          };
                          setLocalSettings(updated);
                          handleSaveAll(updated);
                        })}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Sub-Tab 5: File & Asset Browser ---
  const renderBrowserTab = () => {
    const allFiles = [
      { name: 'Group_posing_in_white_hoodies_20261008231438.mp4', type: 'Video Hero MP4', src: localSettings.heroVideo.src, category: 'Hero Cinematic Video' },
      { name: 'nsn969logo.png', type: 'Logo Utama', src: localSettings.logos.mainLogo, category: 'Branding Logo' },
      { name: 'tiktok_custom_logo.jpg', type: 'Logo TikTok', src: localSettings.logos.tiktokLogo, category: 'Social Logo' },
      { name: 'nsn969latar.png', type: 'Poster / Latar', src: localSettings.logos.heroBackground, category: 'Hero Backdrop' },
      { name: 'nsn969_all_members.jpg', type: 'Crew Banner', src: localSettings.logos.crewBanner, category: 'Community Poster' },
      ...localSettings.gallery.map(g => ({
        name: `${g.id} - ${g.title}`,
        type: 'Galeri Foto',
        src: g.src,
        category: `Galeri (${g.tag})`
      }))
    ];

    return (
      <div className="space-y-6">
        {/* Notice Info Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-800/40 text-emerald-200 flex items-start gap-3.5 shadow-xl">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-white text-sm">
              Semua File Foto & Video Telah Dipindahkan ke Admin Panel
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Seluruh media telah diarsipkan dan dikelola melalui konfigurasi server & database. Anda dapat dengan aman menghapus/mengosongkan file foto dan video dari dalam folder fisik web tanpa membuat tampilan website rusak!
            </p>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/80 border-b border-gray-800 text-gray-400 uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama File / Media</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Tipe Media</th>
                  <th className="py-3.5 px-4">Path / URL</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {allFiles.map((f, i) => (
                  <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <FolderArchive className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[220px]">{f.name}</span>
                    </td>
                    <td className="py-3 px-4 text-purple-400">{f.category}</td>
                    <td className="py-3 px-4 text-gray-400">{f.type}</td>
                    <td className="py-3 px-4 text-gray-400 truncate max-w-[280px]">{f.src}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copyToClipboard(f.src)}
                          className="p-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          title="Salin URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPreviewUrl(f.src);
                            setPreviewTitle(f.name);
                          }}
                          className="p-1.5 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Pratinjau"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Film className="w-8 h-8 text-amber-500" />
            Pusat Media & Manajemen File (Foto & Video)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Kelola seluruh file video hero, 15+ galeri foto, logo identitas, dan avatar anggota.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan...' : 'Simpan Semua Media'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-800/80 custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('video')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'video'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Hero Video Banner</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'gallery'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <FileImage className="w-3.5 h-3.5" />
          <span>{isId ? 'Galeri Foto' : 'Photo Gallery'} ({localSettings.gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'branding'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isId ? 'Logo & Branding' : 'Logos & Branding'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'members'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{isId ? 'Foto Profil Member' : 'Member Profiles'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('browser')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'browser'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>{isId ? 'Daftar File Web' : 'Web Asset Browser'}</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeSubTab === 'video' && renderHeroVideoTab()}
      {activeSubTab === 'gallery' && renderGalleryTab()}
      {activeSubTab === 'branding' && renderBrandingTab()}
      {activeSubTab === 'members' && renderMembersTab()}
      {activeSubTab === 'browser' && renderBrowserTab()}

      {/* Gallery Add / Edit Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <FileImage className="w-5 h-5 text-purple-400" />
                {editingGalleryItem ? 'Edit Foto Galeri' : 'Tambah Foto Galeri Baru'}
              </h3>
              <button
                onClick={() => setGalleryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!galleryFormData.title.trim()) {
                  showToast('error', 'Judul foto wajib diisi.');
                  return;
                }
                if (!galleryFormData.src.trim()) {
                  showToast('error', 'URL/Path foto wajib diisi.');
                  return;
                }

                let nextGallery = [...localSettings.gallery];
                if (editingGalleryItem) {
                  nextGallery = nextGallery.map(g => g.id === editingGalleryItem.id ? { ...galleryFormData } : g);
                } else {
                  nextGallery.push({ ...galleryFormData, id: `gal-${Date.now()}` });
                }

                const updated = { ...localSettings, gallery: nextGallery };
                setLocalSettings(updated);
                handleSaveAll(updated);
                setGalleryModalOpen(false);
                showToast('success', 'Foto galeri berhasil disimpan!');
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Judul Foto *</label>
                <input
                  type="text"
                  required
                  value={galleryFormData.title}
                  onChange={e => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                  placeholder="NSN SQUAD CHAMPIONS"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tag Kategori</label>
                <input
                  type="text"
                  value={galleryFormData.tag}
                  onChange={e => setGalleryFormData({ ...galleryFormData, tag: e.target.value })}
                  placeholder="Community / Roleplay / Tournament"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">URL / Path Foto *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={galleryFormData.src}
                    onChange={e => setGalleryFormData({ ...galleryFormData, src: e.target.value })}
                    placeholder="/Gallery/gallery1.png atau https://..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-purple-500"
                  />
                  <label className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleFileUpload(e, (url) => setGalleryFormData(prev => ({ ...prev, src: url })))}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 font-bold text-xs uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase shadow-lg shadow-purple-600/20"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{previewTitle || 'Pratinjau Media'}</h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-gray-800">
              {previewUrl.endsWith('.mp4') || previewUrl.endsWith('.webm') ? (
                <video src={previewUrl} controls autoPlay className="max-w-full max-h-[65vh]" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[65vh] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={Boolean(deletingGalleryId)}
        title="Hapus Foto Galeri?"
        message="Apakah Anda yakin ingin menghapus foto galeri ini?"
        confirmText="Hapus Foto"
        isDanger={true}
        loading={loading}
        onConfirm={() => {
          if (!deletingGalleryId) return;
          const nextGallery = localSettings.gallery.filter(g => g.id !== deletingGalleryId);
          const updated = { ...localSettings, gallery: nextGallery };
          setLocalSettings(updated);
          handleSaveAll(updated);
          setDeletingGalleryId(null);
          showToast('success', 'Foto galeri berhasil dihapus.');
        }}
        onCancel={() => setDeletingGalleryId(null)}
      />
    </div>
  );
}
