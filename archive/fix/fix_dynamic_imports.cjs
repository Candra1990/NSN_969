const fs = require('fs');
let code = fs.readFileSync('src/components/FirebaseProvider.tsx', 'utf8');

code = code.replace(
  /const \{ deleteDoc, doc, setDoc \} = await import\('firebase\/firestore'\);/g,
  ""
);
code = code.replace(
  /const \{ deleteDoc \} = await import\('firebase\/firestore'\);/g,
  ""
);

fs.writeFileSync('src/components/FirebaseProvider.tsx', code);
