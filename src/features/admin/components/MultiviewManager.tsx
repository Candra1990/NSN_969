import React, { useState } from 'react';
import { Radio, Play, Star, Copy, ExternalLink, Check, Eye } from 'lucide-react';
import type { Streamer } from '@/types';
import { saveStreamerToDb } from '@/services/streamers/streamerService';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

interface MultiviewManagerProps {
  streamers: Streamer[];
  onRefresh?: () => void;
}

export function MultiviewManager({ streamers, onRefresh }: MultiviewManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [previewStream, setPreviewStream] = useState<Streamer | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredStreamers = streamers.filter(s => {
    if (selectedPlatform === 'all') return true;
    return s.platform === selectedPlatform;
  });

  const toggleFeaturedMultiview = async (streamer: Streamer) => {
    try {
      const updated: Streamer = {
        ...streamer,
        isFeatured: !streamer.isFeatured
      };
      await saveStreamerToDb(updated);
      showToast('success', isId 
        ? `${streamer.name} ${updated.isFeatured ? 'ditambahkan ke' : 'dihapus dari'} Multiview Grid.`
        : `${streamer.name} ${updated.isFeatured ? 'added to' : 'removed from'} Multiview Grid.`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', isId ? 'Gagal memperbarui status Multiview.' : 'Failed to update Multiview status.');
    }
  };

  const handleCopyLink = (streamer: Streamer) => {
    const url = streamer.platform === 'youtube'
      ? `https://www.youtube.com/embed/live_stream?channel=${streamer.channelId}`
      : `https://tiktok.com/@${streamer.tiktokId || streamer.channelId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(streamer.id);
    showToast('info', isId ? 'Link embed disalin ke clipboard!' : 'Embed link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Radio className="w-8 h-8 text-amber-500" />
          {isId ? 'Kontrol Tata Letak Multiview' : 'Multiview Grid Control'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isId 
            ? 'Kelola streamer dan channel yang aktif di halaman Multiview Grid (/multiview).'
            : 'Manage active streamers and channels on the Multiview Grid page (/multiview).'}
        </p>
      </div>

      {/* Platform Tabs & Stats */}
      <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'youtube', 'tiktok'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {p === 'all' ? (isId ? 'Semua Platform' : 'All Platforms') : p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold text-gray-300 bg-gray-900/60 px-4 py-2.5 rounded-2xl border border-gray-800">
          <span>
            {isId ? 'Multiview Aktif:' : 'Multiview Active:'} <strong className="text-amber-400">{streamers.filter(s => s.isFeatured).length}</strong> / {streamers.length}
          </span>
        </div>
      </div>

      {/* Grid Source Cards */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStreamers.map(s => {
            const isMultiviewActive = s.isFeatured;
            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isMultiviewActive
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-gray-900/40 border-gray-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center font-black text-amber-500">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm tracking-wide">{s.name}</h4>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                        {s.platform} • {s.channelId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFeaturedMultiview(s)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isMultiviewActive
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-gray-800 text-gray-500 hover:text-white'
                    }`}
                    title={isMultiviewActive ? 'Aktif di Multiview' : 'Aktifkan di Multiview'}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                  <button
                    onClick={() => setPreviewStream(s)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview Live</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(s)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                    title="Copy Embed URL"
                  >
                    {copiedId === s.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embed Live Stream Modal Preview */}
      {previewStream && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{previewStream.name} - Live Stream Preview</h3>
                <p className="text-xs text-gray-400 font-mono">Platform: {previewStream.platform} | Channel: {previewStream.channelId}</p>
              </div>
              <button
                onClick={() => setPreviewStream(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl bg-black border border-gray-800 overflow-hidden relative">
              {previewStream.platform === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/live_stream?channel=${previewStream.channelId}&autoplay=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Live Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Play className="w-12 h-12 text-amber-500" />
                  <p className="text-sm font-bold text-gray-300">
                    Sistem iFrame TikTok memerlukan tab terpisah atau aplikasi seluler.
                  </p>
                  <a
                    href={`https://tiktok.com/@${previewStream.tiktokId || previewStream.channelId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
                  >
                    Buka TikTok Direct <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
