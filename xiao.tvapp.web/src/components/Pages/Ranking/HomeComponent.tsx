import React, { useState, useEffect} from 'react';
import { sessionToken } from '@/types/SessionToken';
import { useSessionService } from '@/hooks/SessionHook';
import { useTvHomeService } from '@/hooks/TvHomeHook';
import { RankingItemContainer } from '@/components/Molecules/RankingItemContainer';
import { ContentData } from '@/types/ContentData';

interface Content {
  type: string;
  content: ContentData;
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
  const [token, setToken] = useState<sessionToken>({
    platformUid: '',
    platformToken: '',
  });
  const [rankingDramaComponent, setRankingDramaComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingVarietyComponent, setRankingVarietyComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingAnimeComponent, setRankingAnimeComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const [rankingNewsComponent, setRankingNewsComponent] = useState<ComponentType>({componentID: '', type: '', label: '', contents: []});
  const sessionService = useSessionService();
  const tvHomeService = useTvHomeService();
  const thumbnailUrl = process.env.NEXT_PUBLIC_IMAG_THUMBNAIL;

  
  // #endregion

  // #region React Event -----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem('rankingData');
        const currentTime = new Date().getTime();
        
        // 15分以内のキャッシュがある場合、キャッシュデータを使用
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (currentTime - parsedData.timestamp < 15 * 60 * 1000) {
            setToken(parsedData.token);
            setRankingDramaComponent(parsedData.rankingDramaComponent);
            setRankingVarietyComponent(parsedData.rankingVarietyComponent);
            setRankingAnimeComponent(parsedData.rankingAnimeComponent);
            setRankingNewsComponent(parsedData.rankingNewsComponent);
            return;
          }
        }
        const session = await sessionService.getSession();
        setToken(session);

        // トークンが取得できたら、TvHomeServiceを呼び出します
        if (session.platformUid && session.platformToken) {
          const data = await tvHomeService.callHome(session.platformUid, session.platformToken);
          console.log(data); 

          // ランキングドラマのデータを取得
          const rankingDramaComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-drama.' && component.type === 'episodeRanking'
          );
          if (rankingDramaComponents.length > 0) {
            setRankingDramaComponent(rankingDramaComponents[0]);
          }
          // ランキングバラエティのデータを取得
          const rankingVarietyComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-variety.' && component.type === 'episodeRanking'
          );
          if (rankingVarietyComponents.length > 0) {
            setRankingVarietyComponent(rankingVarietyComponents[0]);
          }

          // ランキングアニメのデータを取得
          const rankingAnimeComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-anime.' && component.type === 'episodeRanking'
          );
          if (rankingAnimeComponents.length > 0) {
            setRankingAnimeComponent(rankingAnimeComponents[0]);
          }

          // ランキングニュースのデータを取得
          const rankingNewsComponents = data.result.components.filter(
            (component: ComponentType) => component.componentID === 'ranking-news.' && component.type === 'episodeRanking'
          );
          if (rankingNewsComponents.length > 0) {
            setRankingNewsComponent(rankingNewsComponents[0]);
          }

          // データをキャッシュに保存
          localStorage.setItem('rankingData', JSON.stringify({
            token: session,
            rankingDramaComponent: rankingDramaComponents[0],
            rankingVarietyComponent: rankingVarietyComponents[0],
            rankingAnimeComponent: rankingAnimeComponents[0],
            rankingNewsComponent: rankingNewsComponents[0],
            timestamp: currentTime,
          }));

        }
      } catch (error) {
        console.error('Error fetching session:', error);
      setToken({ platformUid: 'Error', platformToken: 'Error' });
      }
    }
    fetchData();
  }, []);
  // #endregion


  // #region Screen Event -----------------------
  // #endregion

  // #region Logic -----------------------
  // #endregion

  return (
    <>
    <RankingItemContainer rankingData={rankingDramaComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingVarietyComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingAnimeComponent}></RankingItemContainer>
    <RankingItemContainer rankingData={rankingNewsComponent}></RankingItemContainer>
    </>
  );
}