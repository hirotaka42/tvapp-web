'use client';

import { useEffect, useState } from 'react';
import { AbemaProgramInfo } from '@/types/abema/view';
import { fetchAbemaJson } from '@/lib/abema/clientPlayback';

export interface UseAbemaProgramResult {
  data: AbemaProgramInfo | null;
  loading: boolean;
  error: string | null;
}

/** Fetch ABEMA VOD program (episode) metadata for the watch page. */
export function useAbemaProgram(episodeId: string | null | undefined): UseAbemaProgramResult {
  const [data, setData] = useState<AbemaProgramInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(episodeId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchAbemaJson<AbemaProgramInfo>(`/api/service/abema/vod/program?id=${encodeURIComponent(episodeId)}`)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'ABEMA program fetch failed');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [episodeId]);

  return { data, loading, error };
}
