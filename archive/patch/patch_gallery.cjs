const fs = require('fs');
let code = fs.readFileSync('src/components/GalleryCarousel.tsx', 'utf8');

// replace imports and Supabase references
code = code.replace(/import \{ supabase \} from '@\/lib\/supabaseClient';/, `import { useFirebase } from './FirebaseProvider';`);
code = code.replace(/const DEFAULT_IMAGES[\s\S]*?\];/, '');
code = code.replace(/interface GalleryItem[\s\S]*?\}/, '');
code = code.replace(/const \[images, setImages\] = useState<GalleryItem\[\]>\(DEFAULT_IMAGES\);/, `const { gallery: images } = useFirebase();`);
code = code.replace(/const \[dbStatus, setDbStatus\] = useState<'connected' | 'error' | 'local'>\('local'\);/, '');
code = code.replace(/const fetchAssets = useCallback\([\s\S]*?\}, \[\]\);/, '');
code = code.replace(/useEffect\(\(\) => \{\n\s*fetchAssets\(\);\n\n\s*\/\/ Subscribe to real-time changes[\s\S]*?return \(\) => \{\n\s*supabase\.removeChannel\(stickersChannel\);\n\s*supabase\.removeChannel\(visualAssetsChannel\);\n\s*\};\n\s*\}, \[fetchAssets\]\);/, '');

fs.writeFileSync('src/components/GalleryCarousel.tsx', code);
