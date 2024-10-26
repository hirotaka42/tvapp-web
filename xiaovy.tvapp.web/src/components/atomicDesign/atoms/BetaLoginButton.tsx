import React from 'react';

export const BetaLoginButton: React.FC = () => {
    const handleBetaLogin = async () => {
        const existingToken = localStorage.getItem('IdToken');
        
        if (existingToken) {
            alert('既にベータアカウントとしてログインされています。');
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
            alert('ベータアカウントとしてログインしました！');
            
        } catch (error) {
            console.error('Error fetching token:', error);
            alert('ログインに失敗しました。');
        }
    };

    return (
        <button
            onClick={handleBetaLogin}
            className="mt-5 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            ベータアカウントでログインする
        </button>
    );
};

export default BetaLoginButton;