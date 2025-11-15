import { useState, useEffect } from 'react';
import { VideoDownload, VideoDownloadResponse } from '@/types/VideoDownload';

// グローバルキャッシュ（コンポーネント間で共有）
let cachedData: VideoDownload[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ

export const useCosmosVideos = () => {
  const [videos, setVideos] = useState<VideoDownload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchVideos = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // キャッシュが有効な場合は使用
      const now = Date.now();
      if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('CosmosDB: キャッシュからデータを取得');
        setVideos(cachedData);
        setLoading(false);
        return;
      }
      
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('IdToken') || process.env.NEXT_PUBLIC_BETA_IDTOKEN;
      
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }
      
      // レート制限を避けるために少し待機
      if (retryCount > 0) {
        await sleep(Math.min(1000 * Math.pow(2, retryCount), 5000)); // 指数バックオフ（最大5秒）
      }
      
      const response = await fetch('/api/cosmosdb/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // 429 (Too Many Requests) の場合はリトライ
      if (response.status === 429 && retryCount < 3) {
        console.warn(`Rate limited, retrying... (attempt ${retryCount + 1})`);
        return fetchVideos(retryCount + 1);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}...`);
      }
      
      const data: VideoDownloadResponse = await response.json();
      
      if (data.success) {
        // キャッシュを更新
        cachedData = data.data;
        cacheTimestamp = now;
        
        setVideos(data.data);
        console.log(`CosmosDB: ${data.data.length}件のビデオを取得しました`);
      } else {
        setError(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while fetching videos';
      setError(errorMessage);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos
  };
};