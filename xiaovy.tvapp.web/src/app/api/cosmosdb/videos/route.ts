import { NextResponse } from 'next/server';
import { CosmosClient } from '@azure/cosmos';
import { VideoDownload, VideoDownloadResponse } from '@/types/VideoDownload';

// CosmosDB接続設定
const endpoint = process.env.COSMOSDB_ENDPOINT || '';
const key = process.env.COSMOSDB_KEY || '';
const databaseName = process.env.COSMOSDB_DATABASE_NAME || 'StreamLoaderDB';
const containerName = process.env.COSMOSDB_CONTAINER_NAME || 'VideoDownloads';

export async function GET(): Promise<NextResponse<VideoDownloadResponse>> {
  try {
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

    // service_id = "1" のデータのみ取得するクエリ
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.metadata.service_id = @serviceId ORDER BY c._ts DESC',
      parameters: [
        {
          name: '@serviceId',
          value: '1'
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
    
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch video data from CosmosDB'
    }, { status: 500 });
  }
}