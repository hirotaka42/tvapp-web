'use client';

import { useCallback, useEffect, useState } from 'react';
import { AbemaVodShelf } from '@/types/abema/view';
import { auth } from '@/lib/firebase';

interface AbemaVodRankingPayload {
  shelves: AbemaVodShelf[];
}

export interface AbemaVodState {
  shelves: AbemaVodShelf[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

async function getAuthToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME || 'IdToken';
    const storedToken = window.localStorage.getItem(tokenName);
    if (storedToken) return storedToken;
  }
  const currentUser = auth?.currentUser;
  if (currentUser) return currentUser.getIdToken();
  return 'anonymous';
}

export function useAbemaVod(): AbemaVodState {
  const [shelves, setShelves] = useState<AbemaVodShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch('/api/service/abema/vod/ranking', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as AbemaVodRankingPayload;
        if (!active) return;
        setShelves(payload.shelves ?? []);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'ABEMA VOD fetch failed');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { shelves, loading, error, reload };
}
