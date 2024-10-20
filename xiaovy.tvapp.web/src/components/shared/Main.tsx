"use client";
import { FC } from "react";
import { Home } from "@/components/Pages/Home";
import Example from "@/components/atomicDesign/molecules/ContentLists"
import { useSessionService } from "@/hooks/useSession";

export const Main: FC = () => {
    const session = useSessionService();
    if (!session) {
        return <div>Loading...</div>;
    }
    const { platformUid, platformToken } = session;
    console.log(platformUid, platformToken);
    return (
        <>
        <h1>Main</h1>
        <Example />
        <Home />
        </>
    );
};