import React, { useState } from 'react';
import { Card, CardActionArea, Box } from '@mui/material';
import EpisodeImg from '../../../../public/images/PC_img_episode_noimage_small.svg';

interface CardElementProps {
  id: string;
  title: string;
}

export const ThumbnailCardElement: React.FC<CardElementProps> = ({ id, title }) => {
  const thumbnailUrl = process.env.NEXT_PUBLIC_TVER_THUMBNAIL;
  const [imageLoaded, setImageLoaded] = useState(false);
  const type_web = id.startsWith('ep') ? 'episodes' : 'series';
  const type = id.startsWith('ep') ? 'episode' : 'series';

  return (
    <Box sx={{ padding: '0px', maxWidth: 260, flex: '0 0 auto' }}>
      <Card>
        <CardActionArea
          onClick={() => {
            window.open(`https://tver.jp/${type_web}/${id}`, '_blank');
          }}>
          <Box sx={{ boxShadow: 4, width: 260, height: 146, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={`${thumbnailUrl}/${type}/small/${id}.jpg`}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                display: imageLoaded ? 'block' : 'none' 
              }}
            />
            {!imageLoaded && (
              <img
                src={EpisodeImg}
                alt="no image"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            )}
          </Box>
        </CardActionArea>
      </Card>
    </Box>
  );
}
