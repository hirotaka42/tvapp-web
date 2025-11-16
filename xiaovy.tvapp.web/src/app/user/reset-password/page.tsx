'use client'
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { BrandPanel } from '@/components/atomicDesign/molecules/BrandPanel';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/atomicDesign/atoms/Button';

const ResetPassword: React.FC = () => {
  const { resetPassword } = useFirebaseAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // クールダウンタイマー
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (countdown > 0 || loading) return;

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      console.log('[SUCCESS] パスワードリセットメールを送信しました');
      toast.success('パスワードリセットメールを送信しました。メールボックスをご確認ください。');
      setEmailSent(true);
      setCountdown(60); // 60秒クールダウン
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Firebase エラー:', error.code, error.message);
        switch (error.code) {
          case 'auth/invalid-email':
            setError('メールアドレスの形式が正しくありません');
            break;
          case 'auth/missing-email':
            setError('メールアドレスを入力してください');
            break;
          case 'auth/user-not-found':
            setError('メールアドレスが登録されていません');
            break;
          default:
            // セキュリティのため、他のエラーでも成功メッセージを表示
            toast.success('メールアドレスが登録されている場合、パスワードリセットメールを送信しました');
            setEmailSent(true);
            setCountdown(60);
        }
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
        <div className="w-full max-w-md space-y-8">
          {/* ロゴ */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 24"
              fill="currentColor"
              className="mx-auto h-12 w-auto fill-sky-400"
            >
              <path d="M18.724 1.714c-4.538 0-7.376 2.286-8.51 6.857 1.702-2.285 3.687-3.143 5.957-2.57 1.296.325 2.22 1.271 3.245 2.318 1.668 1.706 3.6 3.681 7.819 3.681 4.539 0 7.376-2.286 8.51-6.857-1.701 2.286-3.687 3.143-5.957 2.571-1.294-.325-2.22-1.272-3.245-2.32-1.668-1.705-3.6-3.68-7.819-3.68zM10.214 12c-4.539 0-7.376 2.286-8.51 6.857 1.701-2.286 3.687-3.143 5.957-2.571 1.294.325 2.22 1.272 3.245 2.32 1.668 1.705 3.6 3.68 7.818 3.68 4.54 0 7.377-2.286 8.511-6.857-1.702 2.286-3.688 3.143-5.957 2.571-1.295-.326-2.22-1.272-3.245-2.32-1.669-1.705-3.6-3.68-7.82-3.68z"></path>
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              パスワードをリセット
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              登録済みのメールアドレスを入力してください
            </p>
          </div>

          {/* フォーム */}
          <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {!emailSent ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    メールアドレス
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* エラーメッセージ */}
                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                {/* 送信ボタン */}
                <div>
                  <Button
                    type="submit"
                    disabled={loading || countdown > 0}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        送信中...
                      </>
                    ) : countdown > 0 ? (
                      `再送信可能まで ${countdown}秒`
                    ) : (
                      'リセットメールを送信'
                    )}
                  </Button>
                </div>

                {/* ログインページへのリンク */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/user/login')}
                    className="text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    ログインページに戻る
                  </button>
                </div>
              </form>
            ) : (
              // メール送信後の表示
              <div className="space-y-6">
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                        メールを送信しました
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                        <p>
                          <strong>{email}</strong> 宛にパスワードリセットメールを送信しました。
                        </p>
                        <p className="mt-2">
                          メール内のリンクをクリックして、パスワードを再設定してください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 次のステップ */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    次のステップ:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>メールボックスを確認してください</li>
                    <li>パスワードリセットメール内のリンクをクリック</li>
                    <li>新しいパスワードを設定してください</li>
                  </ol>
                </div>

                {/* メールが届かない場合 */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    メールが届かない場合:
                  </p>
                  <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-500 space-y-1">
                    <li>迷惑メールフォルダを確認してください</li>
                    <li>メールアドレスが正しいか確認してください</li>
                    <li>数分待ってから再送信してください</li>
                  </ul>
                </div>

                {/* 再送信ボタン */}
                <Button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  disabled={countdown > 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                >
                  {countdown > 0 ? `再送信可能まで ${countdown}秒` : '再度送信する'}
                </Button>

                {/* ログインページへのリンク */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/user/login')}
                    className="text-sm font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    ログインページに戻る
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
