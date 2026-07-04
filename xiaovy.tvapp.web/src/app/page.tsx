// TODO: creds/リゾルバ接続後に実アダプタへ差し替え(現在は mock)

import type { SourceId, Section, Item } from '@/lib/sources/types';
import { SOURCES, SOURCE_LIST } from '@/lib/sources/registry';
import DiscoveryHome from '@/components/rebuild/DiscoveryHome';

export default async function Home() {
  // 各ソースの getHome() を並列で取得
  const entries = await Promise.all(
    SOURCE_LIST.map(async (s) => {
      const sections = await SOURCES[s.id].getHome();
      return [s.id, sections] as const;
    }),
  );

  const data = Object.fromEntries(entries) as Record<SourceId, Section[]>;

  // crossPicks: 各ソースの先頭セクションの先頭 1〜2 件を集める
  const crossPicks: Item[] = [];
  for (const s of SOURCE_LIST) {
    const sections = data[s.id];
    if (sections && sections.length > 0) {
      crossPicks.push(...sections[0].items.slice(0, 2));
    }
  }

  return (
    <DiscoveryHome
      data={data}
      sources={SOURCE_LIST}
      crossPicks={crossPicks}
    />
  );
}
