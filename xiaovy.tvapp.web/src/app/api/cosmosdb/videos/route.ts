import { NextResponse, NextRequest } from 'next/server';
import { CosmosClient } from '@azure/cosmos';
import { VideoDownload, VideoDownloadResponse } from '@/types/VideoDownload';

// 動的ルートとして強制
export const dynamic = 'force-dynamic';

// CosmosDB接続設定
const endpoint = process.env.COSMOSDB_ENDPOINT || '';
const key = process.env.COSMOSDB_KEY || '';
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'StreamLoaderDB';
const containerName = process.env.COSMOSDB_CONTAINER_NAME || 'VideoDownloads';

export async function GET(request: NextRequest): Promise<NextResponse<VideoDownloadResponse>> {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        data: [],
        error: 'Unauthorized: Missing or invalid authorization header'
      }, { status: 401 });
    }

    // 環境変数のデバッグ情報（セキュリティ上、一部のみ表示）
    console.log('CosmosDB Endpoint:', endpoint ? endpoint.substring(0, 30) + '...' : 'NOT SET');
    console.log('CosmosDB Key:', key ? 'SET (length: ' + key.length + ')' : 'NOT SET');
    console.log('Database Name:', databaseName);
    console.log('Container Name:', containerName);

    // 環境変数の検証
    if (!endpoint || !key) {
      throw new Error('CosmosDB endpoint or key is not configured');
    }

    // CosmosDBクライアントの初期化
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseName);
    const container = database.container(containerName);

    // service_id = "1" でかつTVerのデータのみ取得するクエリ
    // metadata.source_url にtver.jpが含まれるデータのみ取得
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.metadata.service_id = @serviceId_1 OR c.metadata.service_id = @serviceId_2 ORDER BY c._ts DESC',
      parameters: [
        {
          name: '@serviceId_1',
          value: '1'
        },
        {
          name: '@serviceId_2',
          value: '4'
        }
      ]
    };

    console.log('Executing query:', querySpec.query);

    const { resources } = await container.items.query<VideoDownload>(querySpec).fetchAll();

    console.log('Query results count:', resources.length);

    return NextResponse.json({
      success: true,
      data: resources
    });

  } catch (error) {
    console.error('CosmosDB fetch error:', error);
    
    // より詳細なエラー情報を提供
    let errorMessage = 'Failed to fetch video data from CosmosDB';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      // CosmosDBの認証エラーの場合
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        statusCode = 401;
        errorMessage = 'CosmosDB authentication failed';
      }
      // ネットワークエラーの場合
      if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
        statusCode = 503;
        errorMessage = 'Network connection to CosmosDB failed';
      }
    }
    
    return NextResponse.json({
      success: false,
      data: [],
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: statusCode });
  }
}