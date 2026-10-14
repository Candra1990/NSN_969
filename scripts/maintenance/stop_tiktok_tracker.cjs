const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseProvider.tsx', 'utf8');

const regex = /\/\/ 2\. TikTok[\s\S]*?channelId: tiktokUsername\s*\}\);\s*\}/;
code = code.replace(regex, `// 2. TikTok tracking disabled due to blocks, used only for profile links on dashboard`);

fs.writeFileSync('src/components/FirebaseProvider.tsx', code);
