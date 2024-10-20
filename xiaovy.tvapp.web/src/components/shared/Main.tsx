"use client";
import { FC } from "react";
import { Home } from "@/components/Pages/Home";
import Example from "@/components/atomicDesign/molecules/ContentLists";
import { useSessionService } from '@/hooks/useSession';
import { useTvHomeService } from '@/hooks/useTvHome';

export const Main: FC = () => {
    const session = useSessionService();
    const tvHomeData = useTvHomeService(session);

    if (!session || !tvHomeData) {
        return <div>Loading...</div>;
    }

    const { platformUid, platformToken } = session;
    console.log(platformUid, platformToken);
    console.log(tvHomeData);

    return (
        <>
            <h1>Main</h1>
            <Example />
            <Home />
        </>
    );
};