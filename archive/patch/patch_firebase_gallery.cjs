const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseProvider.tsx', 'utf8');

if (!code.includes('gallery: GalleryItem[]')) {
  // Add GalleryItem to imports
  code = code.replace(
    /import \{ Streamer, Backsound, LiveStatus, TIKTOK_USERNAMES \} from '\.\.\/types';/,
    `import { Streamer, Backsound, LiveStatus, TIKTOK_USERNAMES, GalleryItem } from '../types';`
  );

  // Add gallery to Context type
  code = code.replace(
    /tracks: Backsound\[\];/,
    `tracks: Backsound[];\n  gallery: GalleryItem[];`
  );

  // Add default gallery
  const defaultGallery = `
const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'gal-1', src: '/Gallery/gallery1.png', title: 'NSN SQUAD', tag: 'Community' },
  { id: 'gal-2', src: '/Gallery/gallery2.png', title: 'NSN969 SQUAD', tag: 'Team Match' },
  { id: 'gal-3', src: '/Gallery/gallery3.png', title: 'NSN HEADQUARTERS', tag: 'Stream Studio' },
  { id: 'gal-4', src: '/Gallery/gallery4.png', title: 'LIVE PRODUCTION', tag: 'Control Room' },
  { id: 'gal-5', src: '/Gallery/gallery5.png', title: 'CHAMPIONS TEAM', tag: 'Achievement' }
];
`;
  code = code.replace(/const DEFAULT_TRACKS/, defaultGallery + "\nconst DEFAULT_TRACKS");

  // Add state
  code = code.replace(
    /const \[tracks, setTracks\] = useState<Backsound\[\]>\(DEFAULT_TRACKS\);/,
    `const [tracks, setTracks] = useState<Backsound[]>(DEFAULT_TRACKS);\n  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY);`
  );

  // Add sync effect
  const syncGallery = `
  // Sync Gallery
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      if (!snapshot.empty) {
        const list: GalleryItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as GalleryItem);
        });
        const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
        setGallery(sorted);
      } else {
        setGallery(DEFAULT_GALLERY);
        if (isAuthAdmin) {
          const batch = writeBatch(db);
          DEFAULT_GALLERY.forEach((item) => {
            batch.set(doc(db, 'gallery', item.id), item);
          });
          batch.commit().catch(err => handleFirestoreError(err, OperationType.CREATE, 'gallery'));
        }
      }
    }, (error) => {
      setGallery(DEFAULT_GALLERY);
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    return () => unsub();
  }, [isAuthAdmin]);
`;

  code = code.replace(/  \/\/ App system settings states/, syncGallery + "\n  // App system settings states");

  // Export gallery in context provider
  code = code.replace(
    /streamers,\n\s*tracks,\n\s*maintenanceMode,/,
    `streamers,\n        tracks,\n        gallery,\n        maintenanceMode,`
  );

  fs.writeFileSync('src/components/FirebaseProvider.tsx', code);
}
