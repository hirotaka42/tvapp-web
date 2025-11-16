// src/services/IWatchHistoryService.ts

import { RecordWatchHistoryRequest, WatchHistoryResponse, WatchHistoryListResponse } from '@/types/WatchHistory';

export interface IWatchHistoryService {
  /**
   * 視聴履歴を記録
   */
  recordWatchHistory(request: RecordWatchHistoryRequest): Promise<WatchHistoryResponse>;

  /**
   * 視聴履歴一覧を取得
   */
  getWatchHistories(limit?: number, offset?: number): Promise<WatchHistoryListResponse>;

  /**
   * 視聴履歴を削除
   */
  deleteWatchHistory(historyId: string): Promise<void>;
}
