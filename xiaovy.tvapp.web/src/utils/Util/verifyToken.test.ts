import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyToken } from './verifyToken';

const { jwtVerifyMock } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
}));

vi.mock('jose', () => ({
  jwtVerify: jwtVerifyMock,
}));

describe('verifyToken', () => {
  const originalSecret = process.env.JWT_SECRET_KEY;
  const originalExpiration = process.env.JWT_EXPIRATION_TIME;

  afterEach(() => {
    vi.restoreAllMocks();
    jwtVerifyMock.mockReset();
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

  it('有効な JWT のペイロードを返す', async () => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
    jwtVerifyMock.mockResolvedValue({
      payload: { id: 'user-2', email: 'two@example.com', uuid: 'uuid-2' },
    });

    await expect(verifyToken('valid-token')).resolves.toMatchObject({
      id: 'user-2',
      email: 'two@example.com',
      uuid: 'uuid-2',
    });
    expect(jwtVerifyMock.mock.calls[0][0]).toBe('valid-token');
    expect(ArrayBuffer.isView(jwtVerifyMock.mock.calls[0][1])).toBe(true);
  });

  it('不正な JWT は null を返す', async () => {
    process.env.JWT_SECRET_KEY = 'test-secret-key';
    jwtVerifyMock.mockRejectedValue(new Error('invalid token'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(verifyToken('invalid.token.value')).resolves.toBeNull();
  });

  it('JWT_SECRET_KEY がない場合は例外を投げる', async () => {
    delete process.env.JWT_SECRET_KEY;

    await expect(verifyToken('token')).rejects.toThrow('JWT_SECRET_KEY is not defined');
  });
});
