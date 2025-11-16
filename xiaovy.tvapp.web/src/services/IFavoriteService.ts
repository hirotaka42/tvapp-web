// src/services/IFavoriteService.ts

import { AddFavoriteRequest, FavoriteResponse, FavoritesListResponse } from '@/types/Favorite';

export interface IFavoriteService {
  /**
   * お気に入りを追加
   */
  addFavorite(request: AddFavoriteRequest): Promise<FavoriteResponse>;

  /**
   * お気に入りを削除
   */
  removeFavorite(seriesId: string): Promise<void>;

  /**
   * お気に入り一覧を取得
   */
  getFavorites(limit?: number, offset?: number): Promise<FavoritesListResponse>;

  /**
   * お気に入り状態を確認
   */
  isFavorite(seriesId: string): Promise<boolean>;
}
