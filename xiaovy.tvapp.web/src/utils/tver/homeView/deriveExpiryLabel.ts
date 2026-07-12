const DAY_MS = 24 * 60 * 60 * 1000;
const FAR_FUTURE_DAYS = 90;
const JST_FORMATTER = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function jstDateParts(date: Date) {
  const parts = Object.fromEntries(JST_FORMATTER.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function jstDayKey(ms: number): string {
  const parts = jstDateParts(new Date(ms));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function deriveExpiryLabel(endAt: number | null | undefined, now = Date.now()): string | null {
  if (!endAt) return null;

  const endMs = endAt * 1000;
  if (endMs <= now) return null;

  const diffMs = endMs - now;
  if (diffMs > FAR_FUTURE_DAYS * DAY_MS) return null;

  if (jstDayKey(endMs) === jstDayKey(now)) {
    const { hour, minute } = jstDateParts(new Date(endMs));
    return `本日 ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} 終了`;
  }

  return `あと${Math.ceil(diffMs / DAY_MS)}日`;
}
