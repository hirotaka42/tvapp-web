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

const useGenreRanking = (selectedGenre: string | null) => {
    const ranking = useRankingService(selectedGenre);
    return ranking ? convertRankingToCardData(convertEpisodeRankingResponse(ranking)) : null;
};

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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
            <h1>Main</h1>
            {rankingLabels.map(label => (
                <div key={label}>
                    <h2>{label}</h2>
                    <ContentCardList contents={rankingContents[label] || []} />
                </div>
            ))}

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