export interface PlayerProgress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface ProgressInput {
  currentTime: number;
  duration?: number | null;
  bufferedEnd?: number | null;
}

function finiteNonNegative(value: number | null | undefined): number {
  return Number.isFinite(value) && value !== undefined && value !== null && value > 0 ? value : 0;
}

function ratio(value: number, duration: number): number {
  if (duration <= 0) return 0;
  return Math.min(Math.max(value / duration, 0), 1);
}

export function deriveProgress({ currentTime, duration, bufferedEnd }: ProgressInput): PlayerProgress {
  const safeDuration = finiteNonNegative(duration);
  const playedSeconds = finiteNonNegative(currentTime);
  const loadedSeconds = finiteNonNegative(bufferedEnd);

  return {
    played: ratio(playedSeconds, safeDuration),
    playedSeconds,
    loaded: ratio(loadedSeconds, safeDuration),
    loadedSeconds,
  };
}
