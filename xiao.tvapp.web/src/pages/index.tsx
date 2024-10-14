import type { NextPage } from 'next';
import { SessionService } from '../services/implementation/SessionService'
import { TvHomeService } from '../services/implementation/TvHomeService'
import { SessionServiceContext } from '../contexts/SessionContext'
import { TvHomeServiceContext } from '../contexts/TvHomeContext'
import HomeComponent from '../components/Templates/HomeComponent';

// グローバルでインスタンスを生成
const sessionServiceInstance = new SessionService();

const Home: NextPage = () => {
  return (
    <>
    <SessionServiceContext.Provider value={sessionServiceInstance}>
      <TvHomeServiceContext.Provider value={TvHomeService}>
        <HomeComponent />
      </TvHomeServiceContext.Provider>
    </SessionServiceContext.Provider>
    </>
  )
}

export default Home
