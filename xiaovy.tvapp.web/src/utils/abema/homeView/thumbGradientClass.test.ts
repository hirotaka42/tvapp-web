import { describe, expect, it } from 'vitest';
import { thumbGradientClass } from './thumbGradientClass';

describe('thumbGradientClass', () => {
  it('returns stable ag classes', () => {
    expect(thumbGradientClass('slot-1')).toBe(thumbGradientClass('slot-1'));
    expect(thumbGradientClass('slot-1')).toMatch(/^ag[1-9]$/);
    expect(thumbGradientClass('')).toMatch(/^ag[1-9]$/);
  });
});
