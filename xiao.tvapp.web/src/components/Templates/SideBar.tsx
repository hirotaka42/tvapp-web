import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { useRouter } from 'next/router'; 

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function SideBar() {
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const router = useRouter();
    const genreMapping: { [key: string]: string } = {
        '総合': 'all',
        'ドラマ': 'drama',
        'バラエティ': 'variety',
        'アニメ': 'anime',
        '報道': 'news_documentary',
        'スポーツ': 'sports',
        'その他': 'other',
    };

    const toggleDrawer = (anchor: Anchor, open: boolean) =>
        (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };

    const handleClick = (genre: keyof typeof genreMapping) => {
        const englishGenre = genreMapping[genre];
        if (englishGenre) {
          router.push(`/rankings/episode/${englishGenre}`);
        }
    };

    const list = (anchor: Anchor) => (
        <Box
        sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
        role="presentation"
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
        >
        <List>
            {['ホーム', 'お気に入り', 'あとで見る', '視聴履歴'].map((text, index) => (
            <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => {
                    if (text === 'ホーム') {
                        router.push('/');
                    } else {
                        // 他のケースの処理
                        // todo
                    }
                }}>
                <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
            ))}
        </List>
        <Divider />
        <List>
            {['総合', 'ドラマ', 'バラエティ', 'アニメ', '報道', 'スポーツ', 'その他'].map((text, index) => (
            <ListItem key={text} disablePadding>
                <ListItemButton onClick={() => handleClick(text)}>
                <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
            ))}
        </List>
        </Box>
    );

    return (
        <div>
        {(['left'] as const).map((anchor) => (
            <React.Fragment key={anchor}>
            <IconButton onClick={toggleDrawer(anchor, true)}>
                <SvgIcon sx={{ color: 'white' }}>
                <image href="/images/bars_24.svg" width="24" height="24" />
                </SvgIcon>
            </IconButton>
            <Drawer
                anchor={anchor}
                open={state[anchor]}
                onClose={toggleDrawer(anchor, false)}
            >
                {list(anchor)}
            </Drawer>
            </React.Fragment>
        ))}
        </div>
    );
}