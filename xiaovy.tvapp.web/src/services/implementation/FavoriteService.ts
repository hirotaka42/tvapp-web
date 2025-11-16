// src/services/implementation/FavoriteService.ts

import { IFavoriteService } from '../IFavoriteService';
import { AddFavoriteRequest, FavoriteResponse, FavoritesListResponse } from '@/types/Favorite';
import { auth } from '@/lib/firebase';

export class FavoriteService implements IFavoriteService {
  private async getIdToken(): Promise<string> {
    console.log('▶︎getIdToken: auth =', !!auth, 'currentUser =', !!auth?.currentUser);
    if (!auth) {
      throw new Error('Firebase認証が初期化されていません');
    }
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('認証されていません');
    }
    console.log('▶︎getIdToken: user email =', currentUser.email, 'isAnonymous =', currentUser.isAnonymous);
    return await currentUser.getIdToken();
  }

  async addFavorite(request: AddFavoriteRequest): Promise<FavoriteResponse> {
    console.log('▶︎addFavorite called with:', request);
    try {
      const idToken = await this.getIdToken();
      console.log('▶︎Got idToken');

      const response = await fetch('/api/User/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(request),
      });

      console.log('▶︎API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('▶︎API error:', error);
        throw new Error(error.message || 'お気に入り追加に失敗しました');
      }

      const data = await response.json();
      console.log('▶︎API response data:', data);

      return {
        seriesId: data.favorite.seriesId,
        seriesTitle: data.favorite.seriesTitle,
      };
    } catch (error) {
      console.error('▶︎addFavorite error:', error);
      throw error;
    }
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

    const data = await response.json();
    return {
      favorites: data.favorites,
      count: data.count,
    };
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
