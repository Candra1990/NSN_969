const fs = require('fs');
const path = require('path');

const memberDir = path.join(__dirname, '..', 'public', 'member');

// Exceptions that should NOT be modified
const KEEP_FILES = ['kael_blake.png', 'hunt969.png'];

// The new source photos to map from
const SOURCE_PHOTOS = [
  'nsnfoto.png',
  'nsnfoto(Copy).png',
  'nsnfoto(Copy 2).png',
  'nsnfoto(Copy 3).png',
  'nsnfoto(Copy 4).png',
  'nsnfoto(Copy)(Copy).png',
  'nsnfoto(Copy)(Copy 2).png',
  'nsnfoto(Copy)(Copy 3).png',
  'nsnfoto(Copy)(Copy 4).png'
];

// List of standard member filenames to replace
const OLD_SLUGS = [
  'eyangsihir',
  'kai_baenara',
  'son',
  'lyn_stach',
  'mamatcha',
  'tom_keyt',
  'ciyung_kocak',
  'doeeng',
  'el_nekelins',
  'zaskiachr',
  'ic_cutee_piee',
  'khaizure',
  'n4srul',
  'ipulsadila',
  'pobla',
  'abanosz',
  'along',
  'mei_mei',
  'serend',
  'amat_timpas',
  'claire_jeder',
  'andre_myway',
  'verren',
  'nsn969jeje',
  'william_stach',
  'acok_bihun',
  'berlin_ham',
  'moonn',
  'dipsydipo'
];

function run() {
  console.log('Starting photo migration...');

  // 1. Copy source photos to their new filenames: nsn969[member_slug].png
  OLD_SLUGS.forEach((slug, idx) => {
    // Dynamically choose one of the 9 newly uploaded source photo files based on index
    const srcName = SOURCE_PHOTOS[idx % SOURCE_PHOTOS.length];
    const srcPath = path.join(memberDir, srcName);
    const destName = `nsn969${slug}.png`;
    const destPath = path.join(memberDir, destName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcName} to ${destName}`);
    } else {
      console.warn(`Source photo not found: ${srcName}`);
    }
  });

  // 2. Delete the old, broken files from disk
  const files = fs.readdirSync(memberDir);
  files.forEach(file => {
    const filePath = path.join(memberDir, file);
    
    // Skip if it's one of the exceptions
    if (KEEP_FILES.includes(file)) {
      return;
    }
    
    // Skip the newly created nsn969[slug].png files
    if (file.startsWith('nsn969') && file !== 'nsn969jeje.png' && file !== 'nsn969jeje.PNG') {
      // Wait, is 'nsn969jeje' in our OLD_SLUGS? Yes, old slug is 'nsn969jeje'. 
      // The new filename will be 'nsn969nsn969jeje.png'.
      // So any file starting with 'nsn969' except the original 'nsn969jeje.png' is a new file!
      return;
    }

    // Skip the 9 source photos themselves
    if (SOURCE_PHOTOS.includes(file)) {
      return;
    }

    // Delete the old file
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted old broken photo: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err.message);
    }
  });

  console.log('Photo migration completed successfully!');
}

run();
