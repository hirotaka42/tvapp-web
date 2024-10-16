import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";
import bcrypt from "bcrypt";
import { UserRegisterModel } from "@/app/utils/schemaModels";
import { validateUserRegisterData } from "@/app/utils/Validation/validateUserRegisterData";

export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        const body = await request.json();
        const { isValid, errors } = validateUserRegisterData(body);
        if (!isValid) {
            return NextResponse.json({ message: "リクエストボディのバリデーションチェックに失敗しました。", errors }, { status: 400 });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(body.password, saltRounds);

        // オブジェクトのスプレッド構文を使用して、新しいオブジェクトを作成
        const userData = {
            ...body,
            password_hash: hashedPassword
        };
        await connectDB();
        await UserRegisterModel.create(userData);
        return NextResponse.json({ message: "Success: connected to MongoDB" });
    } catch {
        return NextResponse.json({ message: "Failure: unconnected to MongoDB" });
    }
}