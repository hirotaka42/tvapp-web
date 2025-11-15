'use client'

import { useFirebaseAuth } from '@/contexts/AuthContext';

/**
 * 認証状態を返すフック
 * メール/パスワードユーザーの場合はemail、匿名ユーザーの場合はuidを返す
 * 未認証の場合はnullを返す
 */
export function useAuth() {
    const { user } = useFirebaseAuth();

    if (!user) {
        return null;
    }

    // メール/パスワードユーザーの場合はemailを返す
    if (user.email) {
        return user.email;
    }

    // 匿名ユーザーの場合はuidを返す
    if (user.isAnonymous) {
        return user.uid;
    }

    return null;
}