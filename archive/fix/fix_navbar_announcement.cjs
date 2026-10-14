const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  /<Navbar /,
  '<Navbar announcementActive={announcementActive} '
);

fs.writeFileSync('src/App.tsx', appCode);

let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace('interface NavbarProps {', 'interface NavbarProps {  announcementActive?: boolean;');
navCode = navCode.replace('export function Navbar({ currentView, setView, isAdmin, onLogout }: NavbarProps) {', 'export function Navbar({ currentView, setView, isAdmin, onLogout, announcementActive }: NavbarProps) {');

navCode = navCode.replace('fixed top-0 left-0 right-0', 'fixed ${announcementActive ? "top-10" : "top-0"} left-0 right-0');

fs.writeFileSync('src/components/Navbar.tsx', navCode);
