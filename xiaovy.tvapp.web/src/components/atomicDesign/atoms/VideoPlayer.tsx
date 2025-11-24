import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onPlay?: () => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  playing?: boolean;
  controls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onPlay, onProgress, playing = true, controls = true }) => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  // ReactPlayerの再生イベント処理
  const handlePlay = () => {
    console.log('動画が再生されました');
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div className='player-wrapper'>
      {clientSide ? (
        <ReactPlayer
          className='react-player'
          url={url}
          controls={controls}
          playing={playing}
          width='100%'
          height='100%'
          onPlay={handlePlay}
          onProgress={onProgress}
          progressInterval={500}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                playsInline: true,
              },
            },
          }}
        />
      ) : (
        <div className="loading-placeholder">
          <p>読み込み中...</p>
        </div>
      )}
    </div>
  );
};