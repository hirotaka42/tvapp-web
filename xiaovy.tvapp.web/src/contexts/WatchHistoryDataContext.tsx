'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WatchHistoryResponse } from '@/types/WatchHistory';

interface WatchHistoryDataContextType {
  histories: WatchHistoryResponse[];
  setHistories: (histories: WatchHistoryResponse[]) => void;
  addHistoryToList: (history: WatchHistoryResponse) => void;
  removeHistoryFromList: (historyId: string) => void;
}

export const WatchHistoryDataContext = createContext<WatchHistoryDataContextType | null>(null);

export function WatchHistoryDataProvider({ children }: { children: ReactNode }) {
  const [histories, setHistories] = useState<WatchHistoryResponse[]>([]);

  const addHistoryToList = useCallback((history: WatchHistoryResponse) => {
    setHistories(prev => {
      // 重複がないか確認
      const exists = prev.some(h => h.id === history.id);
      if (exists) {
        return prev;
      }
      return [history, ...prev];
    });
  }, []);

  const removeHistoryFromList = useCallback((historyId: string) => {
    setHistories(prev => prev.filter(h => h.id !== historyId));
  }, []);

  return (
    <WatchHistoryDataContext.Provider value={{
      histories,
      setHistories,
      addHistoryToList,
      removeHistoryFromList,
    }}>
      {children}
    </WatchHistoryDataContext.Provider>
  );
}

export function useWatchHistoryData() {
  const context = useContext(WatchHistoryDataContext);
  if (!context) {
    throw new Error('useWatchHistoryData must be used within WatchHistoryDataProvider');
  }
  return context;
}
