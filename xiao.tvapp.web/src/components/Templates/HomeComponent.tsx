import React, { useState, useEffect} from 'react';
import { platformToken } from '../../models/Token';
import { useSessionService } from '../../hooks/SessionHook';
import { ItemContainer } from '../Atoms/Card/ItemContainer';

export default function HomeComponent( ) {
  // #region Variable -----------------------
  // #endregion
  
  // #region State -----------------------
  const [token, setToken] = useState<platformToken>({
    platformUid: '',
    platformToken: '',
  });
  const sessionService = useSessionService();
  const episodeid = "epy7lvmdcg";
  const episodeTitle = "第8話 2人を引き裂く運命…事件当日の真相と罪の告白";
  const seriesTitle = "９ボーダー";
  const broadcasterName = "TBS";
  const broadcastDateLabel = "6月7日(金)放送分";
  
  // #endregion

  // #region React Event -----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await sessionService.getSession();
        setToken(session);
      } catch (error) {
        console.error('Error fetching session:', error);
      setToken({ platformUid: 'Error', platformToken: 'Error' });
      }
    }
    fetchData();

  }, [sessionService]);
  // #endregion


  // #region Screen Event -----------------------
  // #endregion

  // #region Logic -----------------------
  // #endregion

  return (
    <>
    <h1>Home</h1>
    {token ? (
      <>
        <h3>{token.platformUid}</h3>
        <h3>{token.platformToken}</h3>
      </>
    ) : (
      <p>Loading...</p>
    )} 

    <ItemContainer 
      id={episodeid} 
      episodeTitle={episodeTitle} 
      seriesTitle={seriesTitle} 
      broadcastDateLabel={broadcastDateLabel} 
      broadcasterName={broadcasterName} 
    ></ItemContainer>
    </>
  );
}