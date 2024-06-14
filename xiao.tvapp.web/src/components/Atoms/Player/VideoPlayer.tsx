import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

export const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  return (
    <div className='player-wrapper'>
      {clientSide && (
        <ReactPlayer
          className='react-player'
          url={url}
          controls={true}
          width='100%'
          height='100%'
        />
      )}
    </div>
  );
};