import React from 'react';
import { CardContent, Typography } from '@mui/material';
import { ThumbnailCardElement } from '@/components/Atoms/Card/ThumbnailCard';

interface Content {
  type: string;
  content: {
    id: string;
    version: number;
    title: string;
    seriesID: string;
    endAt: number;
    broadcastDateLabel: string;
    isNHKContent: boolean;
    isSubtitle: boolean;
    ribbonID: number;
    seriesTitle: string;
    isAvailable: boolean;
    broadcasterName: string;
    productionProviderName: string;
  };
  rank: number;
}

export const ItemContainer: React.FC<{ item:Content }> = ({ item }) => {
  return (
    <>
    <div style={{ display: 'inline-block', width: 'auto', maxWidth: 260 }}>
      <ThumbnailCardElement item={item} />
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
          {item.content.seriesTitle}
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
          {item.content.title}
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
            {item.content.broadcasterName} {item.content.broadcastDateLabel}
        </Typography>
      </CardContent>
    </div>
    </>
  );
};