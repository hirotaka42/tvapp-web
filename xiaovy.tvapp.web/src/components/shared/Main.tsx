"use client";
import React, { FC, useEffect, useState } from "react";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel, getAllLabels } from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
//import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { Home } from "@/components/Pages/Home";

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<ConvertedContent[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string>('ドラマランキング');
    const [allLabels, setAllLabels] = useState<string[]>([]);

    useEffect(() => {
        if (tvHomeData) {
            setAllLabels(getAllLabels(tvHomeData));
            if (selectedLabel) {
                const selectedContents = convertRankingToCardData(getContentsByLabel(tvHomeData, selectedLabel));
                setRankingContents(selectedContents);
            }
        }
    }, [tvHomeData, selectedLabel]);


    if (!session || !tvHomeData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <h1>Main</h1>
            <select onChange={e => setSelectedLabel(e.target.value)} value={selectedLabel}>
                <option value="">Select a label</option>
                {allLabels.map(label => (
                    <option key={label} value={label}>{label}</option>
                ))}
            </select>

            <ContentCardList contents={rankingContents} />
            <Home />
        </>
    );
};