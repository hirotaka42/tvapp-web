import React from 'react';
import { Button } from '@mui/material';

interface CopyLinkProps {
  button_title?: string,
  videoLink:string
}

export const Button_CopyLink: React.FC<CopyLinkProps> = ({ button_title="copy-link", videoLink }) => {
    const link = `https://tver.jp/episodes/${videoLink}`

    const handleCopyLink = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        await navigator.clipboard.writeText(link);
        alert('Link copied to clipboard');
    };
    return (
    <Button variant="outlined" onClick={handleCopyLink}>
        {button_title}
    </Button>
    );
};
