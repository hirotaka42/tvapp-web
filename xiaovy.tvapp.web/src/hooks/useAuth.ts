'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [loginUser, setLoginUser] = useState("");
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const TokenName = process.env.NEXT_PUBLIC_IDTOKEN_NAME;
            if (!TokenName) {
                throw new Error("環境変数:IDTOKEN_NAMEが設定されていません。");
            }
            const token = localStorage.getItem(TokenName);
            if (!token) {
                router.push('/user/login');
                return;
            }

            try {
                console.log("トークン検証中...");
                const response = await fetch('/api/utils/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();
                if (data.valid) {
                    setLoginUser(data.payload.email);
                } else {
                    router.push('/user/login');
                }
            } catch (error) {
                console.error("トークン検証中にエラーが発生しました", error);
                router.push('/user/login');
            }
        };
        checkToken();
    }, [router]);

    return loginUser;
}