"use client";
import React, { FC, useEffect, useState } from "react";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel, getAllLabels } from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { useAuth } from '@/hooks/useAuth';

export const Main: FC = () => {
    const loginUser = useAuth();
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});

    const [rankingLabels] = useState<string[]>(
        [
            'ドラマランキング', 'バラエティランキング', 'アニメ／ヒーローランキング',
            '報道／ドキュメンタリーランキング', 'スポーツランキング',
            '今週のイチオシバラエティはこれ！',
            'まもなく配信終了','新着'
        ]
    );

    useEffect(() => {
        if (tvHomeData && loginUser) {
            const allLabels = getAllLabels(tvHomeData);
            const contents = allLabels.reduce((acc, label) => {
                const labelContents = convertRankingToCardData(getContentsByLabel(tvHomeData, label));
                return { ...acc, [label]: labelContents };
            }, {});
            setRankingContents(contents);
            // ラベルごとのアイテム構造が把握できていないため、コメントアウト
            // setRankingLabels(allLabels);
        }
    }, [tvHomeData]);

    if (!session || !tvHomeData || !loginUser) {
        return <div>Loading...</div>;
    }

    return (
        <>
            { !rankingLabels.length && <div>Loading...</div> }
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