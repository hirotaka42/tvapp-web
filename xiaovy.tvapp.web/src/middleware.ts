import { NextRequest, NextResponse } from 'next/server'

// midlewareの使い方は下記を参考
// https://qiita.com/masakinihirota/items/30a5e06e3288031b9788
export async function middleware(request: NextRequest) {
    // middleware でのconsole.logは、サーバーサイドでのみ出力される
    // フロントには出力されないので注意
    console.log('▶︎Call middleware')
    if (request.nextUrl.pathname.startsWith('/api/User/Register') || 
        request.nextUrl.pathname.startsWith('/api/User/Authentication') ||
        request.nextUrl.pathname.startsWith('/api/service/session') ||
        request.nextUrl.pathname.startsWith('/api/service/call/home') ||
        request.nextUrl.pathname.startsWith('/api/content/episode') ||
        request.nextUrl.pathname.startsWith('/api/service/call/streaminglink')) {
        return NextResponse.next();
    }
    if (request.nextUrl.pathname === '/about') {
        return NextResponse.redirect(new URL('/redirected', request.url))
    }
    if (request.nextUrl.pathname === '/another') {
        return NextResponse.rewrite(new URL('/rewrite', request.url))
    }

    // 認可処理 (未完成) todo: 認可処理を実装する
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    const token = await request.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
        return NextResponse.json(
            { message: 'トークンがありません。' },
            { status: 401 }
        );
    }
    try {
        console.log('token:', token);
        return NextResponse.next()
    }catch {
        return NextResponse.json(
            { message: 'トークンが正しくないので、再ログインしてください。' },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: [
        '/about/:path*',
        '/another/:path*',
        '/api/:path*',
    ],
}