const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const newAudioTab = `
  const renderAudioTab = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>Audio Library</h2>
         <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
            Upload and manage background music and sound effects for the stream hub.
         </p>
      </div>
      
      <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl\`}>
        <div className="flex items-center gap-4">
           <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Music className="w-6 h-6"/></div>
           <div>
             <h3 className={\`text-xl font-bold \${textPrimary}\`}>Audio Tracks</h3>
             <p className={\`text-sm \${textSecondary} mt-1\`}>{tracks.length} tracks available</p>
           </div>
        </div>
        <button onClick={() => setShowAddTrack(!showAddTrack)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2">
          {showAddTrack ? <><ChevronRight className="w-4 h-4 rotate-90" /> Close Form</> : <><Plus className="w-4 h-4" /> Add Track</>}
        </button>
      </div>
      
      {showAddTrack && (
        <form onSubmit={handleAddTrack} className={\`p-8 rounded-3xl border \${borderCard} bg-gray-900/50 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300 shadow-inner\`}>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
             <input 
               type="text" placeholder="Song Title" 
               value={newTrack.title} onChange={e => setNewTrack(prev => ({...prev, title: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-emerald-500 transition-colors\`}
               required 
             />
          </div>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Artist</label>
             <input 
               type="text" placeholder="Artist Name" 
               value={newTrack.artist} onChange={e => setNewTrack(prev => ({...prev, artist: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-emerald-500 transition-colors\`}
               required 
             />
          </div>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL / Path</label>
             <input 
               type="text" placeholder="/music/track.mp3" 
               value={newTrack.url} onChange={e => setNewTrack(prev => ({...prev, url: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-emerald-500 transition-colors\`}
               required 
             />
          </div>
          <div className="flex items-end">
             <button type="submit" className="w-full px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
               Save Track
             </button>
          </div>
        </form>
      )}
      
      <div className={\`rounded-3xl border \${borderCard} \${bgCard} overflow-hidden shadow-xl\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/80\`}>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Track</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Source URL</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tracks?.map((track) => (
                <tr key={track.id} className="hover:bg-white/5 transition-colors group">
                  <td className={\`px-6 py-5 whitespace-nowrap font-bold \${textPrimary}\`}>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Music className="w-4 h-4 text-emerald-500" />
                       </div>
                       <div>
                          <div>{track.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{track.artist}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {track.url}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteTrack(track.id)}
                      title="Delete Track"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tracks.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
               <Music className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold">No audio tracks found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
`;

const regexAudio = /const renderAudioTab = \(\) => \([\s\S]*?<\/button>\s*<\/div>\s*<\/td>\s*<\/tr>\s*\)\)}\s*<\/tbody>\s*<\/table>\s*\{tracks\.length === 0 && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/m;
code = code.replace(regexAudio, newAudioTab);

const newVisualsTab = `
  const renderVisualsTab = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
         <h2 className={\`text-3xl font-extrabold \${textPrimary} tracking-tight\`}>Visual Gallery</h2>
         <p className={\`text-base \${textSecondary} mt-2 max-w-2xl\`}>
            Manage images, overlays, and background assets for the community visualizer.
         </p>
      </div>
      
      <div className={\`p-8 rounded-3xl border \${borderCard} \${bgCard} flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl\`}>
        <div className="flex items-center gap-4">
           <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><ImageIcon className="w-6 h-6"/></div>
           <div>
             <h3 className={\`text-xl font-bold \${textPrimary}\`}>Gallery Assets</h3>
             <p className={\`text-sm \${textSecondary} mt-1\`}>{gallery.length} images available</p>
           </div>
        </div>
        <button onClick={() => setShowAddGallery(!showAddGallery)} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2">
          {showAddGallery ? <><ChevronRight className="w-4 h-4 rotate-90" /> Close Form</> : <><Plus className="w-4 h-4" /> Add Image</>}
        </button>
      </div>
      
      {showAddGallery && (
        <form onSubmit={handleAddGallery} className={\`p-8 rounded-3xl border \${borderCard} bg-gray-900/50 grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300 shadow-inner\`}>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
             <input 
               type="text" placeholder="Image Title" 
               value={newGalleryItem.title} onChange={e => setNewGalleryItem(prev => ({...prev, title: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-purple-500 transition-colors\`}
               required 
             />
          </div>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tag</label>
             <input 
               type="text" placeholder="e.g. background" 
               value={newGalleryItem.tag} onChange={e => setNewGalleryItem(prev => ({...prev, tag: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-purple-500 transition-colors\`}
               required 
             />
          </div>
          <div className="space-y-2 md:col-span-1">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
             <input 
               type="text" placeholder="https://..." 
               value={newGalleryItem.src} onChange={e => setNewGalleryItem(prev => ({...prev, src: e.target.value}))}
               className={\`w-full p-4 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-purple-500 transition-colors\`}
               required 
             />
          </div>
          <div className="flex items-end">
             <button type="submit" className="w-full px-4 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
               Save Image
             </button>
          </div>
        </form>
      )}
      
      <div className={\`rounded-3xl border \${borderCard} \${bgCard} overflow-hidden shadow-xl\`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={\`border-b \${borderCard} bg-[#0B0F19]/80\`}>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Image Preview</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Title</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider\`}>Tag</th>
                <th className={\`px-6 py-5 text-xs font-bold \${textSecondary} uppercase tracking-wider text-right\`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {gallery?.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <img src={item.src} alt={item.title} className="w-20 h-12 object-cover rounded-lg border border-gray-700 shadow-sm" referrerPolicy="no-referrer" />
                  </td>
                  <td className={\`px-6 py-5 whitespace-nowrap font-bold \${textPrimary}\`}>
                    {item.title}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-xs font-bold uppercase tracking-wider">{item.tag}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteGallery(item.id)}
                      title="Delete Image"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!gallery || gallery.length === 0) && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
               <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-semibold">No images found in gallery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
`;

const regexVis = /const renderVisualsTab = \(\) => \([\s\S]*?<\/button>\s*<\/div>\s*<\/td>\s*<\/tr>\s*\)\)}\s*<\/tbody>\s*<\/table>\s*\{\(!gallery \|\| gallery\.length === 0\) && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);/m;
code = code.replace(regexVis, newVisualsTab);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
