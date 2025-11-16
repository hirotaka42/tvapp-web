import React from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/AuthContext';

export const GuestLoginButton: React.FC<{ router: ReturnType<typeof useRouter> }> = ({ router }) => {
    const { signInAsGuest } = useFirebaseAuth();

    const handleGuestLogin = async () => {
        try {
            // Firebase匿名認証でゲストログイン
            const userCredential = await signInAsGuest();

            // ゲストロール設定エンドポイントを呼び出し
            const token = await userCredential.user.getIdToken();
            const response = await fetch('/api/User/setGuestRole', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'ゲストロール設定に失敗しました');
            }

            const result = await response.json();
            console.log('Guest role set successfully:', result);

            // Firebaseのカスタムクレイムが反映されるまで待機（1秒）
            await new Promise(resolve => setTimeout(resolve, 1000));

            // トークンを強制リフレッシュしてロールを確認
            await userCredential.user.getIdToken(true);
            const updatedTokenResult = await userCredential.user.getIdTokenResult(true);
            console.log('Updated token obtained');
            console.log('Updated claims:', updatedTokenResult.claims);

            toast.success('ゲストとしてログインしました');

            // ホームページへリダイレクト
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
