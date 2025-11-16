// src/types/Favorite.ts

import { Timestamp } from 'firebase/firestore';

/**
 * お気に入りデータ (Firestoreドキュメント)
 */
export interface Favorite {
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
  addedAt: Timestamp;
}

/**
 * お気に入り追加リクエスト
 */
export interface AddFavoriteRequest {
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
}

/**
 * お気に入りレスポンス (フロントエンド用)
 */
export interface FavoriteResponse {
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
  addedAt: Date;
}

/**
 * お気に入り一覧レスポンス
 */
export interface FavoritesListResponse {
  favorites: FavoriteResponse[];
  count: number;
}
