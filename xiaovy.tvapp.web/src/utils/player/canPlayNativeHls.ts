export function canPlayNativeHls(canPlayTypeResult: string | null | undefined): boolean {
  return canPlayTypeResult === 'probably' || canPlayTypeResult === 'maybe';
}

export type HlsPlaybackStrategy = 'hls-js' | 'native-hls' | 'unsupported';

interface HlsPlaybackStrategyInput {
  hlsJsSupported: boolean;
  nativeHlsCanPlayType: string | null | undefined;
}

export function selectHlsPlaybackStrategy({
  hlsJsSupported,
  nativeHlsCanPlayType,
}: HlsPlaybackStrategyInput): HlsPlaybackStrategy {
  if (hlsJsSupported) return 'hls-js';
  if (canPlayNativeHls(nativeHlsCanPlayType)) return 'native-hls';
  return 'unsupported';
}
