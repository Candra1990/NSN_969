const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboardView.tsx', 'utf8');

const tabsReplacement = `  const TABS = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'streamers', label: 'Streamers Management', icon: Users },
    { id: 'audio', label: 'Audio Library', icon: Music },
    { id: 'visuals', label: 'Visual Assets', icon: ImageIcon },
    { id: 'discussions', label: 'Global Discussions', icon: MessageCircle },
    { id: 'stickers', label: 'Custom Stickers', icon: Settings },
    { id: 'hero', label: 'Hero Backgrounds', icon: FileImage },
  ];`;
code = code.replace(/const TABS = \[\s*\{ id: 'dashboard'[\s\S]*?\];/, tabsReplacement);

// Replace activeTab render block
const renderBlockReplacement = `{activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'discussions' && renderDiscussionsTab()}
          {activeTab === 'streamers' && renderPlaceholder('Streamers Management')}
          {activeTab === 'audio' && renderPlaceholder('Audio Library')}
          {activeTab === 'visuals' && renderPlaceholder('Visual Assets')}
          {activeTab === 'stickers' && renderPlaceholder('Custom Stickers')}
          {activeTab === 'hero' && renderPlaceholder('Hero Backgrounds')}`;
code = code.replace(/\{activeTab === 'dashboard'[\s\S]*?\{activeTab === 'visuals' && renderPlaceholder\('Visual Assets'\)\}/, renderBlockReplacement);

fs.writeFileSync('src/components/AdminDashboardView.tsx', code);
