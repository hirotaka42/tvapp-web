"use client";

import { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "next-themes";
import { SessionServiceContext } from "@/contexts/SessionContext";
import { SessionService } from '@/services/implementation/SessionService'
import { TvHomeService } from "@/services/implementation/TvHomeService";
import { TvHomeServiceContext } from "@/contexts/TvHomeContext";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <SessionServiceContext.Provider value={new SessionService()}>
        <TvHomeServiceContext.Provider value={new TvHomeService()}>
        {children}
        </TvHomeServiceContext.Provider>
      </SessionServiceContext.Provider>
    </ThemeProvider>
  );
};