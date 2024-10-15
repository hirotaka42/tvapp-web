import { NextRequest, NextResponse } from 'next/server'

// midlewareの使い方は下記を参考
// https://qiita.com/masakinihirota/items/30a5e06e3288031b9788
export function middleware(request: NextRequest) {
    // middleware でのconsole.logは、サーバーサイドでのみ出力される
    // フロントには出力されないので注意
    console.log('▶︎Call middleware')
    if (request.nextUrl.pathname === '/about') {
        return NextResponse.redirect(new URL('/redirected', request.url))
    }
    if (request.nextUrl.pathname === '/another') {
        return NextResponse.rewrite(new URL('/rewrite', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/about/:path*', '/another/:path*', '/api/:path*'],
}
