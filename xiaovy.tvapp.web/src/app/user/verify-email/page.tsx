'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // ユーザーがログインしていない場合はログインページへ
    if (!user) {
      router.push('/user/login');
      return;
    }

    // 既にメール確認済みの場合はホームへ
    if (user.emailVerified) {
      router.push('/');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // カウントダウン処理
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!user || countdown > 0) return;

    setResending(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/user/login?verified=true`,
        handleCodeInApp: false,
      });
      toast.success('確認メールを再送信しました');
      setCountdown(60); // 60秒のクールダウン
    } catch (error) {
      console.error('確認メール再送信エラー:', error);
      toast.error('確認メールの再送信に失敗しました');
    } finally {
      setResending(false);
    }
  };

  if (!user) {
    return null; // ローディング中
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
            <EnvelopeIcon className="h-12 w-12 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            メールアドレスを確認してください
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            確認メールを送信しました
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              <strong className="text-gray-900 dark:text-white">{user.email}</strong>{' '}
              宛に確認メールを送信しました。
            </p>
            <p>メール内のリンクをクリックして、メールアドレスの確認を完了してください。</p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              次のステップ:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>メールボックスを確認してください</li>
              <li>確認メール内のリンクをクリックしてください</li>
              <li>ログインページに戻ってログインしてください</li>
            </ol>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              メールが届かない場合:
            </p>
            <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <li>迷惑メールフォルダを確認してください</li>
              <li>メールアドレスが正しいか確認してください</li>
              <li>数分待ってから再送信してください</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resending || countdown > 0}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
          >
            {resending ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                送信中...
              </>
            ) : countdown > 0 ? (
              `再送信可能まで ${countdown}秒`
            ) : (
              '確認メールを再送信'
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/user/login')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            ログインページへ
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          メールアドレスの確認が完了したら、ログインしてアプリをご利用いただけます
        </p>
      </div>
    </div>
  );
}
