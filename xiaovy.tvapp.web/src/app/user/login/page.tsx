'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import SignInForms from '@/components/atomicDesign/molecules/Forms/sign-in-forms';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';

interface FormData {
  Email: string;
  Password: string;
}

const Login: React.FC = () => {
  const loginUser = useAuth();
  const router = useRouter();
  const url = '/api/User/Authentication';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // TODO: ↓この処理は共通化したい
  const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
  if (!TokenName){
    console.log(TokenName);
    throw new Error("環境変数:IDTOKEN_NAMEが設定されていません。");
  }

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

    // EmailをUidにも送信（後方互換性のため）
    const dataToSend = {
      Email: formData.Email,
      Uid: formData.Email,
      Password: formData.Password,
      PhoneNumber: null
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        setError('ログインIDまたはパスワードが正しくありません');
        throw new Error('ログイン失敗');
      }
      const result = await response.json();
      localStorage.setItem(TokenName, result.IdToken);
      console.log('ログイン成功:', result);
      toast.success('ログインしました');
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラー :', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginUser) {
      router.push('/');
    }
  }, [loginUser, router]);

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