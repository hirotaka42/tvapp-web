import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UpdateProfileRequest } from "@/types/ProfileEdit";

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
  console.log('▶︎Call GET /api/user/profile');
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
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // ドキュメントが存在しない場合、Firebase Authから情報を取得して作成
      console.log('▶︎User document not found, creating from Firebase Auth...');

      try {
        const authUser = await adminAuth.getUser(uid);

        // デフォルトのプロフィールを作成
        // メールアドレスから@より前の文字列をニックネームに使用
        const defaultNickname = authUser.email?.split('@')[0] || `user_${uid.substring(0, 8)}`;

        const defaultProfile = {
          uid: authUser.uid,
          userName: defaultNickname,
          email: authUser.email || '',
          emailVerified: authUser.emailVerified,
          phoneNumber: authUser.phoneNumber || null,
          phoneNumberVerified: false,
          role: 'user',
          photoURL: null,
          firstName: '',
          lastName: '',
          nickname: defaultNickname,
          birthday: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isAnonymous: false,
        };

        // Firestoreにドキュメントを作成
        await userRef.set(defaultProfile);
        console.log('▶︎User document created successfully');

        return NextResponse.json(serializeTimestamps(defaultProfile));
      } catch (authError) {
        console.error('Failed to create user document:', authError);
        return NextResponse.json(
          { message: "ユーザー情報の取得に失敗しました" },
          { status: 500 }
        );
      }
    }

    const userProfile = userDoc.data();

    if (!userProfile) {
      return NextResponse.json(
        { message: "ユーザー情報が見つかりません" },
        { status: 404 }
      );
    }

    // photoURLフィールドが存在しない場合は追加（既存ユーザー対応）
    if (!('photoURL' in userProfile)) {
      console.log('▶︎Adding photoURL field to existing user document');
      await userRef.update({ photoURL: null });
      userProfile.photoURL = null;
    }

    return NextResponse.json(serializeTimestamps(userProfile));

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

export async function PUT(request: NextRequest) {
  console.log('▶︎Call PUT /api/user/profile');
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

    console.log('▶︎Updating profile for user:', uid);

    // 2. リクエストボディをパース
    const body: UpdateProfileRequest = await request.json();
    const { nickname, birthday, phoneNumber } = body;

    // 3. バリデーション - ニックネームの長さチェック
    if (nickname && nickname !== '' && nickname !== null) {
      if (nickname.trim().length > 20) {
        return NextResponse.json(
          { message: "ニックネームは20文字以内である必要があります" },
          { status: 400 }
        );
      }
    }

    // 生年月日の形式チェック（YYYY-MM-DD）
    if (birthday !== null && birthday !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthday)) {
        return NextResponse.json(
          { message: "生年月日はYYYY-MM-DD形式で入力してください" },
          { status: 400 }
        );
      }

      // 日付の妥当性チェック
      const date = new Date(birthday);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { message: "有効な生年月日を入力してください" },
          { status: 400 }
        );
      }

      // 未来の日付チェック
      if (date > new Date()) {
        return NextResponse.json(
          { message: "生年月日は現在より前の日付を入力してください" },
          { status: 400 }
        );
      }
    }

    // 電話番号の形式チェック（数字とハイフンのみ）
    if (phoneNumber !== null && phoneNumber !== '') {
      const phoneRegex = /^[\d-]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { message: "電話番号は数字とハイフンのみで入力してください" },
          { status: 400 }
        );
      }
    }

    // 4. Firestoreを更新
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const updateData = {
      nickname: (nickname && nickname.trim() !== '') ? nickname.trim() : null,
      birthday: birthday && birthday.trim() !== '' ? birthday : null,
      phoneNumber: phoneNumber && phoneNumber.trim() !== '' ? phoneNumber : null,
      updatedAt: new Date(),
    };

    await userRef.update(updateData);

    console.log('▶︎Profile updated successfully for user:', uid);

    // 5. 更新後のプロファイルを取得して返す
    const updatedDoc = await userRef.get();
    const updatedProfile = updatedDoc.data();

    return NextResponse.json({
      message: "プロフィールを更新しました",
      profile: updatedProfile,
    });

  } catch (error: unknown) {
    console.error("updateProfile error:", error);

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
      { message: "プロフィールの更新に失敗しました" },
      { status: 500 }
    );
  }
}
