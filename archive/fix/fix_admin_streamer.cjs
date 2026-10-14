const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace(
  /isLive: false/,
  "isFeatured: false, category: 'NSN Community Stream'"
);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
