export function canPlayNativeHls(canPlayTypeResult: string | null | undefined): boolean {
  return canPlayTypeResult === 'probably' || canPlayTypeResult === 'maybe';
}
