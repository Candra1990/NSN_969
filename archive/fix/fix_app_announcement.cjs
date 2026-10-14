const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const { announcementActive, announcementEn, announcementId } = useFirebase();')) {
  // Update useFirebase call in AppContent
  code = code.replace(
    /const \{ isAdmin, loading: fbLoading, logout \} = useFirebase\(\);/,
    'const { isAdmin, loading: fbLoading, logout, announcementActive, announcementEn, announcementId } = useFirebase();'
  );

  const announcementBanner = `
      {/* Global Announcement Banner */}
      {announcementActive && (announcementEn || announcementId) && (
        <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg border-b border-white/20 fixed top-0 left-0 z-[100] animate-in slide-in-from-top-10 duration-500">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
             <span className="relative flex h-2.5 w-2.5 shrink-0">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
             </span>
             <p className="truncate z-10 font-sans uppercase">
               {dict.language === 'en' ? announcementEn : announcementId}
             </p>
          </div>
        </div>
      )}
  `;
  
  // Insert banner before Navbar
  code = code.replace('{/* Header element */}', announcementBanner + '\n      {/* Header element */}');

  // Adjust body padding to avoid overlapping the navbar with the banner
  code = code.replace(/pt-24 pb-28/, 'pt-24 pb-28 ${announcementActive ? "mt-10" : ""}');
}

fs.writeFileSync('src/App.tsx', code);
