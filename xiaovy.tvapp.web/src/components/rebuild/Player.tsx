'use client';

// src/components/rebuild/Player.tsx
// react-player で YouTube 動画を再生する。SSR 安全に dynamic import する。

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/youtube'), {
  ssr: false,
});

interface PlayerProps {
  videoId: string;
  onStarted?: () => void;
}

export default function Player({ videoId, onStarted }: PlayerProps) {
  return (
    <div className="player-wrapper aspect-video w-full overflow-hidden rounded-lg bg-black">
      <ReactPlayer
        url={`https://www.youtube.com/watch?v=${videoId}`}
        controls
        width="100%"
        height="100%"
        onPlay={onStarted}
      />
    </div>
  );
}
