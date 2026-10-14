const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf8');
code = code.replace('"start": "node dist/server.cjs"', '"start": "NODE_ENV=production node dist/server.cjs"');
fs.writeFileSync('package.json', code);
