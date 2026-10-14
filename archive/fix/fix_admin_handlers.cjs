const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

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

code = code.replace(
  /const \[showAddTrack, setShowAddTrack\] = useState\(false\);/,
  "const [showAddTrack, setShowAddTrack] = useState(false);\n" + handlers
);

// Fix TS Error: Type '"tiktok" | "youtube"' is not assignable to type '"youtube"'.
// Change state declaration to: const [newStreamer, setNewStreamer] = useState<{name: string; platform: 'tiktok' | 'youtube'; channelId: string}>({ name: '', platform: 'tiktok', channelId: '' });
code = code.replace(
  /const \[newStreamer, setNewStreamer\] = useState\(\{ name: '', platform: 'youtube', channelId: '' \}\);/,
  "const [newStreamer, setNewStreamer] = useState<{name: string; platform: 'tiktok' | 'youtube'; channelId: string}>({ name: '', platform: 'tiktok', channelId: '' });"
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
