import React from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export const GuestLoginButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
    const { signInAsGuest } = useFirebaseAuth();

    const handleGuestLogin = async () => {
        try {
            // Firebase匿名認証でゲストログイン
            await signInAsGuest();

            // Firebase ID Token取得
            if (!auth) {
                throw new Error('Firebase auth is not initialized');
            }
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not found after sign in');
            }
            const firebaseIdToken = await user.getIdToken();

            // Custom Claims設定（ゲストロール）
            const setRoleResponse = await fetch('/api/User/setGuestRole', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${firebaseIdToken}`,
                },
            });

            if (!setRoleResponse.ok) {
                console.warn('Failed to set guest role, but continuing...');
            }

            // TVer API用のIdTokenを取得してlocalStorageに保存
            const response = await fetch('/api/service/betaLoginToken', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch token');
            }

            const data = await response.json();
            localStorage.setItem('IdToken', data.IdToken);

            toast.success('ゲストとしてログインしました');
            router.push('/');
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error during guest login:', error.message);
                toast.error(`ゲストログインに失敗しました: ${error.message}`);
            } else {
                console.error('Unknown error:', error);
                toast.error('ゲストログイン処理で不明なエラーが発生しました');
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
            ゲストとしてログイン
        </button>
    );
};

export default GuestLoginButton;
