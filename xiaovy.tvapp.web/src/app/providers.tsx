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
import { SeriesService } from '@/services/implementation/SeriseService';
import { SeriesServiceContext } from "@/contexts/SeriesContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export const Providers: FC<PropsWithChildren> = ({ children }) => {

  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <SessionServiceContext.Provider value={new SessionService()}>
          <TvHomeServiceContext.Provider value={new TvHomeService()}>
            <SeriesServiceContext.Provider value={new SeriesService()}>
              <EpisodeServiceContext.Provider value={new EpisodeService()}>
                <RankingServiceContext.Provider value={new RankingService()}>
                  <StreamServiceContext.Provider value={new StreamService()}>
                    <Toaster
                      position="bottom-right"
                      toastOptions={{
                        duration: 4000,
                      }}
                    />
                      {children}
                  </StreamServiceContext.Provider>
                </RankingServiceContext.Provider>
              </EpisodeServiceContext.Provider>
            </SeriesServiceContext.Provider>
          </TvHomeServiceContext.Provider>
        </SessionServiceContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
};