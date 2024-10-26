'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/hooks/useAuth';
import { BetaLoginButton } from '@/components/atomicDesign/atoms/BetaLoginButton';

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
    // 空文字列をnullに置き換える
    // これは、サーバー側で空文字列を受け付けない場合に必要
    // Todo: 影響範囲がよくわかっていないので、調査する
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
    {/*
      This example requires updating your template:

      ```
      <html class="h-full bg-white">
      <body class="h-full">
      ```
    */}
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form action="#" method="POST" className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Email address
            </label>
            <div className="mt-2">
              <InputField 
                key="Email"
                name="Email"
                value={formData['Email']}
                type="Email"
                onChange={handleChange}
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <InputField 
                  key="Password"
                  name="Password"
                  value={formData['Password']}
                  type="Password"
                  onChange={handleChange}
                  placeholder="Password"
                />
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500 dark:text-slate-300">
          Not a member?{' '}
          <a href="/user/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Sign up now
          </a>
        </p>
      </div>
    </div>
    <BetaLoginButton />
  </>
  );

};

export default Login;