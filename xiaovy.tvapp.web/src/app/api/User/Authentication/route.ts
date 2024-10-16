import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";
import bcrypt from "bcrypt";
import { UserRegisterModel } from "@/app/utils/schemaModels";
import { validateUserLoginData } from "@/app/utils/Validation/validateUserLoginData";
import { createToken } from "@/app/utils/Util/createToken";

export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        const body = await request.json();
        const { isValid, errors } = validateUserLoginData(body);
        if (!isValid) {
            return NextResponse.json({ message: "リクエストボディのバリデーションチェックに失敗しました。", errors }, { status: 400 });
        }
        await connectDB();
        const savedUserData = await UserRegisterModel.findOne({ email: body.email });
        if (!savedUserData) {
            return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
        }
        const isPasswordValid = await bcrypt.compare(body.password, savedUserData.password_hash);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "パスワードが正しくありません。" }, { status: 401 });
        }
        const token = await createToken(savedUserData._id, savedUserData.email, savedUserData.uuid);
        return NextResponse.json({ message: "ログイン成功", token });
    } catch {
        return NextResponse.json({ message: "サーバーエラーが発生しました。" }, { status: 500 });
    }
}