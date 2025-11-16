// src/services/implementation/FavoriteService.ts

import { IFavoriteService } from '../IFavoriteService';
import { AddFavoriteRequest, FavoriteResponse, FavoritesListResponse } from '@/types/Favorite';
import { auth } from '@/lib/firebase';

export class FavoriteService implements IFavoriteService {
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

  async addFavorite(request: AddFavoriteRequest): Promise<FavoriteResponse> {
    const idToken = await this.getIdToken();
    const response = await fetch('/api/User/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'お気に入り追加に失敗しました');
    }

    const data = await response.json();
    return data.favorite;
  }

  async removeFavorite(seriesId: string): Promise<void> {
    const idToken = await this.getIdToken();
    const response = await fetch(`/api/User/favorites/${seriesId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'お気に入り削除に失敗しました');
    }
  }

  async getFavorites(limit = 20, offset = 0): Promise<FavoritesListResponse> {
    const idToken = await this.getIdToken();
    const response = await fetch(
      `/api/User/favorites?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('お気に入り取得に失敗しました');
    }

    return await response.json();
  }

  async isFavorite(seriesId: string): Promise<boolean> {
    const idToken = await this.getIdToken();
    const response = await fetch(`/api/User/favorites/${seriesId}/exists`, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.exists;
  }
}
