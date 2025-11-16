// src/hooks/useWatchHistory.ts

import { useContext, useState, useCallback } from 'react';
import { WatchHistoryServiceContext } from '@/contexts/WatchHistoryContext';
import { RecordWatchHistoryRequest, WatchHistoryResponse } from '@/types/WatchHistory';
import toast from 'react-hot-toast';

export function useWatchHistory() {
  const service = useContext(WatchHistoryServiceContext);
  const [histories, setHistories] = useState<WatchHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    throw new Error('useWatchHistory must be used within WatchHistoryServiceContext');
  }

  const fetchHistories = useCallback(async (limit?: number, offset?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await service.getWatchHistories(limit, offset);
      setHistories(response.histories);
    } catch (err) {
      const errorMessage = '視聴履歴の取得に失敗しました';
      console.error('fetchHistories error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [service]);

  const recordHistory = useCallback(async (request: RecordWatchHistoryRequest) => {
    try {
      const history = await service.recordWatchHistory(request);
      setHistories(prev => [history, ...prev]);
      return history;
    } catch (err) {
      // ベストエフォート: エラーをログに出すがトーストは表示しない
      console.error('Failed to record watch history:', err);
    }
  }, [service]);

  const deleteHistory = useCallback(async (historyId: string) => {
    try {
      await service.deleteWatchHistory(historyId);
      setHistories(prev => prev.filter(h => h.id !== historyId));
      toast.success('視聴履歴を削除しました');
    } catch (err) {
      toast.error('視聴履歴削除に失敗しました');
      throw err;
    }
  }, [service]);

  return {
    histories,
    loading,
    error,
    fetchHistories,
    recordHistory,
    deleteHistory,
  };
}
