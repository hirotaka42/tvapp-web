import { describe, expect, it } from 'vitest';
import { deriveCinemaStatus } from './status';

describe('deriveCinemaStatus', () => {
  const today = '2026-07-08';

  it('exposes undated titles when release date is missing or unknown', () => {
    expect(deriveCinemaStatus({ releaseDate: null, datePrecision: 'unknown' }, today).status).toBe('undated');
    expect(deriveCinemaStatus({ releaseDate: '2026-09-01', datePrecision: 'unknown' }, today).status).toBe('undated');
  });

  it('prioritizes postponed over date based states', () => {
    expect(deriveCinemaStatus({ releaseDate: '2026-09-01', datePrecision: 'day', isPostponed: 1 }, today).status).toBe('postponed');
  });

  it('calculates upcoming and now showing offsets', () => {
    expect(deriveCinemaStatus({ releaseDate: '2026-07-10', datePrecision: 'day' }, today)).toEqual({
      status: 'upcoming',
      daysUntil: 2,
    });
    expect(deriveCinemaStatus({ releaseDate: '2026-07-08', datePrecision: 'day', nowShowing: 1 }, today)).toEqual({
      status: 'now_showing',
      daysSince: 1,
    });
    expect(deriveCinemaStatus({ releaseDate: '2026-07-01', datePrecision: 'day', nowShowing: 1 }, today)).toEqual({
      status: 'now_showing',
      daysSince: 8,
    });
  });

  it('marks past non-showing titles as ended', () => {
    expect(deriveCinemaStatus({ releaseDate: '2026-07-01', datePrecision: 'day', nowShowing: 0 }, today).status).toBe('ended');
  });
});
