// src/hooks/useFavorites.ts

import { useContext, useState, useCallback } from 'react';
import { FavoriteServiceContext } from '@/contexts/FavoriteContext';
import { AddFavoriteRequest, FavoriteResponse } from '@/types/Favorite';
import toast from 'react-hot-toast';

export function useFavorites() {
  const service = useContext(FavoriteServiceContext);
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    throw new Error('useFavorites must be used within FavoriteServiceContext');
  }

  const fetchFavorites = useCallback(async (limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await service.getFavorites(limit, offset);
      setFavorites(response.favorites);
    } catch (err) {
      const errorMessage = 'お気に入りの取得に失敗しました';
      console.error('fetchFavorites error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const addFavorite = useCallback(async (request: AddFavoriteRequest) => {
    try {
      const favorite = await service.addFavorite(request);
      setFavorites(prev => [favorite, ...prev]);
      toast.success('お気に入りに追加しました');
      return favorite;
    } catch (err) {
      toast.error('お気に入り追加に失敗しました');
      throw err;
    }
  }, [service]);

  const removeFavorite = useCallback(async (seriesId: string) => {
    try {
      await service.removeFavorite(seriesId);
      setFavorites(prev => prev.filter(f => f.seriesId !== seriesId));
      toast.success('お気に入りから削除しました');
    } catch (err) {
      toast.error('お気に入り削除に失敗しました');
      throw err;
    }
  }, [service]);

  const isFavorite = useCallback(async (seriesId: string) => {
    return await service.isFavorite(seriesId);
  }, [service]);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
