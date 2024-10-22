import { Main as GenreDetailResponseTypes } from '@/types/RankingGenreDetailResponse'

export interface IRankingService {
    callRanking: (genre: string) => Promise<GenreDetailResponseTypes>;
}