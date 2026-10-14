const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const memberDir = path.join(__dirname, '..', 'public', 'member');

// Ensure the directory exists
if (!fs.existsSync(memberDir)) {
  fs.mkdirSync(memberDir, { recursive: true });
}

const MEMBERS = [
  'blake',
  'hunt',
  'eyangsihir',
  'kai',
  'son',
  'lyn',
  'mamat',
  'tomkeyt',
  'ciyung',
  'doeeng',
  'el',
  'zaskia',
  'cutee',
  'quilla',
  'n4srul',
  'ipul',
  'pobla',
  'aban',
  'along',
  'meimei',
  'serend',
  'amat',
  'claire',
  'andre',
  'varren',
  'jeje',
  'william',
  'acok',
  'berlin',
  'moon',
  'dipsy',
  'yupzy',
  'jnnyruby',
  'geo',
  'yuyun',
  'agatha'
];

// Aesthetic luxury gradients based on member index
const GRADIENT_PALETTES = [
  { r1: 20, g1: 15, b1: 10, r2: 229, g2: 169, b2: 60 },   // Golden Glow
  { r1: 15, g1: 10, b1: 25, r2: 100, g2: 50, b2: 200 },  // Mystical Violet
  { r1: 10, g1: 20, b1: 15, r2: 20, g2: 180, b2: 120 },   // Emerald Aurum
  { r1: 25, g1: 10, b1: 10, r2: 220, g2: 60, b2: 60 },    // Crimson Spark
  { r1: 10, g1: 15, b1: 25, r2: 40, g2: 140, b2: 250 }    // Sapphire Steel
];

function generateMemberImage(filename, name, paletteIndex) {
  const width = 200; // 200x250 is plenty for dashboard card avatars and keeps file size super light
  const height = 250;
  const png = new PNG({ width, height });

  const palette = GRADIENT_PALETTES[paletteIndex % GRADIENT_PALETTES.length];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Linear gradient calculation with soft background vignette
      const factor = y / height;
      const xFactor = x / width;
      const r = Math.round(palette.r1 * (1 - factor) + palette.r2 * factor * 0.12 + (xFactor * 10));
      const g = Math.round(palette.g1 * (1 - factor) + palette.g2 * factor * 0.12 + (xFactor * 8));
      const b = Math.round(palette.b1 * (1 - factor) + palette.b2 * factor * 0.12 + (xFactor * 5));

      // Draw active circular frame/vignette in the middle
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      let finalR = r;
      let finalG = g;
      let finalB = b;

      // Dark elegant vignette edges
      const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
      const vignette = 1 - (dist / maxDist) ** 1.8;
      
      finalR = Math.max(0, Math.min(255, Math.round(finalR * (vignette * 0.65 + 0.35))));
      finalG = Math.max(0, Math.min(255, Math.round(finalG * (vignette * 0.65 + 0.35))));
      finalB = Math.max(0, Math.min(255, Math.round(finalB * (vignette * 0.65 + 0.35))));

      // Golden center core flare/aesthetic ring
      if (dist > 52 && dist < 54) {
        // Glowing gold ring divider
        finalR = Math.round(finalR * 0.25 + 229 * 0.75);
        finalG = Math.round(finalG * 0.25 + 169 * 0.75);
        finalB = Math.round(finalB * 0.25 + 60 * 0.75);
      } else if (dist < 52) {
        // Inner circle glowing base
        const innerRatio = 1 - (dist / 52);
        finalR = Math.min(255, finalR + Math.round(palette.r2 * innerRatio * 0.3));
        finalG = Math.min(255, finalG + Math.round(palette.g2 * innerRatio * 0.3));
        finalB = Math.min(255, finalB + Math.round(palette.b2 * innerRatio * 0.3));
      }

      png.data[idx] = finalR;
      png.data[idx + 1] = finalG;
      png.data[idx + 2] = finalB;
      png.data[idx + 3] = 255; // Alpha
    }
  }

  // Save compiled stream to disk
  const filePath = path.join(memberDir, filename);
  png.pack().pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
      console.log(`Successfully generated placeholder: ${filename}`);
    })
    .on('error', (err) => {
      console.error(`Error saving ${filename}:`, err);
    });
}

console.log('Generating elite NSN969 member placeholder photos...');
MEMBERS.forEach((m, idx) => {
  const filename = `nsn969${m}.png`;
  generateMemberImage(filename, m, idx);
});
