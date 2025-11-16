import React from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';

export const GuestLoginButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
    const { signInAsGuest } = useFirebaseAuth();

    const handleGuestLogin = async () => {
        try {
            // Firebase匿名認証でゲストログイン
            await signInAsGuest();

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
