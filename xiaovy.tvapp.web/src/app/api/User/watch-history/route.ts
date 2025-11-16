// src/app/api/User/watch-history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { RecordWatchHistoryRequest } from '@/types/WatchHistory';
import { Timestamp } from 'firebase-admin/firestore';

// 視聴履歴記録
export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/User/watch-history');
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
    const body: RecordWatchHistoryRequest = await request.json();
    const { episodeId, episodeTitle, seriesId, seriesTitle, thumbnailUrl, description } = body;

    // 3. バリデーション
    if (!episodeId || episodeId.trim() === '') {
      return NextResponse.json(
        { message: 'episodeIdを指定してください' },
        { status: 400 }
      );
    }

    if (!episodeTitle || episodeTitle.trim() === '') {
      return NextResponse.json(
        { message: 'episodeTitleを指定してください' },
        { status: 400 }
      );
    }

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

    console.log(`▶︎Recording watch history for user: ${uid}, episodeId: ${episodeId}`);

    // 4. Firestoreに追加
    const watchedAt = Timestamp.now();
    const historyData = {
      episodeId: episodeId.trim(),
      episodeTitle: episodeTitle.trim(),
      seriesId: seriesId.trim(),
      seriesTitle: seriesTitle.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      description: description ? description.trim() : '',
      watchedAt,
    };

    const historyRef = await adminDb
      .collection('users')
      .doc(uid)
      .collection('watchHistory')
      .add(historyData);

    console.log('▶︎Watch history recorded successfully');

    // 5. レスポンス返却
    return NextResponse.json({
      message: '視聴履歴を記録しました',
      history: {
        id: historyRef.id,
        episodeId: historyData.episodeId,
        episodeTitle: historyData.episodeTitle,
        seriesId: historyData.seriesId,
        seriesTitle: historyData.seriesTitle,
        thumbnailUrl: historyData.thumbnailUrl,
        description: historyData.description,
        watchedAt: watchedAt.toDate().toISOString(),
      },
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('recordWatchHistory error:', error);

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
      { message: '視聴履歴記録に失敗しました' },
      { status: 500 }
    );
  }
}

// 視聴履歴一覧取得
export async function GET(request: NextRequest) {
  console.log('▶︎Call GET /api/User/watch-history');
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

    console.log(`▶︎Fetching watch history for user: ${uid}, limit: ${limit}, offset: ${offset}`);

    // 3. Firestoreから取得
    const historiesRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('watchHistory')
      .orderBy('watchedAt', 'desc')
      .limit(limit)
      .offset(offset);

    const snapshot = await historiesRef.get();

    const histories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        episodeId: data.episodeId,
        episodeTitle: data.episodeTitle,
        seriesId: data.seriesId,
        seriesTitle: data.seriesTitle,
        thumbnailUrl: data.thumbnailUrl,
        description: data.description,
        watchedAt: data.watchedAt.toDate().toISOString(),
      };
    });

    console.log(`▶︎Found ${histories.length} watch histories`);

    return NextResponse.json({
      histories,
      count: histories.length,
    });

  } catch (error: unknown) {
    console.error('getWatchHistories error:', error);

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
      { message: '視聴履歴取得に失敗しました' },
      { status: 500 }
    );
  }
}
