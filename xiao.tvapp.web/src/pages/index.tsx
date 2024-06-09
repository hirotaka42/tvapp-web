import type { NextPage } from 'next';
import { SessionService } from '../services/implementation/SessionService'
import { SessionServiceContext } from '../contexts/SessionContext'
import HomeComponent from '../components/Templates/HomeComponent';


const Home: NextPage = () => {
  return (
    <>
    <SessionServiceContext.Provider value={new SessionService()}>
      <HomeComponent />
    </SessionServiceContext.Provider>
    </>
  )
}

export default Home
