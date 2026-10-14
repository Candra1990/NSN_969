const fs = require('fs');

let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const newDiscussionsTab = `
  const renderDiscussionsTab = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>Global Discussions</h2>
         <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
            Manage community text channels, global chat rooms, and public forums.
         </p>
      </div>
      
      <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} shadow-xl\`}>
        <h3 className={\`text-xl font-bold mb-8 flex items-center gap-3 \${textPrimary}\`}>
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><MessageSquare className="w-6 h-6" /></div>
          Create New Channel
        </h3>
        
        <form onSubmit={handleCreateChannel} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4 space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Channel Name</label>
             <input 
               type="text" 
               placeholder="e.g. general-chat" 
               value={newChannelName}
               onChange={e => setNewChannelName(e.target.value)}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors\`}
               required 
             />
          </div>
          <div className="md:col-span-5 space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
             <input 
               type="text" 
               placeholder="What is this channel about?" 
               value={newChannelDesc}
               onChange={e => setNewChannelDesc(e.target.value)}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-900/50 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors\`}
             />
          </div>
          <div className="md:col-span-3">
             <button type="submit" className="w-full px-4 py-4 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
               <Plus className="w-4 h-4" /> Create
             </button>
          </div>
        </form>
      </div>
      
      <div className={\`rounded-3xl border \${borderCard} \${bgCard} overflow-hidden shadow-xl\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/80\`}>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Channel Info</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {channels?.map((ch) => (
                <tr key={ch.id} className="hover:bg-white/5 transition-colors group">
                  <td className={\`px-6 py-5 whitespace-nowrap\`}>
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-full bg-blue-500/10 text-blue-400">
                          <MessageSquare className="w-5 h-5" />
                       </div>
                       <div>
                          <div className={\`font-bold \${textPrimary} text-base\`}>#{ch.name}</div>
                          <div className="text-sm text-gray-400 mt-0.5">{ch.description}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDeleteChannel(ch.id)}
                      title="Delete Channel"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {channels.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
               <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold">No channels available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
`;

const regexDisc = /const renderDiscussionsTab = \(\) => \([\s\S]*?<\/div>\s*<\/div>\s*\)\)}\s*<\/div>\s*<\/div>\s*\);/m;
code = code.replace(regexDisc, newDiscussionsTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
