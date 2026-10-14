import React, { useState, useEffect } from 'react';
import { Sliders, Save, Globe, Mail, MessageSquare, Youtube, CheckCircle2 } from 'lucide-react';
import type { WebsiteSettingsData } from '@/types/admin';
import { getWebsiteSettings, saveWebsiteSettings } from '@/services/admin/adminService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ToastNotif, ToastMessage } from './ToastNotif';
import { useLanguage } from '@/contexts/LanguageProvider';

export function WebsiteSettingsManager() {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [settings, setSettings] = useState<WebsiteSettingsData>(getWebsiteSettings());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ id: Date.now().toString(), type, text });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadSettingsFromSupabase() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase
            .from('system_settings')
            .select('website_settings')
            .eq('id', 'global')
            .maybeSingle();

          if (data && data.website_settings) {
            setSettings(prev => ({
              ...prev,
              ...data.website_settings
            }));
          }
        } catch (err) {
          console.warn('[WebsiteSettingsManager] Error loading settings from Supabase:', err);
        }
      }
    }
    loadSettingsFromSupabase();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveWebsiteSettings(settings);
      showToast('success', isId ? 'Pengaturan website berhasil disimpan!' : 'Website settings saved successfully!');
    } catch (err) {
      showToast('error', isId ? 'Gagal menyimpan pengaturan.' : 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ToastNotif toast={toast} onClose={() => setToast(null)} />

      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sliders className="w-8 h-8 text-amber-500" />
          {isId ? 'Konfigurasi Sistem & Branding' : 'Website & Branding Settings'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isId 
            ? 'Konfigurasi nama situs, motto branding, tautan sosial media, dan layout publik.' 
            : 'Configure site name, brand motto, social links, and public layout.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="p-8 rounded-3xl border border-[#1F2937] bg-[#111827] shadow-xl space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-500" /> Identity & Branding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Nama Website</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Tagline Branding</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Email Kontak Official</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" /> Social Links & Channels
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Discord Community URL</label>
              <input
                type="text"
                value={settings.discordUrl}
                onChange={e => setSettings({ ...settings, discordUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">TikTok Official URL</label>
              <input
                type="text"
                value={settings.tiktokUrl}
                onChange={e => setSettings({ ...settings, tiktokUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">YouTube Official Channel</label>
              <input
                type="text"
                value={settings.youtubeUrl}
                onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
