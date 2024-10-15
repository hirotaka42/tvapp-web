import { NextResponse } from 'next/server';
 
type ResponseData = {
    message: string;
};

export async function GET(): Promise<NextResponse<ResponseData>> {
    try {
        return NextResponse.json(
            { message: 'Hello Next.js' },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { message: 'サーバーエラーです。' },
            { status: 500 }
        );
    }
}