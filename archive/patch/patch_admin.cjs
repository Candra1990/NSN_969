const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Replace TABS
code = code.replace(
  /const TABS = \[[\s\S]*?\];/,
  `const TABS = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'announcements', label: 'Pengumuman (Config)', icon: Megaphone },
    { id: 'members', label: 'Member NSN969', icon: Users },
    { id: 'audio', label: 'Audio Library', icon: Music },
    { id: 'visuals', label: 'Foto Gallery', icon: ImageIcon },
    { id: 'discussions', label: 'Global Discussions', icon: MessageCircle }
  ];`
);

// Add Megaphone to imports
code = code.replace(
  /ShieldAlert, Ban, CheckCircle2, MoreHorizontal/,
  `ShieldAlert, Ban, CheckCircle2, MoreHorizontal, Megaphone`
);

// Replace Cougan
code = code.replace(
  /"By Order Of The Cougan Family :cougan:"/,
  `"By Order Of The NSN969 Family :nsn969:"`
);

// Add renderAnnouncementsTab before renderPlaceholder
const announcementsTabCode = `  const renderAnnouncementsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className={\`text-2xl font-bold \${textPrimary}\`}>Pengumuman Sistem & Config</h2>
      
      <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard}\`}>
        <h3 className={\`text-lg font-semibold mb-6 flex items-center gap-2 \${textPrimary}\`}>
          <Megaphone className="w-5 h-5" />
          Global Configuration
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className={\`block text-xs font-bold \${textSecondary} uppercase mb-2\`}>Announcement Text (ID)</label>
            <textarea 
              value={alertTextId}
              onChange={(e) => setAlertTextId(e.target.value)}
              className={\`w-full p-4 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`}
              rows={3}
              placeholder="Pengumuman dalam Bahasa Indonesia..."
            />
          </div>

          <div>
            <label className={\`block text-xs font-bold \${textSecondary} uppercase mb-2\`}>Announcement Text (EN)</label>
            <textarea 
              value={alertTextEn}
              onChange={(e) => setAlertTextEn(e.target.value)}
              className={\`w-full p-4 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`}
              rows={3}
              placeholder="Announcement in English..."
            />
          </div>
          
          <div className="flex flex-wrap gap-6">
            <label className={\`flex items-center gap-3 text-sm font-medium cursor-pointer \${textPrimary}\`}>
              <div className={\`w-6 h-6 rounded flex items-center justify-center border \${alertActive ? 'bg-[#2563EB] border-[#2563EB]' : 'border-gray-600 bg-gray-800'}\`}>
                <input 
                  type="checkbox" 
                  checked={alertActive} 
                  onChange={e => setAlertActive(e.target.checked)} 
                  className="opacity-0 absolute w-0 h-0" 
                />
                {alertActive && <div className="w-3 h-3 bg-white rounded-sm" />}
              </div>
              Show Announcement Banner
            </label>
            
            <label className={\`flex items-center gap-3 text-sm font-medium cursor-pointer \${textPrimary}\`}>
              <div className={\`w-6 h-6 rounded flex items-center justify-center border \${maintActive ? 'bg-red-500 border-red-500' : 'border-gray-600 bg-gray-800'}\`}>
                <input 
                  type="checkbox" 
                  checked={maintActive} 
                  onChange={e => setMaintActive(e.target.checked)} 
                  className="opacity-0 absolute w-0 h-0" 
                />
                {maintActive && <div className="w-3 h-3 bg-white rounded-sm" />}
              </div>
              Maintenance Mode
            </label>
          </div>
          
          <button 
            onClick={handleSaveGlobalAdminSettings} 
            className="px-6 py-3 bg-[#2563EB] text-white font-bold rounded-xl text-sm hover:bg-[#1D4ED8] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, IconComponent: any) => (`;

code = code.replace(/const renderPlaceholder = \(title: string, IconComponent: any\) => \(/, announcementsTabCode);

// Update dynamic tabs in render
code = code.replace(
  /{activeTab === 'stickers' && renderPlaceholder\('Custom Stickers', Settings\)}\n\s*{activeTab === 'hero' && renderPlaceholder\('Hero Backgrounds', FileImage\)}/,
  `{activeTab === 'announcements' && renderAnnouncementsTab()}`
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
