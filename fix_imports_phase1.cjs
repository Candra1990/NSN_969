const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src').concat(['./server.ts']);

const replacements = [
  // contexts
  { from: /['"]\.\/?components\/FirebaseProvider['"]/g, to: "'@/contexts/FirebaseProvider'" },
  { from: /['"]\.\/?components\/ThemeProvider['"]/g, to: "'@/contexts/ThemeProvider'" },
  { from: /['"]\.\/?components\/LanguageProvider['"]/g, to: "'@/contexts/LanguageProvider'" },
  { from: /['"](\.\.\/)*components\/FirebaseProvider['"]/g, to: "'@/contexts/FirebaseProvider'" },
  { from: /['"](\.\.\/)*components\/ThemeProvider['"]/g, to: "'@/contexts/ThemeProvider'" },
  { from: /['"](\.\.\/)*components\/LanguageProvider['"]/g, to: "'@/contexts/LanguageProvider'" },
  
  // admin
  { from: /['"](\.\.\/)*components\/AdminDashboardView['"]/g, to: "'@/features/admin/AdminDashboardView'" },
  { from: /['"](\.\.\/)*components\/AdminLogin['"]/g, to: "'@/features/admin/AdminLogin'" },

  // multiview
  { from: /['"](\.\.\/)*components\/MultiViewPlayer['"]/g, to: "'@/features/multiview/MultiViewPlayer'" },
  { from: /['"](\.\.\/)*components\/features\/player\/TikTokLivePlayer['"]/g, to: "'@/features/multiview/TikTokLivePlayer'" },
  { from: /['"](\.\.\/)*components\/features\/player\/ChatOverlay['"]/g, to: "'@/features/multiview/ChatOverlay'" },
  { from: /['"](\.\/)?features\/player\/TikTokLivePlayer['"]/g, to: "'@/features/multiview/TikTokLivePlayer'" },
  { from: /['"](\.\/)?features\/player\/ChatOverlay['"]/g, to: "'@/features/multiview/ChatOverlay'" },

  // home
  { from: /['"](\.\.\/)*components\/HomeDashboard['"]/g, to: "'@/features/home/HomeDashboard'" },
  { from: /['"](\.\.\/)*components\/GalleryCarousel['"]/g, to: "'@/features/home/GalleryCarousel'" },
  { from: /['"](\.\.\/)*components\/StreamerAvatar['"]/g, to: "'@/features/home/StreamerAvatar'" },
  { from: /['"](\.\.\/)*components\/MemberIllustration['"]/g, to: "'@/features/home/MemberIllustration'" },
  { from: /['"]\.\/MemberIllustration['"]/g, to: "'@/features/home/MemberIllustration'" },

  // gta-card
  { from: /['"](\.\.\/)*components\/GtaCardGenerator['"]/g, to: "'@/features/gta-card/GtaCardGenerator'" },
  { from: /['"](\.\.\/)*components\/RefineMaskEditor['"]/g, to: "'@/features/gta-card/RefineMaskEditor'" },
  
  // mail
  { from: /['"](\.\.\/)*components\/GmailClient['"]/g, to: "'@/features/mail/GmailClient'" },

  // ui
  { from: /['"](\.\.\/)*components\/AudioPlayer['"]/g, to: "'@/components/ui/AudioPlayer'" },
  { from: /['"](\.\.\/)*components\/Navbar['"]/g, to: "'@/components/ui/Navbar'" },
  { from: /['"](\.\.\/)*components\/FontSelector['"]/g, to: "'@/components/ui/FontSelector'" },
  { from: /['"](\.\.\/)*components\/CommunityChat['"]/g, to: "'@/components/ui/CommunityChat'" },
  { from: /['"](\.\.\/)*lib\/LoadingScreen['"]/g, to: "'@/components/ui/LoadingScreen'" },

  // error
  { from: /['"](\.\.\/)*components\/ErrorBoundary['"]/g, to: "'@/components/error/ErrorBoundary'" },

  // other
  { from: /['"](\.\.\/)*lib\/firebase['"]/g, to: "'@/lib/firebase'" },
  { from: /['"](\.\.\/)*lib\/crypto['"]/g, to: "'@/lib/crypto'" },
  { from: /['"](\.\.\/)*lib\/totp['"]/g, to: "'@/lib/totp'" },
  { from: /['"](\.\.\/)*types['"]/g, to: "'@/types'" },
  { from: /['"](\.\.\/)*model\/UserObject['"]/g, to: "'@/model/UserObject'" },

  // server specific
  { from: /['"]\.\/src\/api\/tiktok-proxy['"]/g, to: "'./server/services/tiktok-proxy'" }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.from, r.to);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
