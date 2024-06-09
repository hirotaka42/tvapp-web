import React from 'react';
import { Button } from '@mui/material';

interface OpenIinaProps {
  button_title?: string,
  videoLink:string
}

export const Button_OpenIina: React.FC<OpenIinaProps> = ({ button_title="open-iina", videoLink }) => {
    const link = `https://tver.jp/episodes/${videoLink}`
    return (
        <Button sx={{ flexGrow: 1 }} variant="outlined" href={`iina://open?url=${encodeURIComponent(link)}`}>
        {button_title}
        </Button>
    );
};
