// src/types/WatchHistory.ts

import { Timestamp } from 'firebase/firestore';

/**
 * 視聴履歴データ (Firestoreドキュメント)
 */
export interface WatchHistory {
  episodeId: string;
  episodeTitle: string;
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
  description: string;
  watchedAt: Timestamp;
}

/**
 * 視聴履歴記録リクエスト
 */
export interface RecordWatchHistoryRequest {
  episodeId: string;
  episodeTitle: string;
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
  description: string;
}

/**
 * 視聴履歴レスポンス (フロントエンド用)
 */
export interface WatchHistoryResponse {
  id: string;  // Firestore Document ID
  episodeId: string;
  episodeTitle: string;
  seriesId: string;
  seriesTitle: string;
  thumbnailUrl: string;
  description: string;
  watchedAt: Date;
}

/**
 * 視聴履歴一覧レスポンス
 */
export interface WatchHistoryListResponse {
  histories: WatchHistoryResponse[];
  count: number;
}
