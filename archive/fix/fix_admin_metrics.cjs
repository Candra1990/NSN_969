const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Update useFirebase call to include liveStatuses
if (!code.includes('const { logout, streamers, tracks, gallery, liveStatuses }')) {
  code = code.replace(
    /const \{ logout, streamers, tracks, gallery \} = useFirebase\(\);/,
    'const { logout, streamers, tracks, gallery, liveStatuses } = useFirebase();'
  );
}

// Update metrics
code = code.replace(
  /const metrics = \{ members: streamers\.length, live: streamers\.filter\(\(s: any\) => s\.platform === 'tiktok'\)\.length, audio: tracks\.length, visuals: gallery\.length \};/,
  'const metrics = { members: streamers.length, live: Object.values(liveStatuses || {}).filter((s: any) => s.isLive).length, audio: tracks.length, visuals: gallery.length };'
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
