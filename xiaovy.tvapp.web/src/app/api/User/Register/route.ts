import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";
import bcrypt from "bcrypt";
import { UserRegisterModel } from "@/app/utils/schemaModels";
import { validateUserRegisterData } from "@/app/utils/Validation/UserReq";
import { RegisterReq } from "@/Types/api/request/user";

export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        const body: RegisterReq = await request.json();
        console.log('▶︎body:', body);

        // 空文字列をundefinedに変換してタイプを保持
        const sanitizedBody: RegisterReq = {
            ...body,
            BirthDay: body.BirthDay ? body.BirthDay : null,
            PhoneNumber: body.PhoneNumber ? body.PhoneNumber : null,
            EmailConfirmed: body.EmailConfirmed !== undefined ? body.EmailConfirmed : undefined,
            PhoneNumberConfirmed: body.PhoneNumberConfirmed !== undefined ? body.PhoneNumberConfirmed : undefined,
            IsDeleted: body.IsDeleted !== undefined ? body.IsDeleted : undefined,
        };

        console.log('▶︎sanitizedBody:', sanitizedBody);

        const { isValid, errors } = validateUserRegisterData(sanitizedBody);
        if (!isValid) {
            return NextResponse.json({ message: "リクエストボディのバリデーションチェックに失敗しました。", errors }, { status: 400 });
        }
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(sanitizedBody.Password, saltRounds);

        const userData = {
            ...sanitizedBody,
            Password_hash: hashedPassword
        };

        await connectDB();
        await UserRegisterModel.create(userData);
        return NextResponse.json({ message: "Success: connected to MongoDB" });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Failure: unconnected to MongoDB" });
    }
}