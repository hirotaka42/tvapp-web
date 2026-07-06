import { describe, expect, it } from 'vitest';
import { validateUserLoginData, validateUserRegisterData } from './UserReq';

describe('UserReq validation', () => {
  it('登録リクエストの必須項目を検証する', () => {
    expect(validateUserRegisterData({
      FirstName: 'Taro',
      LastName: 'Yamada',
      Email: 'taro@example.com',
      Password: 'password',
    })).toEqual({ isValid: true, errors: [] });

    expect(validateUserRegisterData({
      FirstName: '',
      LastName: 'Yamada',
      Email: '',
      Password: 'password',
    } as any)).toEqual({
      isValid: false,
      errors: ['FirstName は必須です。', 'Email は必須です。'],
    });
  });

  it('ログインリクエストの必須項目を検証する', () => {
    expect(validateUserLoginData({ Email: 'taro@example.com', Password: 'password' })).toEqual({
      isValid: true,
      errors: [],
    });
    expect(validateUserLoginData({ Email: '', Password: '' })).toEqual({
      isValid: false,
      errors: ['Email は必須です。', 'Password は必須です。'],
    });
  });
});
