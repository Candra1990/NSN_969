import React, { useState } from 'react';
import { 
  FileImage, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Eye, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';
import type { GalleryItem } from '@/types';
import { saveGalleryItemToDb, deleteGalleryItemFromDb } from '@/services/gallery/galleryService';
import { ConfirmModal } from './ConfirmModal';
import { ToastNotif, ToastMessage } from './ToastNotif';

interface GalleryManagerProps {
  gallery: GalleryItem[];
  onRefresh?: () => void;
}

export function GalleryManager({ gallery, onRefresh }: GalleryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Lightbox Preview Image Modal
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    tag: 'Community',
    src: ''
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

  const filteredGallery = gallery.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      id: `gal-${Date.now()}`,
      title: '',
      tag: 'Community',
      src: '/Gallery/gallery1.png'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      title: item.title,
      tag: item.tag || 'Community',
      src: item.src
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast('error', 'Judul gambar wajib diisi.');
      return;
    }
    if (!formData.src?.trim()) {
      showToast('error', 'URL/Path gambar wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload: GalleryItem = {
        id: formData.id || `gal-${Date.now()}`,
        title: formData.title.trim(),
        tag: formData.tag?.trim() || 'Community',
        src: formData.src.trim()
      };

      await saveGalleryItemToDb(payload);
      showToast('success', `Visual asset "${payload.title}" berhasil disimpan.`);
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan gambar.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await deleteGalleryItemFromDb(deletingId);
      showToast('success', `Gambar "${deletingTitle}" telah dihapus.`);
      setDeletingId(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menghapus gambar.');
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
            <FileImage className="w-8 h-8 text-purple-400" />
            Gallery & Visual Assets
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Kelola {gallery.length} foto galeri, poster komunitas, dan visual banner NSN969.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Gambar</span>
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
            placeholder="Cari judul gambar atau tag..."
            className="w-full bg-gray-900/60 border border-gray-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl">
        {filteredGallery.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-base font-bold text-gray-300">Tidak ada gambar yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGallery.map(g => (
              <div
                key={g.id}
                className="group relative rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-lg flex flex-col justify-between hover:border-purple-500/50 transition-all"
              >
                {/* Image Aspect Box */}
                <div className="w-full aspect-video bg-black/60 relative overflow-hidden">
                  <img
                    src={g.src}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewImage(g)}
                      className="p-2.5 bg-black/70 hover:bg-black text-white rounded-xl transition-colors cursor-pointer"
                      title="Lihat Full HD"
                    >
                      <Eye className="w-5 h-5 text-purple-400" />
                    </button>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-purple-500/30 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {g.tag}
                  </span>
                </div>

                {/* Footer Description */}
                <div className="p-4 flex items-center justify-between gap-2 bg-gray-900/90">
                  <h4 className="font-extrabold text-white text-xs truncate tracking-wide">{g.title}</h4>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Visual"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(g.id);
                        setDeletingTitle(g.title);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Visual"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{previewImage.title}</h3>
                <p className="text-xs font-mono text-purple-400">Tag: {previewImage.tag}</p>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-gray-800">
              <img src={previewImage.src} alt={previewImage.title} className="max-w-full max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111827] border border-[#1F2937] rounded-3xl p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                <FileImage className="w-5 h-5 text-purple-400" />
                {editingItem ? 'Edit Visual Asset' : 'Tambah Gambar Baru'}
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
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Judul Gambar *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="NSN SQUAD CHAMPIONS"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tag Kategori</label>
                <input
                  type="text"
                  value={formData.tag || ''}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Community / Team Match / Tournament"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">URL / Path File Gambar *</label>
                <input
                  type="text"
                  required
                  value={formData.src || ''}
                  onChange={e => setFormData({ ...formData, src: e.target.value })}
                  placeholder="/Gallery/gallery1.png atau https://..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-purple-500 transition-colors"
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
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Visual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="Hapus Gambar Visual?"
        message={`Apakah Anda yakin ingin menghapus gambar "${deletingTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Gambar"
        isDanger={true}
        loading={loading}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
