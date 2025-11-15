import React from 'react';
import Image from 'next/image';
import { PlayIcon, ArrowDownTrayIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { VideoDownload } from '@/types/VideoDownload';
import { formatExpiryDate, getExpiryStatus, getSasExpiryDate } from '@/utils/formatExpiryDate';

interface GroupedVideoItemProps {
  video: VideoDownload;
  onPlay: (video: VideoDownload) => void;
  onDownload: (video: VideoDownload) => void;
  onOpenInVLC: (video: VideoDownload) => void;
  onOpenInInfuse: (video: VideoDownload) => void;
}

export const GroupedVideoItem: React.FC<GroupedVideoItemProps> = ({
  video,
  onPlay,
  onDownload,
  onOpenInVLC,
  onOpenInInfuse
}) => {
  const expiryStatus = getExpiryStatus(video);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
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
          {video.metadata.episode || video.video_info.title}
        </h3>
        
        {/* 有効期限表示 */}
        {getSasExpiryDate(video) && (
          <div className={`flex items-center gap-1 mb-2 text-xs ${
            expiryStatus === 'expired' 
              ? 'text-red-600 dark:text-red-400' 
              : expiryStatus === 'warning'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {expiryStatus === 'expired' ? (
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
            onClick={() => onPlay(video)}
            disabled={expiryStatus === 'expired'}
            className={`w-full flex items-center justify-center gap-1 px-3 py-2 text-white text-xs rounded transition-colors ${
              expiryStatus === 'expired'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <PlayIcon className="h-4 w-4" />
            {expiryStatus === 'expired' ? '期限切れ' : 'ブラウザで再生'}
          </button>
          
          {/* 第2行：外部アプリ再生 */}
          <div className="flex gap-1">
            <button
              onClick={() => onOpenInVLC(video)}
              disabled={expiryStatus === 'expired'}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                expiryStatus === 'expired'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              VLC
            </button>
            <button
              onClick={() => onOpenInInfuse(video)}
              disabled={expiryStatus === 'expired'}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                expiryStatus === 'expired'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Infuse
            </button>
            <button
              onClick={() => onDownload(video)}
              disabled={expiryStatus === 'expired'}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-white text-xs rounded transition-colors ${
                expiryStatus === 'expired'
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
  );
};