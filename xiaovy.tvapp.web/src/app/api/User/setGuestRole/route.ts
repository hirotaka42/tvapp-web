import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UserRole, UserProfile } from "@/types/User";

export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/User/setGuestRole');
  try {
    // 1. Authorization ヘッダーからトークン取得
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "認証が必要です" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];

    // 2. トークン検証
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    console.log('▶︎Setting guest role for user:', uid);

    // 3. Custom Claimsでロール設定（ゲストユーザーはロール-1）
    await adminAuth.setCustomUserClaims(uid, {
      role: UserRole.GUEST
    });

    // 4. Firestoreにゲストプロファイル作成
    const guestProfile: UserProfile = {
      uid,
      userName: `ゲストユーザー_${uid.substring(0, 8)}`,
      email: decodedToken.email || `guest_${uid}@anonymous.local`,
      emailVerified: false,
      phoneNumber: null,
      phoneNumberVerified: false,
      role: UserRole.GUEST,
      photoURL: null,
      firstName: "ゲスト",
      lastName: "ユーザー",
      birthday: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: true,
    };

    await adminDb.collection('users').doc(uid).set(guestProfile);

    console.log('▶︎Guest profile saved to Firestore with role -1');

    return NextResponse.json({
      message: "ゲストユーザーのロールを設定しました",
      uid,
      role: UserRole.GUEST
    });

  } catch (error: unknown) {
    console.error("setGuestRole error:", error);

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
      { message: "ロール設定に失敗しました" },
      { status: 500 }
    );
  }
}
