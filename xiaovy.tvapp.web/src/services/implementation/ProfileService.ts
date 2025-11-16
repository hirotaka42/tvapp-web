import { IProfileService } from '../IProfileService';
import { UserProfile } from '@/types/User';
import { UpdateProfileRequest, UploadPhotoResponse, UploadProgress } from '@/types/ProfileEdit';
import { auth } from '@/lib/firebase';

export class ProfileService implements IProfileService {
  private async getIdToken(): Promise<string> {
    if (!auth) {
      throw new Error('Firebase認証が初期化されていません');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('認証されていません');
    }
    return await currentUser.getIdToken();
  }

  async getProfile(): Promise<UserProfile> {
    const idToken = await this.getIdToken();
    const response = await fetch('/api/User/profile', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('プロフィールの取得に失敗しました');
    }

    return await response.json();
  }

  async updateProfile(request: UpdateProfileRequest): Promise<UserProfile> {
    const idToken = await this.getIdToken();
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'プロフィールの更新に失敗しました');
    }

    const data = await response.json();
    return data.profile;
  }

  async uploadPhoto(file: File, onProgress?: (progress: UploadProgress) => void): Promise<UploadPhotoResponse> {
    const idToken = await this.getIdToken();

    const formData = new FormData();
    formData.append('photo', file);

    // XMLHttpRequestを使用してプログレス監視
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress({
              bytesTransferred: e.loaded,
              totalBytes: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('画像のアップロードに失敗しました'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('ネットワークエラーが発生しました'));
      });

      xhr.open('POST', '/api/user/profile/upload-photo');
      xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      xhr.send(formData);
    });
  }

  async deletePhoto(): Promise<void> {
    const idToken = await this.getIdToken();
    const response = await fetch('/api/user/profile/photo', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('画像の削除に失敗しました');
    }
  }
}
