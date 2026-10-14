const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const newMembersTab = `
  const renderMembersTab = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>Member Management</h2>
         <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
            Add, remove, or modify NSN969 streamer accounts and ranks within the ecosystem.
         </p>
      </div>
      
      <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl\`}>
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Users className="w-6 h-6"/></div>
           <div>
             <h3 className={\`text-xl font-bold \${textPrimary}\`}>Streamer Directory</h3>
             <p className={\`text-sm \${textSecondary} mt-1\`}>{streamers.length} active streamers</p>
           </div>
        </div>
        <button onClick={() => setShowAddStreamer(!showAddStreamer)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
          {showAddStreamer ? <><ChevronRight className="w-4 h-4 rotate-90" /> Close Form</> : <><Plus className="w-4 h-4" /> Add Streamer</>}
        </button>
      </div>
      
      {showAddStreamer && (
        <form onSubmit={handleAddStreamer} className={\`p-8 rounded-3xl border \${borderCard} bg-gray-900/50 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300 shadow-inner\`}>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
             <input 
               type="text" placeholder="e.g. UCUP" 
               value={newStreamer.name} onChange={e => setNewStreamer(prev => ({...prev, name: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors\`}
               required 
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</label>
             <select 
               value={newStreamer.platform} onChange={e => setNewStreamer(prev => ({...prev, platform: e.target.value as any}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors\`}
             >
               <option value="tiktok">TikTok</option>
               <option value="youtube">YouTube</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channel / User ID</label>
             <input 
               type="text" placeholder="ID or Username" 
               value={newStreamer.channelId} onChange={e => setNewStreamer(prev => ({...prev, channelId: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500 transition-colors\`}
               required 
             />
          </div>
          <div className="flex items-end">
             <button type="submit" className="w-full px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
               Save Streamer
             </button>
          </div>
        </form>
      )}
      
      <div className={\`rounded-3xl border \${borderCard} \${bgCard} overflow-hidden shadow-xl\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/80\`}>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Streamer</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Channel ID</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Platform</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Status</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Role</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {streamers?.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className={\`px-6 py-5 whitespace-nowrap font-bold \${textPrimary}\`}>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                          <img src={\`https://api.dicebear.com/7.x/identicon/svg?seed=\${encodeURIComponent(member.name)}&backgroundColor=0d0e12\`} className="w-full h-full object-cover" />
                       </div>
                       {member.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {member.channelId}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={\`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold \${
                      member.platform === 'tiktok' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : member.platform === 'youtube'
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }\`}>
                      {member.platform.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={\`w-2 h-2 rounded-full \${member.isFeatured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}\`}></div>
                      <span className={\`text-xs font-bold \${member.isFeatured ? 'text-emerald-400' : 'text-red-400'}\`}>
                        {member.isFeatured ? 'FEATURED' : 'HIDDEN'}
                      </span>
                    </div>
                  </td>
                  <td className={\`px-6 py-5 whitespace-nowrap text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>
                    {member.category}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      title="Delete User"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {streamers.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
               <Users className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold">No members found in directory.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
`;

const regexMem = /const renderMembersTab = \(\) => \([\s\S]*?<\/button>\s*<\/div>\s*<\/td>\s*<\/tr>\s*\)\)}\s*<\/tbody>\s*<\/table>\s*\{streamers\.length === 0 && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/m;
code = code.replace(regexMem, newMembersTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
