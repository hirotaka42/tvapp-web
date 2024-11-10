import { useContext, useEffect, useState } from 'react';
import { SeriesServiceContext } from '@/contexts/SeriesContext';
import { Main as EpisodesForSeriseIdResponseTypes } from '@/types/api/response/episodesForSeriseId'
import { sessionToken } from '@/types/Token';

export function useSeriesService(seriesId: string, session:sessionToken | null) {
  const SeriesService = useContext(SeriesServiceContext);

  if (!SeriesService) {
    throw new Error('\`useSeriesService\` を使用するコンポーネントが \`SeriesServiceContext.Provider\` でラップされていることを確認してください。');
  }

  const [data, setData] = useState<EpisodesForSeriseIdResponseTypes | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId || !session) {
        return;
      }
      try {
        const result = await SeriesService.callSeriesContents(seriesId, session);
        setData(result);
        console.log(`${seriesId}のシリーズコンテンツが取得されました`);
      } catch (error) {
        console.error("Error fetching series contents data:", error);
      }
    };

    fetchData();
  }, [seriesId, session]);
  return data;
}