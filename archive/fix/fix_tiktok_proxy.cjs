const fs = require('fs');

let code = fs.readFileSync('src/api/tiktok-proxy.ts', 'utf8');

// Remove console.warn
code = code.replace(/console\.warn\(\`\[TikTok Proxy\].*?\`\);/g, '');

fs.writeFileSync('src/api/tiktok-proxy.ts', code);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(/console\.log\(\`\[TikTok background checker\].*?\`\);/g, '');
serverCode = serverCode.replace(/console\.error\(\`\[TikTok background checker\] Error.*?\`, err\);/g, '');
fs.writeFileSync('server.ts', serverCode);
