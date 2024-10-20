"use client";
import { FC } from "react";
import { Home } from "@/components/Pages/Home";
import Example from "@/components/atomicDesign/molecules/ContentLists";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';
import { useEpisodeService } from '@/hooks/useEpisode';
import { useStreamService } from '@/hooks/useStream';

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);
    const episodInfo = useEpisodeService('epf2lcrt80');
    const streamUrl = useStreamService('epf2lcrt80');

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
            <Example />
            <Home />
        </>
    );
};