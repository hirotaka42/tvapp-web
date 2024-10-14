import type { NextPage } from 'next';
import { SessionService } from '@/../src/services/implementation/SessionService'
import { TvHomeService } from '@/../src/services/implementation/TvHomeService'
import { SessionServiceContext } from '@/../src/contexts/SessionContext'
import { TvHomeServiceContext } from '@/../src/contexts/TvHomeContext'
import HomeComponent from '@/../src/components/Pages/Ranking/HomeComponent';

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
