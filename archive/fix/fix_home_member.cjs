const fs = require('fs');
let code = fs.readFileSync('src/components/HomeDashboard.tsx', 'utf8');

const regexFilepath = /const filepath = `\/member\/\$\{getMemberPhotoPath\(str\.name\)\}\.\$\{imgExt\}\?v=\$\{MEM_CACHE_BUSTER\}`;/;
const replacementFilepath = `const filepath = str.photoUrl || \`/member/\${getMemberPhotoPath(str.name)}.\${imgExt}?v=\${MEM_CACHE_BUSTER}\`;`;

code = code.replace(regexFilepath, replacementFilepath);

const regexTiktokUsername = /const tiktokUsername = TIKTOK_USERNAMES\[str\.id\] \|\| str\.channelId;/;
const replacementTiktokUsername = `const tiktokUsername = str.tiktokId || TIKTOK_USERNAMES[str.id] || (str.platform === 'tiktok' ? str.channelId : undefined);`;

code = code.replace(regexTiktokUsername, replacementTiktokUsername);

const regexTiktokUrl = /const tiktokUrl = `https:\/\/www\.tiktok\.com\/@\$\{tiktokUsername\}`;/;
const replacementTiktokUrl = `const tiktokUrl = tiktokUsername ? \`https://www.tiktok.com/@\${tiktokUsername.replace('@', '')}\` : '#';`;

code = code.replace(regexTiktokUrl, replacementTiktokUrl);

fs.writeFileSync('src/components/HomeDashboard.tsx', code);
