// src/types/ProfileEdit.ts

/**
 * プロフィール更新リクエスト
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  birthday: string | null;
  phoneNumber: string | null;
}

/**
 * プロフィール画像アップロードレスポンス
 */
export interface UploadPhotoResponse {
  photoURL: string;
  message: string;
}

/**
 * プロフィール更新レスポンス
 */
export interface UpdateProfileResponse {
  profile: import('./User').UserProfile;
  message: string;
}

/**
 * 画像アップロード進捗
 */
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}
