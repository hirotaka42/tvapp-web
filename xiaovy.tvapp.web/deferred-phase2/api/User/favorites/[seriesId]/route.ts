// src/app/api/User/favorites/[seriesId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  console.log('▶︎Call DELETE /api/User/favorites/[seriesId]');
  try {
    // 1. 認証チェック
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '認証が必要です' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { seriesId } = params;

    console.log(`▶︎Deleting favorite for user: ${uid}, seriesId: ${seriesId}`);

    // 2. Firestoreから削除
    const favoriteRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .doc(seriesId);

    const favoriteDoc = await favoriteRef.get();

    if (!favoriteDoc.exists) {
      return NextResponse.json(
        { message: 'お気に入りが見つかりません' },
        { status: 404 }
      );
    }

    await favoriteRef.delete();

    console.log('▶︎Favorite deleted successfully');

    return NextResponse.json({
      message: 'お気に入りから削除しました',
    });

  } catch (error: unknown) {
    console.error('deleteFavorite error:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };

      if (firebaseError.code === 'auth/argument-error') {
        return NextResponse.json(
          { message: 'トークンが無効です' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { message: 'お気に入り削除に失敗しました' },
      { status: 500 }
    );
  }
}
