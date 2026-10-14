const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Use tracks from useFirebase
code = code.replace(
  /const \{ logout, streamers, deleteStreamerFromDb, addStreamerToDb \} = useFirebase\(\);/,
  `const { logout, streamers, deleteStreamerFromDb, addStreamerToDb, tracks } = useFirebase();\n  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '' });\n  const [showAddTrack, setShowAddTrack] = useState(false);`
);

// Define delete and add track
const trackHandlers = `
  const handleDeleteTrack = async (id: string) => {
    if (confirm('Are you sure you want to remove this track?')) {
      await deleteDoc(doc(db, 'tracks', id));
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.title || !newTrack.url) return;
    const newId = \`track-\${Date.now()}\`;
    await setDoc(doc(db, 'tracks', newId), {
      id: newId,
      title: newTrack.title,
      artist: newTrack.artist,
      url: newTrack.url
    });
    setNewTrack({ title: '', artist: '', url: '' });
    setShowAddTrack(false);
  };
`;

code = code.replace(
  /const handleDeleteMember = async/g,
  trackHandlers + "\n  const handleDeleteMember = async"
);

const newRenderAudioTab = `  const renderAudioTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className={\`text-2xl font-bold \${textPrimary}\`}>Audio Library</h2>
      <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-4\`}>
        <div>
          <h3 className={\`text-lg font-semibold \${textPrimary}\`}>Manage Audio & Music</h3>
          <p className={\`text-sm \${textSecondary} mt-1\`}>Upload background music and sound effects for stream hub.</p>
        </div>
        <button onClick={() => setShowAddTrack(!showAddTrack)} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Track URL
        </button>
      </div>

      {showAddTrack && (
        <form onSubmit={handleAddTrack} className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} grid grid-cols-1 md:grid-cols-4 gap-4\`}>
          <input 
            type="text" placeholder="Title" 
            value={newTrack.title} onChange={e => setNewTrack(prev => ({...prev, title: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#059669]\`} required
          />
          <input 
            type="text" placeholder="Artist" 
            value={newTrack.artist} onChange={e => setNewTrack(prev => ({...prev, artist: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#059669]\`} required
          />
          <input 
            type="text" placeholder="Audio URL (.mp3)" 
            value={newTrack.url} onChange={e => setNewTrack(prev => ({...prev, url: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#059669]\`} required
          />
          <button type="submit" className="w-full px-4 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            Save Track
          </button>
        </form>
      )}
      
      <div className={\`rounded-2xl border \${borderCard} \${bgCard} overflow-hidden\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/50\`}>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Track Name</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Artist</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>URL</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className={\`font-medium \${textPrimary}\`}>{track.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {track.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 truncate max-w-[200px]">
                    {track.url}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDeleteTrack(track.id)}
                      title="Delete Track"
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tracks.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No tracks found.
            </div>
          )}
        </div>
      </div>
    </div>
  );`;

code = code.replace(/const renderAudioTab = \(\) => \([\s\S]*?Connected to \/api\/music and public\/music directory\.[\s\S]*?<\/div>\n    <\/div>\n  \);/, newRenderAudioTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
