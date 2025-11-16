'use client';

import { useRef, useState } from 'react';
import { ProfileAvatar } from '../atoms/ProfileAvatar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { resizeImage } from '@/utils/imageResize';

interface ProfileImageUploaderProps {
  currentPhotoURL: string | null;
  userName: string;
  onUploadSuccess: (photoURL: string) => void;
  onDeleteSuccess: () => void;
}

export function ProfileImageUploader({
  currentPhotoURL,
  userName,
  onUploadSuccess,
  onDeleteSuccess,
}: ProfileImageUploaderProps) {
  const { uploading, progress, uploadPhoto, deletePhoto } = useImageUpload();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewURL(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // リサイズ処理
      const resizedFile = await resizeImage(file, 800, 800);

      // アップロード
      const photoURL = await uploadPhoto(resizedFile);
      onUploadSuccess(photoURL);
      setPreviewURL(null);
    } catch (error) {
      setPreviewURL(null);
      console.error('Upload error:', error);
    }

    // inputをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto();
      onDeleteSuccess();
      setShowDeleteConfirm(false);
    } catch (error) {
      // エラーはhookで処理済み
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* プロフィール画像表示 */}
      <ProfileAvatar
        photoURL={previewURL || currentPhotoURL}
        userName={userName}
        size="xl"
      />

      {/* アップロード進捗 */}
      {uploading && progress && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
            {progress.percentage}% アップロード中...
          </p>
        </div>
      )}

      {/* ボタン */}
      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {uploading ? 'アップロード中...' : '画像を変更'}
        </button>

        {currentPhotoURL && !uploading && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            画像を削除
          </button>
        )}
      </div>

      {/* ファイル入力（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">プロフィール画像を削除しますか？</h3>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
