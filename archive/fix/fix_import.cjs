const fs = require('fs');
let code = fs.readFileSync('src/components/MultiViewPlayer.tsx', 'utf8');

if (!code.includes("import { StreamerAvatar }")) {
  code = code.replace("import React,", "import { StreamerAvatar } from './StreamerAvatar';\nimport React,");
  fs.writeFileSync('src/components/MultiViewPlayer.tsx', code);
}
