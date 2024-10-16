import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";
import bcrypt from "bcrypt";
import { UserRegisterModel } from "@/app/utils/schemaModels";
import { validateUserLoginData } from "@/app/utils/Validation/validateUserLoginData";

export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        const body = await request.json();
        const { isValid, errors } = validateUserLoginData(body);
        if (!isValid) {
            return NextResponse.json({ message: "リクエストボディのバリデーションチェックに失敗しました。", errors }, { status: 400 });
        }
        await connectDB();
        const user = await UserRegisterModel.findOne({ email: body.email });
        if (!user) {
            return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
        }
        const isPasswordValid = await bcrypt.compare(body.password, user.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "パスワードが正しくありません。" }, { status: 401 });
        }
        return NextResponse.json({ message: "ログイン成功" });
    } catch {
        return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 });
    }
}