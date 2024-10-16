import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";
import { UserRegisterModel } from "@/app/utils/schemaModels";

type UserRegisterData = {
    firstname: string;
    lastname: string;
    birsday: string;
    email: string;
    emailConfirmed: boolean;
    phoneNamber: string;
    phoneNamberConfirmed: boolean;
    password_hash: string;
    IsDeleted: boolean;
};

const mockUser: UserRegisterData = {
    firstname: "John",
    lastname: "Doe",
    birsday: "1990-01-01",
    email: "ezample@sute.jp",
    emailConfirmed: false,
    phoneNamber: "123-4567-8901",
    phoneNamberConfirmed: false,
    password_hash: "password",
    IsDeleted: false,
};


export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        console.log('Request Body:', await request.json());
        await connectDB();
        await UserRegisterModel.create(mockUser);
        return NextResponse.json({ message: "Success: connected to MongoDB" });
    } catch {
        return NextResponse.json({ message: "Failure: unconnected to MongoDB" });
    }
}