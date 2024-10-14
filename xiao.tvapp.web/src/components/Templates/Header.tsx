import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

type Props = {
  title: string;
}

const Header: React.FC<Props> = ({ title }) => {
    return (
        <AppBar position="static" sx={{ bgcolor: '#000' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Header;
