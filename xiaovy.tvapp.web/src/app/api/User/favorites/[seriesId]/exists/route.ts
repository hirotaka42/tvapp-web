// src/app/api/User/favorites/[seriesId]/exists/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  console.log('▶︎Call GET /api/User/favorites/[seriesId]/exists');
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

    console.log(`▶︎Checking favorite exists for user: ${uid}, seriesId: ${seriesId}`);

    // 2. Firestoreで存在確認
    const favoriteRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .doc(seriesId);

    const favoriteDoc = await favoriteRef.get();

    console.log(`▶︎Favorite exists: ${favoriteDoc.exists}`);

    return NextResponse.json({
      exists: favoriteDoc.exists,
    });

  } catch (error: unknown) {
    console.error('checkFavoriteExists error:', error);

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
      { message: 'お気に入り確認に失敗しました' },
      { status: 500 }
    );
  }
}
