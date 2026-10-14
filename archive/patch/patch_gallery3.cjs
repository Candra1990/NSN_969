const fs = require('fs');
let code = fs.readFileSync('src/components/GalleryCarousel.tsx', 'utf8');

code = code.replace(/\/\/ Responsive tracker & Data Fetcher\s*useEffect\(\(\) => \{[\s\S]*?\}, \[[^\]]*\]\);/m, `// Responsive tracker
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`);

fs.writeFileSync('src/components/GalleryCarousel.tsx', code);
