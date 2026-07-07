import { describe, expect, it } from 'vitest';
import { canPlayNativeHls, selectHlsPlaybackStrategy } from './canPlayNativeHls';

describe('canPlayNativeHls', () => {
  it.each(['probably', 'maybe'])('treats %s as native HLS support', (result) => {
    expect(canPlayNativeHls(result)).toBe(true);
  });

  it.each(['', 'no', undefined, null])('rejects unsupported result %s', (result) => {
    expect(canPlayNativeHls(result)).toBe(false);
  });
});

describe('selectHlsPlaybackStrategy', () => {
  it.each(['probably', 'maybe', '', undefined, null])('prefers hls.js over native result %s', (nativeHlsCanPlayType) => {
    expect(selectHlsPlaybackStrategy({ hlsJsSupported: true, nativeHlsCanPlayType })).toBe('hls-js');
  });

  it('falls back to native HLS only when hls.js is unsupported', () => {
    expect(selectHlsPlaybackStrategy({ hlsJsSupported: false, nativeHlsCanPlayType: 'probably' })).toBe('native-hls');
  });

  it('reports unsupported when neither hls.js nor native HLS can play', () => {
    expect(selectHlsPlaybackStrategy({ hlsJsSupported: false, nativeHlsCanPlayType: '' })).toBe('unsupported');
  });
});
