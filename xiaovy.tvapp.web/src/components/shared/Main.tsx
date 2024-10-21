"use client";
import React, { FC, useEffect, useState } from "react";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel} from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
//import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { Home } from "@/components/Pages/Home";

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});

    const rankingLabels = [
        'ドラマランキング', 'バラエティランキング', 'アニメ／ヒーローランキング',
        '報道／ドキュメンタリーランキング', 'スポーツランキング',
        '↓この放送回、すごく再生されています', '10月開始の新バラエティ番組',
        '【音楽特集】人気番組を見逃し配信中！',
        '今週のイチオシバラエティはこれ！', 'まもなく配信終了'
    ];

    useEffect(() => {
        if (tvHomeData) {
            const contents = rankingLabels.reduce((acc, label) => {
                const labelContents = convertRankingToCardData(getContentsByLabel(tvHomeData, label));
                return { ...acc, [label]: labelContents };
            }, {});
            setRankingContents(contents);
        }
    }, [tvHomeData]);

    if (!session || !tvHomeData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <h1>Main</h1>
            {rankingLabels.map(label => (
                <div key={label}>
                    <h2>{label}</h2>
                    <ContentCardList contents={rankingContents[label] || []} />
                </div>
            ))}
            <Home />
        </>
    );
};