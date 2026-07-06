import { NextResponse } from 'next/server';

// デプロイ鮮度の検証用に、デプロイ時に埋め込まれた git コミット SHA を返す。
// deploy.sh が `wrangler deploy --var BUILD_SHA:<sha>` で設定し、デプロイ後に
// 本番の build_sha が最新コミットと一致するかを照合する(古い成果物の誤デプロイ検出)。
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      build_sha: process.env.BUILD_SHA || 'unknown',
      resolver: process.env.AZURE_FUNCTION_STREEAMING ? 'azure-jp' : 'pure-ts',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
