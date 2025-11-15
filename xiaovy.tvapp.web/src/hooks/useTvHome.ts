import { useContext, useEffect, useState } from 'react';
import { TvHomeServiceContext } from '@/contexts/TvHomeContext';
import { Main as HomeResponseType } from '@/types/HomeResponse';
import { sessionToken } from '@/types/Token';

export function useTvHomeService(session: sessionToken | null) {
  const tvHomeService = useContext(TvHomeServiceContext);

  if (!tvHomeService) {
    throw new Error('\`useTvHomeService\` を使用するコンポーネントが \`TvHomeServiceContext.Provider\` でラップされていることを確認してください。');
  }

  const [data, setData] = useState<HomeResponseType | null>(null);

  useEffect(() => {
    // セッションがない場合は早期リターン
    if (!session) return;

    const fetchData = async () => {
      try {
        const result = await tvHomeService.callHome(session.platformUid, session.platformToken);
        setData(result);
        console.log('TVホームデータが取得されました');
      } catch (error) {
        console.error("Error fetching TV home data:", error);
      }
    };

    fetchData();
  }, [session, tvHomeService]);
  return data;
}