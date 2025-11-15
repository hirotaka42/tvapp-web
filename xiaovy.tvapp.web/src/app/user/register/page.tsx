'use client'
import React, { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import SignUpForms from '@/components/atomicDesign/molecules/Forms/sign-up-forms';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';

interface FormData {
  Uid: string;
  Password: string;
  Email: string;
  PhoneNumber: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const url = '/api/User/Register';

  const [formData, setFormData] = useState<FormData>({
    Uid: '',
    Password: '',
    Email: '',
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
    setLoading(true);

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
        toast.error('アカウントの作成に失敗しました');
        throw new Error('ネットワークエラーが発生しました');
      }
      const result = await response.json();
      console.log('登録成功:', result);
      toast.success('アカウントを作成しました');
      router.push('/user/login');
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラー :', error.message);
      } else {
        console.error('Unexpected error:', error);
        throw new Error('予期しないエラーが発生しました');
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
        />
      </div>
    </div>
  );
};

export default Register;