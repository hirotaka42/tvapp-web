import React, { useState, useEffect} from 'react';
import { platformToken } from '../../models/Token';
import { useSessionService } from '../../hooks/SessionHook';
import { useTvHomeService } from '../../hooks/TvHomeHook';
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
  const [rankingDramaComponent, setRankingDramaComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingVarietyComponent, setRankingVarietyComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingAnimeComponent, setRankingAnimeComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingNewsComponent, setRankingNewsComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
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
          console.log(data); 

          // ランキングドラマのデータを取得
          const rankingComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-drama.' && component.type === 'episodeRanking'
          );
          if (rankingComponents.length > 0) {
            setRankingDramaComponent(rankingComponents[0]);
            console.log("A: ");
            console.log(rankingDramaComponent)
          }
          // ランキングバラエティのデータを取得
          const rankingVarietyComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-variety.' && component.type === 'episodeRanking'
          );
          if (rankingVarietyComponents.length > 0) {
            setRankingVarietyComponent(rankingVarietyComponents[0]);
            console.log("B: ");
            console.log(rankingVarietyComponent)
          }

          // ランキングアニメのデータを取得
          const rankingAnimeComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-anime.' && component.type === 'episodeRanking'
          );
          if (rankingAnimeComponents.length > 0) {
            setRankingAnimeComponent(rankingAnimeComponents[0]);
            console.log("C: ");
            console.log(rankingAnimeComponent)
          }

          // ランキングニュースのデータを取得
          const rankingNewsComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-news.' && component.type === 'episodeRanking'
          );
          if (rankingNewsComponents.length > 0) {
            setRankingNewsComponent(rankingNewsComponents[0]);
            console.log("D: ");
            console.log(rankingNewsComponent)
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
    <h1>Home ip:{process.env.BFF_SERVER}</h1>

    <RankingItemContainer rankingData={rankingDramaComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingVarietyComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingAnimeComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingNewsComponent}></RankingItemContainer>

    </>
  );
}