import { UserProfile } from '@/types/User';
import { UpdateProfileRequest, UploadPhotoResponse, UploadProgress } from '@/types/ProfileEdit';

export interface IProfileService {
  /**
   * プロフィール情報を取得
   */
  getProfile(): Promise<UserProfile>;

  /**
   * プロフィール情報を更新
   */
  updateProfile(request: UpdateProfileRequest): Promise<UserProfile>;

  /**
   * プロフィール画像をアップロード
   */
  uploadPhoto(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadPhotoResponse>;

  /**
   * プロフィール画像を削除
   */
  deletePhoto(): Promise<void>;
}
