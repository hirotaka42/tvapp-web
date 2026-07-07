'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SignInForms from '@/components/atomicDesign/molecules/Forms/sign-in-forms';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';
import { FirebaseError } from 'firebase/app';

interface FormData {
  Email: string;
  Password: string;
}

const Login: React.FC = () => {
  const { user, signIn, signInWithGoogle, sendEmailSignInLink, isEmailSignInLink, completeEmailLinkSignIn } = useFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    Email: '',
    Password: ''
  });

  // ログイン後の復帰先(内部パスのみ許可。オープンリダイレクト防止)
  const getRedirect = () => {
    const r = searchParams.get('redirect');
    return r && r.startsWith('/') && !r.startsWith('//') ? r : '/';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signIn(formData.Email, formData.Password);
      console.log('ログイン成功:', userCredential.user.uid);

      // メールアドレス確認チェック
      if (!userCredential.user.emailVerified) {
        console.warn('[WARNING] メールアドレスが未確認です');
        toast.error('メールアドレスの確認が完了していません');
        router.push('/user/verify-email');
        return;
      }

      console.log('[SUCCESS] ログイン成功（メール確認済み）');
      toast.success('ログインしました');
      router.push(getRedirect());
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase エラー:', error.code, error.message);
        switch (error.code) {
          case 'auth/invalid-email':
            setError('メールアドレスの形式が正しくありません');
            break;
          case 'auth/user-disabled':
            setError('このアカウントは無効化されています');
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('メールアドレスまたはパスワードが正しくありません');
            break;
          case 'auth/invalid-credential':
            setError('認証情報が無効です');
            break;
          default:
            setError('ログインに失敗しました');
        }
      } else {
        console.error('Unexpected error:', error);
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google ログイン
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      toast.success('ログインしました');
      router.push(getRedirect());
    } catch (err) {
      console.error('Google ログイン失敗:', err);
      setError('Google ログインに失敗しました');
    } finally {
      setGoogleLoading(false);
    }
  };

  // メールリンク(パスワードなし)送信
  const handleSendEmailLink = async () => {
    setError('');
    if (!formData.Email.trim()) {
      setError('メールアドレスを入力してください');
      return;
    }
    try {
      await sendEmailSignInLink(formData.Email);
      setEmailLinkSent(true);
      toast.success('ログイン用リンクを送信しました');
    } catch (err) {
      console.error('メールリンク送信失敗:', err);
      setError('メールリンクの送信に失敗しました');
    }
  };

  // メールリンクで戻ってきた場合はサインインを完了する
  useEffect(() => {
    const url = window.location.href;
    if (isEmailSignInLink(url)) {
      completeEmailLinkSignIn(url)
        .then(() => {
          toast.success('ログインしました');
          router.push(getRedirect());
        })
        .catch((err) => {
          console.error('メールリンクのログイン失敗:', err);
          setError('メールリンクでのログインに失敗しました');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // メールアドレス確認完了メッセージの表示
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('メールアドレスの確認が完了しました');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.push(getRedirect());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <SignInForms
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          onSendEmailLink={handleSendEmailLink}
          loading={loading}
          googleLoading={googleLoading}
          emailLinkSent={emailLinkSent}
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;