const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Use gallery from useFirebase
code = code.replace(
  /const \{ logout, streamers, deleteStreamerFromDb, addStreamerToDb, tracks \} = useFirebase\(\);/,
  `const { logout, streamers, deleteStreamerFromDb, addStreamerToDb, tracks, gallery } = useFirebase();\n  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', tag: '', src: '' });\n  const [showAddGallery, setShowAddGallery] = useState(false);`
);

// Define delete and add gallery
const galleryHandlers = `
  const handleDeleteGallery = async (id: string) => {
    if (confirm('Are you sure you want to remove this image?')) {
      await deleteDoc(doc(db, 'gallery', id));
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.title || !newGalleryItem.src) return;
    const newId = \`gal-\${Date.now()}\`;
    await setDoc(doc(db, 'gallery', newId), {
      id: newId,
      title: newGalleryItem.title,
      tag: newGalleryItem.tag,
      src: newGalleryItem.src
    });
    setNewGalleryItem({ title: '', tag: '', src: '' });
    setShowAddGallery(false);
  };
`;

code = code.replace(
  /const handleDeleteTrack = async/g,
  galleryHandlers + "\n  const handleDeleteTrack = async"
);

const newRenderVisualsTab = `  const renderVisualsTab = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <h2 className={\`text-2xl font-bold \${textPrimary}\`}>Foto Gallery</h2>
      <div className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-4\`}>
        <div>
          <h3 className={\`text-lg font-semibold \${textPrimary}\`}>Manage Gallery Images</h3>
          <p className={\`text-sm \${textSecondary} mt-1\`}>Upload or add image URLs for the main carousel.</p>
        </div>
        <button onClick={() => setShowAddGallery(!showAddGallery)} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>

      {showAddGallery && (
        <form onSubmit={handleAddGallery} className={\`p-6 rounded-2xl border \${borderCard} \${bgCard} grid grid-cols-1 md:grid-cols-4 gap-4\`}>
          <input 
            type="text" placeholder="Title" 
            value={newGalleryItem.title} onChange={e => setNewGalleryItem(prev => ({...prev, title: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`} required
          />
          <input 
            type="text" placeholder="Tag" 
            value={newGalleryItem.tag} onChange={e => setNewGalleryItem(prev => ({...prev, tag: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`}
          />
          <input 
            type="text" placeholder="Image URL (.png, .jpg)" 
            value={newGalleryItem.src} onChange={e => setNewGalleryItem(prev => ({...prev, src: e.target.value}))}
            className={\`w-full p-3 text-sm rounded-xl border border-[#374151] bg-[#1F2937] text-white focus:outline-none focus:border-[#3B82F6]\`} required
          />
          <button type="submit" className="w-full px-4 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            Save Image
          </button>
        </form>
      )}
      
      <div className={\`rounded-2xl border \${borderCard} \${bgCard} overflow-hidden\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/50\`}>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Image</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Title</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider\`}>Tag</th>
                <th className={\`px-6 py-4 text-xs font-semibold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {gallery?.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={item.src} alt={item.title} className="w-16 h-10 object-cover rounded-md" referrerPolicy="no-referrer" />
                  </td>
                  <td className={\`px-6 py-4 whitespace-nowrap font-medium \${textPrimary}\`}>
                    {item.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-[#1F2937] rounded-md text-xs">{item.tag}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleDeleteGallery(item.id)}
                      title="Delete Image"
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!gallery || gallery.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              No images found.
            </div>
          )}
        </div>
      </div>
    </div>
  );`;

code = code.replace(/const renderVisualsTab = \(\) => \([\s\S]*?<\/div>\n    <\/div>\n  \);/, newRenderVisualsTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
