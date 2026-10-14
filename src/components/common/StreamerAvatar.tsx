import React, { useState } from 'react';

interface StreamerAvatarProps {
  streamName: string;
  photoUrl?: string;
  className?: string;
}

export function StreamerAvatar({ streamName, photoUrl, className }: StreamerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const fallbackSvg = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(streamName)}&backgroundColor=0d0e12`;

  if (failed || !photoUrl) {
    return (
      <img
        src={fallbackSvg}
        alt={streamName}
        className={className}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGQwZTEyIi8+PC9zdmc+';
        }}
      />
    );
  }

  return (
    <img
      src={photoUrl}
      alt={streamName}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

