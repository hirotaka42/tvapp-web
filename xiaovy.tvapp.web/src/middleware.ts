import { NextRequest, NextResponse } from 'next/server';

// 注: Next 16 は proxy.ts 規約を推奨するが、proxy は Node ランタイム専用で
// OpenNext(Cloudflare)は Node middleware 未対応のため、Edge で動く従来の
// middleware.ts を用いる(Next 16 では非推奨警告が出るが動作する)。
export async function middleware(request: NextRequest) {
  // 公開ルート（認証不要）
  const publicPaths = [
    '/api/User/Register',
    '/api/User/Authentication',
    '/api/User/setGuestRole',
    '/api/service/betaLoginToken',
    '/api/service/stream/hls',
    // ABEMA 再生系メディアエンドポイント（プレイヤー/hls.js は認可ヘッダを付けられないため公開。
    // TVER の stream/hls と同種の、公開コンテンツのストリーム解決・中継・鍵配布）
    '/api/service/abema/streaminglink',
    '/api/service/abema/hls',
    '/api/service/abema/key',
    '/api/utils/verify-token',
    '/api/health',
  ];

  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Authorizationヘッダーの存在チェック（詳細な検証は各APIで実施）
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // /api/ パスのみ認証必須
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'トークンがありません。' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
