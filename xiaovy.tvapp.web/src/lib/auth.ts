// src/lib/auth.ts
// API ルート共通の認証ゲート。Firebase ID トークンを検証し、
// **アカウントを持つユーザーのみ**を通す(匿名=ゲストは拒否)。
// これまで各ルートに 6〜10 行コピペされていた検証を1箇所に集約し、
// 「検証漏れルート」が構造的に発生しないようにする。
//
// 使い方:
//   const auth = await requireAuth(request);
//   if (!auth.ok) return auth.response;      // 401/403 をそのまま返す
//   const { uid, role, token } = auth;       // 以降はアカウント確定
//
//   管理者専用ルートは requireAuth(request, { minRole: UserRole.SUPER_USER })。

import { NextRequest, NextResponse } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '@/lib/firebase-admin';
import { UserRole } from '@/types/User';

export type AuthSuccess = {
  ok: true;
  token: DecodedIdToken;
  uid: string;
  role: UserRole;
};
export type AuthFailure = { ok: false; response: NextResponse };
export type AuthResult = AuthSuccess | AuthFailure;

function unauthorized(message: string, status: 401 | 403): AuthFailure {
  return { ok: false, response: NextResponse.json({ message }, { status }) };
}

/**
 * アカウント必須の認証ゲート。
 * - Authorization: Bearer <idToken> が無ければ 401
 * - トークン検証失敗は 401
 * - 匿名(ゲスト)ログインは 403(アカウント必須)
 * - role が GUEST 以下は 403
 * - opts.minRole 未満は 403
 */
export async function requireAuth(
  request: NextRequest,
  opts?: { minRole?: UserRole }
): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized('認証が必要です', 401);
  }
  const idToken = authHeader.split('Bearer ')[1];

  let token: DecodedIdToken;
  try {
    token = await adminAuth.verifyIdToken(idToken);
  } catch {
    return unauthorized('トークンが無効か失効しています', 401);
  }

  // 匿名(ゲスト)は不可 —— アカウントでのログインを必須にする
  if (token.firebase?.sign_in_provider === 'anonymous') {
    return unauthorized('アカウントでのログインが必要です', 403);
  }

  const role: UserRole =
    typeof token.role === 'number' ? (token.role as UserRole) : UserRole.GENERAL;
  if (role <= UserRole.GUEST) {
    return unauthorized('アカウントでのログインが必要です', 403);
  }

  if (opts?.minRole != null && role < opts.minRole) {
    return unauthorized('権限が不足しています', 403);
  }

  return { ok: true, token, uid: token.uid, role };
}
