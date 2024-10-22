import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import SideBar from '@/components/Templates/SideBar';

type Props = {
  title: string;
}

const Header: React.FC<Props> = ({ title }) => {
    return (
        <AppBar position="static" sx={{ bgcolor: '#FFF' }} elevation={0}>
            <Toolbar>
                <SideBar />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'black', ml: 2 }}>
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Header;
