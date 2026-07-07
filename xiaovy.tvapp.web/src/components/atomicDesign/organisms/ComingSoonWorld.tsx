'use client';

import { useService } from '@/contexts/ServiceContext';
import { ServiceId, getServiceMeta } from '@/utils/service/serviceCatalog';

export function ComingSoonWorld({ service }: { service: ServiceId }) {
  const { setService } = useService();
  const meta = getServiceMeta(service);

  return (
    <section className={`world cs-world cs-${service}`} id={meta.panelId} role="tabpanel" aria-labelledby={`dk-${service}`} aria-label={`${meta.label} ホーム`}>
      <div className="cs-wrap">
        <p className="cs-k">COMING SOON</p>
        <h1>{meta.label}</h1>
        <p>{meta.label} ホームは準備中です。現在はTVERホームのみ利用できます。</p>
        <button className="tv-btn p" type="button" onClick={() => setService('tver')}>
          TVERへ戻る
        </button>
      </div>
    </section>
  );
}
