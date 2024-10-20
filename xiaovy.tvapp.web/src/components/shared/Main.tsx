"use client";
import { FC, useEffect, useState } from "react";
import { Home } from "@/components/Pages/Home";
import Example from "@/components/atomicDesign/molecules/ContentLists";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { useEpisodeService } from '@/hooks/useEpisode';
import { useStreamService } from '@/hooks/useStream';
import { useRankingService } from '@/hooks/useRanking';
import { getContentsByLabel, getLabelContentCounts } from '@/utils/Convert/ranking/home/responseParser';
import { convertEpisodeRankingResponse } from '@/utils/Convert/ranking/genreDetail/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const episodInfo = useEpisodeService('epf2lcrt80');
    const streamUrl = useStreamService('epf2lcrt80');
    const ranking = useRankingService('anime');
    const [rankingContents, setRankingContents] = useState<ConvertedContent[]>([]);

    useEffect(() => {
        if (tvHomeData) {
            const dramaContents = convertRankingToCardData(getContentsByLabel(tvHomeData, 'ドラマランキング'));
            const comedyContents = convertRankingToCardData(getContentsByLabel(tvHomeData, '笑ってストレス発散！人気コメディドラマ'));
            const contensCount = getLabelContentCounts(tvHomeData);
            console.log('ドラマ情報', dramaContents);
            console.log('コンテンツ数', contensCount);
            console.log('コメディドラマ', comedyContents);
        }
        if (ranking) {
            const rankingData = convertRankingToCardData(convertEpisodeRankingResponse(ranking));
            console.log('rankingData', rankingData);
            setRankingContents(rankingData);
        }
    }, [tvHomeData, ranking]);

    if (!session || !tvHomeData) {
        return <div>Loading...</div>;
    }

    const { platformUid, platformToken } = session;
    console.log(platformUid, platformToken);
    console.log(tvHomeData);
    console.log(episodInfo);
    console.log(streamUrl);

    return (
        <>
            <h1>Main</h1>
            <Example contents={rankingContents} />
            <Home />
        </>
    );
};