import React, { useState, useEffect} from 'react';
import { platformToken } from '../../models/Token';
import { useSessionService } from '../../hooks/SessionHook';
import { useTvHomeService } from '../../hooks/TvHomeHook';
import { ItemContainer } from '../Atoms/Card/ItemContainer';
import { RankingItemContainer } from '../Molecules/RankingItemContainer';

interface Content {
  type: string;
  content: {
    id: string;
    version: number;
    title: string;
    seriesID: string;
    endAt: number;
    broadcastDateLabel: string;
    isNHKContent: boolean;
    isSubtitle: boolean;
    ribbonID: number;
    seriesTitle: string;
    isAvailable: boolean;
    broadcasterName: string;
    productionProviderName: string;
  };
  rank: number;
}

interface ComponentType {
  componentID: string;
  type: string;
  label: string;
  contents: Content[];
}

export default function HomeComponent( ) {
  // #region Variable -----------------------
  // #endregion
  
  // #region State -----------------------
  const [token, setToken] = useState<platformToken>({
    platformUid: '',
    platformToken: '',
  });
  const [rankingData, setRankingData] = useState<Content[]>([]);
  const sessionService = useSessionService();
  const tvHomeService = useTvHomeService();

  
  // #endregion

  // #region React Event -----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await sessionService.getSession();
        setToken(session);

        // トークンが取得できたら、TvHomeServiceを呼び出します
        if (session.platformUid && session.platformToken) {
          const data = await tvHomeService.callHome(session.platformUid, session.platformToken);
          console.log(data); // 番組情報をコンソールに出力します
          const rankingComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-drama.' && component.type === 'episodeRanking'
          );
          if (rankingComponents.length > 0) {
            setRankingData(rankingComponents[0].contents);
            console.log("A: ");
            console.log(rankingData)
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      setToken({ platformUid: 'Error', platformToken: 'Error' });
      }
    }
    fetchData();

  }, [sessionService, tvHomeService]);
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

    <RankingItemContainer rankingData={rankingData}></RankingItemContainer>

    {/* {rankingData.map((content, index) => (
        <ItemContainer
          key={index}
          id={content.content.id}
          episodeTitle={content.content.title}
          seriesTitle={content.content.seriesTitle}
          broadcastDateLabel={content.content.broadcastDateLabel}
          broadcasterName={content.content.broadcasterName}
        />
      ))} */}
    </>
  );
}