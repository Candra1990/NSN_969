const fs = require('fs');
let code = fs.readFileSync('src/api/tiktok-proxy.ts', 'utf8');

if (!code.includes("res.on('error'")) {
  code = code.replace(
    "res.on('data', (chunk: Buffer) => {",
    "res.on('error', (err) => reject(err));\n        res.on('data', (chunk: Buffer) => {"
  );
  fs.writeFileSync('src/api/tiktok-proxy.ts', code);
}
