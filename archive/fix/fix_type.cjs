const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace(
  /useState\(\{ name: '', platform: 'youtube' as const, channelId: '' \}\);/,
  "useState<{name: string, platform: 'tiktok' | 'youtube', channelId: string}>({ name: '', platform: 'youtube', channelId: '' });"
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
