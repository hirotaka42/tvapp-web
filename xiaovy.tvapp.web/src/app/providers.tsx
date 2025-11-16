"use client";

import { FC, PropsWithChildren, useMemo } from "react";
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
import { ProfileService } from "@/services/implementation/ProfileService";
import { ProfileServiceContext } from "@/contexts/ProfileContext";
import { FavoriteService } from "@/services/implementation/FavoriteService";
import { FavoriteServiceContext } from "@/contexts/FavoriteContext";
import { WatchHistoryService } from "@/services/implementation/WatchHistoryService";
import { WatchHistoryServiceContext } from "@/contexts/WatchHistoryContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  // サービスインスタンスをメモ化して、不要な再生成を防ぐ
  const sessionService = useMemo(() => new SessionService(), []);
  const tvHomeService = useMemo(() => new TvHomeService(), []);
  const seriesService = useMemo(() => new SeriesService(), []);
  const episodeService = useMemo(() => new EpisodeService(), []);
  const rankingService = useMemo(() => new RankingService(), []);
  const streamService = useMemo(() => new StreamService(), []);
  const profileService = useMemo(() => new ProfileService(), []);
  const favoriteService = useMemo(() => new FavoriteService(), []);
  const watchHistoryService = useMemo(() => new WatchHistoryService(), []);

  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <SessionServiceContext.Provider value={sessionService}>
          <TvHomeServiceContext.Provider value={tvHomeService}>
            <SeriesServiceContext.Provider value={seriesService}>
              <EpisodeServiceContext.Provider value={episodeService}>
                <RankingServiceContext.Provider value={rankingService}>
                  <StreamServiceContext.Provider value={streamService}>
                    <ProfileServiceContext.Provider value={profileService}>
                      <FavoriteServiceContext.Provider value={favoriteService}>
                        <WatchHistoryServiceContext.Provider value={watchHistoryService}>
                          <Toaster
                            position="bottom-right"
                            toastOptions={{
                              duration: 4000,
                            }}
                          />
                            {children}
                        </WatchHistoryServiceContext.Provider>
                      </FavoriteServiceContext.Provider>
                    </ProfileServiceContext.Provider>
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