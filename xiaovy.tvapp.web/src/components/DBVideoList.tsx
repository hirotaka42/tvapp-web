import React, { useState } from 'react';
import Image from 'next/image';
import { PlayIcon, ArrowDownTrayIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { VideoDownload } from '@/types/VideoDownload';
import { useCosmosVideos } from '@/hooks/useCosmosVideos';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';
import { getSasUrl } from '@/utils/getSasUrl';
import { getSasExpiryDate, formatExpiryDate, getExpiryStatus } from '@/utils/formatExpiryDate';

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

interface DBVideoListProps {
  maxItems?: number;
}

export const DBVideoList: React.FC<DBVideoListProps> = ({ maxItems }) => {
  const { videos, loading, error } = useCosmosVideos();
  const [selectedVideo, setSelectedVideo] = useState<VideoDownload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const playVideo = (video: VideoDownload) => {
    // 期限切れの場合は再生しない
    if (getExpiryStatus(video) === 'expired') {
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
    if (getExpiryStatus(video) === 'expired') {
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
    if (getExpiryStatus(video) === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }
    const vlcUrl = `vlc://${getSasUrl(video)}`;
    window.open(vlcUrl, '_blank');
  };

  const openInInfuse = (video: VideoDownload) => {
    if (getExpiryStatus(video) === 'expired') {
      alert('この動画の視聴期限が切れています。');
      return;
    }
    const infuseUrl = `infuse://x-callback-url/play?url=${encodeURIComponent(getSasUrl(video))}`;
    window.open(infuseUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 dark:text-red-400">エラー: {error}</p>
        <p className="text-xs text-gray-500 mt-2">データ件数: {videos.length}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">データがありません</p>
        <p className="text-xs text-gray-500 mt-2">API応答は正常ですが、表示するデータがありません</p>
      </div>
    );
  }

  // maxItemsが指定されている場合のみ制限を適用
  const displayVideos = maxItems ? videos.slice(0, maxItems) : videos;

  console.log(`DBVideoList: 取得データ数: ${videos.length}, 表示データ数: ${displayVideos.length}, maxItems: ${maxItems}`);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 p-4">
        {displayVideos.map((video) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* サムネイル部分 */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
              {video.video_info.thumbnail ? (
                <Image
                  src={video.video_info.thumbnail}
                  alt={video.video_info.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* 再生時間オーバーレイ */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {Math.floor(video.video_info.duration / 60)}:
                {String(Math.floor(video.video_info.duration % 60)).padStart(2, '0')}
              </div>
            </div>

            {/* コンテンツ部分 */}
            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2 line-clamp-2 overflow-hidden">
                {video.video_info.title}
              </h3>
              
              {/* 有効期限表示 */}
              {getSasExpiryDate(video) && (
                <div className={`flex items-center gap-1 mb-2 text-xs ${
                  getExpiryStatus(video) === 'expired' 
                    ? 'text-red-600 dark:text-red-400' 
                    : getExpiryStatus(video) === 'warning'
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {getExpiryStatus(video) === 'expired' ? (
                    <ExclamationTriangleIcon className="h-3 w-3" />
                  ) : (
                    <ClockIcon className="h-3 w-3" />
                  )}
                  <span className="font-medium">
                    視聴期限: {formatExpiryDate(video)}
                  </span>
                </div>
              )}
              
              {/* アクションボタン */}
              <div className="space-y-2">
                {/* 第1行：再生ボタン */}
                <button
                  onClick={() => playVideo(video)}
                  disabled={getExpiryStatus(video) === 'expired'}
                  className={`w-full flex items-center justify-center gap-1 px-3 py-2 text-white text-xs rounded transition-colors ${
                    getExpiryStatus(video) === 'expired'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <PlayIcon className="h-4 w-4" />
                  {getExpiryStatus(video) === 'expired' ? '期限切れ' : 'ブラウザで再生'}
                </button>
                
                {/* 第2行：外部アプリ再生 */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openInVLC(video)}
                    disabled={getExpiryStatus(video) === 'expired'}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                      getExpiryStatus(video) === 'expired'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    VLC
                  </button>
                  <button
                    onClick={() => openInInfuse(video)}
                    disabled={getExpiryStatus(video) === 'expired'}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                      getExpiryStatus(video) === 'expired'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    Infuse
                  </button>
                  <button
                    onClick={() => downloadVideo(video)}
                    disabled={getExpiryStatus(video) === 'expired'}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                      getExpiryStatus(video) === 'expired'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    DL
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};