'use client'
import React, { useState, ChangeEvent } from 'react';
import InputField from '@/components/InputField';

interface FormData {
  FirstName: string;
  LastName: string;
  Password: string;
  Email: string;
  PhoneNumber: string;
  Birthday: string;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const url = '/api/User/Register';

  const [formData, setFormData] = useState<FormData>({
    FirstName: '',
    LastName: '',
    Password: '',
    Email: '',
    PhoneNumber: '',
    Birthday: ''
  });

  const fields = [
    { name: 'FirstName', placeholder: '名前', type: 'text' },
    { name: 'LastName', placeholder: '名字', type: 'text' },
    { name: 'Password', placeholder: 'パスワード', type: 'password' },
    { name: 'Email', placeholder: 'メールアドレス', type: 'email' },
    { name: 'PhoneNumber', placeholder: '電話番号', type: 'tel' },
    { name: 'Birthday', placeholder: '誕生日', type: 'date' }
  ];

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
        throw new Error('ネットワークエラーが発生しました');
      }
      const result = await response.json();
      console.log('登録成功:', result);
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラー :', error.message);
        setError(error.message);
      } else {
        console.error('Unexpected error:', error);
        setError('予期しないエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <InputField 
            key={field.name}
            name={field.name}
            value={formData[field.name as keyof FormData]}
            type={field.type}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        ))}
        <br />
        <button>Submit</button>
      </form>
    </>
  );
};

export default Register;