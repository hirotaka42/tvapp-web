'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SignUpForms from '@/components/atomicDesign/molecules/Forms/sign-up-forms';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';
import { FirebaseError } from 'firebase/app';
import { sendEmailVerification } from 'firebase/auth';

interface FormData {
  Email: string;
  Password: string;
  ConfirmPassword: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const { signUp } = useFirebaseAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    Email: '',
    Password: '',
    ConfirmPassword: ''
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

    // パスワード一致確認
    if (formData.Password !== formData.ConfirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      // ユーザー登録
      const userCredential = await signUp(formData.Email, formData.Password);
      console.log('登録成功:', userCredential.user.uid);

      // メールアドレス確認メールを送信
      try {
        console.log('[DEBUG] メール送信開始:', {
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          redirectUrl: `${window.location.origin}/user/login?verified=true`
        });

        await sendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/user/login?verified=true`,
          handleCodeInApp: false,
        });

        console.log('[SUCCESS] 確認メールを送信しました');
        toast.success('確認メールを送信しました。メールボックスをご確認ください。');
        // メール確認待ちページへリダイレクト
        router.push('/user/verify-email');
      } catch (emailError) {
        console.error('[ERROR] 確認メール送信エラー:', emailError);

        if (emailError instanceof Error) {
          console.error('[ERROR] エラー詳細:', {
            name: emailError.name,
            message: emailError.message,
            stack: emailError.stack
          });
          toast.error(`確認メールの送信に失敗しました: ${emailError.message}`);
        } else {
          toast.error('確認メールの送信に失敗しました。後ほど再送信してください。');
        }

        // メール送信に失敗してもアカウント作成は成功しているので、確認ページへ
        router.push('/user/verify-email');
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase エラー:', error.code, error.message);
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('このメールアドレスは既に使用されています');
            break;
          case 'auth/invalid-email':
            setError('メールアドレスの形式が正しくありません');
            break;
          case 'auth/operation-not-allowed':
            setError('メール/パスワード認証が有効になっていません');
            break;
          case 'auth/weak-password':
            setError('パスワードは6文字以上である必要があります');
            break;
          default:
            setError('アカウントの作成に失敗しました');
        }
        toast.error(error.message);
      } else {
        console.error('Unexpected error:', error);
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      <BrandPanel />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <SignUpForms
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Register;