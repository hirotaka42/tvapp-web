'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// メールリンク(passwordless)送信時に、送信先メールを控えておく localStorage キー
const EMAIL_LINK_STORAGE_KEY = 'emailForSignIn';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  // メールリンク(パスワードなし)
  sendEmailSignInLink: (email: string) => Promise<void>;
  isEmailSignInLink: (url: string) => boolean;
  completeEmailLinkSignIn: (url: string, email?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearAllAuthState: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ローカル開発専用の認証バイパス。
// 本番(NODE_ENV=production)では絶対に無効。かつ明示フラグ時のみ有効。
// Firebase 設定なしで TVER のブラウズ/再生を確認するための開発用アフォーダンス。
const DEV_BYPASS_AUTH =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === '1';

const DEV_MOCK_USER = {
  uid: 'dev-local-user',
  email: 'dev@localhost',
  emailVerified: true,
  isAnonymous: false,
  displayName: 'Local Dev',
  getIdToken: async () => 'dev-local-token',
  getIdTokenResult: async () => ({ claims: { role: 99 }, token: 'dev-local-token' }),
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      // 開発用: 常にログイン済み扱い(Firebase 未設定でも UI を通す)
      setUser(DEV_MOCK_USER);
      setLoading(false);
      return;
    }
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // IDトークンをlocalStorageに保存（暫定対応）
    const token = await userCredential.user.getIdToken();
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
    if (tokenName) {
      localStorage.setItem(tokenName, token);
    }
    return userCredential;
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // IDトークンをlocalStorageに保存（暫定対応）
    const token = await userCredential.user.getIdToken();
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
    if (tokenName) {
      localStorage.setItem(tokenName, token);
    }
    return userCredential;
  };

  // IDトークンを localStorage に保存（暫定対応・各サインイン共通）
  const saveIdToken = async (user: User) => {
    const token = await user.getIdToken();
    const tokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
    if (tokenName) {
      localStorage.setItem(tokenName, token);
    }
  };

  /** Google アカウントでログイン */
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await saveIdToken(userCredential.user);
    return userCredential;
  };

  /** メールリンク(パスワードなし): サインインリンクをメール送信 */
  const sendEmailSignInLink = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const actionCodeSettings = {
      url: `${window.location.origin}/user/login`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
  };

  /** 現在の URL がメールリンクのサインインリンクかどうか */
  const isEmailSignInLink = (url: string) => {
    if (!auth) return false;
    return isSignInWithEmailLink(auth, url);
  };

  /** メールリンク(パスワードなし): 遷移先でサインインを完了 */
  const completeEmailLinkSignIn = async (url: string, email?: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const mail = email || window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY) || '';
    if (!mail) throw new Error('サインインに使用したメールアドレスが必要です');
    const userCredential = await signInWithEmailLink(auth, mail, url);
    window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    await saveIdToken(userCredential.user);
    return userCredential;
  };

  const logout = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    return signOut(auth);
  };

  /**
   * 統一ログアウト処理
   * Firebase認証、localStorage、sessionStorage、キャッシュの全てをクリアします
   */
  const clearAllAuthState = async () => {
    try {
      // Firebase認証からログアウト
      if (auth) {
        await signOut(auth);
      }

      // localStorageからIdTokenを削除
      const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
      if (TokenName) {
        localStorage.removeItem(TokenName);
      }

      // sessionStorageをクリア
      // 注意: Firebase Authが使用するキー（firebase:で始まる）は削除しない
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (!key.startsWith('firebase:') && !key.includes('firebase')) {
          sessionStorage.removeItem(key);
        }
      });

      // localStorageの特定キー（ユーザー関連データ）をクリア
      // 注意: Firebase Authが使用するキー（firebase:で始まる）は削除しない
      const keysToRemove = [
        'favorites',
        'watchHistory',
        'profile',
        'userRole',
      ];

      // 指定されたキーを削除
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // ブラウザキャッシュをクリア（IndexedDB）
      // 注意: Firebase Authが使用するIndexedDB（firebaseLocalStorageDb）は削除しない
      if ('indexedDB' in window && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          dbs.forEach(db => {
            // Firebase Authのデータベースは保持する
            if (db.name && !db.name.includes('firebase')) {
              window.indexedDB.deleteDatabase(db.name);
            }
          });
        } catch (err) {
          console.warn('IndexedDB クリア処理でエラー:', err);
        }
      }

      console.log('✓ ログアウト: 全ての認証状態とキャッシュをクリアしました');
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました:', error);
      throw error;
    }
  };

  /**
   * パスワードリセットメールを送信
   * @param email - パスワードをリセットするユーザーのメールアドレス
   */
  const resetPassword = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/user/login?reset=true`,
      handleCodeInApp: false,
    });
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    sendEmailSignInLink,
    isEmailSignInLink,
    completeEmailLinkSignIn,
    logout,
    clearAllAuthState,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  return context;
}
