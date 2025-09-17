import { VideoDownload } from '@/types/VideoDownload';

export interface GroupedVideo {
  seriesName: string;
  seasons: {
    seasonName: string;
    seasonNumber?: number;
    episodes: VideoDownload[];
  }[];
}

/**
 * ビデオをシリーズ・シーズン別にグルーピングする
 */
export function groupVideosBySeriesAndSeason(videos: VideoDownload[]): GroupedVideo[] {
  // シリーズごとにグルーピング
  const seriesMap = new Map<string, VideoDownload[]>();
  
  videos.forEach(video => {
    const seriesName = video.metadata.series || 'その他';
    if (!seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, []);
    }
    seriesMap.get(seriesName)!.push(video);
  });

  // 各シリーズ内でシーズン別にグルーピング
  const result: GroupedVideo[] = [];
  
  seriesMap.forEach((seriesVideos, seriesName) => {
    const seasonMap = new Map<string, VideoDownload[]>();
    
    seriesVideos.forEach(video => {
      const seasonName = video.metadata.season || 'シーズン不明';
      if (!seasonMap.has(seasonName)) {
        seasonMap.set(seasonName, []);
      }
      seasonMap.get(seasonName)!.push(video);
    });

    // シーズンをシーズン番号順にソート
    const seasons = Array.from(seasonMap.entries()).map(([seasonName, episodes]) => {
      // エピソードをエピソード番号順にソート
      const sortedEpisodes = episodes.sort((a, b) => {
        const episodeA = a.metadata.episode_number || 0;
        const episodeB = b.metadata.episode_number || 0;
        return episodeA - episodeB;
      });

      return {
        seasonName,
        seasonNumber: episodes[0]?.metadata.season_number,
        episodes: sortedEpisodes
      };
    }).sort((a, b) => {
      // シーズン番号でソート
      const seasonA = a.seasonNumber || 0;
      const seasonB = b.seasonNumber || 0;
      return seasonA - seasonB;
    });

    result.push({
      seriesName,
      seasons
    });
  });

  // シリーズ名でソート
  return result.sort((a, b) => a.seriesName.localeCompare(b.seriesName));
}

/**
 * エピソード番号を表示用にフォーマット
 */
export function formatEpisodeNumber(episode: VideoDownload): string {
  if (episode.metadata.episode_number) {
    return `第${episode.metadata.episode_number}話`;
  }
  return '';
}

/**
 * シーズン名を表示用にフォーマット
 */
export function formatSeasonName(seasonName: string, seasonNumber?: number): string {
  if (seasonNumber) {
    return `${seasonName} (S${seasonNumber})`;
  }
  return seasonName;
}