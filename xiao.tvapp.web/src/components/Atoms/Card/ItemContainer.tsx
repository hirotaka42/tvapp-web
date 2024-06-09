import React from 'react';
import { CardContent, Typography } from '@mui/material';
import { ThumbnailCardElement } from './ThumbnailCard';

interface ItemContainerProps {
    seriesTitle: string;
    episodeTitle: string;
    broadcasterName: string;
    broadcastDateLabel: string;
    id: string;
}

export const ItemContainer: React.FC<ItemContainerProps> = ({ seriesTitle, episodeTitle, broadcasterName,broadcastDateLabel, id }) => {
  return (
    <>
    <div style={{ display: 'inline-block', width: 'auto', maxWidth: 260 }}>
      <ThumbnailCardElement id={id} title={episodeTitle} />
      <CardContent 
        sx={{ 
          marginTop: 1,
          padding: 0,
          width: '100%',
          borderRadius: '5px',
          '&.MuiCardContent-root:last-child': {
            paddingBottom: 0,
          },
        }}
      >
        <Typography variant="h6" component="div" 
          sx={{
            fontSize: '15px',
            lineHeight: '18px',
            paddingBottom: '2px',
            fontWeight: '700',
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: '#1f2b3e',
            marginBottom: '0.5px',
          }}
        >
          {seriesTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary"
          sx={{
            fontSize: '13px',
            lineHeight: '17px',
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: '#1f2b3e',
            marginBottom: '0.5px',
          }}
        >
          {episodeTitle}
        </Typography>
        <Typography 
            variant="body2" color="text.secondary"
            sx={{
                fontSize: '13px',
                lineHeight: '20px',
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                boxSizing: 'border-box',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {broadcasterName} {broadcastDateLabel}
        </Typography>
      </CardContent>
    </div>
    </>
  );
};