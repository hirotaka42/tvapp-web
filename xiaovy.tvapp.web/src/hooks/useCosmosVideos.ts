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
      
      // 認証トークンを取得（環境変数から）
      const token = process.env.NEXT_PUBLIC_BETA_IDTOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY3ZjEyMjg0ODEzOGRiZjQxMzZjZjM3NCIsImVtYWlsIjoiaHNzQGdtYWlsLmNvbSIsInV1aWQiOiIzNjY2NmRiMi01MWQzLTQ0Y2ItYTEwZC1hYTI2NjU2NzIxZDMiLCJleHAiOjE4MjE2MTYyODl9.O67sPAbzHLlEqp0buPob7F_VPJUdAXbCliML1inkLcc';
      
      const response = await fetch('/api/cosmosdb/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: VideoDownloadResponse = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError('Network error while fetching videos');
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