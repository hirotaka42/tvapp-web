'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FavoriteResponse } from '@/types/Favorite';

interface FavoritesDataContextType {
  favorites: FavoriteResponse[];
  setFavorites: (favorites: FavoriteResponse[]) => void;
  addFavoriteToList: (favorite: FavoriteResponse) => void;
  removeFavoriteFromList: (seriesId: string) => void;
}

export const FavoritesDataContext = createContext<FavoritesDataContextType | null>(null);

export function FavoritesDataProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);

  const addFavoriteToList = useCallback((favorite: FavoriteResponse) => {
    setFavorites(prev => {
      // 重複がないか確認
      const exists = prev.some(f => f.seriesId === favorite.seriesId);
      if (exists) {
        return prev;
      }
      return [favorite, ...prev];
    });
  }, []);

  const removeFavoriteFromList = useCallback((seriesId: string) => {
    setFavorites(prev => prev.filter(f => f.seriesId !== seriesId));
  }, []);

  return (
    <FavoritesDataContext.Provider value={{
      favorites,
      setFavorites,
      addFavoriteToList,
      removeFavoriteFromList,
    }}>
      {children}
    </FavoritesDataContext.Provider>
  );
}

export function useFavoritesData() {
  const context = useContext(FavoritesDataContext);
  if (!context) {
    throw new Error('useFavoritesData must be used within FavoritesDataProvider');
  }
  return context;
}
