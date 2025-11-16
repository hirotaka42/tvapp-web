'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signInAsGuest: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearAllAuthState: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * ゲスト（匿名）ログイン
   * Firebase匿名認証を使用してログインします
   */
  const signInAsGuest = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    return signInAnonymously(auth);
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
      sessionStorage.clear();

      // localStorageの全て（ユーザー関連データ）をクリア
      const keysToRemove = [
        'favorites',
        'watchHistory',
        'profile',
        'userRole',
      ];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // ブラウザキャッシュをクリア（IndexedDB）
      if ('indexedDB' in window && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          dbs.forEach(db => {
            if (db.name) {
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
    signInAsGuest,
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
