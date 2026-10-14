import React, { useState, useEffect } from 'react';
import { Megaphone, Save, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { subscribeSystemConfig, saveSystemConfig } from '@/services/admin/adminService';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

export function SystemSettings() {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [alertTextId, setAlertTextId] = useState('');
  const [alertTextEn, setAlertTextEn] = useState('');
  const [alertActive, setAlertActive] = useState(false);
  const [maintActive, setMaintActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const unsub = subscribeSystemConfig((d) => {
      setAlertTextId(d.announcement_id || '');
      setAlertTextEn(d.announcement_en || '');
      setAlertActive(!!d.announcementActive);
      setMaintActive(!!d.maintenanceMode);
    });
    return () => unsub();
  }, []);

  const handleSaveGlobalAdminSettings = async () => {
    setLoading(true);
    try {
      await saveSystemConfig({
        announcement_id: alertTextId,
        announcement_en: alertTextEn,
        announcementActive: alertActive,
        maintenanceMode: maintActive
      });
      showToast('success', isId 
        ? 'Pengaturan pengumuman & lockdown berhasil disimpan ke Supabase!' 
        : 'Announcement & lockdown configurations saved to Supabase!');
    } catch (err: any) {
      showToast('error', isId ? 'Gagal menyimpan konfigurasi.' : 'Failed to save configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-amber-500" />
          {isId ? 'Pengumuman & Mode Pemeliharaan' : 'Announcements & Lockdown'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isId 
            ? 'Kelola banner pengumuman global dan mode pemeliharaan (Maintenance Lockdown).' 
            : 'Manage global announcement banners and maintenance lockdown mode.'}
        </p>
      </div>

      {/* Live Preview Box */}
      {alertActive && (alertTextId || alertTextEn) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Live Banner Preview (Apa yang Dilihat Pengunjung)
          </div>
          <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white font-bold text-sm tracking-wide p-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-3 border border-white/20">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <p className="truncate uppercase font-sans">
              {alertTextId || alertTextEn}
            </p>
          </div>
        </div>
      )}

      {/* Maintenance Alert Box if active */}
      {maintActive && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <strong>MAINTENANCE MODE IS ACTIVE!</strong> Akses publik website akan dibatasi hanya untuk pemeliharaan sistem.
          </div>
        </div>
      )}

      <div className="p-8 rounded-3xl border border-[#1F2937] bg-[#111827] shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-3">
              Announcement Text (Bahasa Indonesia)
            </label>
            <textarea
              value={alertTextId}
              onChange={(e) => setAlertTextId(e.target.value)}
              className="w-full p-4 text-sm rounded-2xl border border-gray-700 bg-gray-900/80 text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-all shadow-inner"
              rows={4}
              placeholder="Pengumuman dalam Bahasa Indonesia..."
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-300 uppercase tracking-wider mb-3">
              Announcement Text (English)
            </label>
            <textarea
              value={alertTextEn}
              onChange={(e) => setAlertTextEn(e.target.value)}
              className="w-full p-4 text-sm rounded-2xl border border-gray-700 bg-gray-900/80 text-white placeholder-gray-500 outline-none focus:border-amber-500 transition-all shadow-inner"
              rows={4}
              placeholder="Announcement in English..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/40 rounded-2xl border border-gray-800">
          <label className="flex items-center gap-4 text-sm font-bold text-white cursor-pointer hover:text-amber-400 transition-colors">
            <input
              type="checkbox"
              checked={alertActive}
              onChange={e => setAlertActive(e.target.checked)}
              className="w-6 h-6 accent-amber-500 rounded cursor-pointer"
            />
            <span>Tampilkan Banner Pengumuman Global</span>
          </label>

          <label className="flex items-center gap-4 text-sm font-bold text-white cursor-pointer hover:text-red-400 transition-colors">
            <input
              type="checkbox"
              checked={maintActive}
              onChange={e => setMaintActive(e.target.checked)}
              className="w-6 h-6 accent-red-500 rounded cursor-pointer"
            />
            <span>Aktifkan Maintenance Mode (Lockdown)</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSaveGlobalAdminSettings}
            disabled={loading}
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
