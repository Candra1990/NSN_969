const fs = require('fs');
let code = fs.readFileSync('src/components/GalleryCarousel.tsx', 'utf8');

code = code.replace(/\|\s*'error'\s*\|\s*'local'>\('local'\);/, '');
fs.writeFileSync('src/components/GalleryCarousel.tsx', code);
