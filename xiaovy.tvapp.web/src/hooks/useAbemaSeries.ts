'use client';

import { useEffect, useState } from 'react';
import { AbemaSeriesDetail } from '@/types/abema/view';
import { fetchAbemaJson } from '@/lib/abema/clientPlayback';

export interface UseAbemaSeriesResult {
  data: AbemaSeriesDetail | null;
  loading: boolean;
  error: string | null;
}

/** Fetch an ABEMA series with its seasons and episodes for the series page. */
export function useAbemaSeries(seriesId: string | null | undefined): UseAbemaSeriesResult {
  const [data, setData] = useState<AbemaSeriesDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(seriesId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchAbemaJson<AbemaSeriesDetail>(`/api/service/abema/vod/series?id=${encodeURIComponent(seriesId)}`)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'ABEMA series fetch failed');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [seriesId]);

  return { data, loading, error };
}
