import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  console.log('▶︎Call GET /api/User/profile');
  try {
    // 1. 認証チェック
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "認証が必要です" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    console.log('▶︎Fetching profile for user:', uid);

    // 2. Firestoreからプロファイル取得
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const userProfile = userDoc.data();

    return NextResponse.json(userProfile);

  } catch (error: unknown) {
    console.error("getProfile error:", error);

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };

      if (firebaseError.code === 'auth/argument-error') {
        return NextResponse.json(
          { message: "トークンが無効です" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { message: "プロファイル取得に失敗しました" },
      { status: 500 }
    );
  }
}
