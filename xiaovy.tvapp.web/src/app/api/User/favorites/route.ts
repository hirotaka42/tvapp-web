// src/app/api/User/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { AddFavoriteRequest } from '@/types/Favorite';
import { Timestamp } from 'firebase-admin/firestore';

// お気に入り追加
export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/User/favorites');
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

    // 2. リクエストボディをパース
    const body: AddFavoriteRequest = await request.json();
    const { seriesId, seriesTitle, thumbnailUrl } = body;

    // 3. バリデーション
    if (!seriesId || seriesId.trim() === '') {
      return NextResponse.json(
        { message: 'seriesIdを指定してください' },
        { status: 400 }
      );
    }

    if (!seriesTitle || seriesTitle.trim() === '') {
      return NextResponse.json(
        { message: 'seriesTitleを指定してください' },
        { status: 400 }
      );
    }

    if (!thumbnailUrl || thumbnailUrl.trim() === '') {
      return NextResponse.json(
        { message: 'thumbnailUrlを指定してください' },
        { status: 400 }
      );
    }

    console.log(`▶︎Adding favorite for user: ${uid}, seriesId: ${seriesId}`);

    // 4. 既に存在するかチェック
    const favoriteRef = adminDb.collection('users').doc(uid).collection('favorites').doc(seriesId);
    const favoriteDoc = await favoriteRef.get();

    if (favoriteDoc.exists) {
      return NextResponse.json(
        { message: 'このシリーズは既にお気に入りに登録されています' },
        { status: 409 }
      );
    }

    // 5. Firestoreに追加
    const addedAt = Timestamp.now();
    const favoriteData = {
      seriesId: seriesId.trim(),
      seriesTitle: seriesTitle.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      addedAt,
    };

    await favoriteRef.set(favoriteData);

    console.log('▶︎Favorite added successfully');

    // 6. レスポンス返却
    return NextResponse.json({
      message: 'お気に入りに追加しました',
      favorite: {
        seriesId: favoriteData.seriesId,
        seriesTitle: favoriteData.seriesTitle,
        thumbnailUrl: favoriteData.thumbnailUrl,
        addedAt: addedAt.toDate().toISOString(),
      },
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('addFavorite error:', error);

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
      { message: 'お気に入り追加に失敗しました' },
      { status: 500 }
    );
  }
}

// お気に入り一覧取得
export async function GET(request: NextRequest) {
  console.log('▶︎Call GET /api/User/favorites');
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

    // 2. クエリパラメータ取得
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(`▶︎Fetching favorites for user: ${uid}, limit: ${limit}, offset: ${offset}`);

    // 3. Firestoreから取得
    const favoritesRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('favorites')
      .orderBy('addedAt', 'desc')
      .limit(limit)
      .offset(offset);

    const snapshot = await favoritesRef.get();

    const favorites = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        seriesId: data.seriesId,
        seriesTitle: data.seriesTitle,
        thumbnailUrl: data.thumbnailUrl,
        addedAt: data.addedAt.toDate().toISOString(),
      };
    });

    console.log(`▶︎Found ${favorites.length} favorites`);

    return NextResponse.json({
      favorites,
      count: favorites.length,
    });

  } catch (error: unknown) {
    console.error('getFavorites error:', error);

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
      { message: 'お気に入り取得に失敗しました' },
      { status: 500 }
    );
  }
}
