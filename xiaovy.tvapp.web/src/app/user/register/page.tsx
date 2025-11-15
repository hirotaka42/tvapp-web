'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SignUpForms from '@/components/atomicDesign/molecules/Forms/sign-up-forms';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';
import { FirebaseError } from 'firebase/app';

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
      await signUp(formData.Email, formData.Password);
      console.log('登録成功');
      toast.success('アカウントを作成しました');
      router.push('/');
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