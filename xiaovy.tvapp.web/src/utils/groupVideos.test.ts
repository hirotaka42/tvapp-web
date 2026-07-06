import { describe, expect, it } from 'vitest';
import { formatEpisodeNumber, formatSeasonName, groupVideosBySeriesAndSeason } from './groupVideos';

const makeVideo = (
  series: string | undefined,
  season: string | undefined,
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
) => ({
  metadata: {
    series,
    season,
    season_number: seasonNumber,
    episode_number: episodeNumber,
  },
});

describe('groupVideosBySeriesAndSeason', () => {
  it('シリーズ名、シーズン番号、エピソード番号でグルーピングとソートを行う', () => {
    const grouped = groupVideosBySeriesAndSeason([
      makeVideo('Bシリーズ', 'S2', 2, 2),
      makeVideo('Aシリーズ', 'S1', 1, 3),
      makeVideo('Aシリーズ', 'S1', 1, 1),
      makeVideo('Aシリーズ', 'S0', 0, undefined),
      makeVideo(undefined, undefined, undefined, undefined),
    ] as any);

    expect(grouped.map((g) => g.seriesName)).toEqual(['Aシリーズ', 'Bシリーズ', 'その他']);
    expect(grouped[0].seasons.map((s) => s.seasonName)).toEqual(['S0', 'S1']);
    expect(grouped[0].seasons[1].episodes.map((e: any) => e.metadata.episode_number)).toEqual([1, 3]);
    expect(grouped[2].seasons[0].seasonName).toBe('シーズン不明');
  });

  it('表示用のエピソード番号とシーズン名を返す', () => {
    expect(formatEpisodeNumber(makeVideo('A', 'S1', 1, 5) as any)).toBe('第5話');
    expect(formatEpisodeNumber(makeVideo('A', 'S1', 1, 0) as any)).toBe('');
    expect(formatSeasonName('シーズン1', 1)).toBe('シーズン1 (S1)');
    expect(formatSeasonName('特別編')).toBe('特別編');
  });
});
