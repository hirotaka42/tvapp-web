"use client";
import React, { FC, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel, getAllLabels } from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/contexts/AuthContext';

export const Main: FC = () => {
    const router = useRouter();
    const loginUser = useAuth();
    const { loading } = useFirebaseAuth();
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});
    const [rankingLabels, setRankingLabels] = useState<string[]>([]);

    // 認証チェック: 未認証の場合はログイン画面へリダイレクト
    useEffect(() => {
        if (!loading && !loginUser) {
            router.push('/user/login');
        }
    }, [loading, loginUser, router]);

    useEffect(() => {
        if (tvHomeData && loginUser) {
            const allLabels = getAllLabels(tvHomeData);
            const contents = allLabels.reduce<Record<string, ConvertedContent[]>>((acc, label) => {
                const labelContents = convertRankingToCardData(getContentsByLabel(tvHomeData, label));
                return { ...acc, [label]: labelContents };
            }, {});
            setRankingContents(contents);
            setRankingLabels(allLabels);
        }
    }, [tvHomeData, loginUser]);

    // 認証チェック中、またはデータ読み込み中
    if (loading || !loginUser || !session || !tvHomeData) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>;
    }

    return (
        <>
            {!rankingLabels.length && <div>Loading...</div>}
            {rankingLabels.map(label => (
                <div key={label}>
                    <h2
                        className="text-md font-bold tracking-tight pl-3 pr-3 mt-1 text-gray-900 dark:text-white truncate"
                    >{label}</h2>
                    <ContentCardList contents={rankingContents[label] || []} />
                </div>
            ))}
        </>
    );
};
