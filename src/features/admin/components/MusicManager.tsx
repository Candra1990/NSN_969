import React, { useState, useRef } from 'react';
import { 
  Music, 
  Plus, 
  Play, 
  Pause, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ExternalLink 
} from 'lucide-react';
import type { Backsound } from '@/types';
import { saveTrackToDb, deleteTrackFromDb } from '@/services/tracks/trackService';
import { ConfirmModal } from './ConfirmModal';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

interface MusicManagerProps {
  tracks: Backsound[];
  onRefresh?: () => void;
}

export function MusicManager({ tracks, onRefresh }: MusicManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Audio Preview Player state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Backsound | null>(null);
  const [formData, setFormData] = useState<Partial<Backsound>>({
    title: '',
    artist: '',
    url: ''
  });

  // Confirm Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>('');

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePlayPreview = (track: Backsound) => {
    const targetUrl = track.url || track.audioUrl;
    if (!targetUrl) {
      showToast('error', 'URL audio tidak tersedia.');
      return;
    }

    if (playingTrackId === track.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(targetUrl);
      audioRef.current = audio;
      audio.play().catch(err => {
        showToast('error', 'Gagal memutar audio preview.');
      });
      setPlayingTrackId(track.id);

      audio.onended = () => {
        setPlayingTrackId(null);
      };
    }
  };

  const handleOpenAdd = () => {
    setEditingTrack(null);
    setFormData({
      id: `track-${Date.now()}`,
      title: '',
      artist: '',
      url: '/music/nsn969music.mp3'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track: Backsound) => {
    setEditingTrack(track);
    setFormData({
      id: track.id,
      title: track.title,
      artist: track.artist || '',
      url: track.url || track.audioUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast('error', 'Judul lagu wajib diisi.');
      return;
    }
    if (!formData.url?.trim()) {
      showToast('error', 'URL audio wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload: Backsound = {
        id: formData.id || `track-${Date.now()}`,
        title: formData.title.trim(),
        artist: formData.artist?.trim() || 'NSN969 Artist',
        url: formData.url.trim(),
        audioUrl: formData.url.trim()
      };

      await saveTrackToDb(payload);
      showToast('success', `Lagu "${payload.title}" berhasil disimpan.`);
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan lagu.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      if (playingTrackId === deletingId && audioRef.current) {
        audioRef.current.pause();
        setPlayingTrackId(null);
      }
      await deleteTrackFromDb(deletingId);
      showToast('success', `Lagu "${deletingTitle}" telah dihapus.`);
      setDeletingId(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menghapus lagu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Music className="w-8 h-8 text-emerald-400" />
            {isId ? 'Pustaka Musik & Suara Latar' : 'Audio & Backsound Library'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isId 
              ? `Kelola ${tracks.length} trek audio backsound dan pemutar musik global website.`
              : `Manage ${tracks.length} background audio tracks and website music player.`}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{isId ? 'Tambah Lagu Baru' : 'Add New Track'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-[#111827] border border-[#1F2937] rounded-3xl shadow-xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isId ? "Cari judul lagu atau nama artis..." : "Search track title or artist name..."}
            className="w-full bg-gray-900/60 border border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Track List */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl">
        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Music className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-base font-bold text-gray-300">Tidak ada trek audio yang ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTracks.map(t => {
              const isPlaying = playingTrackId === t.id;
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPlaying
                      ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlayPreview(t)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isPlaying
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 animate-pulse'
                          : 'bg-gray-800 text-emerald-400 hover:bg-gray-700'
                      }`}
                      title={isPlaying ? 'Pause Audio' : 'Play Audio Preview'}
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                    </button>

                    <div>
                      <h4 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                        {t.title}
                        {isPlaying && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold border border-emerald-500/30 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 animate-bounce" /> PLAYING
                          </span>
                        )}
                      </h4>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">
                        Artis: <strong className="text-gray-300">{t.artist || 'NSN969'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 font-mono text-xs">
                    <span className="text-gray-500 truncate max-w-[200px] text-[11px] hidden lg:block" title={t.url || t.audioUrl}>
                      {t.url || t.audioUrl}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                        title="Edit Track"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(t.id);
                          setDeletingTitle(t.title);
                        }}
                        className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Track Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <Music className="w-5 h-5 text-emerald-400" />
                {editingTrack ? 'Edit Track Audio' : 'Tambah Track Audio Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Judul Lagu *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="NSN969 SIAP TEMPUR"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nama Artis</label>
                <input
                  type="text"
                  value={formData.artist || ''}
                  onChange={e => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Analist Magang / Donz"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">URL File Audio (.mp3 / stream) *</label>
                <input
                  type="text"
                  required
                  value={formData.url || ''}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/music/nsn969music.mp3 atau https://..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Hapus Lagu Audio?"
        message={`Apakah Anda yakin ingin menghapus lagu "${deletingTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Lagu"
        isDanger={true}
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
