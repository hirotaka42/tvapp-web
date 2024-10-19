import { NextResponse } from "next/server";

type SessionToken = {
    platformUid: string;
    platformToken: string;
};

// POST /api/service/session
export async function POST() {
    try {
        const response = await fetch(
            'https://platform-api.tver.jp/v2/api/platform_users/browser/create',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': 'https://s.tver.jp',
                    'Referer': 'https://s.tver.jp/',
                },
                body: 'device_type=pc'
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'sessionTokenの取得に失敗しました。' }, { status: response.status });
        }

        const jsonResponse = await response.json();

        const sessionToken: SessionToken = {
            platformUid: jsonResponse.result.platform_uid,
            platformToken: jsonResponse.result.platform_token,
        };

        return NextResponse.json(sessionToken);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}