import { useContext, useEffect, useState } from 'react';
import { EpisodeServiceContext } from '@/contexts/EpisodeContext';
import { Main as EpisodeResponseType } from '@/types/EpisodeResponse';

export function useEpisodeService(episodeId: string) {
  const EpisodeService = useContext(EpisodeServiceContext);
  
  if (!EpisodeService) {
    throw new Error('\`useCallEpisodeService\` を使用するコンポーネントが \`EpisodeServiceContext.Provider\` でラップされていることを確認してください。');
  }

  const [episodeData, setEpisodeData] = useState<EpisodeResponseType | null>(null);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        const data = await EpisodeService.callEpisodeInfo(episodeId);
        setEpisodeData(data);
        console.log('エピソードデータが取得されました');
      } catch (error) {
        console.error("Error fetching episode data:", error);
      }
    };

    if (episodeId) {
      fetchEpisodeData();
    }
  }, [episodeId, EpisodeService]); // EpisodeService を依存配列に追加することで、EpisodeService のインスタンスが変更された場合に再度データを取得する

  return episodeData;
}