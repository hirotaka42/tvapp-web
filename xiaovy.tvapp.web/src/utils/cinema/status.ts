import { CinemaDatePrecision, CinemaStatus } from '@/types/cinema';

export interface CinemaStatusInput {
  releaseDate?: string | null;
  datePrecision: CinemaDatePrecision;
  isPostponed?: boolean | number | null;
  nowShowing?: boolean | number | null;
}

export interface CinemaStatusResult {
  status: CinemaStatus;
  daysUntil?: number | null;
  daysSince?: number | null;
}

export function jstToday(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateToUtcDay(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function daysBetween(fromDate: string, toDate: string): number {
  return Math.round(dateToUtcDay(toDate) - dateToUtcDay(fromDate));
}

export function deriveCinemaStatus(input: CinemaStatusInput, today = jstToday()): CinemaStatusResult {
  if (!input.releaseDate || input.datePrecision === 'unknown') {
    return { status: 'undated' };
  }

  if (input.isPostponed) {
    return { status: 'postponed' };
  }

  const diff = daysBetween(today, input.releaseDate);
  if (diff > 0) {
    return { status: 'upcoming', daysUntil: diff };
  }

  if (input.nowShowing) {
    return { status: 'now_showing', daysSince: Math.abs(diff) + 1 };
  }

  return { status: 'ended' };
}
