import { Main as EpisodesForSeriseIdResponseTypes } from '@/types/api/response/episodesForSeriseId'
import { ISeriesService } from '@/services/ISeriesService';
import { sessionToken } from '@/types/Token';

export class SeriesService implements ISeriesService {
  async callSeriesContents(seriesId: string, session:sessionToken): Promise<EpisodesForSeriseIdResponseTypes> {
    const baseUrl = '/api/service/call/seriesEpisodes';
    const url = `${baseUrl}/${seriesId}?platform_uid=${session.platformUid}&platform_token=${session.platformToken}`;

    try {
      const response = await fetch(url, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${localStorage.getItem('IdToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('インターネット接続がありません');
      }

      const data = await response.json();
      return data as EpisodesForSeriseIdResponseTypes;
    } catch (error) {
      console.error("Error:", error);
      throw new Error('Internal Server Error');
    }
  }
}