// src/lib/auth.test.ts
// requireAuth の認可ゲートを検証する。firebase-admin はモックし、
// 「未トークン=401 / 無効=401 / 匿名=403 / ゲスト=403 / 一般=通過 / 権限不足=403」を確認する。
//
// 注: verifyIdToken は vi.fn ではなく「差し替え可能なプレーン async 関数」でモックする。
//     vi.fn のモック実装が throw すると vitest がその例外を(requireAuth が握り潰しても)
//     テスト失敗として二重報告するため。プレーン関数なら spy 計測が無く、
//     reject は requireAuth 内の try/catch で正しく 401 になる。

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';

// hoisted: vi.mock ファクトリから安全に参照できる差し替え口。
const state = vi.hoisted(() => ({
  verify: null as null | ((token: string) => Promise<Partial<DecodedIdToken>>),
}));

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: { verifyIdToken: (token: string) => state.verify!(token) },
  adminDb: {},
}));

import { requireAuth } from './auth';
import { UserRole } from '@/types/User';

// requireAuth は request.headers.get() のみ使うため、Headers を持つ最小スタブで十分。
function req(authorization?: string): NextRequest {
  const headers = new Headers();
  if (authorization) headers.set('Authorization', authorization);
  return { headers } as unknown as NextRequest;
}

// verifyIdToken の戻り値を差し替える小ヘルパ。
function resolvesTo(token: Partial<DecodedIdToken>) {
  state.verify = async () => token;
}
function rejects(message: string) {
  state.verify = async () => { throw new Error(message); };
}

describe('requireAuth', () => {
  beforeEach(() => resolvesTo({}));

  it('Authorization ヘッダが無ければ 401', async () => {
    const r = await requireAuth(req());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(401);
  });

  it('トークン検証に失敗したら 401', async () => {
    rejects('invalid');
    const r = await requireAuth(req('Bearer bad'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(401);
  });

  it('匿名(ゲスト)ログインは 403', async () => {
    resolvesTo({ uid: 'g1', firebase: { sign_in_provider: 'anonymous', identities: {} } });
    const r = await requireAuth(req('Bearer x'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(403);
  });

  it('GUEST ロールは 403', async () => {
    resolvesTo({ uid: 'g2', role: UserRole.GUEST, firebase: { sign_in_provider: 'password', identities: {} } });
    const r = await requireAuth(req('Bearer x'));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(403);
  });

  it('一般アカウントは通過し uid/role を返す', async () => {
    resolvesTo({ uid: 'u1', role: UserRole.GENERAL, firebase: { sign_in_provider: 'password', identities: {} } });
    const r = await requireAuth(req('Bearer x'));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.uid).toBe('u1');
      expect(r.role).toBe(UserRole.GENERAL);
    }
  });

  it('role クレイム未設定でも 一般 として通過する', async () => {
    resolvesTo({ uid: 'u2', firebase: { sign_in_provider: 'google.com', identities: {} } });
    const r = await requireAuth(req('Bearer x'));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.role).toBe(UserRole.GENERAL);
  });

  it('minRole 未満は 403', async () => {
    resolvesTo({ uid: 'u1', role: UserRole.GENERAL, firebase: { sign_in_provider: 'password', identities: {} } });
    const r = await requireAuth(req('Bearer x'), { minRole: UserRole.SUPER_USER });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.response.status).toBe(403);
  });
});
