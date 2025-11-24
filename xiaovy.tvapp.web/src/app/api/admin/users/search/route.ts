import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UserRole } from "@/types/User";
import { UserSearchResult } from "@/types/Admin";

// Firestore Timestampをシリアライズするヘルパー関数
function serializeTimestamps(data: Record<string, unknown>) {
  const result = { ...data };

  // createdAtとupdatedAtをISO文字列に変換
  if (result.createdAt && typeof result.createdAt === 'object' && 'toDate' in result.createdAt) {
    result.createdAt = (result.createdAt as { toDate: () => Date }).toDate().toISOString();
  }
  if (result.updatedAt && typeof result.updatedAt === 'object' && 'toDate' in result.updatedAt) {
    result.updatedAt = (result.updatedAt as { toDate: () => Date }).toDate().toISOString();
  }

  return result;
}

export async function GET(request: NextRequest) {
  console.log('▶︎Call GET /api/admin/users/search');

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

    // 2. 権限チェック（特権ユーザーのみ）
    if (decodedToken.role !== UserRole.SUPER_USER) {
      console.log('▶︎Access denied: User role is', decodedToken.role);
      return NextResponse.json(
        { message: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // 3. クエリパラメータから検索条件を取得
    const searchParams = request.nextUrl.searchParams;
    const searchType = searchParams.get('searchType') as 'email' | 'uid' | null;
    const searchValue = searchParams.get('searchValue');

    // バリデーション
    if (!searchType || !searchValue) {
      return NextResponse.json(
        { message: "searchType と searchValue は必須です" },
        { status: 400 }
      );
    }

    if (searchType !== 'email' && searchType !== 'uid') {
      return NextResponse.json(
        { message: "searchType は 'email' または 'uid' である必要があります" },
        { status: 400 }
      );
    }

    console.log(`▶︎Searching user by ${searchType}:`, searchValue);

    // 4. Firebase Authでユーザーを検索
    let authUser;
    try {
      if (searchType === 'email') {
        authUser = await adminAuth.getUserByEmail(searchValue);
      } else {
        authUser = await adminAuth.getUser(searchValue);
      }
    } catch (error: unknown) {
      console.log('▶︎User not found in Firebase Auth:', error);
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const uid = authUser.uid;
    console.log('▶︎User found in Firebase Auth, UID:', uid);

    // 5. Firestoreからプロファイル情報を取得
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('▶︎User not found in Firestore');
      return NextResponse.json(
        { message: "ユーザープロファイルが見つかりません" },
        { status: 404 }
      );
    }

    const userProfile = userDoc.data();
    if (!userProfile) {
      return NextResponse.json(
        { message: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // 6. 結果を整形して返却
    const resultData = {
      uid: userProfile.uid,
      email: userProfile.email,
      userName: userProfile.userName,
      nickname: userProfile.nickname || null,
      role: userProfile.role,
      emailVerified: userProfile.emailVerified,
      phoneNumber: userProfile.phoneNumber || null,
      photoURL: userProfile.photoURL || null,
      firstName: userProfile.firstName || '',
      lastName: userProfile.lastName || '',
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
      isAnonymous: userProfile.isAnonymous || false,
    };

    const result = serializeTimestamps(resultData) as unknown as UserSearchResult;

    console.log('▶︎User search successful:', result.email);
    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("User search error:", error);

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
      { message: "ユーザー検索に失敗しました" },
      { status: 500 }
    );
  }
}
