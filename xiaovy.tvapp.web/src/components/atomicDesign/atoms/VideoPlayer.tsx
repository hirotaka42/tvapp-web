import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onPlay?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onPlay }) => {
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
          controls={true}
          width='100%'
          height='100%'
          onPlay={handlePlay}
        />
      ) : (
        <div className="loading-placeholder">
          <p>読み込み中...</p>
        </div>
      )}
    </div>
  );
};