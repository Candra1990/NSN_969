const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Update metrics initialization
if (code.includes('const [metrics, setMetrics] = useState({')) {
  code = code.replace(
    /const \[metrics, setMetrics\] = useState\(\{[\s\S]*?\}\);/,
    `const metrics = { members: streamers.length, live: streamers.filter((s: any) => s.platform === 'tiktok').length, audio: tracks.length, visuals: gallery.length };`
  );
  code = code.replace(/setMetrics\(prev => \(\{ \.\.\.prev, live: list\.length \}\)\);/, '');
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
