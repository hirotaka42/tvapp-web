import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UserRole } from "@/types/User";
import { AuditAction } from "@/types/AuditLog";

export async function POST(request: NextRequest) {
  console.log('▶︎Call POST /api/admin/updateRole');
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
      return NextResponse.json(
        { message: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // 3. リクエストボディ取得
    const { targetUid, newRole } = await request.json();

    // 4. バリデーション
    if (!targetUid || newRole === undefined) {
      return NextResponse.json(
        { message: "targetUidとnewRoleは必須です" },
        { status: 400 }
      );
    }

    if (![0, 1, 2, 10, 99].includes(newRole)) {
      return NextResponse.json(
        { message: "無効なロール値です" },
        { status: 400 }
      );
    }

    console.log(`▶︎Updating role for user ${targetUid} to ${newRole}`);

    // 5. 現在のロールを取得
    const userDoc = await adminDb.collection('users').doc(targetUid).get();
    const oldRole = userDoc.data()?.role || 0;

    // 6. Custom Claimsを更新
    await adminAuth.setCustomUserClaims(targetUid, { role: newRole });

    // 7. Firestoreも更新
    await adminDb.collection('users').doc(targetUid).update({
      role: newRole,
      updatedAt: new Date()
    });

    // 8. 監査ログ記録
    await adminDb.collection('audit_logs').add({
      action: AuditAction.ROLE_UPDATE,
      adminUid: decodedToken.uid,
      targetUid,
      oldValue: { role: oldRole },
      newValue: { role: newRole },
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || null
    });

    console.log('▶︎Role updated successfully');

    return NextResponse.json({
      message: "ロールを更新しました",
      uid: targetUid,
      oldRole,
      newRole
    });

  } catch (error: unknown) {
    console.error("updateRole error:", error);

    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };

      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { message: "ユーザーが見つかりません" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { message: "ロール更新に失敗しました" },
      { status: 500 }
    );
  }
}
