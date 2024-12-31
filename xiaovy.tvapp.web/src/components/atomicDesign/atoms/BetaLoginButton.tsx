import React from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { removeIdToken } from '@/utils/Util/cleanToken';

export const BetaLoginButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
    const handleBetaLogin = async () => {
        // たまにβアカウントでログインしようとしているのに、すでにログインしている場合があるので、一度ログアウトする
        // TODO: この処理は共通化したい
        const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
        if (!TokenName) {
            console.error("環境変数:IDTOKEN_NAMEが設定されていません。");
            toast.error("環境変数:IDTOKEN_NAMEが設定されていません。");
            return;
        }
        const existingToken = localStorage.getItem(TokenName);
        if (existingToken) removeIdToken();

        try {
            const response = await fetch('/api/service/betaLoginToken', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }

            const data = await response.json();
            localStorage.setItem('IdToken', data.IdToken);
            toast.success('βアカウントとしてログインしました');
            router.push('/');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error fetching token:', error.message);
                toast.error(`βアカウントとしてログインに失敗しました: ${error.message}`);
            } else {
                console.error('Unknown error:', error);
                toast.error('βアカウントのログイン処理で不明なエラーが発生しました');
            }
        }
    };

    return (
        <button
            // フォーム内に配置されているため、デフォルトのサブミット動作を防ぐ
            // デフォルトのサブミット動作を防ぐために、type="button"を指定
            type="button"
            onClick={handleBetaLogin}
            className="mt-5 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            βアカウントでログイン
        </button>
    );
};

export default BetaLoginButton;