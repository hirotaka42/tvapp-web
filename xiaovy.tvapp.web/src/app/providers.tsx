"use client";

import { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { SessionServiceContext } from "@/contexts/SessionContext";
import { SessionService } from '@/services/implementation/SessionService'
import { TvHomeService } from "@/services/implementation/TvHomeService";
import { TvHomeServiceContext } from "@/contexts/TvHomeContext";
import { EpisodeService } from "@/services/implementation/EpisodeService";
import { EpisodeServiceContext } from "@/contexts/EpisodeContext";
import { StreamService } from "@/services/implementation/StreamService";
import { StreamServiceContext } from "@/contexts/StreamContext";
import { RankingService } from "@/services/implementation/RankingService";
import { RankingServiceContext } from "@/contexts/RankingContext";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <SessionServiceContext.Provider value={new SessionService()}>
        <TvHomeServiceContext.Provider value={new TvHomeService()}>
          <EpisodeServiceContext.Provider value={new EpisodeService()}>
            <RankingServiceContext.Provider value={new RankingService()}>
              <StreamServiceContext.Provider value={new StreamService()}>
                {children}
              </StreamServiceContext.Provider>
            </RankingServiceContext.Provider>
          </EpisodeServiceContext.Provider>
        </TvHomeServiceContext.Provider>
      </SessionServiceContext.Provider>
    </ThemeProvider>
  );
};