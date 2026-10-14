import React, { useState } from 'react';
import { Menu, Search, Bell, ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import type { AdminTabType } from './AdminSidebar';

interface AdminTopHeaderProps {
  activeTab: AdminTabType;
  onToggleSidebar: () => void;
}

const tabTitles: Record<AdminTabType, { 
  titleEn: string; 
  titleId: string; 
  breadcrumbEn: string; 
  breadcrumbId: string; 
}> = {
  dashboard: { 
    titleEn: 'Dashboard Overview', 
    titleId: 'Ringkasan Dasbor', 
    breadcrumbEn: 'Home  •  Dashboard',
    breadcrumbId: 'Beranda  •  Dasbor'
  },
  streamers: { 
    titleEn: 'Streamer Management', 
    titleId: 'Manajemen Streamer', 
    breadcrumbEn: 'Home  •  Streamers',
    breadcrumbId: 'Beranda  •  Streamer'
  },
  multiview: { 
    titleEn: 'Multiview Grid', 
    titleId: 'Tata Letak Multiview', 
    breadcrumbEn: 'Home  •  Multiview',
    breadcrumbId: 'Beranda  •  Multiview'
  },
  audio: { 
    titleEn: 'Audio Library', 
    titleId: 'Pustaka Musik', 
    breadcrumbEn: 'Home  •  Audio',
    breadcrumbId: 'Beranda  •  Musik'
  },
  visuals: { 
    titleEn: 'Visual Assets', 
    titleId: 'Galeri Foto & Media', 
    breadcrumbEn: 'Home  •  Visuals',
    breadcrumbId: 'Beranda  •  Foto & Media'
  },
  announcements: { 
    titleEn: 'Announcements', 
    titleId: 'Pemberitahuan Sistem', 
    breadcrumbEn: 'Home  •  Announcements',
    breadcrumbId: 'Beranda  •  Pengumuman'
  },
  members: { 
    titleEn: 'User Roles & Permissions', 
    titleId: 'Peran & Hak Akses', 
    breadcrumbEn: 'Home  •  Members',
    breadcrumbId: 'Beranda  •  Anggota'
  },
  settings: { 
    titleEn: 'System Configurations', 
    titleId: 'Konfigurasi Sistem', 
    breadcrumbEn: 'Home  •  Settings',
    breadcrumbId: 'Beranda  •  Pengaturan'
  },
  background: { 
    titleEn: 'Hero Backgrounds', 
    titleId: 'Video Latar & Banner', 
    breadcrumbEn: 'Home  •  Backgrounds',
    breadcrumbId: 'Beranda  •  Video Latar'
  },
  logs: { 
    titleEn: 'Audit Logs', 
    titleId: 'Catatan Aktivitas', 
    breadcrumbEn: 'Home  •  Logs',
    breadcrumbId: 'Beranda  •  Log Sistem'
  },
  system: { 
    titleEn: 'System Health', 
    titleId: 'Kesehatan Sistem', 
    breadcrumbEn: 'Home  •  Health',
    breadcrumbId: 'Beranda  •  Status Sistem'
  },
};

export function AdminTopHeader({ activeTab, onToggleSidebar }: AdminTopHeaderProps) {
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const isId = language === 'id';
  const meta = tabTitles[activeTab] || { 
    titleEn: 'Control Center', 
    titleId: 'Pusat Kontrol', 
    breadcrumbEn: 'Home  •  Admin',
    breadcrumbId: 'Beranda  •  Admin'
  };

  return (
    <header className="h-[72px] shrink-0 border-b border-[#1E2638] bg-[#0D121F]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none relative z-30">
      {/* Left: Hamburger & Page Title & Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-300 hover:text-white hover:bg-[#161C2E] rounded-xl transition-colors cursor-pointer shrink-0"
          title={isId ? "Buka Navigasi" : "Toggle Navigation"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate leading-tight">
            {isId ? meta.titleId : meta.titleEn}
          </h1>
        </div>
      </div>

      {/* Right: Search Bar, Language, Status, Notifications, Admin Profile Pill */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search Bar (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141A2B] border border-[#1E2638] text-xs text-gray-400 w-52 focus-within:w-64 focus-within:border-indigo-500/50 transition-all duration-200">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isId ? "Cari apapun di admin..." : "Search anything..."}
            className="bg-transparent text-white placeholder-gray-500 outline-none w-full text-xs"
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-gray-400 bg-[#1C243B] rounded border border-[#2B3552] shrink-0">
            Ctrl + K
          </kbd>
        </div>

        {/* Top Header Language Toggle Button */}
        <button
          type="button"
          onClick={() => setLanguage(isId ? 'en' : 'id')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141A2B] border border-[#1E2638] text-xs font-mono font-bold tracking-wider text-gray-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer"
          title={isId ? "Ubah ke Bahasa Inggris" : "Switch to Indonesian"}
        >
          <Globe className="w-3.5 h-3.5 text-amber-500" />
          <span>{isId ? "ID" : "EN"}</span>
        </button>

        {/* System Online Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isId ? "Sistem Aktif" : "System Online"}
        </div>

        {/* Notifications Icon */}
        <button className="relative p-2 text-gray-300 hover:text-white hover:bg-[#161C2E] rounded-xl transition-colors cursor-pointer shrink-0">
          <Bell className="w-4 h-4" />
        </button>

        {/* Admin User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E2638]">
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">
              {isId ? "Admin Utama" : "Super Admin"}
            </div>
            <div className="text-[10px] font-mono text-gray-400 leading-none">
              {isId ? "Pengelola Sistem" : "Administrator"}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block shrink-0" />
        </div>
      </div>
    </header>
  );
}
