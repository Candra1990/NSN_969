const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseProvider.tsx', 'utf8');

code = code.replace(
  /await setDoc\(doc\(db, 'streamers', id\), \{\}\); \/\/ block-overwrite, or actually deleting:/g,
  ""
);

code = code.replace(
  /await setDoc\(doc\(db, 'tracks', id\), \{\}\);/g,
  ""
);

code = code.replace(
  /await setDoc\(doc\(db, 'gallery', id\), \{\}\);/g,
  ""
);

fs.writeFileSync('src/components/FirebaseProvider.tsx', code);
