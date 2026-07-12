import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { CategoryChips } from '@/components/atomicDesign/molecules/CategoryChips';
import { EndingSoonBand } from '@/components/atomicDesign/molecules/EndingSoonBand';
import { RankingShelf } from '@/components/atomicDesign/molecules/RankingShelf';
import { ResumeBand } from '@/components/atomicDesign/molecules/ResumeBand';
import { TrendingTicker } from '@/components/atomicDesign/molecules/TrendingTicker';
import { TverFooter } from '@/components/atomicDesign/organisms/TverFooter';
import { TverHero } from '@/components/atomicDesign/organisms/TverHero';
import { deriveEndingSoon } from '@/utils/tver/homeView/deriveEndingSoon';
import { deriveFeatured } from '@/utils/tver/homeView/deriveFeatured';
import { deriveTickerItems } from '@/utils/tver/homeView/deriveTickerItems';
import { sectionAccentForLabel } from '@/utils/tver/homeView/sectionAccentForLabel';

interface TverHomeProps {
  rankingLabels: string[];
  rankingContents: Record<string, ConvertedContent[]>;
  active?: boolean;
}

export const TverHome = React.memo(function TverHome({ rankingLabels, rankingContents, active = true }: TverHomeProps) {
  const [now, setNow] = useState(() => Date.now());
  const wasActiveRef = useRef(active);

  useEffect(() => {
    if (active && !wasActiveRef.current) {
      setNow(Date.now());
    }
    wasActiveRef.current = active;
  }, [active]);

  const { featured, tickerItems, endingSoon } = useMemo(() => {
    const firstLabel = rankingLabels[0];
    const primaryContents = firstLabel ? rankingContents[firstLabel] || [] : [];
    return {
      featured: deriveFeatured(primaryContents),
      tickerItems: deriveTickerItems(primaryContents),
      endingSoon: deriveEndingSoon(rankingContents),
    };
  }, [rankingLabels, rankingContents, now]);

  return (
    <section className="world tv-world" id="tv" role="tabpanel" aria-labelledby="dk-tver" aria-label="TVER ホーム">
      <TrendingTicker items={tickerItems} />
      <CategoryChips />
      <TverHero featured={featured} />
      <ResumeBand />
      <div className="wrap">
        {rankingLabels.map((label, index) => (
          <RankingShelf
            key={label}
            label={label}
            contents={rankingContents[label] || []}
            accent={sectionAccentForLabel(label, index)}
          />
        ))}
      </div>
      <EndingSoonBand items={endingSoon} />
      <TverFooter />
    </section>
  );
});
