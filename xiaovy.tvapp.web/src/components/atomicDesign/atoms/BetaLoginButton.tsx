import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

export const BetaLoginButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
    const { showToast } = useToast();

    const handleBetaLogin = async () => {
        const existingToken = localStorage.getItem('IdToken');

        if (existingToken) {
            showToast('βアカウントとしてログインしているようです', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/service/betaLoginToken', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }

            const data = await response.json();
            localStorage.setItem('IdToken', data.IdToken);
            showToast('βアカウントとしてログインしました', 'success');
            router.push('/');
        } catch (error) {
            console.error('Error fetching token:', error);
            showToast('ログインに失敗しました', 'error');
        }
    };

    return (
        <button
            onClick={handleBetaLogin}
            className="mt-5 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            βアカウントでログイン
        </button>
    );
};

export default BetaLoginButton;