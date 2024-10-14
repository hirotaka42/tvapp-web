import type { NextPage } from 'next';
import { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SessionService } from '@/services/implementation/SessionService'
import { TvHomeService } from '@/services/implementation/TvHomeService'
import { SessionServiceContext } from '@/contexts/SessionContext'
import { TvHomeServiceContext } from '@/contexts/TvHomeContext'
import HomeComponent from '@/components/Pages/Ranking/HomeComponent';
import Header from '@components/Templates/Header';
import Footer from '@components/Templates/Footer';
// グローバルでインスタンスを生成
const sessionServiceInstance = new SessionService();

const Home: NextPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // テーマの作成
  const theme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#ffffff' : '#1f2b3e',
      },
      background: {
        default: isDarkMode ? '#1f2b3e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
      },
    },
  }), [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <>
    <ThemeProvider theme={theme}>
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
    <SessionServiceContext.Provider value={sessionServiceInstance}>
      <TvHomeServiceContext.Provider value={TvHomeService}>
        <Header title="tvapp-web V2"/>
        <button onClick={toggleDarkMode}>
          {isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        </button>
        <HomeComponent />
        <Footer domain="tvapp-web V2"/>
      </TvHomeServiceContext.Provider>
    </SessionServiceContext.Provider>
    </div>
    </ThemeProvider>
    </>
  )
}

export default Home
