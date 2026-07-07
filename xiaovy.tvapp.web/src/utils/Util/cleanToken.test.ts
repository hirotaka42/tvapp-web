import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { removeIdToken } from './cleanToken';

describe('removeIdToken', () => {
  const originalTokenName = process.env.NEXT_PUBLIC_TOKEN_NAME;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    if (originalTokenName === undefined) {
      delete process.env.NEXT_PUBLIC_TOKEN_NAME;
    } else {
      process.env.NEXT_PUBLIC_TOKEN_NAME = originalTokenName;
    }
  });

  it('環境変数で指定されたトークンを削除する', () => {
    process.env.NEXT_PUBLIC_TOKEN_NAME = 'ID_TOKEN';
    localStorage.setItem('ID_TOKEN', 'token-value');

    removeIdToken();

    expect(localStorage.getItem('ID_TOKEN')).toBeNull();
  });

  it('トークンが存在しない場合も何もしない', () => {
    process.env.NEXT_PUBLIC_TOKEN_NAME = 'ID_TOKEN';
    expect(() => removeIdToken()).not.toThrow();
  });

  it('トークン名の環境変数がない場合は例外を投げる', () => {
    delete process.env.NEXT_PUBLIC_TOKEN_NAME;
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    expect(() => removeIdToken()).toThrow('環境変数:IDTOKEN_NAMEが設定されていません。');
  });
});
