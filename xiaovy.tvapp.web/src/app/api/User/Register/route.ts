import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UserRole, UserProfile } from "@/types/User";

export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/User/Register');
  try {
    const { email, password, firstName, lastName, birthday, phoneNumber, role, roleSecret } =
      await request.json();

    // 1. バリデーション
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: "必須フィールドが入力されていません" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "パスワードは6文字以上である必要があります" },
        { status: 400 }
      );
    }

    // role指定時のバリデーション
    if (role !== undefined) {
      // roleSecretが必須
      if (!roleSecret) {
        return NextResponse.json(
          { message: "role指定時はroleSecretが必要です" },
          { status: 400 }
        );
      }

      // roleSecretが環境変数と一致するか
      if (roleSecret !== process.env.SUPER_USER_CREATE_SECRET) {
        return NextResponse.json(
          { message: "無効な認証キーです" },
          { status: 401 }
        );
      }

      // roleの値が有効か
      const validRoles = [0, 1, 2, 10, 99];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { message: "無効なロール値です。有効な値: 0, 1, 2, 10, 99" },
          { status: 400 }
        );
      }
    }

    // 2. Firebase Authにユーザー作成
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: `${lastName} ${firstName}`,
      phoneNumber: phoneNumber || undefined,
    });

    console.log('▶︎Created Firebase user:', userRecord.uid);

    // 3. Custom Claimsでロール設定（指定があれば使用、なければデフォルト）
    const userRole = role !== undefined ? role : UserRole.GENERAL;
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: userRole
    });

    console.log(`▶︎Set user role: ${userRole}`);

    // 4. Firestoreにユーザープロファイル保存
    const userProfile: UserProfile = {
      uid: userRecord.uid,
      userName: `${lastName}${firstName}`,
      email,
      emailVerified: false,
      phoneNumber: phoneNumber || null,
      phoneNumberVerified: false,
      role: userRole,
      photoURL: null,
      firstName,
      lastName,
      birthday: birthday || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isAnonymous: false,
    };

    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    console.log('▶︎User profile saved to Firestore');

    return NextResponse.json({
      message: "ユーザー登録が完了しました",
      uid: userRecord.uid,
      role: userRole
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Registration error:", error);

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };

      if (firebaseError.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { message: "このメールアドレスは既に使用されています" },
          { status: 400 }
        );
      }

      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { message: "メールアドレスの形式が正しくありません" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  }
}