'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AbemaChannel, AbemaSlot } from '@/types/abema/view';
import { auth } from '@/lib/firebase';

interface AbemaChannelsPayload {
  channels: AbemaChannel[];
}

interface AbemaSlotsPayload {
  date: string;
  slots: AbemaSlot[];
}

export interface AbemaHomeState {
  channels: AbemaChannel[];
  slots: AbemaSlot[];
  date: string;
  fetchedAt: number | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function jstToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

async function getAuthToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME || 'IdToken';
    const storedToken = window.localStorage.getItem(tokenName);
    if (storedToken) return storedToken;
  }

  const currentUser = auth?.currentUser;
  if (currentUser) {
    return currentUser.getIdToken();
  }

  return 'anonymous';
}

export function useAbemaHome(): AbemaHomeState {
  const [channels, setChannels] = useState<AbemaChannel[]>([]);
  const [slots, setSlots] = useState<AbemaSlot[]>([]);
  const [date, setDate] = useState(() => jstToday());
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const targetDate = jstToday();
    setDate(targetDate);
    setLoading(true);
    setError(null);

    Promise.all([
      fetchJson<AbemaChannelsPayload>('/api/service/abema/channels'),
      fetchJson<AbemaSlotsPayload>(`/api/service/abema/slots?date=${targetDate}`),
    ])
      .then(([channelPayload, slotPayload]) => {
        if (!active) return;
        setChannels(channelPayload.channels);
        setSlots(slotPayload.slots);
        setDate(slotPayload.date);
        setFetchedAt(Date.now());
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : 'ABEMA data fetch failed');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return useMemo(
    () => ({ channels, slots, date, fetchedAt, loading, error, reload }),
    [channels, date, error, fetchedAt, loading, reload, slots],
  );
}
