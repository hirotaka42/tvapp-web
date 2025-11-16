import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { VideoDownload } from '@/types/VideoDownload';
import { useCosmosVideos } from '@/hooks/useCosmosVideos';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { getSasUrl } from '@/utils/getSasUrl';
import { getExpiryStatus } from '@/utils/formatExpiryDate';
import { groupVideosBySeriesAndSeason, formatSeasonName } from '@/utils/groupVideos';
import { GroupedVideoItem } from '@/components/GroupedVideoItem';
import { useUserRole } from '@/hooks/useUserRole';
import { UserRole } from '@/types/User';

// モーダルコンポーネント
const VideoModal: React.FC<{
  video: VideoDownload | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ video, isOpen, onClose }) => {
  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {video.video_info.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="aspect-video">
          <VideoPlayer url={getSasUrl(video)} />
        </div>
      </div>
    </div>
  );
};

interface GroupedDBVideoListProps {
  maxItems?: number;
}

export const GroupedDBVideoList: React.FC<GroupedDBVideoListProps> = ({ maxItems }) => {
  const { videos, loading, error } = useCosmosVideos();
  const { role } = useUserRole();
  const [selectedVideo, setSelectedVideo] = useState<VideoDownload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());

  const playVideo = (video: VideoDownload) => {
    // 期限切れの場合は再生しない
    const expiryStatus = getExpiryStatus(video);
    if (expiryStatus === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }
    
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const downloadVideo = (video: VideoDownload) => {
    const expiryStatus = getExpiryStatus(video);
    if (expiryStatus === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }

    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const sasUrl = getSasUrl(video);
    
    if (isIOS || isAndroid) {
      // モバイルの場合：モーダルでリンクを表示
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 90%;
        text-align: center;
      `;

      // 要素を個別に作成
      const message = document.createElement('p');
      message.style.cssText = 'margin-bottom: 15px; color: black;';
      message.textContent = 'リンクを長押ししてダウンロードできます';

      const link = document.createElement('a');
      link.href = sasUrl;
      link.download = video.metadata.original_filename || `${video.video_info.title}.mp4`;
      link.style.cssText = 'color: blue; text-decoration: underline; word-break: break-all; display: block; margin-bottom: 15px;';
      link.textContent = sasUrl;

      const closeButton = document.createElement('button');
      closeButton.style.cssText = 'background: #666; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;';
      closeButton.textContent = '閉じる';
      closeButton.onclick = () => {
        document.body.removeChild(modal);
      };

      content.appendChild(message);
      content.appendChild(link);
      content.appendChild(closeButton);
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      // 背景クリックで閉じる
      modal.onclick = (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      };
    } else {
      // PC/その他の場合：従来通り
      const link = document.createElement('a');
      link.href = sasUrl;
      link.download = video.metadata.original_filename || `${video.video_info.title}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInVLC = (video: VideoDownload) => {
    const expiryStatus = getExpiryStatus(video);
    if (expiryStatus === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }

    const vlcUrl = `vlc://${getSasUrl(video)}`;
    window.open(vlcUrl, '_blank');
  };

  const openInInfuse = (video: VideoDownload) => {
    const expiryStatus = getExpiryStatus(video);
    if (expiryStatus === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }

    const infuseUrl = `infuse://x-callback-url/play?url=${encodeURIComponent(getSasUrl(video))}`;
    window.open(infuseUrl, '_blank');
  };

  const toggleSeries = (seriesName: string) => {
    const newExpanded = new Set(expandedSeries);
    if (newExpanded.has(seriesName)) {
      newExpanded.delete(seriesName);
    } else {
      newExpanded.add(seriesName);
    }
    setExpandedSeries(newExpanded);
  };

  const toggleSeason = (seasonKey: string) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonKey)) {
      newExpanded.delete(seasonKey);
    } else {
      newExpanded.add(seasonKey);
    }
    setExpandedSeasons(newExpanded);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    // ゲストユーザーの場合は機能制限メッセージを表示
    if (role === UserRole.GUEST) {
      return (
        <div className="p-4 text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-semibold">🔒 機能制限中</p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              ゲストユーザーはDBリストの利用ができません
            </p>
          </div>
        </div>
      );
    }

    // その他のユーザーの場合はエラーメッセージを表示
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 dark:text-red-400">エラー: {error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">動画がありません</p>
      </div>
    );
  }

  const filteredVideos = maxItems ? videos.slice(0, maxItems) : videos;
  const groupedVideos = groupVideosBySeriesAndSeason(filteredVideos);

  return (
    <div className="space-y-4">
      {groupedVideos.map((series) => (
        <div key={series.seriesName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* シリーズヘッダー */}
          <button
            onClick={() => toggleSeries(series.seriesName)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-between text-left transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {series.seriesName}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {series.seasons.reduce((total, season) => total + season.episodes.length, 0)}話
              </span>
              {expandedSeries.has(series.seriesName) ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </button>

          {/* シリーズのコンテンツ */}
          {expandedSeries.has(series.seriesName) && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {series.seasons.map((season, seasonIndex) => {
                const seasonKey = `${series.seriesName}-${seasonIndex}`;
                return (
                  <div key={seasonKey}>
                    {/* シーズンヘッダー */}
                    <button
                      onClick={() => toggleSeason(seasonKey)}
                      className="w-full px-6 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between text-left transition-colors"
                    >
                      <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                        {formatSeasonName(season.seasonName, season.seasonNumber)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {season.episodes.length}話
                        </span>
                        {expandedSeasons.has(seasonKey) ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </button>

                    {/* エピソードリスト */}
                    {expandedSeasons.has(seasonKey) && (
                      <div className="px-6 py-3 space-y-3">
                        {season.episodes.map((episode) => (
                          <GroupedVideoItem
                            key={episode.id}
                            video={episode}
                            onPlay={playVideo}
                            onDownload={downloadVideo}
                            onOpenInVLC={openInVLC}
                            onOpenInInfuse={openInInfuse}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* モーダル */}
      <VideoModal video={selectedVideo} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};