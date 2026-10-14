const fs = require('fs');

const replacements = [
  {
    file: 'archive/legacy/discord/MessageList/MessageComposer/MessageComposer.tsx',
    from: /'@\/components\/ChannelList\/TopBar\/ChannelListMenuRow'/g,
    to: "'@/archive/legacy/discord/ChannelList/TopBar/ChannelListMenuRow'" // Wait, the alias @ points to src/. I should just use relative paths for archive
  }
];
