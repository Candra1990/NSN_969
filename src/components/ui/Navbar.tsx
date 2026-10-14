import { useState } from 'react';
import { Menu, X, Shield, Globe, LogOut, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { useMedia } from '@/hooks/useMedia';

interface NavbarProps {  announcementActive?: boolean;
  currentView: 'home' | 'multiview' | 'gmail' | 'admin';
  setView: (view: 'home' | 'multiview' | 'gmail' | 'admin') => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export function Navbar({ currentView, setView, isAdmin, onLogout, announcementActive }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { dict, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logos } = useMedia();
  const [logoFailed, setLogoFailed] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  const menuItems = [
    { id: 'home', label: dict.navbar.home },
    { id: 'multiview', label: dict.navbar.multiView },
  ] as const;

  return (
    <nav className={`fixed ${announcementActive ? "top-10" : "top-0"} left-0 right-0 z-50 border-b backdrop-blur-xl shadow-xl transition-all duration-300 ${
      theme === 'light' 
        ? 'border-zinc-250 bg-white/90 text-zinc-800' 
        : 'border-white/5 bg-black/85 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Brand Logo & Command Hub Tag */}
          <div className="flex items-center gap-3">
            {/* Premium Highly-Polished Animated Circle Frame */}
            <div 
              className="relative w-11 h-11 rounded-full bg-black overflow-hidden shadow-[0_0_18px_rgba(229,169,60,0.25)] transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer group"
              onClick={() => setView('admin')}
            >
              {/* Active Rotating Gold Rim Accent */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e5a93c] via-transparent to-[#f5c76c] animate-[spin_3.5s_linear_infinite] pointer-events-none" />
              
              {/* Dark Inner Shield Face Layer */}
              <div className="absolute inset-[1.5px] bg-black rounded-full flex items-center justify-center overflow-hidden">
                {!logoFailed ? (
                  <img
                    src={logos.mainLogo || "/images/nsn969logo.png"}
                    alt="NSN969"
                    onError={() => setLogoFailed(true)}
                    className="w-[82%] h-[82%] object-contain mix-blend-screen filter drop-shadow-[0_1px_4px_rgba(229,169,60,0.35)] transition-transform duration-300 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[#e5a93c] font-black text-xs font-serif tracking-wider">
                    969
                  </span>
                )}
              </div>
              
              {/* Aura shadow halo pulse */}
              <div className="absolute -inset-1 rounded-full border border-amber-500/10 pointer-events-none group-hover:border-amber-500/30 transition-colors" />
            </div>

            <div className="flex flex-col select-none cursor-pointer" onClick={() => setView('home')}>
              <span className={`text-md font-black tracking-widest uppercase transition-colors hover:text-amber-500 ${
                theme === 'light' ? 'text-zinc-900' : 'text-white'
              }`}>
                NSN969
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                  }}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active 
                      ? theme === 'light'
                        ? 'text-amber-600 bg-amber-500/[0.08] border-b border-amber-500 font-bold'
                        : 'text-amber-500 bg-amber-500/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-b border-amber-500' 
                      : theme === 'light'
                        ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Divider line */}
            <span className={`h-4 w-[1px] mx-3 ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-800'}`} />

            {/* Theme Selection Toggle */}
            <button
              id="btn-theme-toggle-desktop"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer mr-2 select-none ${
                theme === 'light'
                  ? 'border-zinc-300 hover:border-amber-500/50 text-indigo-600 hover:text-amber-600 bg-zinc-100'
                  : 'border-zinc-800 hover:border-amber-500/45 text-zinc-400 hover:text-amber-450 bg-zinc-950/40'
              }`}
              title={theme === 'light' 
                ? (language === 'id' ? 'Beralih ke Mode Gelap' : 'Switch to Dark Mode') 
                : (language === 'id' ? 'Beralih ke Mode Terang' : 'Switch to Light Mode')}
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{theme === 'light' 
                ? (language === 'id' ? 'MODE GELAP' : 'DARK MODE') 
                : (language === 'id' ? 'MODE TERANG' : 'LIGHT MODE')}</span>
            </button>

            {/* Language Selection Toggle */}
            <button
              id="btn-language-toggle-desktop"
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer mr-2 select-none ${
                theme === 'light'
                  ? 'border-zinc-300 hover:border-amber-500/55 text-zinc-600 hover:text-amber-600 bg-zinc-50'
                  : 'border-zinc-800 hover:border-amber-500/40 text-zinc-400 hover:text-amber-400 bg-zinc-950/40'
              }`}
              title={language === 'en' ? 'Ubah ke Bahasa Indonesia' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500/80 group-hover:text-amber-400" />
              <span>{language === 'en' ? 'ENGLISH (EN)' : 'INDONESIA (ID)'}</span>
            </button>
            
          </div>

          {/* Mobile menu and Language triggers */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle Button */}
            <button
              id="btn-theme-toggle-mobile"
              onClick={toggleTheme}
              className={`flex items-center justify-center rounded-lg p-2 border transition-all select-none mr-1 ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-300 text-indigo-600'
                  : 'bg-zinc-950/60 border-zinc-800 text-amber-500'
              }`}
              title={theme === 'light' 
                ? (language === 'id' ? 'Beralih ke Mode Gelap' : 'Switch to Dark Mode') 
                : (language === 'id' ? 'Beralih ke Mode Terang' : 'Switch to Light Mode')}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Mobile Language Toggle Button */}
            <button
              id="btn-language-toggle-mobile"
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-[9px] font-mono font-bold transition-all mr-1.5 select-none ${
                theme === 'light'
                  ? 'bg-zinc-50 border-zinc-300 text-zinc-600 active:text-amber-600'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 active:text-amber-400'
              }`}
              title={language === 'en' ? 'Ubah ke Bahasa Indonesia' : 'Switch to English'}
            >
              <Globe className="w-3 h-3 text-amber-500/80" />
              <span>{language === 'en' ? 'EN' : 'ID'}</span>
            </button>
            <button 
              id="btn-mobile-menu"
              onClick={() => setIsOpen(!isOpen)} 
              className={`p-2 rounded transition-colors ${
                theme === 'light'
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title={isOpen ? (language === 'id' ? 'Tutup Menu' : 'Close Menu') : (language === 'id' ? 'Buka Menu' : 'Open Menu')}
              aria-label={isOpen ? (language === 'id' ? 'Tutup Menu' : 'Close Menu') : (language === 'id' ? 'Buka Menu' : 'Open Menu')}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu expanded layout - strictly Dashboard & Multiview only */}
      {isOpen && (
        <div className={`md:hidden border-t px-4 py-4 space-y-2 animate-in slide-in-from-top duration-300 ${
          theme === 'light' 
            ? 'border-zinc-250 bg-white/95 text-zinc-800 shadow-xl' 
            : 'border-zinc-900 bg-black/95 text-white'
        }`}>
          {menuItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left block px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  active 
                    ? theme === 'light'
                      ? 'bg-zinc-100 text-amber-600 font-extrabold'
                      : 'bg-zinc-900/80 text-amber-500 font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]' 
                    : theme === 'light'
                      ? 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                      : 'text-zinc-400 hover:bg-zinc-950/80 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
