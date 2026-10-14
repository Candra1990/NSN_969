import { useState, useEffect, lazy, Suspense } from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageProvider';
import { FirebaseProvider } from '@/contexts/FirebaseProvider';
import { useAuth } from '@/hooks/useAuth';
import { useAdminConfig } from '@/hooks/useAdminConfig';
import { ThemeProvider, useTheme } from '@/contexts/ThemeProvider';
import { Navbar } from '@/components/ui/Navbar';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { HomeDashboard } from '@/features/home/HomeDashboard';
import type { Streamer } from '@/types';
import { AdminLogin } from '@/features/admin/AdminLogin';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { VideoOpening } from '@/components/VideoOpening';

import { MultiViewPlayer } from '@/features/multiview/MultiViewPlayer';
import { GmailClient } from '@/features/mail/GmailClient';
import { AdminDashboardView } from '@/features/admin/AdminDashboardView';

function AppContent({ isIntroActive = false }: { isIntroActive?: boolean }) {
  const { dict, language } = useLanguage();
  const { theme } = useTheme();
  const { user, isAdmin, loading: fbLoading, logout } = useAuth();
  const { maintenanceMode, announcementActive, announcementEn, announcementId } = useAdminConfig();
  const [onlineCount, setOnlineCount] = useState<number>(3);
  const [memberCount, setMemberCount] = useState<number>(10);
  
  // Custom SPA Router mapping browser pathname to state
  const [currentView, setView] = useState<'home' | 'multiview' | 'gmail' | 'admin'>(() => {
    const path = window.location.pathname;
    if (path === '/multiview') return 'multiview';
    if (path === '/gmail') return 'gmail';
    if (path === '/admin') return 'admin';
    return 'home';
  });

  // Track visited views to keep components mounted once loaded for instant navigation
  const [visitedViews, setVisitedViews] = useState<Set<string>>(() => new Set(['home', currentView]));

  // Navigation setter that synchronizes state with browser path
  const handleSetView = (view: 'home' | 'multiview' | 'gmail' | 'admin') => {
    setView(view);
    setVisitedViews(prev => {
      if (prev.has(view)) return prev;
      const next = new Set(prev);
      next.add(view);
      return next;
    });
    const path = view === 'multiview' ? '/multiview' : view === 'gmail' ? '/gmail' : view === 'admin' ? '/admin' : '/';
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.dispatchEvent(new Event('navchange'));
  };

  // Preload heavy lazy components in background to eliminate initial load delay when opening menus
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      import('@/features/multiview/MultiViewPlayer').catch(() => {});
      import('@/features/mail/GmailClient').catch(() => {});
      import('@/features/admin/AdminDashboardView').catch(() => {});
    }, 1000);
    return () => clearTimeout(preloadTimer);
  }, []);


  // Synchronize with native Back/Forward keys
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/multiview') {
        setView('multiview');
      } else if (path === '/gmail') {
        setView('gmail');
      } else if (path === '/admin') {
        setView('admin');
      } else {
        setView('home');
      }
      window.dispatchEvent(new Event('navchange'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear active streams session storage on first page/app load to ensure clean start
  useEffect(() => {
    try {
      sessionStorage.removeItem('nsn_active_streams');
    } catch (e) {}
  }, []);

  // Quick stream launch trigger from cards
  const handleSelectStream = (_str: Streamer) => {
    handleSetView('multiview');
  };

  if (fbLoading) {
    return <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f7f8fa]' : 'bg-[#070708]'}`} />;
  }

  // Maintenance Lockdown Mode for Non-Admin Public Visitors
  if (maintenanceMode && !isAdmin && currentView !== 'admin') {
    return (
      <div className="fixed inset-0 z-[200] w-screen h-screen bg-[#070708] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d0e12] border border-amber-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
              Maintenance Mode Active
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              {language === 'en' ? 'System Under Maintenance' : 'Sistem Dalam Pemeliharaan'}
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {language === 'en'
                ? 'NSN969 Multiview is currently undergoing scheduled maintenance by administrators. Please check back shortly.'
                : 'Website NSN969 Multiview sedang dalam proses pemeliharaan sistem rutin. Silakan kembali beberapa saat lagi.'}
            </p>
          </div>
          <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
            <button
              onClick={() => handleSetView('admin')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Portal Login Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdminActive = currentView === 'admin';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col relative overflow-x-hidden pt-24 pb-28 ${announcementActive && !isAdminActive ? "mt-10" : ""} ${
      theme === 'light' ? 'bg-[#f7f8fa] text-zinc-800' : 'bg-[#070708] text-zinc-100'
    }`}>
      {/* Background Matrix Mesh pattern */}
      <div className={`absolute inset-x-0 top-0 h-[600px] pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1b1c1e_1px,transparent_1px),linear-gradient(to_bottom,#1b1c1e_1px,transparent_1px)] bg-[size:4rem_4rem] ${
        theme === 'light' ? 'opacity-5 mix-blend-difference' : ''
      }`} />
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] filter blur-[150px] rounded-full pointer-events-none ${
        theme === 'light' ? 'bg-amber-500/[0.01]' : 'bg-amber-500/[0.02]'
      }`} />
      
      {/* Global Announcement Banner */}
      {announcementActive && !isAdminActive && (announcementEn || announcementId) && (
        <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg border-b border-white/20 fixed top-0 left-0 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
             <span className="relative flex h-2.5 w-2.5 shrink-0">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
             </span>
             <p className="truncate z-10 font-sans uppercase">
               {language === 'en' ? announcementEn : announcementId}
             </p>
          </div>
        </div>
      )}
  
      {/* Header element */}
      {currentView !== 'admin' && (
        <Navbar announcementActive={announcementActive} 
          currentView={currentView} 
          setView={handleSetView} 
          isAdmin={isAdmin} 
          onLogout={() => {
            logout().then(() => handleSetView('home'));
          }} 
        />
      )}

      {/* Primary content router section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-300">
        <ErrorBoundary>
          <Suspense fallback={null}>
            <div className={currentView === 'home' ? '' : 'hidden'}>
              <HomeDashboard 
                onSelectStream={handleSelectStream} 
                setView={handleSetView} 
              />
            </div>
            
            {/* MultiView Player (Kept playing offscreen in background when navigating away so live audio continues) */}
            <div 
              aria-hidden={currentView !== 'multiview'}
              className={
                currentView === 'multiview' 
                  ? 'w-full' 
                  : 'fixed -left-[9999px] -top-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden'
              }
            >
              {(currentView === 'multiview' || visitedViews.has('multiview')) && (
                <MultiViewPlayer isActive={currentView === 'multiview'} />
              )}
            </div>

            <div className={currentView === 'gmail' ? '' : 'hidden'}>
              {(currentView === 'gmail' || visitedViews.has('gmail')) && <GmailClient />}
            </div>

            {/* Standalone Admin View (Overlay so background audio remains alive) */}
            <div className={currentView === 'admin' ? 'fixed inset-0 z-50 w-screen h-screen min-h-[100dvh] bg-[#0B0F19] text-white overflow-y-auto flex flex-col' : 'hidden'}>
              {currentView === 'admin' && (
                !user ? (
                  <AdminLogin 
                    onSuccess={() => handleSetView('admin')} 
                    onBack={() => handleSetView('home')} 
                  />
                ) : (
                  <AdminDashboardView />
                )
              )}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Floating audio deck controls widget - completely hidden/removed while intro is active */}
      {!isIntroActive && currentView === 'home' && <AudioPlayer />}

      {/* Floating Discord Community Chat Button (sleek black circle matching audio trigger) */}
      {currentView === 'home' && (
        <button
          id="community-chat-bubble"
          type="button"
          onClick={() => {
            window.open('https://discord.gg/kX2kbhaZc', '_blank', 'noopener,noreferrer');
          }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center group bg-[#121316]/95 text-white border border-[#3e2e1a] hover:border-[#e5a93c]/50 hover:text-[#f0ba6e] shadow-[0_8px_30px_rgba(0,0,0,0.9)] backdrop-blur-md hover:scale-108 active:scale-92"
          title={language === 'en' ? 'Join NSN969 Discord Community' : 'Masuk Komunitas Discord NSN969'}
          aria-label={language === 'en' ? 'NSN969 Discord Community' : 'Komunitas Discord NSN969'}
        >
          {/* Hover Tooltip */}
          <div className="absolute bottom-16 right-0 mb-1.5 whitespace-nowrap bg-zinc-950/98 text-xs text-zinc-100 font-medium px-3.5 py-2 rounded-xl border border-zinc-800/90 shadow-2xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none flex items-center gap-2 font-sans tracking-wide">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-extrabold font-mono text-[11px]">{language === 'en' ? 'Discord Community' : 'Komunitas Discord'}</span>
            </div>
            <span className="text-zinc-700 font-normal">|</span>
            <span className="text-amber-400 text-[10.5px] font-mono font-bold leading-none">
              NSN969
            </span>
          </div>

          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5.5 h-5.5 stroke-[2]" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [isIntroActive, setIsIntroActive] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('nsn969_intro_disabled') === 'true') return false;
      return true; // Selalu aktifkan intro setiap kali web di-refresh / dibuka
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const handleIntroStart = () => setIsIntroActive(true);
    const handleIntroEnd = () => setIsIntroActive(false);

    window.addEventListener('nsn969:intro-start', handleIntroStart);
    window.addEventListener('nsn969:intro-end', handleIntroEnd);
    window.addEventListener('nsn969:play-intro', handleIntroStart);

    return () => {
      window.removeEventListener('nsn969:intro-start', handleIntroStart);
      window.removeEventListener('nsn969:intro-end', handleIntroEnd);
      window.removeEventListener('nsn969:play-intro', handleIntroStart);
    };
  }, []);

  return (
    <FirebaseProvider>
      <ThemeProvider>
        <LanguageProvider>
          {/* Video Opening / Intro Cinematic Overlay */}
          <VideoOpening onComplete={() => setIsIntroActive(false)} />
          <AppContent isIntroActive={isIntroActive} />
        </LanguageProvider>
      </ThemeProvider>
    </FirebaseProvider>
  );
}
