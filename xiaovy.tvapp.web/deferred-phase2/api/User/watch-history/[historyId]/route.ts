// src/app/api/User/watch-history/[historyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { historyId: string } }
) {
  console.log('▶︎Call DELETE /api/User/watch-history/[historyId]');
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

    const { historyId } = params;

    console.log(`▶︎Deleting watch history for user: ${uid}, historyId: ${historyId}`);

    // 2. Firestoreから削除
    const historyRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('watchHistory')
      .doc(historyId);

    const historyDoc = await historyRef.get();

    if (!historyDoc.exists) {
      return NextResponse.json(
        { message: '視聴履歴が見つかりません' },
        { status: 404 }
      );
    }

    await historyRef.delete();

    console.log('▶︎Watch history deleted successfully');

    return NextResponse.json({
      message: '視聴履歴を削除しました',
    });

  } catch (error: unknown) {
    console.error('deleteWatchHistory error:', error);

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
      { message: '視聴履歴削除に失敗しました' },
      { status: 500 }
    );
  }
}
