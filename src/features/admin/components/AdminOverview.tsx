import React from 'react';
import { 
  Users, 
  Radio, 
  Music, 
  FileImage, 
  CheckCircle2, 
  TrendingUp, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface AdminOverviewProps {
  metrics: {
    members: number;
    live: number;
    audio: number;
    visuals: number;
  };
  onNavigateTab?: (tab: string) => void;
}

export function AdminOverview({ metrics, onNavigateTab }: AdminOverviewProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const cardBg = 'bg-[#121828] border-[#1E2638]';

  return (
    <div className="space-y-6 pb-12 text-white animate-in fade-in duration-200 select-none">
      {/* 1. Greeting & Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121828] border border-[#1E2638] shadow-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {isId ? 'Selamat Datang Kembali, Admin!' : 'Welcome back, Super Admin!'} <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {isId ? 'Berikut ringkasan statistik dan operasional platform NSN969 hari ini.' : "Here's what's happening with your NSN969 platform today."}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {isId ? 'Sistem Aktif' : 'System Online'}
        </div>
      </div>

      {/* 2. Top Metric Statistics Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Streamers */}
        <div className={`p-5 rounded-2xl border ${cardBg} shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isId ? 'Total Streamer' : 'Total Streamers'}
              </span>
              <div className="text-3xl font-black text-white mt-1">{metrics.members}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isId ? 'Akun streamer terdaftar' : 'Active registered accounts'}</span>
          </div>
        </div>

        {/* Card 2: Live Streamers */}
        <div className={`p-5 rounded-2xl border ${cardBg} shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/40 transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isId ? 'Streamer Sedang Live' : 'Live Streamers'}
              </span>
              <div className="text-3xl font-black text-white mt-1">{metrics.live}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{metrics.live} {isId ? 'Sedang Siaran Langsung' : 'Broadcasting Live Now'}</span>
          </div>
        </div>

        {/* Card 3: Audio Library */}
        <div className={`p-5 rounded-2xl border ${cardBg} shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isId ? 'Pustaka Musik' : 'Audio Library'}
              </span>
              <div className="text-3xl font-black text-white mt-1">{metrics.audio}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Music className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span>🎵 {metrics.audio} {isId ? 'Daftar Lagu' : 'Music Tracks'}</span>
          </div>
        </div>

        {/* Card 4: Visual Assets */}
        <div className={`p-5 rounded-2xl border ${cardBg} shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/40 transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isId ? 'Galeri Foto & Media' : 'Visual Assets'}
              </span>
              <div className="text-3xl font-black text-white mt-1">{metrics.visuals}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <span>🖼️ {metrics.visuals} {isId ? 'Item Galeri Tersimpan' : 'Gallery Items'}</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: System Health */}
      <div className={`p-6 rounded-2xl border ${cardBg} shadow-lg flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#1E2638] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {isId ? 'Kesehatan Sistem' : 'System Health'}
                </h3>
                <p className="text-[10px] text-gray-400">
                  {isId ? 'Semua modul berjalan optimal.' : 'All systems are running perfectly.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
            {/* Circular Ring Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="100, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-white leading-none">100%</span>
                <span className="text-[9px] font-mono text-gray-400 uppercase mt-0.5">Uptime</span>
              </div>
            </div>

            {/* Status List */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                <span className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Database
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">
                  {isId ? 'Operasional' : 'Operational'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                <span className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Server API
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">
                  {isId ? 'Operasional' : 'Operational'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                <span className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Storage
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">
                  {isId ? 'Operasional' : 'Operational'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0E1322] border border-[#1A2236]">
                <span className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Sync
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">
                  {isId ? 'Operasional' : 'Operational'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onNavigateTab && onNavigateTab('system')}
          className="w-full mt-4 py-2.5 rounded-xl bg-[#182033] hover:bg-[#202B45] border border-[#232F4D] text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isId ? 'Lihat Log Sistem' : 'View System Logs'}</span>
        </button>
      </div>

      {/* 5. Platform Analytics Sparklines Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-wide">
            {isId ? 'Analitik Platform' : 'Platform Analytics'} <span className="text-xs font-normal text-gray-400">({isId ? '7 Hari Terakhir' : 'Last 7 Days'})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sparkline 1 */}
          <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {isId ? 'Total Pengunjung' : 'Total Visitors'}
              </div>
              <div className="text-lg font-black text-white mt-0.5">1,248</div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">↑ 18.2%</div>
            </div>
            <svg className="w-16 h-8 text-emerald-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 25 L10 20 L20 22 L30 12 L40 18 L50 8 L60 14" />
            </svg>
          </div>

          {/* Sparkline 2 */}
          <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {isId ? 'Pengguna Aktif' : 'Active Users'}
              </div>
              <div className="text-lg font-black text-white mt-0.5">892</div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">↑ 14.7%</div>
            </div>
            <svg className="w-16 h-8 text-indigo-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 22 L10 18 L20 25 L30 10 L40 15 L50 5 L60 12" />
            </svg>
          </div>

          {/* Sparkline 3 */}
          <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {isId ? 'Kunjungan Halaman' : 'Page Views'}
              </div>
              <div className="text-lg font-black text-white mt-0.5">3,246</div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">↑ 21.3%</div>
            </div>
            <svg className="w-16 h-8 text-amber-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 28 L10 22 L20 18 L30 14 L40 19 L50 10 L60 8" />
            </svg>
          </div>

          {/* Sparkline 4 */}
          <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">
                {isId ? 'Pesan Chat' : 'Messages'}
              </div>
              <div className="text-lg font-black text-white mt-0.5">1,095</div>
              <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">↑ 16.8%</div>
            </div>
            <svg className="w-16 h-8 text-purple-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 20 L10 24 L20 12 L30 18 L40 10 L50 14 L60 6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
