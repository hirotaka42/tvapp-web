import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToken } from './createToken';

const {
  signMock,
  setExpirationTimeMock,
  setProtectedHeaderMock,
  signJwtConstructorMock,
} = vi.hoisted(() => ({
  signMock: vi.fn(),
  setExpirationTimeMock: vi.fn(),
  setProtectedHeaderMock: vi.fn(),
  signJwtConstructorMock: vi.fn(),
}));

vi.mock('jose', () => {
  class MockSignJWT {
    payload: unknown;

    constructor(payload: unknown) {
      this.payload = payload;
      signJwtConstructorMock(payload);
    }

    setProtectedHeader(header: unknown) {
      setProtectedHeaderMock(header);
      return this;
    }

    setExpirationTime(expiration: unknown) {
      setExpirationTimeMock(expiration);
      return this;
    }

    sign(secret: Uint8Array) {
      signMock(secret);
      return Promise.resolve('signed-token');
    }
  }

  return { SignJWT: MockSignJWT };
});

describe('createToken', () => {
  const originalSecret = process.env.JWT_SECRET_KEY;
  const originalExpiration = process.env.JWT_EXPIRATION_TIME;

  afterEach(() => {
    vi.clearAllMocks();
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET_KEY;
    } else {
      process.env.JWT_SECRET_KEY = originalSecret;
    }
    if (originalExpiration === undefined) {
      delete process.env.JWT_EXPIRATION_TIME;
    } else {
      process.env.JWT_EXPIRATION_TIME = originalExpiration;
    }
  });

  it('ユーザー情報を含む JWT を作成する', async () => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
    process.env.JWT_EXPIRATION_TIME = '1h';

    const token = await createToken('user-1', 'user@example.com', 'uuid-1');

    expect(token).toBe('signed-token');
    expect(signJwtConstructorMock).toHaveBeenCalledWith({ id: 'user-1', email: 'user@example.com', uuid: 'uuid-1' });
    expect(setProtectedHeaderMock).toHaveBeenCalledWith({ alg: 'HS256' });
    expect(setExpirationTimeMock).toHaveBeenCalledWith('1h');
    expect(ArrayBuffer.isView(signMock.mock.calls[0][0])).toBe(true);
  });

  it('JWT_SECRET_KEY がない場合は例外を投げる', async () => {
    delete process.env.JWT_SECRET_KEY;
    process.env.JWT_EXPIRATION_TIME = '1h';

    await expect(createToken('user-1', 'user@example.com', 'uuid-1')).rejects.toThrow('JWT_SECRET_KEY is not defined');
  });

  it('JWT_EXPIRATION_TIME がない場合は例外を投げる', async () => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
    delete process.env.JWT_EXPIRATION_TIME;

    await expect(createToken('user-1', 'user@example.com', 'uuid-1')).rejects.toThrow('JWT_EXPIRATION_TIME is not defined');
  });
});
