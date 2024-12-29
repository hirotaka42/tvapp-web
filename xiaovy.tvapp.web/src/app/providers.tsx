"use client";

import { FC, PropsWithChildren } from "react";
import { useState, useEffect, useRef } from 'react'
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
import { Toast } from '@/components/atomicDesign/atoms/Toast';
import { ToastContext } from '@/contexts/ToastContext';
import { SeriesService } from '@/services/implementation/SeriseService';
import { SeriesServiceContext } from "@/contexts/SeriesContext";

type ToastType = 'success' | 'warning' | 'error'

interface ToastContext {
  showToast: (message: string, type: ToastType) => void
  closeToast: () => void
}

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string>('')
  const [toastType, setToastType] = useState<ToastType>('success')
  const [isShowToast, setShowToast] = useState<boolean>(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const showToast = (message: string, type: ToastType) => {
    // すでに実行されているsetTimeout()をキャンセルする
    clearTimeout(timer.current)
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const closeToast = () => {
    // すでに実行されているsetTimeout()をキャンセルする
    clearTimeout(timer.current)
    setShowToast(false)
  }

  useEffect(() => {
    if (!isShowToast) return
    // 5秒後にToastを非表示にする
    timer.current = setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }, [isShowToast])

  return (
    <ThemeProvider attribute="class">
      <SessionServiceContext.Provider value={new SessionService()}>
        <TvHomeServiceContext.Provider value={new TvHomeService()}>
          <SeriesServiceContext.Provider value={new SeriesService()}>
            <EpisodeServiceContext.Provider value={new EpisodeService()}>
              <RankingServiceContext.Provider value={new RankingService()}>
                <StreamServiceContext.Provider value={new StreamService()}>
                  <ToastContext.Provider value={{ showToast, closeToast }}>
                    {isShowToast && <Toast message={toastMessage} toastType={toastType} />}
                    {children}
                  </ToastContext.Provider>
                </StreamServiceContext.Provider>
              </RankingServiceContext.Provider>
            </EpisodeServiceContext.Provider>
          </SeriesServiceContext.Provider>
        </TvHomeServiceContext.Provider>
      </SessionServiceContext.Provider>
    </ThemeProvider>
  );
};