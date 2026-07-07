import { useCallback, useEffect, useState } from 'react';
import { Main as StreamResponseType } from '@/types/StreamResponse';

export type AbemaStreamRequest =
  | { type: 'live'; channelId: string }
  | { type: 'slot'; slotId: string };

/** Failure category surfaced by the streaminglink route, for varied UI messages. */
export type AbemaStreamReason =
  | 'premium'
  | 'geo'
  | 'upstream'
  | 'not_found'
  | 'resolver_unavailable'
  | 'unknown';

export interface UseAbemaStreamResult {
  data: StreamResponseType | null;
  error: Error | null;
  errorReason: AbemaStreamReason | null;
  isLoading: boolean;
  retry: () => void;
}

export function useAbemaStream(request: AbemaStreamRequest): UseAbemaStreamResult {
  const [data, setData] = useState<StreamResponseType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [errorReason, setErrorReason] = useState<AbemaStreamReason | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => setNonce((n) => n + 1), []);
  const requestType = request.type;
  const requestId = request.type === 'live' ? request.channelId : request.slotId;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ type: requestType });
    if (requestType === 'live') params.set('channelId', requestId);
    if (requestType === 'slot') params.set('slotId', requestId);

    setIsLoading(true);
    setError(null);
    setErrorReason(null);
    setData(null);

    fetch(`/api/service/abema/streaminglink?${params.toString()}`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          if (typeof body?.reason === 'string') setErrorReason(body.reason as AbemaStreamReason);
          throw new Error(typeof body?.error === 'string' ? body.error : 'ABEMAの再生URLを取得できませんでした');
        }
        return body as StreamResponseType;
      })
      .then((body) => {
        if (cancelled) return;
        if (!body.video_url) {
          setError(new Error('再生できるABEMA動画が見つかりませんでした'));
          return;
        }
        setData(body);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught : new Error('ABEMA動画の読み込みに失敗しました'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestId, requestType, nonce]);

  return { data, error, errorReason, isLoading, retry };
}
