import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      cosmosdb: {
        endpoint: process.env.COSMOSDB_ENDPOINT ? 'configured' : 'missing',
        key: process.env.COSMOSDB_KEY ? 'configured' : 'missing',
        database: process.env.COSMOSDB_DATABASE_NAME || 'not set',
        container: process.env.COSMOSDB_CONTAINER_NAME || 'not set'
      }
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}