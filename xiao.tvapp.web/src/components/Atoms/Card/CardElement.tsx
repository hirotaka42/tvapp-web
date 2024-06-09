import React, { useState } from 'react';
import { Card, CardMedia, CardActionArea, Box } from '@mui/material';
import EpisodeImg from '../../../../public/images/PC_img_episode_noimage_small.svg';

interface CardElementProps {
  id: string;
  title: string;
}

export const CardElement: React.FC<CardElementProps> = ( { id, title } ) => {
  const thumbnailUrl = process.env.NEXT_PUBLIC_TVER_THUMBNAIL;
  const [imageLoaded, setImageLoaded] = useState(false);
  const type = id.startsWith('ep') ? 'episode' : 'series';

  return (
    <Box sx={{ padding:'4px', maxWidth: 260, flex: '0 0 auto'}}>
      <Card>
        <CardActionArea
          onClick={() => {
            window.open(`https://tver.jp/${type}/${id}`, '_blank');
          }}>
          <Box sx={{ boxShadow: 4 , display: 'flex'}}>
            <img
              src={`${thumbnailUrl}/${type}/small/${id}.jpg`}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          </Box>
        </CardActionArea>
      </Card>
    </Box>
  );
}