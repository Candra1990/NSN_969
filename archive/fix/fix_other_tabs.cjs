const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Update renderAnnouncementsTab
const newAnnouncementsTab = `
  const renderAnnouncementsTab = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>Global Configuration</h2>
         <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
            Manage system-wide alerts, maintenance modes, and overarching broadcast settings.
         </p>
      </div>
      
      <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} shadow-xl\`}>
        <h3 className={\`text-xl font-bold mb-8 flex items-center gap-3 \${textPrimary}\`}>
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><Megaphone className="w-6 h-6" /></div>
          System Announcements
        </h3>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <label className={\`block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3\`}>Announcement Text (ID)</label>
               <textarea 
                 value={alertTextId}
                 onChange={(e) => setAlertTextId(e.target.value)}
                 className={\`w-full p-5 text-base rounded-2xl border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner\`}
                 rows={4}
                 placeholder="Pengumuman dalam Bahasa Indonesia..."
               />
             </div>
             <div>
               <label className={\`block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3\`}>Announcement Text (EN)</label>
               <textarea 
                 value={alertTextEn}
                 onChange={(e) => setAlertTextEn(e.target.value)}
                 className={\`w-full p-5 text-base rounded-2xl border border-gray-700 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner\`}
                 rows={4}
                 placeholder="Announcement in English..."
               />
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 p-6 bg-gray-900/30 rounded-2xl border border-gray-800">
            <label className={\`flex items-center gap-4 text-base font-semibold cursor-pointer \${textPrimary} hover:text-blue-400 transition-colors\`}>
              <div className={\`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors \${alertActive ? 'bg-blue-600 border-blue-600' : 'border-gray-600 bg-gray-800'}\`}>
                <input 
                  type="checkbox" 
                  checked={alertActive} 
                  onChange={e => setAlertActive(e.target.checked)} 
                  className="opacity-0 absolute w-0 h-0" 
                />
                {alertActive && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              Show Announcement Banner
            </label>
            
            <label className={\`flex items-center gap-4 text-base font-semibold cursor-pointer \${textPrimary} hover:text-red-400 transition-colors\`}>
              <div className={\`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors \${maintActive ? 'bg-red-500 border-red-500' : 'border-gray-600 bg-gray-800'}\`}>
                <input 
                  type="checkbox" 
                  checked={maintActive} 
                  onChange={e => setMaintActive(e.target.checked)} 
                  className="opacity-0 absolute w-0 h-0" 
                />
                {maintActive && <CheckCircle2 className="w-5 h-5 text-white" />}
              </div>
              Maintenance Mode (Lockdown)
            </label>
          </div>
          
          <div className="pt-4 flex justify-end">
             <button 
               onClick={handleSaveGlobalAdminSettings} 
               className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-base hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center gap-3"
             >
               <Save className="w-5 h-5" /> Save Configuration
             </button>
          </div>
        </div>
      </div>
    </div>
  );
`;

const regexAnn = /const renderAnnouncementsTab = \(\) => \([\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/m;
code = code.replace(regexAnn, newAnnouncementsTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
