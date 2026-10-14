const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace the desktop Admin Logout button
code = code.replace(
  /\{\/\* Admin Logout button \*\/\}\s*\{isAdmin && \(\s*<button\s*id="btn-admin-logout"\s*onClick=\{onLogout\}[\s\S]*?<LogOut className="w-4 h-4" \/>\s*<\/button>\s*\)\}/,
  ""
);

fs.writeFileSync('src/components/Navbar.tsx', code);
