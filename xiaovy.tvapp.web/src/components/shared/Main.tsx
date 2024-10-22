"use client";
import React, { FC, useEffect, useState } from "react";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { useRankingService } from '@/hooks/useRanking';
import { getContentsByLabel } from '@/utils/Convert/ranking/home/responseParser';
import { convertEpisodeRankingResponse } from '@/utils/Convert/ranking/genreDetail/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { ContentCardList } from '@/components/atomicDesign/molecules/ContentCardList';
import { RankingContentCardList } from '@/components/atomicDesign/molecules/RankingContentCardList';
import { Home } from "@/components/Pages/Home";
import { TabsWithUnderline } from "@/components/atomicDesign/molecules/Navi/TabsWithUnderLine";

const useGenreRanking = (selectedGenre: string | null) => {
    const ranking = useRankingService(selectedGenre);
    return ranking ? convertRankingToCardData(convertEpisodeRankingResponse(ranking)) : null;
};

type Tab = {
    title: string;
    query: string;
};

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const sampleTabs: Tab[] = [
        {
          title: "アニメ",
          query: "Anime",
        },
        {
          title: "ドラマ",
          query: "Drama",
        },
        {
          title: "バラエティー",
          query: "Veraety",
        },
        {
          title: "ドキュメンタリー",
          query: "Documentary",
        },
      ];
    

    const rankingLabels = [
        'ドラマランキング', 'バラエティランキング', 'アニメ／ヒーローランキング',
        '報道／ドキュメンタリーランキング', 'スポーツランキング',
        '↓この放送回、すごく再生されています', '10月開始の新バラエティ番組',
        '【音楽特集】人気番組を見逃し配信中！',
        '今週のイチオシバラエティはこれ！', 'まもなく配信終了'
    ];
    const rankingGenres = [
        'anime', 'variety', 'drama'
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

    const genreRankingData = useGenreRanking(selectedGenre);

    useEffect(() => {
        if (selectedGenre) {
            setLoading(true);
        }
    }, [selectedGenre]);

    useEffect(() => {
        if (genreRankingData && selectedGenre) {
            setRankingContents(prevContents => ({ ...prevContents, [selectedGenre]: genreRankingData }));
            setLoading(false);
        }
    }, [genreRankingData, selectedGenre]);

    if (!session || !tvHomeData) {
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
            <TabsWithUnderline
                tabs={sampleTabs}
            />

            <div>
                <h2>ランキングジャンル</h2>
                {rankingGenres.map(genre => (
                    <button 
                        key={genre} 
                        onClick={() => setSelectedGenre(genre)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                    >
                        {genre}
                    </button>
                ))}
            </div>

            {selectedGenre && (
                loading ? 
                <div>Loading...</div> :
                <RankingContentCardList contents={rankingContents[selectedGenre] || []} />
            )}

            <Home />
        </>
    );
};