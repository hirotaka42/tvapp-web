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
  const { user, signIn } = useFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    Email: '',
    Password: ''
  });

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
      router.push('/');
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

  // メールアドレス確認完了メッセージの表示
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('メールアドレスの確認が完了しました');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <SignInForms
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          router={router}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;