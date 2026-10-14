const fs = require('fs');
let code = fs.readFileSync('src/components/MultiViewPlayer.tsx', 'utf8');

const regex = /const streamerOptions = React\.useMemo\(\(\) => \{[\s\S]*?return list\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\);\s*\}, \[streamers\]\);/;
const replacement = `const streamerOptions = React.useMemo(() => {
    const list: Streamer[] = [];
    streamers.forEach(s => {
      // 1. YouTube option only
      const ytId = s.youtubeId || (s.platform === 'youtube' ? s.channelId : undefined);
      if (ytId) {
        list.push({
          ...s,
          id: \`\${s.id}-youtube\`,
          platform: 'youtube',
          channelId: ytId
        });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [streamers]);`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/MultiViewPlayer.tsx', code);
