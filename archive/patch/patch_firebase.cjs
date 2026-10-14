const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseProvider.tsx', 'utf8');

// Replace streamers sync logic
const newStreamersSync = `  // Sync Streamers List
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'streamers'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Streamer[] = [];
        let needsSync = false;
        
        snapshot.forEach((d) => {
          list.push(d.data() as Streamer);
        });
        
        if (list.length < DEFAULT_STREAMERS.length) {
          needsSync = true;
        } else {
          setStreamers(list);
        }
        
        if (needsSync) {
          // Sync missing defaults to DB
          const batch = writeBatch(db);
          DEFAULT_STREAMERS.forEach(s => {
            if (!list.find(l => l.id === s.id)) {
              batch.set(doc(db, 'streamers', s.id), s);
            }
          });
          batch.commit().catch(console.error);
        }
      } else {
        // DB is empty, initialize it
        const batch = writeBatch(db);
        DEFAULT_STREAMERS.forEach(s => {
          batch.set(doc(db, 'streamers', s.id), s);
        });
        batch.commit().catch(console.error);
        setStreamers(DEFAULT_STREAMERS);
      }
    });

    return () => unsub();
  }, []);`;

code = code.replace(/  \/\/ Sync Streamers List \(Read-only from local code config\)\n  useEffect\(\(\) => \{\n    setStreamers\(DEFAULT_STREAMERS\);\n  \}, \[\]\);/, newStreamersSync);

fs.writeFileSync('src/components/FirebaseProvider.tsx', code);
