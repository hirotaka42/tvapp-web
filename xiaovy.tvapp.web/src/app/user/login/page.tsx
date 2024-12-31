'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import SignInForms from '@/components/atomicDesign/molecules/Forms/sign-in-forms';

interface FormData {
  Uid: string;
  Password: string;
  Email: string;
  PhoneNumber: string;
}

const Login: React.FC = () => {
  const loginUser = useAuth();
  const router = useRouter();
  const url = '/api/User/Authentication';
  // TODO: ↓この処理は共通化したい
  const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
  if (!TokenName){
    console.log(TokenName);
    throw new Error("環境変数:IDTOKEN_NAMEが設定されていません。");
  }

  const [formData, setFormData] = useState<FormData>({
    Email: '',
    Password: '',
    Uid: '',
    PhoneNumber: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value || null])
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) {
        toast.error('ログインに失敗しました');
        throw new Error('ネットワークエラーが発生しました');
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
        throw new Error('予期しないエラーが発生しました');
      }
    }
  };

  useEffect(() => {
    if (loginUser) {
      router.push('/');
    }
  }, [loginUser, router]);

  return (
    <>
      <SignInForms
        formData={{ Email: formData.Email, Password: formData.Password }}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        router={router}
      />
    </>
  );
};

export default Login;