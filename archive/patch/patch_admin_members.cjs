const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Use streamers from useFirebase
code = code.replace(
  /const \{ logout \} = useFirebase\(\);/,
  `const { logout, streamers, deleteStreamerFromDb, addStreamerToDb } = useFirebase();`
);

// Remove local state membersList
code = code.replace(
  /const \[membersList, setMembersList\] = useState\(\[\s*{[\s\S]*?\]\);/,
  ""
);

// Add state for new streamer
const newStreamerState = `
  const [newStreamer, setNewStreamer] = useState({ name: '', platform: 'youtube' as const, channelId: '' });
  const [showAddStreamer, setShowAddStreamer] = useState(false);
`;
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\('dashboard'\);/,
  `const [activeTab, setActiveTab] = useState('dashboard');\n${newStreamerState}`
);


// Replace handlePromote, handleRestrict, handleDeleteMember with correct ones
const newMemberHandlers = `
  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await deleteStreamerFromDb(id);
    }
  };

  const handleAddStreamer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamer.name || !newStreamer.channelId) return;
    
    const newId = \`str-\${Date.now()}\`;
    await addStreamerToDb({
      id: newId,
      name: newStreamer.name,
      platform: newStreamer.platform,
      channelId: newStreamer.channelId,
      isFeatured: true,
      category: 'NSN Community Stream'
    });
    
    setNewStreamer({ name: '', platform: 'youtube', channelId: '' });
    setShowAddStreamer(false);
  };
`;

code = code.replace(
  /const handlePromote = \([\s\S]*?\}\s*\};\s*const handleRestrict = \([\s\S]*?\}\s*\};\s*const handleDeleteMember = \([\s\S]*?\}\s*\};/,
  newMemberHandlers
);

// Replace mapping inside renderMembersTab
code = code.replace(
  /\{membersList\.map\(\(member\) => \([\s\S]*?\)\)\}/,
  `{streamers.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className={\`font-medium \${textPrimary}\`}>{member.name}</div>
                        <div className={\`text-xs \${textSecondary}\`}>{member.channelId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={\`px-2.5 py-1 rounded-full text-xs font-medium border \${
                      member.platform === 'youtube' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                    }\`}>
                      {member.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className={\`w-2 h-2 rounded-full \${member.isFeatured ? 'bg-emerald-500' : 'bg-red-500'}\`}></div>
                      <span className={\`text-sm \${member.isFeatured ? 'text-emerald-400' : 'text-red-400'}\`}>
                        {member.isFeatured ? 'Featured' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className={\`px-6 py-4 whitespace-nowrap text-sm \${textSecondary}\`}>
                    {member.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        title="Delete User"
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}`
);

// Update Add Streamer Button
code = code.replace(
  /<button className="px-4 py-2 bg-\[#2563EB\] hover:bg-\[#1D4ED8\] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">\s*<Plus className="w-4 h-4" \/> Add Streamer\s*<\/button>/,
  `<button onClick={() => setShowAddStreamer(!showAddStreamer)} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Streamer
        </button>`
);

// Add form UI
code = code.replace(
  /<div className=\{\`rounded-2xl border \$\{borderCard\} \$\{bgCard\} overflow-hidden\`\}>/,
  `{showAddStreamer && (
        <form onSubmit={handleAddStreamer} className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} grid grid-cols-1 md:grid-cols-4 gap-4\`}>
          <input 
            type="text" placeholder="Name (e.g. UCUP)" 
            value={newStreamer.name} onChange={e => setNewStreamer(prev => ({...prev, name: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`} required
          />
          <input 
            type="text" placeholder="Channel ID/Username" 
            value={newStreamer.channelId} onChange={e => setNewStreamer(prev => ({...prev, channelId: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`} required
          />
          <select 
            value={newStreamer.platform} onChange={e => setNewStreamer(prev => ({...prev, platform: e.target.value as 'youtube' | 'tiktok'}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`} required
          >
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
          </select>
          <button type="submit" className="w-full px-4 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            Save Streamer
          </button>
        </form>
      )}
      <div className={\`rounded-2xl border \${borderCard} \${bgCard} overflow-hidden\`}>`
);

code = code.replace(
  /\{membersList\.length === 0 && \(/,
  `{streamers.length === 0 && (`
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
