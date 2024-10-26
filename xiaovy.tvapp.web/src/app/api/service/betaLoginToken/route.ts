import { NextResponse } from "next/server";

type BetaToken = {
    IdToken: string;
};

// POST /api/service/betaLoginToken
export async function POST() {
    const token = process.env.BETA_IDTOKEN
    if (!token) {
        console.log(token);
        throw new Error("環境変数:BETA_IDTOKENが設定されていません。");
    }

    try {
        const betaToken: BetaToken = {
            IdToken: token,
        };

        return NextResponse.json(betaToken);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}