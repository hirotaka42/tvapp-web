import { Main as GenreDetailResponseTypes } from '@/types/RankingGenreDetailResponse';
import { IRankingService } from '@/services/IRankingService';

export class RankingService implements IRankingService {
  async callRanking(genre: string): Promise<GenreDetailResponseTypes> {
    const baseUrl = '/api/service/call/ranking/episode/detail';
    const url = `${baseUrl}/${genre}`;

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
      return data as GenreDetailResponseTypes;
    } catch (error) {
      console.error("Error:", error);
      throw new Error('Internal Server Error');
    }
  }
}