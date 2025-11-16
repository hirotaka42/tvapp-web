// src/services/implementation/WatchHistoryService.ts

import { IWatchHistoryService } from '../IWatchHistoryService';
import { RecordWatchHistoryRequest, WatchHistoryResponse, WatchHistoryListResponse } from '@/types/WatchHistory';
import { auth } from '@/lib/firebase';

export class WatchHistoryService implements IWatchHistoryService {
  private async getIdToken(): Promise<string> {
    if (!auth) {
      throw new Error('Firebase認証が初期化されていません');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('認証されていません');
    }
    return await currentUser.getIdToken();
  }

  async recordWatchHistory(request: RecordWatchHistoryRequest): Promise<WatchHistoryResponse> {
    try {
      const idToken = await this.getIdToken();
      const response = await fetch('/api/User/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('視聴履歴記録に失敗しました');
      }

      const data = await response.json();
      return data.history;
    } catch (error) {
      // ベストエフォート: エラーをログに出すが例外を投げない
      console.error('Failed to record watch history:', error);
      throw error;
    }
  }

  async getWatchHistories(limit = 20, offset = 0): Promise<WatchHistoryListResponse> {
    const idToken = await this.getIdToken();
    const response = await fetch(
      `/api/User/watch-history?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('視聴履歴取得に失敗しました');
    }

    return await response.json();
  }

  async deleteWatchHistory(historyId: string): Promise<void> {
    const idToken = await this.getIdToken();
    const response = await fetch(`/api/User/watch-history/${historyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '視聴履歴削除に失敗しました');
    }
  }
}
