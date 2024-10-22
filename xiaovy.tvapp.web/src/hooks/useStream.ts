import { useContext, useEffect, useState, useMemo } from 'react';
import { StreamServiceContext } from '@/contexts/StreamContext';
import { Main as StreamResponseType } from '@/types/StreamResponse';

export function useStreamService(episodeId: string) {
  const streamService = useContext(StreamServiceContext);
  const [streamUrl, setStreamUrl] = useState<StreamResponseType | null>(null);

  const memoizedService = useMemo(() => streamService, [streamService]);

  useEffect(() => {
    if (!episodeId || !memoizedService) return;

    const fetchStreamData = async () => {
      try {
        const data = await memoizedService.getVideoUrl(episodeId);
        setStreamUrl(data);
        console.log('ストリームデータが取得されました');
      } catch (error) {
        console.error("Error fetching streaming data:", error);
      }
    };

    fetchStreamData();
  }, [episodeId, memoizedService]);

  return useMemo(() => streamUrl, [streamUrl]);
}