import React, { useState } from 'react';
import Image from 'next/image';
import { PlayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { VideoDownload } from '@/types/VideoDownload';
import { useCosmosVideos } from '@/hooks/useCosmosVideos';
import { VideoPlayer } from '@/components/atomicDesign/atoms/VideoPlayer';

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
          <VideoPlayer url={video.sas_url} />
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
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const downloadVideo = (video: VideoDownload) => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    if (isIOS) {
      // iOSの場合：アプリストアの案内またはSafariでの直接ダウンロード
      if (confirm('iOSでダウンロードするには以下の方法があります：\n\n1. Documents by Readdle (推奨)\n2. Safariで直接ダウンロード\n\n「OK」でアプリストアを開く、「キャンセル」で直接ダウンロード')) {
        window.open('https://apps.apple.com/jp/app/documents-by-readdle/id364901807', '_blank');
      } else {
        window.open(video.sas_url, '_blank');
      }
    } else if (isAndroid) {
      // Androidの場合：推奨アプリの案内
      if (confirm('Androidでダウンロードするには以下のアプリがおすすめです：\n\n1. ADM (Advanced Download Manager)\n2. Chrome標準ダウンロード\n\n「OK」でPlay Storeを開く、「キャンセル」で直接ダウンロード')) {
        window.open('https://play.google.com/store/apps/details?id=com.dv.adm', '_blank');
      } else {
        window.open(video.sas_url, '_blank');
      }
    } else {
      // PC/その他の場合：従来通り
      const link = document.createElement('a');
      link.href = video.sas_url;
      link.download = video.metadata.original_filename || `${video.video_info.title}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInVLC = (video: VideoDownload) => {
    const vlcUrl = `vlc://${video.sas_url}`;
    window.open(vlcUrl, '_blank');
  };

  const openInInfuse = (video: VideoDownload) => {
    const infuseUrl = `infuse://x-callback-url/play?url=${encodeURIComponent(video.sas_url)}`;
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
              
              {/* アクションボタン */}
              <div className="space-y-2">
                {/* 第1行：再生ボタン */}
                <button
                  onClick={() => playVideo(video)}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <PlayIcon className="h-4 w-4" />
                  ブラウザで再生
                </button>
                
                {/* 第2行：外部アプリ再生 */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openInVLC(video)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors"
                  >
                    VLC
                  </button>
                  <button
                    onClick={() => openInInfuse(video)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                  >
                    Infuse
                  </button>
                  <button
                    onClick={() => downloadVideo(video)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
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