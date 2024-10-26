'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import SignInForms from '@/components/atomicDesign/molecules/Forms/sign-in-forms';

interface FormData {
  Uid: string;
  Password: string;
  Email: string;
  PhoneNumber: string;
}

const Login: React.FC = () => {
  const loginUser = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const url = '/api/User/Authentication';
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
        showToast('ログインに失敗しました', 'error');
        throw new Error('ネットワークエラーが発生しました');
      }
      const result = await response.json();
      localStorage.setItem(TokenName, result.IdToken);
      console.log('ログイン成功:', result);
      showToast('ログインしました', 'success');
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