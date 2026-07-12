'use client';

import { createContext, PropsWithChildren, useCallback, useContext, useLayoutEffect, useState } from 'react';
import { ServiceId, isServiceId } from '@/utils/service/serviceCatalog';

const STORAGE_KEY = 'tvapp-svc-v2';

interface ServiceContextValue {
  service: ServiceId;
  setService: (service: ServiceId) => void;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

function readInitialService(): ServiceId {
  if (typeof window === 'undefined') return 'tver';

  const hash = window.location.hash.replace('#', '');
  if (isServiceId(hash)) return hash;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isServiceId(stored)) return stored;

  return 'tver';
}

function syncService(service: ServiceId) {
  if (typeof window === 'undefined') return;

  document.documentElement.setAttribute('data-svc', service);
  window.localStorage.setItem(STORAGE_KEY, service);
  const nextUrl = `${window.location.pathname}${window.location.search}#${service}`;
  window.history.replaceState(null, '', nextUrl);
}

export function ServiceProvider({ children }: PropsWithChildren) {
  const [service, setServiceState] = useState<ServiceId>('tver');

  useLayoutEffect(() => {
    const initial = readInitialService();
    setServiceState(initial);
    syncService(initial);
  }, []);

  const setService = useCallback((nextService: ServiceId) => {
    setServiceState(nextService);
    syncService(nextService);
  }, []);

  return (
    <ServiceContext.Provider value={{ service, setService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService(): ServiceContextValue {
  const value = useContext(ServiceContext);
  if (!value) {
    throw new Error('useService must be used within ServiceProvider');
  }
  return value;
}
