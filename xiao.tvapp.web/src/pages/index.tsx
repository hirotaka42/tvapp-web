import type { NextPage } from 'next';
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
  return (
    <>
    <SessionServiceContext.Provider value={sessionServiceInstance}>
      <TvHomeServiceContext.Provider value={TvHomeService}>
        <Header title="tvapp-web V2"/>
        <HomeComponent />
        <Footer domain="tvapp-web V2"/>
      </TvHomeServiceContext.Provider>
    </SessionServiceContext.Provider>
    </>
  )
}

export default Home
