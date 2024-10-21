import { Main as HomeResponseType } from '@/types/HomeResponse';
import { ITvHomeService } from '@/services/ITvHomeService';

export class TvHomeService implements ITvHomeService {
  async callHome(platformUid: string, platformToken: string): Promise<HomeResponseType> {
    try {
      const response = await fetch(`/api/service/call/home?platformUid=${platformUid}&platformToken=${platformToken}`, {
        headers: {
          'accept': '*/*'
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