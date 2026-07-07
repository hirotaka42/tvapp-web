import { afterEach, describe, expect, it, vi } from 'vitest';

describe('PHASE2_USER_DATA_ENABLED', () => {
  const originalValue = process.env.NEXT_PUBLIC_ENABLE_USER_DATA;

  afterEach(() => {
    vi.resetModules();
    if (originalValue === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_USER_DATA;
    } else {
      process.env.NEXT_PUBLIC_ENABLE_USER_DATA = originalValue;
    }
  });

  it('環境変数が 1 のとき有効になる', async () => {
    process.env.NEXT_PUBLIC_ENABLE_USER_DATA = '1';
    const { PHASE2_USER_DATA_ENABLED } = await import('./features');
    expect(PHASE2_USER_DATA_ENABLED).toBe(true);
  });

  it('環境変数が未設定または 1 以外のとき無効になる', async () => {
    delete process.env.NEXT_PUBLIC_ENABLE_USER_DATA;
    let module = await import('./features');
    expect(module.PHASE2_USER_DATA_ENABLED).toBe(false);

    vi.resetModules();
    process.env.NEXT_PUBLIC_ENABLE_USER_DATA = 'true';
    module = await import('./features');
    expect(module.PHASE2_USER_DATA_ENABLED).toBe(false);
  });
});
