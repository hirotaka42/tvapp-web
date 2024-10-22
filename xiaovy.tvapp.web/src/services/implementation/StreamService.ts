import { Main as StreamResponseType } from '@/types/StreamResponse';
import { IStreamService } from '@/services/IStreamService';

export class StreamService implements IStreamService {
  async getVideoUrl(episodeId: string): Promise<StreamResponseType> {
    const baseUrl = `/api/service/call/streaminglink`;
    
    // クエリパラメータの作成
    const queryParams = new URLSearchParams({ episodeId }).toString();
    const url = `${baseUrl}?${queryParams}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('インターネット接続がありません');
      }

      const data = await response.json();
      return data as StreamResponseType;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error('Internal Server Error');
    }
  }
}