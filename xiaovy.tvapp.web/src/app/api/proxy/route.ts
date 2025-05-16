export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) {
        return new Response('Invalid url', { status: 400 });
    }
    
    // トークンはクエリパラメータから取得
    const token = searchParams.get('auth');
    
    try {
        const response = await fetch(url, {
            headers: token ? { 'authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
            return new Response('Error fetching resource', { status: response.status });
        }
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // m3u8のようなテキスト形式（プレーンテキスト、UTF-8)の場合のみ書き換え
        if (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('vnd.apple.mpegurl') || contentType.includes('text/plain')) {
            const text = await response.text();
            const urlObj = new URL(url);
            const baseUrl = urlObj.href.substring(0, urlObj.href.lastIndexOf('/') + 1);
            const rewritten = text.split('\n').map(line => {
                // コメント行はスキップ
                if (!line || line.startsWith('#')) {
                    return line;
                }
                try {
                    // 絶対URLかどうかを判定
                    new URL(line);
                    return line;
                } catch {
                    // 相対URLの場合は、baseUrlで展開してproxy経由のURLに置き換え
                    const absoluteUrl = new URL(line, baseUrl).href;
                    const proxyUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}` + (token ? `&auth=${encodeURIComponent(token)}` : '');
                    return proxyUrl;
                }
            }).join('\n');
            return new Response(rewritten, {
                headers: { 'Content-Type': contentType }
            });
        }

        // それ以外はストリームをそのまま返す
        return new Response(response.body, {
            headers: { 'Content-Type': contentType }
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Error fetching resource' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}