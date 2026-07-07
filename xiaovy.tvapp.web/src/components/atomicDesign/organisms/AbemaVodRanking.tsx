'use client';

import { useAbemaVod } from '@/hooks/useAbemaVod';
import { AbemaVodCard } from '@/components/atomicDesign/molecules/abema/AbemaVodCard';

export function AbemaVodRanking() {
  const { shelves, loading, error, reload } = useAbemaVod();

  if (loading) {
    return (
      <section className="ab-vod" aria-label="ABEMA VODランキング">
        <div className="ab-vod-h">
          <span className="ab-vod-k ab-cnd">VOD RANKING</span>
          <h2>ビデオランキング</h2>
        </div>
        <div className="ab-vod-state">ランキングを読み込み中…</div>
      </section>
    );
  }

  if (error || shelves.length === 0) {
    return (
      <section className="ab-vod" aria-label="ABEMA VODランキング">
        <div className="ab-vod-h">
          <span className="ab-vod-k ab-cnd">VOD RANKING</span>
          <h2>ビデオランキング</h2>
        </div>
        <div className="ab-vod-state">
          <p>ランキングを取得できませんでした。</p>
          <button type="button" onClick={reload}>再読み込み</button>
        </div>
      </section>
    );
  }

  return (
    <section className="ab-vod" aria-label="ABEMA VODランキング">
      <div className="ab-vod-h">
        <span className="ab-vod-k ab-cnd">VOD RANKING</span>
        <h2>ビデオランキング</h2>
        <span className="ab-vod-sub">アプリ内でそのまま再生できます</span>
      </div>
      {shelves.map((shelf) => (
        <section className="ab-sec" key={shelf.key} aria-label={shelf.title}>
          <div className="ab-sech">
            <h2>{shelf.title}</h2>
            <span className="cnt ab-cnd">{shelf.items.length}作品</span>
          </div>
          <div className="ab-row">
            {shelf.items.map((item, index) => (
              <AbemaVodCard key={`${shelf.key}-${item.contentId}`} item={item} rank={index + 1} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
