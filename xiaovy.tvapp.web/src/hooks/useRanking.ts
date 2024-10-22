import { useContext, useEffect, useState } from 'react';
import { RankingServiceContext } from '@/contexts/RankingContext';
import { Main as GenreDetailResponseTypes } from '@/types/RankingGenreDetailResponse'

export function useRankingService(genre: string | null) {
  const RankingService = useContext(RankingServiceContext);

  if (!RankingService) {
    throw new Error('\`useRankingService\` を使用するコンポーネントが \`RankingServiceContext.Provider\` でラップされていることを確認してください。');
  }

  const [data, setData] = useState<GenreDetailResponseTypes | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!genre) {
        return;
      }
      try {
        const result = await RankingService.callRanking(genre);
        setData(result);
        console.log(`${genre}のランキングが取得されました`);
      } catch (error) {
        console.error("Error fetching genre ranking data:", error);
      }
    };

    fetchData();
  }, [genre]);
  return data;
}