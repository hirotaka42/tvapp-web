import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { FeaturedContent } from './types';

export function deriveFeatured(contents: ConvertedContent[] | null | undefined): FeaturedContent | null {
  const first = contents?.[0];
  if (!first) return null;

  return {
    ...first,
    displayTitle: first.seriesTitle || first.title,
  };
}
