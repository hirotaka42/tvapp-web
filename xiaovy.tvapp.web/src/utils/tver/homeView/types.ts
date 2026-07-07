import { ConvertedContent } from '@/types/CardItem/RankingContent';

export interface FeaturedContent extends ConvertedContent {
  displayTitle: string;
}

export interface TickerItem {
  id: string;
  label: string;
  text: string;
  variant: 'trend' | 'ending' | 'new';
}

export type SectionAccent = 's-pink' | 's-yellow' | 's-blue' | 's-orange' | 's-purple';
