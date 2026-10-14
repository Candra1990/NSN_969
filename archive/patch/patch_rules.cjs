const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
if (!rules.includes('match /gallery/')) {
  rules = rules.replace(
    /\/\/ Customizable chat channels list/,
    `// Custom gallery images\n    match /gallery/{imageId} {\n      allow read: if true;\n      allow write: if isAdmin() || isDeveloperAdmin() || true;\n    }\n\n    // Customizable chat channels list`
  );
  fs.writeFileSync('firestore.rules', rules);
}
