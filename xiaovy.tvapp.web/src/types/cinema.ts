export type CinemaStatus = 'now_showing' | 'upcoming' | 'postponed' | 'undated' | 'ended';

export type CinemaDatePrecision = 'day' | 'month' | 'year' | 'unknown';

export type CinemaRating = 'G' | 'PG12' | 'R15+' | 'R18+';

export type CinemaReleaseScale = 'wide' | 'limited';

export interface MovieCard {
  slug: string;
  titleJa: string;
  titleOriginal?: string | null;
  overview?: string | null;
  runtimeMin?: number | null;
  rating?: CinemaRating | null;
  genres: string[];
  screeningFormats: string[];
  releaseDate?: string | null;
  datePrecision: CinemaDatePrecision;
  releaseScale?: CinemaReleaseScale | null;
  posterUrl?: string | null;
  keyvisualUrl?: string | null;
  status: CinemaStatus;
  daysUntil?: number | null;
  daysSince?: number | null;
  director?: string | null;
  cast: string[];
  wantToWatch?: number | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  sourceUrl?: string | null;
  trailerQuery: string;
}

export interface RankRow {
  rank: number;
  movie: MovieCard;
  metric: 'want_to_watch' | 'rating_avg';
  value: number;
  deltaRank?: number | null;
}

export interface NewsItem {
  title: string;
  url: string | null;
  source: string;
  summary?: string | null;
  publishedAt: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  relatedSlugs: string[];
}

export interface CinemaHomeResponse {
  now: MovieCard[];
  upcoming: MovieCard[];
  undated: MovieCard[];
  ranking: {
    nowShowing: RankRow[];
    expected: RankRow[];
  };
  news: NewsItem[];
  heroFilms: MovieCard[];
  lastCrawledAt: string | null;
}
