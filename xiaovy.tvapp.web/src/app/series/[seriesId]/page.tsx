"use client";
import React, { useState, useEffect } from 'react';
import { useSessionService } from '@/hooks/useSession';
import { GenreContentCardList } from '@/components/atomicDesign/molecules/GenreContentCardList';
import { ConvertedCardViewContent } from '@/types/CardItem/ForGeneric';
import { convertCardContentsBySeason } from '@/utils/Convert/episodesForSeries/responseParser';
import { useSeriesService } from '@/hooks/useSeries';
import { FavoriteButton } from '@/components/atomicDesign/atoms/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { ErrorState } from '@/components/atomicDesign/molecules/ErrorState';

interface SeasonGroupedContents {
    seasonTitle: string;
    contents: ConvertedCardViewContent[];
}

function SeriesEpisodesPage({ params }: { params: { seriesId: string } }) {
    const { seriesId } = params;
    const [seriesContents, setSeriesContents] = useState<SeasonGroupedContents[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
    const session = useSessionService();
    // TODO: 取得完了まで待ちたいが、プロアクティすがわからず、、
    const seriesContent = useSeriesService(seriesId, session);
    const [attempt, setAttempt] = useState<number>(0);
    const { user: loginUser } = useFirebaseAuth();
    const { isFavorite: checkIsFavorite } = useFavorites();
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [seriesTitle, setSeriesTitle] = useState<string>('');

    // TODO: 取得完了まで待ちたいが、プロアクティすがわからず、、ここでの処理で正解？
    useEffect(() => {
        const maxAttempts = 5;  // 最大トライ数
        if (!seriesContent || !session) {
            if (attempt < maxAttempts) {
                const timer = setTimeout(() => {
                    setAttempt((prevAttempt) => prevAttempt + 1);
                }, 300);  // 300msごとに再試行
                return () => clearTimeout(timer);  // クリーンアップ
            } else {
                setLoading(false);
                console.error("シリーズコンテンツ情報を取得できませんでした。");
            }
            return;
        }
        const convertedData = convertCardContentsBySeason(seriesContent);
        setSeriesContents(convertedData);

        // シリーズタイトルを設定
        if (seriesContent.data.result.contents?.[0]) {
            const firstEpisode = seriesContent.data.result.contents[0];
            setSeriesTitle(firstEpisode.contents?.[0]?.content.seriesTitle || '');
        }

        setLoading(false);
    }, [seriesContent, session, attempt, seriesId]);

    // お気に入り状態を確認
    useEffect(() => {
        const checkFavorite = async () => {
            if (seriesId && loginUser && !loginUser.isAnonymous) {
                try {
                    const isFav = await checkIsFavorite(seriesId);
                    setIsFavorite(isFav);
                } catch (error) {
                    console.error('お気に入り状態の確認に失敗:', error);
                }
            }
        };
        checkFavorite();
    }, [seriesId, loginUser, checkIsFavorite]);

    // 10秒以上読み込みに時間がかかったかを判定するuseEffect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                setLoadingTimeout(true);
            }
        }, 10000); // 10秒

        return () => clearTimeout(timer);
    }, [loading]);

    if (!seriesId) {
        return (
            <ErrorState
                title="エラー"
                message="シリーズIDが指定されていません。正しいURLでアクセスしてください。"
                icon="❌"
                actionLabel="ホームに戻る"
                actionHref="/"
            />
        );
    }

    if (loading && !loadingTimeout) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mb-4"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">シリーズを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!seriesContents || seriesContents.length === 0) {
        return (
            <ErrorState
                title="シリーズが見つかりません"
                message="このシリーズは公開が終了しているか、削除されている可能性があります。データ取得に失敗した場合は再度読み込んでみてください。"
                icon="🎬"
                actionLabel="ホームに戻る"
                actionHref="/"
                onRetry={() => setAttempt(0)}
            />
        );
    }

    const handleFavoriteToggle = (newState: boolean) => {
        setIsFavorite(newState);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* シリーズヘッダー */}
            {seriesTitle && (
                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {seriesTitle}
                    </h1>
                    {loginUser && !loginUser.isAnonymous && (
                        <FavoriteButton
                            seriesId={seriesId}
                            seriesTitle={seriesTitle}
                            isFavorite={isFavorite}
                            onToggle={handleFavoriteToggle}
                            onFavoritesUpdate={() => {
                                // シリーズページではFetchはしないが、削除時のための処理
                            }}
                        />
                    )}
                </div>
            )}

            {/* エピソードリスト */}
            {seriesContents.map((season, index) => (
                <div key={index}>
                    <h2
                        className="text-base font-bold tracking-tight pl-3 pr-3 mt-1 text-gray-900 dark:text-white truncate"
                    >{season.seasonTitle}</h2>
                    <GenreContentCardList contents={season.contents} />
                </div>
            ))}
        </div>
    );
}

export default SeriesEpisodesPage;