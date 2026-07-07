export interface RetryDecision {
  shouldRetry: boolean;
  nextAttempt: number;
  delayMs: number;
}

interface RetryPolicyOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export function getRetryDecision(
  currentAttempt: number,
  { maxAttempts = 3, baseDelayMs = 500, maxDelayMs = 4000 }: RetryPolicyOptions = {},
): RetryDecision {
  const safeAttempt = Math.max(0, Math.floor(currentAttempt));

  if (safeAttempt >= maxAttempts) {
    return {
      shouldRetry: false,
      nextAttempt: safeAttempt,
      delayMs: 0,
    };
  }

  return {
    shouldRetry: true,
    nextAttempt: safeAttempt + 1,
    delayMs: Math.min(baseDelayMs * 2 ** safeAttempt, maxDelayMs),
  };
}
