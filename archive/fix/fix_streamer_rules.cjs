const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /return data\.keys\(\)\.hasAll\(\['id', 'name', 'platform', 'handle', 'isFeatured'\]\)/,
  "return data.keys().hasAll(['id', 'name', 'platform', 'channelId', 'isFeatured'])"
);

rules = rules.replace(
  /&& data\.handle is string && data\.handle\.size\(\) <= 200/,
  "&& data.channelId is string && data.channelId.size() <= 200"
);

fs.writeFileSync('firestore.rules', rules);
