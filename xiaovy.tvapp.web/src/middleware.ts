import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('▶︎Call middleware');

  // 公開ルート（認証不要）
  const publicPaths = [
    '/api/User/Register',
    '/api/User/Authentication',
    '/api/service/betaLoginToken',
    '/api/utils/verify-token',
    '/api/health',
  ];

  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // レガシールート（リダイレクト・リライト）
  if (request.nextUrl.pathname === '/about') {
    return NextResponse.redirect(new URL('/redirected', request.url));
  }
  if (request.nextUrl.pathname === '/another') {
    return NextResponse.rewrite(new URL('/rewrite', request.url));
  }

  // Authorizationヘッダーの存在チェック（詳細な検証は各APIで実施）
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // /api/ パスのみ認証必須
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'トークンがありません。' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/about/:path*',
    '/another/:path*',
    '/api/:path*',
  ],
};