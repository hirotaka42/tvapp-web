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
  // 映画ワールドの取り込み口。クローラ(GitHub Actions/ローカル)からの書き込みで、
  // Bearer トークンを付けられないため公開扱いにし、ルート側で x-ingest-secret を定数時間比較して認証する。
  const exactPublicPaths = ['/api/service/cinema/ingest'];
  const pathname = request.nextUrl.pathname;

  if (exactPublicPaths.includes(pathname) || publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 映画メタは公開情報のため、読取 API は既存アプリ同様に Bearer の存在チェックへ委ねる。
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
