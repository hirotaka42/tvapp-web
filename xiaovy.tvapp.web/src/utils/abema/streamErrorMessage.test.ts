import { describe, it, expect } from 'vitest';
import { abemaStreamErrorMessage } from './streamErrorMessage';

describe('abemaStreamErrorMessage', () => {
  it('maps each reason to a distinct message', () => {
    const reasons = ['premium', 'geo', 'resolver_unavailable', 'not_found', 'upstream'] as const;
    const messages = reasons.map((r) => abemaStreamErrorMessage(r));
    expect(new Set(messages).size).toBe(reasons.length);
    expect(abemaStreamErrorMessage('premium')).toContain('有料');
    expect(abemaStreamErrorMessage('geo')).toContain('地域');
  });

  it('uses the fallback for unknown/null', () => {
    expect(abemaStreamErrorMessage('unknown', 'ぼぼ')).toBeTruthy();
    expect(abemaStreamErrorMessage(null)).toContain('再生できませんでした');
  });
});
