export function deriveNowPercent(window: { startMs: number; endMs: number }, now: number): number {
  if (window.endMs <= window.startMs) return 0;
  const raw = ((now - window.startMs) / (window.endMs - window.startMs)) * 100;
  return Math.min(100, Math.max(0, raw));
}
