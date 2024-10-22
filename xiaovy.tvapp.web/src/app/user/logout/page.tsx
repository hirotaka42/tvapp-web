'use client'
import React from 'react';
import { useRouter } from 'next/navigation';

const Logout = () => {
  const router = useRouter();
  const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
  if (!TokenName){
    console.log(TokenName);
    throw new Error("環境変数:IDTOKEN_NAMEが設定されていません。");
  }

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.removeItem(TokenName);
    router.push('/user/register');
  };

  return (
    <>
      <h1>Logoutページ</h1>
      <form onSubmit={handleLogout}>
        <button type="submit">Logout</button>
      </form>
    </>
  );
};

export default Logout;