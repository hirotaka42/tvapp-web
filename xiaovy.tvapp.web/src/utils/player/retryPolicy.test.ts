import { describe, expect, it } from 'vitest';
import { getRetryDecision } from './retryPolicy';

describe('getRetryDecision', () => {
  it('uses capped exponential backoff while attempts remain', () => {
    expect(getRetryDecision(0)).toEqual({ shouldRetry: true, nextAttempt: 1, delayMs: 500 });
    expect(getRetryDecision(2)).toEqual({ shouldRetry: true, nextAttempt: 3, delayMs: 2000 });
    expect(getRetryDecision(4, { maxAttempts: 8, baseDelayMs: 1000, maxDelayMs: 3000 })).toEqual({
      shouldRetry: true,
      nextAttempt: 5,
      delayMs: 3000,
    });
  });

  it('stops at the configured limit', () => {
    expect(getRetryDecision(3)).toEqual({ shouldRetry: false, nextAttempt: 3, delayMs: 0 });
  });

  it('normalizes invalid attempt counts', () => {
    expect(getRetryDecision(-2, { baseDelayMs: 100 })).toEqual({
      shouldRetry: true,
      nextAttempt: 1,
      delayMs: 100,
    });
    expect(getRetryDecision(1.8, { baseDelayMs: 100 })).toEqual({
      shouldRetry: true,
      nextAttempt: 2,
      delayMs: 200,
    });
  });
});
