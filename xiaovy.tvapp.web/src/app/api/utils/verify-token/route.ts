import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/utils/Util/verifyToken';

export async function POST(req: NextRequest) {
    try {
        const { token } = await req.json();
        const payload = await verifyToken(token);
        if (payload) {
            return NextResponse.json({ valid: true, payload });
        } else {
            return NextResponse.json({ valid: false }, { status: 401 });
        }
    } catch (error) {
        console.error("トークン検証中にエラーが発生しました", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}