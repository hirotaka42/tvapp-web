import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

type Props = {
  domain: string;
}

const Footer: React.FC<Props> = ({ domain }) => {
    return (
        <AppBar position="static" sx={{ bgcolor: '#000' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', textAlign: 'center' }}>
                    © 2024 {domain} All rights reserved.
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Footer;
