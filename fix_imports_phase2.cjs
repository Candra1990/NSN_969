const fs = require('fs');

const fixMap = [
  // App.tsx
  { file: 'src/App.tsx', find: /['"]\.\/components\/Navbar['"]/g, replace: "'@/components/ui/Navbar'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/AudioPlayer['"]/g, replace: "'@/components/ui/AudioPlayer'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/HomeDashboard['"]/g, replace: "'@/features/home/HomeDashboard'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/MultiViewPlayer['"]/g, replace: "'@/features/multiview/MultiViewPlayer'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/CommunityChat['"]/g, replace: "'@/components/ui/CommunityChat'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/GmailClient['"]/g, replace: "'@/features/mail/GmailClient'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/GtaCardGenerator['"]/g, replace: "'@/features/gta-card/GtaCardGenerator'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/AdminLogin['"]/g, replace: "'@/features/admin/AdminLogin'" },
  { file: 'src/App.tsx', find: /['"]\.\/components\/AdminDashboardView['"]/g, replace: "'@/features/admin/AdminDashboardView'" },

  // src/components/ui/AudioPlayer.tsx
  { file: 'src/components/ui/AudioPlayer.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/components/ui/AudioPlayer.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/components/ui/CommunityChat.tsx
  { file: 'src/components/ui/CommunityChat.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/components/ui/Navbar.tsx
  { file: 'src/components/ui/Navbar.tsx', find: /['"]\.\/LanguageProvider['"]/g, replace: "'@/contexts/LanguageProvider'" },
  { file: 'src/components/ui/Navbar.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/features/admin/AdminDashboardView.tsx
  { file: 'src/features/admin/AdminDashboardView.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },
  { file: 'src/features/admin/AdminDashboardView.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/features/admin/AdminDashboardView.tsx', find: /['"]\.\/GalleryCarousel['"]/g, replace: "'@/features/home/GalleryCarousel'" },

  // src/features/admin/AdminLogin.tsx
  { file: 'src/features/admin/AdminLogin.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/features/admin/AdminLogin.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/features/gta-card/GtaCardGenerator.tsx
  { file: 'src/features/gta-card/GtaCardGenerator.tsx', find: /['"]\.\/LanguageProvider['"]/g, replace: "'@/contexts/LanguageProvider'" },
  { file: 'src/features/gta-card/GtaCardGenerator.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },
  { file: 'src/features/gta-card/GtaCardGenerator.tsx', find: /['"]\.\/FontSelector['"]/g, replace: "'@/components/ui/FontSelector'" },

  // src/features/home/GalleryCarousel.tsx
  { file: 'src/features/home/GalleryCarousel.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/features/home/GalleryCarousel.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/features/home/HomeDashboard.tsx
  { file: 'src/features/home/HomeDashboard.tsx', find: /['"]\.\/LanguageProvider['"]/g, replace: "'@/contexts/LanguageProvider'" },
  { file: 'src/features/home/HomeDashboard.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/features/home/HomeDashboard.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/features/multiview/MultiViewPlayer.tsx
  { file: 'src/features/multiview/MultiViewPlayer.tsx', find: /['"]\.\/StreamerAvatar['"]/g, replace: "'@/features/home/StreamerAvatar'" },
  { file: 'src/features/multiview/MultiViewPlayer.tsx', find: /['"]\.\/LanguageProvider['"]/g, replace: "'@/contexts/LanguageProvider'" },
  { file: 'src/features/multiview/MultiViewPlayer.tsx', find: /['"]\.\/FirebaseProvider['"]/g, replace: "'@/contexts/FirebaseProvider'" },
  { file: 'src/features/multiview/MultiViewPlayer.tsx', find: /['"]\.\/ThemeProvider['"]/g, replace: "'@/contexts/ThemeProvider'" },

  // src/features/multiview/TikTokLivePlayer.tsx
  { file: 'src/features/multiview/TikTokLivePlayer.tsx', find: /['"]\.\.\/\.\.\/MemberIllustration['"]/g, replace: "'@/features/home/MemberIllustration'" },

  // src/main.tsx
  { file: 'src/main.tsx', find: /['"]\.\/components\/ErrorBoundary\.tsx['"]/g, replace: "'@/components/error/ErrorBoundary'" }
];

fixMap.forEach(({file, find, replace}) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(find, replace);
    fs.writeFileSync(file, content);
  }
});
