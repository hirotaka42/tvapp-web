import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase-admin";
import { UploadPhotoResponse } from "@/types/ProfileEdit";

export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/user/profile/upload-photo');

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

    // 2. FormDataからファイル取得
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "画像ファイルが指定されていません" },
        { status: 400 }
      );
    }

    // 3. ファイルバリデーション
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "JPEG、PNG、WebP形式の画像のみアップロードできます" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "画像サイズは5MB以内にしてください" },
        { status: 413 }
      );
    }

    // 4. ファイル拡張子を取得
    const fileExtension = file.type.split('/')[1];
    const fileName = `profile.${fileExtension}`;
    const filePath = `users/${uid}/${fileName}`;

    // 5. Firebase Storageにアップロード
    const bucket = adminStorage.bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileUpload = bucket.file(filePath);

    await fileUpload.save(fileBuffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: crypto.randomUUID(), // Download URL用のトークン
      },
    });

    console.log('▶︎File uploaded to Storage:', filePath);

    // 6. 公開URLを取得
    await fileUpload.makePublic();
    const photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log('▶︎Photo URL:', photoURL);

    // 7. Firestoreのphoto URLを更新
    await adminDb.collection('users').doc(uid).update({
      photoURL,
      updatedAt: new Date(),
    });

    console.log('▶︎Firestore updated with photoURL');

    const response: UploadPhotoResponse = {
      photoURL,
      message: "プロフィール画像を更新しました",
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: unknown) {
    console.error("Upload photo error:", error);

    return NextResponse.json(
      { message: "画像のアップロードに失敗しました" },
      { status: 500 }
    );
  }
}
