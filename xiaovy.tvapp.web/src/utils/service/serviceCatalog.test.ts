import { describe, expect, it } from 'vitest';
import { SERVICES, isReady, isServiceId, getServiceMeta } from './serviceCatalog';

describe('serviceCatalog', () => {
  it('defines four services with unique hints', () => {
    expect(SERVICES).toHaveLength(4);
    expect(new Set(SERVICES.map((service) => service.hint)).size).toBe(4);
  });

  it('marks TVER and ABEMA as ready', () => {
    expect(isReady('tver')).toBe(true);
    expect(isReady('abema')).toBe(true);
    expect(isReady('youtube')).toBe(false);
    expect(isReady('niconico')).toBe(false);
  });

  it('checks service ids and returns metadata', () => {
    expect(isServiceId('tver')).toBe(true);
    expect(isServiceId('unknown')).toBe(false);
    expect(getServiceMeta('youtube').label).toBe('YouTube');
  });
});
