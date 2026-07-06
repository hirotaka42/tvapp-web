import { describe, expect, it } from 'vitest';
import { UserRole } from '@/types/User';
import { getRoleDescription, getRoleDisplayName } from './roleDisplay';

describe('roleDisplay', () => {
  it('定義済みロールの表示名と説明を返す', () => {
    expect(getRoleDisplayName(UserRole.GUEST)).toBe('ゲストユーザー(機能制限)');
    expect(getRoleDisplayName(UserRole.GENERAL)).toBe('一般ユーザー');
    expect(getRoleDisplayName(UserRole.DL_ENABLED)).toBe('DL有効化ユーザー');
    expect(getRoleDisplayName(UserRole.TV_ENABLED)).toBe('TV有効化ユーザー');
    expect(getRoleDisplayName(UserRole.PREVIEW)).toBe('プレビューユーザー');
    expect(getRoleDisplayName(UserRole.SUPER_USER)).toBe('特権ユーザー');
    expect(getRoleDescription(UserRole.GUEST)).toContain('ゲストユーザー');
    expect(getRoleDescription(UserRole.DL_ENABLED)).toContain('ダウンロード機能');
    expect(getRoleDescription(UserRole.SUPER_USER)).toContain('特権ユーザー');
  });

  it('未知のロールはフォールバックを返す', () => {
    expect(getRoleDisplayName(12345)).toBe('不明なロール');
    expect(getRoleDescription(12345)).toBe('');
  });
});
