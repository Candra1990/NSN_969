import { 
  LayoutDashboard, 
  Users, 
  Radio, 
  Music, 
  FileImage, 
  Film,
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  LogOut,
  ExternalLink,
  MoreVertical,
  Layers,
  FolderArchive
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageProvider';

export type AdminTabType = 
  | 'dashboard' 
  | 'streamers' 
  | 'multiview' 
  | 'audio' 
  | 'visuals' 
  | 'announcements' 
  | 'members' 
  | 'settings' 
  | 'background' 
  | 'logs' 
  | 'system';

interface AdminSidebarProps {
  activeTab: AdminTabType;
  setActiveTab: (tab: AdminTabType) => void;
  onLogout: () => void;
  counts?: {
    streamers?: number;
    tracks?: number;
    gallery?: number;
  };
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavGroup {
  groupName: string;
  items: {
    id: AdminTabType | 'portal_public' | 'portal_multiview';
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isSoon?: boolean;
    isExternal?: boolean;
    action?: () => void;
  }[];
}

export function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  counts,
  mobileOpen,
  setMobileOpen
}: AdminSidebarProps) {
  const { user } = useAuth();
  const { language } = useLanguage();

  const userEmail = user?.email || 'admin@nsn969.com';
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const isId = language === 'id';

  const navGroups: NavGroup[] = [
    {
      groupName: isId ? 'NAVIGASI UTAMA' : 'MAIN NAVIGATION',
      items: [
        { 
          id: 'dashboard', 
          label: isId ? 'Ringkasan Dasbor' : 'Dashboard Overview', 
          icon: <LayoutDashboard className="w-4 h-4" /> 
        },
        { 
          id: 'streamers', 
          label: isId ? 'Manajemen Streamer' : 'Streamer Management', 
          icon: <Users className="w-4 h-4" />, 
          badge: counts?.streamers || 0 
        },
        { 
          id: 'audio', 
          label: isId ? 'Pustaka Musik' : 'Audio Library', 
          icon: <Music className="w-4 h-4" />, 
          badge: counts?.tracks || 0 
        },
        { 
          id: 'visuals', 
          label: isId ? 'Galeri Foto & Media' : 'Photos & Media', 
          icon: <Film className="w-4 h-4" />, 
          badge: counts?.gallery || 0 
        },
        { 
          id: 'multiview', 
          label: isId ? 'Tata Letak Multiview' : 'Multiview Grid', 
          icon: <Radio className="w-4 h-4" /> 
        },
      ]
    },
    {
      groupName: isId ? 'SISTEM & PENGATURAN' : 'SYSTEM & SETTINGS',
      items: [
        { 
          id: 'settings', 
          label: isId ? 'Konfigurasi Sistem' : 'System Configurations', 
          icon: <Sliders className="w-4 h-4" /> 
        },
        { 
          id: 'members', 
          label: isId ? 'Peran & Hak Akses' : 'User Roles & Permissions', 
          icon: <ShieldCheck className="w-4 h-4" /> 
        },
        { 
          id: 'background', 
          label: isId ? 'Video Latar & Banner' : 'Hero & Background Video', 
          icon: <Sparkles className="w-4 h-4" /> 
        },
        { 
          id: 'system', 
          label: isId ? 'Kesehatan Sistem' : 'System Health', 
          icon: <Layers className="w-4 h-4" /> 
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-md transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-[270px] shrink-0 h-full flex flex-col bg-[#0D121F] border-r border-[#1B2234] z-50 transition-all duration-300 ${
          mobileOpen 
            ? 'fixed inset-y-0 left-0 shadow-2xl translate-x-0' 
            : 'hidden lg:flex'
        }`}
      >
        <div className="flex flex-col h-full p-4 bg-[#0D121F] select-none">
          {/* Logo Brand Header */}
          <div className="pb-5 mb-3 border-b border-[#1E2638] flex items-center justify-between">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                NSN
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-white tracking-tight italic">NSN969</span>
                </div>
                <p className="text-[10px] font-mono font-semibold text-gray-400 tracking-widest uppercase">
                  ADMIN PANEL
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Groups Scroll Area */}
          <nav className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar text-xs">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 pb-1.5 text-[10px] font-bold text-gray-400/80 tracking-wider uppercase font-mono">
                  {group.groupName}
                </div>
                
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          setActiveTab(item.id as AdminTabType);
                        }
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium tracking-wide transition-all duration-150 cursor-pointer group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white font-semibold shadow-md shadow-indigo-600/20 border border-indigo-400/30'
                          : 'text-gray-300 hover:text-white hover:bg-[#161C2E]'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`transition-colors ${
                          isActive 
                            ? 'text-white' 
                            : 'text-gray-400 group-hover:text-indigo-400'
                        }`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.isSoon && (
                          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            SOON
                          </span>
                        )}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-[#182033] text-gray-400 group-hover:text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.isExternal && (
                          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Profile & Sign Out Footer */}
          <div className="pt-3 mt-3 border-t border-[#1E2638] space-y-2 shrink-0">
            {/* User Info Card */}
            <div className="p-2.5 rounded-xl bg-[#141A2B] border border-[#1E2638] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold font-mono text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate leading-snug">Super Admin</div>
                  <div className="text-[10px] font-mono text-gray-400 truncate leading-none mt-0.5">
                    {userEmail}
                  </div>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-gray-400 shrink-0" />
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs tracking-wider transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isId ? 'Keluar Admin' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
