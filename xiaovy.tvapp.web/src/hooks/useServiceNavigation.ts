'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useService } from '@/contexts/ServiceContext';
import { ServiceId } from '@/utils/service/serviceCatalog';

const PLAYBACK_PATH_PATTERNS = [
  /^\/episode\/[^/]+\/?$/,
  /^\/service\/abema\/watch\/[^/]+\/?$/,
  /^\/service\/abema\/live\/[^/]+\/?$/,
];

export function isPlaybackPathname(pathname: string | null): boolean {
  if (!pathname) return false;
  return PLAYBACK_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function useServiceNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { service, setService } = useService();

  const selectService = useCallback((nextService: ServiceId) => {
    if (isPlaybackPathname(pathname)) {
      const shouldLeave = window.confirm('再生中です。ホームへ移動しますか?');
      if (!shouldLeave) return;
    }

    setService(nextService);

    if (pathname !== '/') {
      router.push('/');
    }
  }, [pathname, router, setService]);

  return { service, selectService };
}
