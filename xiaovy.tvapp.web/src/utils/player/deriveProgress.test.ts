import { describe, expect, it } from 'vitest';
import { deriveProgress } from './deriveProgress';

describe('deriveProgress', () => {
  it('derives ReactPlayer-compatible progress values', () => {
    expect(deriveProgress({ currentTime: 25, duration: 100, bufferedEnd: 60 })).toEqual({
      played: 0.25,
      playedSeconds: 25,
      loaded: 0.6,
      loadedSeconds: 60,
    });
  });

  it('guards unknown duration and missing buffer', () => {
    expect(deriveProgress({ currentTime: 12, duration: 0 })).toEqual({
      played: 0,
      playedSeconds: 12,
      loaded: 0,
      loadedSeconds: 0,
    });
  });

  it('clamps ratios and rejects negative or non-finite seconds', () => {
    expect(deriveProgress({ currentTime: 150, duration: 100, bufferedEnd: Infinity })).toEqual({
      played: 1,
      playedSeconds: 150,
      loaded: 0,
      loadedSeconds: 0,
    });
    expect(deriveProgress({ currentTime: -1, duration: 100, bufferedEnd: -10 })).toEqual({
      played: 0,
      playedSeconds: 0,
      loaded: 0,
      loadedSeconds: 0,
    });
  });
});
