const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// The function is named `AdminDashboardView`. Let's rewrite the renderDashboardTab

const newRenderDashboardTab = `
  const renderDashboardTab = () => (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>System Overview</h2>
        <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
          Welcome to the Super Admin Control Center. Monitor live metrics, control global settings, and manage your ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Streamers */}
        <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow\`}>
          <div>
            <div className={\`text-sm font-semibold text-blue-400 mb-2 uppercase tracking-wider\`}>Streamers</div>
            <div className={\`text-4xl font-black \${textPrimary}\`}>{metrics.members}</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
        </div>
        
        {/* Live Streamers */}
        <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow\`}>
          <div>
            <div className={\`text-sm font-semibold text-rose-400 mb-2 uppercase tracking-wider\`}>Live Now</div>
            <div className={\`text-4xl font-black \${textPrimary}\`}>{metrics.live}</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <Radio className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
        </div>
        
        {/* Audio Library */}
        <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow\`}>
          <div>
            <div className={\`text-sm font-semibold text-emerald-400 mb-2 uppercase tracking-wider\`}>Audio Tracks</div>
            <div className={\`text-4xl font-black \${textPrimary}\`}>{metrics.audio}</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Music className="w-7 h-7 text-emerald-400" />
          </div>
        </div>
        
        {/* Visual Assets */}
        <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex items-center justify-between shadow-sm hover:shadow-md transition-shadow\`}>
          <div>
            <div className={\`text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wider\`}>Visual Assets</div>
            <div className={\`text-4xl font-black \${textPrimary}\`}>{metrics.visuals}</div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <FileImage className="w-7 h-7 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlight Card */}
        <div className={\`p-8 rounded-3xl border \${borderCard} bg-gradient-to-br from-[#111827] to-[#0B0F19] flex flex-col relative overflow-hidden shadow-xl\`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Shield className="w-48 h-48 text-blue-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-blue-500/20 rounded-lg">
               <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Active Community</span>
          </div>
          <p className={\`text-2xl font-semibold \${textPrimary} mb-6 leading-relaxed relative z-10\`}>
            "Welcome to the NSN969 Multi-View Command Center. Use the sidebar to configure the global experience."
          </p>
          <div className="flex items-center gap-4 mt-auto relative z-10">
            <div className="px-3 py-1.5 rounded-md font-bold bg-blue-600 text-white text-xs uppercase tracking-wider">
              System Admin
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} flex flex-col items-center justify-center text-center shadow-xl\`}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
             <Activity className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className={\`text-2xl font-extrabold \${textPrimary} mb-3\`}>System Health Optimal</h3>
          <p className={\`text-base \${textSecondary} mb-8 max-w-sm\`}>
            All core services, database connections, and streaming proxies are running smoothly.
          </p>
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-full font-bold border border-emerald-500/20 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Uptime
          </div>
        </div>
      </div>

      {/* Portal Management */}
      <div>
        <h2 className={\`text-2xl font-bold \${textPrimary} mb-2\`}>Portal Management</h2>
        <p className={\`text-sm \${textSecondary} mb-6\`}>
          Quick links and status shortcuts.
        </p>
        
        <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} shadow-xl\`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><LayoutDashboard className="w-5 h-5"/></div>
                      <div>
                         <div className="font-bold text-white">Public Dashboard</div>
                         <div className="text-xs text-gray-400">/home</div>
                      </div>
                   </div>
                   <button onClick={() => window.open('/', '_blank')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">Visit</button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><Users className="w-5 h-5"/></div>
                      <div>
                         <div className="font-bold text-white">Multi-View Grid</div>
                         <div className="text-xs text-gray-400">/multiview</div>
                      </div>
                   </div>
                   <button onClick={() => window.open('/multiview', '_blank')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors">Visit</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
`;

const regex = /const renderDashboardTab = \(\) => \([\s\S]*?Portal Management[\s\S]*?<\/div>\s*<\/div>\s*\);\s*const renderDiscussionsTab/m;
code = code.replace(regex, newRenderDashboardTab + '\n  const renderDiscussionsTab');

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
