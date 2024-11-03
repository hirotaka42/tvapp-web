import { Main as HomeResponseType } from '@/types/HomeResponse';
import { ITvHomeService } from '@/services/ITvHomeService';

export class TvHomeService implements ITvHomeService {
  async callHome(platformUid: string, platformToken: string): Promise<HomeResponseType> {
    const baseUrl = `/api/service/call/home`
    const url = `${baseUrl}?platformUid=${platformUid}&platformToken=${platformToken}`;
    try {
      const response = await fetch(url, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('IdToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error('インターネット接続がありません');
      }

      const data = await response.json();
      return data as HomeResponseType;
    } catch (error) {
      console.error("Error:", error);
      throw new Error('Internal Server Error');
    }
  }
}