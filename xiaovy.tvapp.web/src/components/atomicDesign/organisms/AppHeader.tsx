'use client';

import { usePathname, useRouter } from 'next/navigation';
import { IconLogo } from '@/components/atomicDesign/atoms/IconLogo';
import { SearchBar } from '@/components/atomicDesign/molecules/SearchBar';
import { ServiceDock } from '@/components/atomicDesign/molecules/ServiceDock';
import { UserMenu } from '@/components/atomicDesign/molecules/UserMenu';
import { useServiceNavigation } from '@/hooks/useServiceNavigation';
import { SERVICES, getServiceMeta } from '@/utils/service/serviceCatalog';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { service, selectService } = useServiceNavigation();
  const selectedMeta = getServiceMeta(service);

  if (pathname === '/user/login' || pathname === '/user/register') {
    return null;
  }

  return (
    <header className="hd">
      <div className="hd-in">
        <IconLogo />
        <ServiceDock services={SERVICES} selected={service} onSelect={selectService} />
        <SearchBar
          placeholder={selectedMeta.searchPlaceholder}
          onSubmit={(query) => {
            if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
          }}
        />
        <span className="hd-hint">
          <kbd>1</kbd>-<kbd>4</kbd> / <kbd>←</kbd><kbd>→</kbd> で切替
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
