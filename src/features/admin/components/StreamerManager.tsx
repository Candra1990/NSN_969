import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Shield,
  Star,
  RefreshCw
} from 'lucide-react';
import type { Streamer } from '@/types';
import { saveStreamerToDb, deleteStreamerFromDb } from '@/services/streamers/streamerService';
import { ConfirmModal } from './ConfirmModal';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

interface StreamerManagerProps {
  streamers: Streamer[];
  onRefresh?: () => void;
}

export function StreamerManager({ streamers, onRefresh }: StreamerManagerProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Modal / Drawer state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);

  // Form inputs
  const [formData, setFormData] = useState<Partial<Streamer>>({
    name: '',
    platform: 'youtube',
    channelId: '',
    youtubeId: '',
    tiktokId: '',
    photoUrl: '',
    category: 'NSN Community Stream',
    isFeatured: true,
  });

  // Delete Confirmation Modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(streamers.map(s => s.category || 'NSN Community Stream')))];

  // Filtered streamers
  const filteredStreamers = streamers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.channelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.youtubeId && s.youtubeId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || (s.category || 'NSN Community Stream') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingStreamer(null);
    setFormData({
      id: `str-${Date.now()}`,
      name: '',
      platform: 'youtube',
      channelId: '',
      youtubeId: '',
      tiktokId: '',
      photoUrl: '',
      category: 'NSN Community Stream',
      isFeatured: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Streamer) => {
    setEditingStreamer(s);
    setFormData({
      id: s.id,
      name: s.name,
      platform: s.platform,
      channelId: s.channelId,
      youtubeId: s.youtubeId || '',
      tiktokId: s.tiktokId || '',
      photoUrl: s.photoUrl || '',
      category: s.category || 'NSN Community Stream',
      isFeatured: !!s.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('error', 'Nama streamer wajib diisi.');
      return;
    }
    if (!formData.channelId?.trim() && !formData.youtubeId?.trim()) {
      showToast('error', 'Channel ID / Youtube ID wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload: Streamer = {
        id: formData.id || `str-${Date.now()}`,
        name: formData.name.trim(),
        platform: formData.platform || 'youtube',
        channelId: formData.channelId?.trim() || formData.youtubeId?.trim() || '',
        youtubeId: formData.youtubeId?.trim() || formData.channelId?.trim() || '',
        tiktokId: formData.tiktokId?.trim() || '',
        photoUrl: formData.photoUrl?.trim() || '',
        category: formData.category?.trim() || 'NSN Community Stream',
        isFeatured: !!formData.isFeatured,
      };

      await saveStreamerToDb(payload);
      showToast('success', `Streamer ${payload.name} berhasil disimpan!`);
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan streamer.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await deleteStreamerFromDb(deletingId);
      showToast('success', `Streamer ${deletingName} telah dihapus.`);
      setDeletingId(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menghapus streamer.');
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
            <Users className="w-8 h-8 text-amber-500" />
            {isId ? 'Manajemen Streamer' : 'Streamer Management'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isId 
              ? `Kelola ${streamers.length} streamer resmi NSN969, update ID channel, foto, dan kategori.`
              : `Manage ${streamers.length} official NSN969 streamers, update channel IDs, photos, and categories.`}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>{isId ? 'Tambah Streamer' : 'Add Streamer'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#111827] border border-[#1F2937] rounded-3xl flex flex-col md:flex-row items-center gap-4 shadow-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={isId ? "Cari nama streamer, channel ID..." : "Search streamer name, channel ID..."}
            className="w-full bg-gray-900/60 border border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider shrink-0 px-2">
            {isId ? 'Kategori:' : 'Category:'}
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black shadow-md font-extrabold'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Streamers Directory Grid */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl">
        {filteredStreamers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-base font-bold text-gray-300">
              {isId ? 'Tidak ada streamer yang ditemukan' : 'No streamers found'}
            </p>
            <p className="text-xs text-gray-500">
              {isId ? 'Coba ubah kata kunci pencarian atau tambah streamer baru.' : 'Try changing your search keywords or add a new streamer.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStreamers.map(s => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center font-black text-amber-500 text-lg">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        s.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-base tracking-wide group-hover:text-amber-400 transition-colors">
                          {s.name}
                        </h4>
                        {s.isFeatured && (
                          <span className="p-1 bg-amber-500/10 text-amber-400 rounded-lg" title="Featured Multiview">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block mt-0.5">
                        {s.platform} • {s.category || 'NSN Community'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                      title="Edit Streamer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(s.id);
                        setDeletingName(s.name);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Streamer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80 font-mono text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Channel ID:</span>
                    <span className="text-gray-200 font-bold truncate max-w-[180px]">{s.channelId}</span>
                  </div>
                  {s.youtubeId && s.youtubeId !== s.channelId && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">YouTube ID:</span>
                      <span className="text-gray-300 truncate max-w-[180px]">{s.youtubeId}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <a
                    href={s.platform === 'youtube' ? `https://youtube.com/channel/${s.channelId}` : `https://tiktok.com/@${s.tiktokId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    Kunjungi Live Channel <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Add Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                {editingStreamer ? 'Edit Data Streamer' : 'Tambah Streamer Baru'}
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
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nama Streamer *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: KAEL BLAKE"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Platform *</label>
                  <select
                    value={formData.platform || 'youtube'}
                    onChange={e => setFormData({ ...formData, platform: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitch">Twitch</option>
                    <option value="facebook">Facebook</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Kategori</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="NSN Community Stream"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Channel ID / Handle *</label>
                <input
                  type="text"
                  required
                  value={formData.channelId || ''}
                  onChange={e => setFormData({ ...formData, channelId: e.target.value })}
                  placeholder="UCsUhlZAanKWUsZxqbPbjAOw"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">YouTube ID (Opsional)</label>
                  <input
                    type="text"
                    value={formData.youtubeId || ''}
                    onChange={e => setFormData({ ...formData, youtubeId: e.target.value })}
                    placeholder="Sama dengan channel ID jika YouTube"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">TikTok ID (Opsional)</label>
                  <input
                    type="text"
                    value={formData.tiktokId || ''}
                    onChange={e => setFormData({ ...formData, tiktokId: e.target.value })}
                    placeholder="@username"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Foto Avatar URL</label>
                <input
                  type="url"
                  value={formData.photoUrl || ''}
                  onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <input
                    type="checkbox"
                    checked={!!formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-sm font-bold text-white">
                    Tampilkan di Multiview Grid & Featured List
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading 
                    ? (isId ? 'Menyimpan...' : 'Saving...') 
                    : (isId ? 'Simpan Streamer' : 'Save Streamer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title={isId ? "Hapus Streamer?" : "Delete Streamer?"}
        message={isId 
          ? `Apakah Anda yakin ingin menghapus streamer "${deletingName}"? Tindakan ini tidak dapat dibatalkan.`
          : `Are you sure you want to delete streamer "${deletingName}"? This action cannot be undone.`}
        confirmText={isId ? "Hapus Streamer" : "Delete Streamer"}
        cancelText={isId ? "Batal" : "Cancel"}
        isDanger={true}
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
