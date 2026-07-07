import { describe, expect, it } from 'vitest';
import { normalizeProgram } from './normalizeProgram';

describe('normalizeProgram', () => {
  it('normalizes program metadata and prefers the episode still thumbnail', () => {
    const program = normalizeProgram({
      id: '210-18_s1_p1',
      series: {
        id: '210-18',
        title: '追放された転生重騎士',
        thumbComponent: {
          urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/series/210-18',
          filename: 'series_thumb.png',
          query: 'version=1',
          extension: 'png',
        },
      },
      season: {
        id: '210-18_s1',
        sequence: 1,
        name: 'シーズン1',
      },
      genre: {
        id: 'animation',
        name: 'アニメ',
      },
      episode: {
        number: 1,
        title: '第1話 重騎士エルマ',
        content: 'あらすじ本文',
      },
      label: { free: true },
      thumbComponent: {
        urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1',
        filename: 'program_thumb.png',
        query: 'version=2',
        extension: 'png',
      },
    });

    expect(program).toEqual({
      id: '210-18_s1_p1',
      seriesId: '210-18',
      seriesTitle: '追放された転生重騎士',
      seasonId: '210-18_s1',
      seasonName: 'シーズン1',
      seasonSequence: 1,
      episodeNumber: 1,
      episodeTitle: '第1話 重騎士エルマ',
      description: 'あらすじ本文',
      thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p1/thumb001.png?height=158&width=280&quality=75',
      genreName: 'アニメ',
      isFree: true,
      isPremium: false,
    });
  });

  it('uses the episode still thumbnail and rejects missing ids', () => {
    expect(normalizeProgram({})).toBeNull();

    expect(normalizeProgram({
      id: '210-18_s1_p2',
      thumbComponent: {
        urlPrefix: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p2',
        filename: 'program_thumb.png',
        extension: 'png',
      },
      label: { newest: true },
    })).toEqual({
      id: '210-18_s1_p2',
      seriesId: undefined,
      seriesTitle: undefined,
      seasonId: undefined,
      seasonName: undefined,
      seasonSequence: undefined,
      episodeNumber: undefined,
      episodeTitle: undefined,
      description: undefined,
      thumbnailUrl: 'https://image.p-c2-x.abema-tv.com/image/programs/210-18_s1_p2/thumb001.png?height=158&width=280&quality=75',
      genreName: undefined,
      isFree: undefined,
      isPremium: true,
    });
  });
});
