import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { StreamServiceContext } from '@/contexts/StreamContext';
import { Main as StreamResponseType } from '@/types/StreamResponse';

export interface UseStreamResult {
  data: StreamResponseType | null;
  error: Error | null;
  isLoading: boolean;
  /** 手動で再取得する(再試行ボタン用) */
  retry: () => void;
}

export function useStreamService(episodeId: string): UseStreamResult {
  const streamService = useContext(StreamServiceContext);
  const [data, setData] = useState<StreamResponseType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [nonce, setNonce] = useState(0);

  const memoizedService = useMemo(() => streamService, [streamService]);
  const retry = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!episodeId || !memoizedService) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setData(null);

    memoizedService
      .getVideoUrl(episodeId)
      .then((result) => {
        if (cancelled) return;
        // video_url が空(解決できなかった)場合もエラー扱いにする
        if (!result?.video_url) {
          setError(new Error('再生できる動画が見つかりませんでした'));
        } else {
          setData(result);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error('動画の読み込みに失敗しました'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [episodeId, memoizedService, nonce]);

  return { data, error, isLoading, retry };
}
