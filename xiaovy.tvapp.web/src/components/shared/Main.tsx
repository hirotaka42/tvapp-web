"use client";
import React, { FC, useEffect, useState } from "react";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel } from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { TabsWithUnderlineRanking } from "@/components/atomicDesign/molecules/Navi/TabsWithUnderLine-Ranking";
import { useAuth } from '@/hooks/useAuth';

type Tab = {
    title: string;
    query: string;
};

export const Main: FC = () => {
    const loginUser = useAuth();
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});
    const sampleGenres: Tab[] = [
        {
          title: "アニメ",
          query: "anime",
        },
        {
          title: "ドラマ",
          query: "drama",
        },
        {
          title: "バラエティー",
          query: "variety",
        }
      ];
    

    const rankingLabels = [
        'ドラマランキング', 'バラエティランキング', 'アニメ／ヒーローランキング',
        '報道／ドキュメンタリーランキング', 'スポーツランキング',
        '↓この放送回、すごく再生されています', '10月開始の新バラエティ番組',
        '【音楽特集】人気番組を見逃し配信中！',
        '今週のイチオシバラエティはこれ！', 'まもなく配信終了'
    ];

    useEffect(() => {
        if (tvHomeData && loginUser) {
            const contents = rankingLabels.reduce((acc, label) => {
                const labelContents = convertRankingToCardData(getContentsByLabel(tvHomeData, label));
                return { ...acc, [label]: labelContents };
            }, {});
            setRankingContents(contents);
        }
    }, [tvHomeData]);

    if (!session || !tvHomeData || !loginUser) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {rankingLabels.map(label => (
                <div key={label}>
                    <h2
                      className="text-md font-bold tracking-tight pl-3 pr-3 mt-1 text-gray-900 dark:text-white truncate"
                    >{label}</h2>
                    <ContentCardList contents={rankingContents[label] || []} />
                </div>
            ))}
            <TabsWithUnderlineRanking tabs={sampleGenres}/>
        </>
    );
};