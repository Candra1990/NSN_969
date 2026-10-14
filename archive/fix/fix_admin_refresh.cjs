const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

// Update useFirebase call to include refreshLiveStatuses if not already
if (!code.includes('const { logout, streamers, tracks, gallery, liveStatuses, refreshLiveStatuses }')) {
  code = code.replace(
    /const \{ logout, streamers, tracks, gallery, liveStatuses \} = useFirebase\(\);/,
    'const { logout, streamers, tracks, gallery, liveStatuses, refreshLiveStatuses } = useFirebase();'
  );
}

// Add the Refresh button to the dashboard tab
const refreshBtnCode = `
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => refreshLiveStatuses && refreshLiveStatuses()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Force Refresh Live Status
          </button>
        </div>
`;

if (!code.includes('Force Refresh Live Status')) {
  const target = '<div className="grid grid-cols-2 md:grid-cols-4 gap-6">';
  code = code.replace(target, refreshBtnCode + '\n        ' + target);
  code = code.replace('import { Users, AlertTriangle, ShieldCheck, UserCheck, PlayCircle, Image as ImageIcon, MessageSquare, Plus, Edit, Trash, Settings, ChevronRight } from \'lucide-react\';', 'import { Users, AlertTriangle, ShieldCheck, UserCheck, PlayCircle, Image as ImageIcon, MessageSquare, Plus, Edit, Trash, Settings, ChevronRight, RefreshCw } from \'lucide-react\';');
}

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
