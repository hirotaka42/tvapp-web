"use client";
import React, { FC, useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { getContentsByLabel, getAllLabels } from '@/utils/Convert/ranking/home/responseParser';
import { convertRankingToCardData } from "@/utils/Convert/ranking/convertRankingToCardData";
import { ConvertedContent } from '@/types/CardItem/RankingContent';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/contexts/AuthContext';
import { useService } from '@/contexts/ServiceContext';
import { ComingSoonWorld } from '@/components/atomicDesign/organisms/ComingSoonWorld';
import { TverHome } from '@/components/atomicDesign/organisms/TverHome';
import { AbemaHomeContainer } from '@/components/atomicDesign/organisms/AbemaHome';
import { CinemaWorldContainer } from '@/components/atomicDesign/organisms/CinemaWorld';

export const Main: FC = () => {
    const router = useRouter();
    const loginUser = useAuth();
    const { loading } = useFirebaseAuth();
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const { service } = useService();
    const [rankingContents, setRankingContents] = useState<Record<string, ConvertedContent[]>>({});
    const [rankingLabels, setRankingLabels] = useState<string[]>([]);
    const [visited, setVisited] = useState<ReadonlySet<string>>(() => new Set());

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
                acc[label] = labelContents;
                return acc;
            }, {});
            setRankingContents(contents);
            setRankingLabels(allLabels);
        }
    }, [tvHomeData, loginUser]);

    useEffect(() => {
        if (service === 'tver' || service === 'abema') {
            setVisited((prev) => (prev.has(service) ? prev : new Set(prev).add(service)));
        }
    }, [service]);

    if (loading || !loginUser) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>;
    }

    return (
        <>
            {(service === 'abema' || visited.has('abema')) && (
                <div hidden={service !== 'abema'}>
                    <AbemaHomeContainer active={service === 'abema'} />
                </div>
            )}
            {service === 'cinema' && <CinemaWorldContainer />}
            {(service === 'tver' || visited.has('tver')) && (
                <div hidden={service !== 'tver'}>
                    {(!session || !tvHomeData || !rankingLabels.length)
                        ? <div className="flex justify-center items-center min-h-screen"><div className="text-gray-600 dark:text-gray-400">Loading...</div></div>
                        : <TverHome rankingLabels={rankingLabels} rankingContents={rankingContents} active={service === 'tver'} />}
                </div>
            )}
            {service !== 'tver' && service !== 'abema' && service !== 'cinema' && <ComingSoonWorld service={service} />}
        </>
    );
};
