const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Fix FirebaseProvider destructuring
code = code.replace(
  /const \{ logout, streamers, deleteStreamerFromDb, addStreamerToDb, tracks, gallery \} = useFirebase\(\);/,
  `const { logout, streamers, tracks, gallery } = useFirebase();`
);

// Remove mock member handlers that cause errors
code = code.replace(/const handlePromote = \([\s\S]*?\}\s*\};\s*const handleRestrict = \([\s\S]*?\}\s*\};\s*const handleDeleteMember = \([\s\S]*?\}\s*\};/, '');
// Sometimes the regex above fails. Let's manually replace the block:
code = code.replace(/const handlePromote = \(id: string\) => \{[\s\S]*?setMembersList\(prev => prev\.filter\(m => m\.id !== id\)\);\n    \}\n  \};/, '');


// Add Streamer, Audio, Gallery handlers
const handlers = `
  const handleAddStreamer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamer.name || !newStreamer.channelId) return;
    const newId = \`str-\${Date.now()}\`;
    await setDoc(doc(db, 'streamers', newId), {
      id: newId,
      name: newStreamer.name,
      platform: newStreamer.platform,
      channelId: newStreamer.channelId,
      isLive: false
    });
    setNewStreamer({ name: '', platform: 'tiktok', channelId: '' });
    setShowAddStreamer(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Remove this streamer?')) {
      await deleteDoc(doc(db, 'streamers', id));
    }
  };

  const handleAddTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrack.title || !newTrack.url) return;
    const newId = \`trk-\${Date.now()}\`;
    await setDoc(doc(db, 'tracks', newId), {
      id: newId,
      title: newTrack.title,
      artist: newTrack.artist,
      url: newTrack.url
    });
    setNewTrack({ title: '', artist: '', url: '' });
    setShowAddTrack(false);
  };

  const handleDeleteTrack = async (id: string) => {
    if (confirm('Remove this track?')) {
      await deleteDoc(doc(db, 'tracks', id));
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

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Remove this image?')) {
      await deleteDoc(doc(db, 'gallery', id));
    }
  };
`;

code = code.replace(/const handlePromote = \(id: string\) => \{/, handlers + '\n  const handlePromote = (id: string) => {');

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
