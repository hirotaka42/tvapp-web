import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  validateBirthday,
  validateFirstName,
  validateLastName,
  validateNickname,
  validatePhoneNumber,
  validateProfileUpdate,
} from './profileValidation';

describe('profileValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('姓名の必須と最大長を検証する', () => {
    expect(validateFirstName('')).toBe('名前（名）を入力してください');
    expect(validateFirstName('あ'.repeat(51))).toBe('名前（名）は50文字以内で入力してください');
    expect(validateFirstName('太郎')).toBeNull();
    expect(validateLastName('  ')).toBe('名前（姓）を入力してください');
    expect(validateLastName('山田')).toBeNull();
  });

  it('生年月日の空、形式、未来日、下限を検証する', () => {
    expect(validateBirthday(null)).toBeNull();
    expect(validateBirthday('')).toBeNull();
    expect(validateBirthday('2026/07/07')).toBe('生年月日はYYYY-MM-DD形式で入力してください');
    expect(validateBirthday('2026-07-08')).toBe('生年月日は現在より前の日付を入力してください');
    expect(validateBirthday('1899-12-31')).toBe('生年月日は1900年以降の日付を入力してください');
    expect(validateBirthday('2000-01-01')).toBeNull();
  });

  it('ニックネームと電話番号を検証する', () => {
    expect(validateNickname(null)).toBeNull();
    expect(validateNickname('あ'.repeat(21))).toBe('ニックネームは20文字以内で入力してください');
    expect(validateNickname('ニック')).toBeNull();
    expect(validatePhoneNumber(null)).toBeNull();
    expect(validatePhoneNumber('03-1234-abcd')).toBe('電話番号は数字とハイフンのみで入力してください');
    expect(validatePhoneNumber('123')).toBe('電話番号は10桁または11桁で入力してください');
    expect(validatePhoneNumber('090-1234-5678')).toBeNull();
  });

  it('プロフィール更新全体のエラーを field 付きで返す', () => {
    expect(validateProfileUpdate({ nickname: 'nick', birthday: '2000-01-01', phoneNumber: '09012345678' })).toEqual({
      isValid: true,
      errors: [],
    });

    const result = validateProfileUpdate({ nickname: 'あ'.repeat(21), birthday: 'bad', phoneNumber: 'abc' });
    expect(result.isValid).toBe(false);
    expect(result.errors.map((e) => e.field)).toEqual(['nickname', 'birthday', 'phoneNumber']);
  });
});
