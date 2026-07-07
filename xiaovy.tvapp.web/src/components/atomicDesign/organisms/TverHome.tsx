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
}

export function TverHome({ rankingLabels, rankingContents }: TverHomeProps) {
  const firstLabel = rankingLabels[0];
  const primaryContents = firstLabel ? rankingContents[firstLabel] || [] : [];
  const featured = deriveFeatured(primaryContents);
  const tickerItems = deriveTickerItems(primaryContents);
  const endingSoon = deriveEndingSoon(rankingContents);

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
}
