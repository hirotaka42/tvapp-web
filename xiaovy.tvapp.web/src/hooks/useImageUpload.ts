import { useState, useCallback, useContext } from 'react';
import { ProfileServiceContext } from '@/contexts/ProfileContext';
import { UploadProgress } from '@/types/ProfileEdit';
import toast from 'react-hot-toast';

export function useImageUpload() {
  const service = useContext(ProfileServiceContext);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    throw new Error('useImageUpload must be used within ProfileServiceContext');
  }

  const uploadPhoto = useCallback(async (file: File) => {
    // ファイルバリデーション
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'JPEG、PNG、WebP形式の画像のみアップロードできます';
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = '画像サイズは5MB以内にしてください';
      setError(errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      const response = await service.uploadPhoto(file, (prog) => {
        setProgress(prog);
      });
      toast.success('プロフィール画像を更新しました');
      return response.photoURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '画像のアップロードに失敗しました';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [service]);

  const deletePhoto = useCallback(async () => {
    setError(null);
    try {
      await service.deletePhoto();
      toast.success('プロフィール画像を削除しました');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '画像の削除に失敗しました';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [service]);

  return {
    uploading,
    progress,
    error,
    uploadPhoto,
    deletePhoto,
  };
}
