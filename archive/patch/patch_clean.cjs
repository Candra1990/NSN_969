const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

code = code.replace(/const handlePromote = \([\s\S]*?\}\s*\};\s*const handleRestrict = \([\s\S]*?\}\s*\};\s*const handleDeleteMember = \([\s\S]*?\}\s*\};/, '');
fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
