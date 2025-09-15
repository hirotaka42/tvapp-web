import { useState, useEffect } from 'react';
import { VideoDownload, VideoDownloadResponse } from '@/types/VideoDownload';

export const useCosmosVideos = () => {
  const [videos, setVideos] = useState<VideoDownload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('IdToken') || process.env.NEXT_PUBLIC_BETA_IDTOKEN;
      
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }
      
      const response = await fetch('/api/cosmosdb/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data: VideoDownloadResponse = await response.json();
      
      if (data.success) {
        setVideos(data.data);
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