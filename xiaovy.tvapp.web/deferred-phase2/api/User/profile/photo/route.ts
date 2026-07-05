import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase-admin";

export async function DELETE(request: NextRequest) {
  console.log('▶︎Call DELETE /api/user/profile/photo');

  try {
    // 1. JWT認証
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: "認証が必要です" },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { message: "認証トークンが無効です" },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    console.log('▶︎Authenticated user:', uid);

    // 2. Firestoreから現在のphotoURLを取得
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    const photoURL = userDoc.data()?.photoURL;
    if (!photoURL) {
      return NextResponse.json(
        { message: "プロフィール画像が設定されていません" },
        { status: 404 }
      );
    }

    // 3. Firebase Storageから画像を削除
    const bucket = adminStorage.bucket();

    // photoURLからファイルパスを抽出
    // 例: https://storage.googleapis.com/bucket-name/users/uid/profile.jpg
    //     -> users/uid/profile.jpg
    const urlParts = photoURL.split('/');
    const bucketIndex = urlParts.findIndex((part: string) => part === bucket.name);
    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      try {
        await bucket.file(filePath).delete();
        console.log('▶︎File deleted from Storage:', filePath);
      } catch (error) {
        console.error('Storage delete error:', error);
        // ファイルが存在しない場合も続行
      }
    }

    // 4. FirestoreのphotoURLをnullに更新
    await adminDb.collection('users').doc(uid).update({
      photoURL: null,
      updatedAt: new Date(),
    });

    console.log('▶︎Firestore updated: photoURL set to null');

    return NextResponse.json({
      message: "プロフィール画像を削除しました"
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Delete photo error:", error);

    return NextResponse.json(
      { message: "画像の削除に失敗しました" },
      { status: 500 }
    );
  }
}
