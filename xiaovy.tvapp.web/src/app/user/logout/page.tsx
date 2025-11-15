'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '@/components/atomicDesign/molecules/ConfirmationModal';

const Logout = () => {
  const router = useRouter();
  const { clearAllAuthState } = useFirebaseAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // ページ表示時に自動的にモーダルを表示
  useEffect(() => {
    setLogoutModalOpen(true);
  }, []);

  const handleLogoutConfirm = async () => {
    try {
      await clearAllAuthState();
      toast.success('ログアウトしました');
      router.push('/user/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const handleCancel = () => {
    setLogoutModalOpen(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ログアウト
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ログアウト処理を行います
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={logoutModalOpen}
        onClose={handleCancel}
        onConfirm={handleLogoutConfirm}
        title="ログアウトしますか？"
        confirmText="はい"
        cancelText="いいえ"
      />
    </div>
  );
};

export default Logout;