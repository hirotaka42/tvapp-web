export const HLS_PROXY_PATH = '/api/service/stream/hls';

const HLS_CONTENT_TYPES = new Set([
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
]);

export function isAllowedStreaksUrl(value: string): boolean {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  const hostname = url.hostname.toLowerCase();
  return hostname === 'streaks.jp' || hostname.endsWith('.streaks.jp');
}

export function createHlsProxyUrl(value: string): string {
  return `${HLS_PROXY_PATH}?url=${encodeURIComponent(value)}`;
}

export function isM3u8Resource(url: string, contentType?: string | null): boolean {
  const mediaType = contentType?.split(';', 1)[0]?.trim().toLowerCase();

  if (mediaType && HLS_CONTENT_TYPES.has(mediaType)) return true;

  try {
    return new URL(url).pathname.toLowerCase().endsWith('.m3u8');
  } catch {
    return false;
  }
}

export function contentTypeForUrl(url: string, fallback?: string | null): string {
  if (fallback) return fallback;

  const pathname = safePathname(url);
  if (pathname.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (pathname.endsWith('.ts')) return 'video/mp2t';
  if (pathname.endsWith('.m4s')) return 'video/iso.segment';
  if (pathname.endsWith('.mp4')) return 'video/mp4';
  if (pathname.endsWith('.aac')) return 'audio/aac';
  if (pathname.endsWith('.vtt')) return 'text/vtt';
  if (pathname.endsWith('.key')) return 'application/octet-stream';

  return 'application/octet-stream';
}

export function rewriteM3u8Urls(playlist: string, playlistUrl: string): string {
  return playlist
    .split(/\r?\n/)
    .map((line) => rewriteM3u8Line(line, playlistUrl))
    .join('\n');
}

function rewriteM3u8Line(line: string, playlistUrl: string): string {
  const trimmed = line.trim();

  if (!trimmed) return line;

  if (trimmed.startsWith('#')) {
    return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
      const rewritten = toProxyUrl(uri, playlistUrl);
      return rewritten ? `URI="${rewritten}"` : `URI="${uri}"`;
    });
  }

  const rewritten = toProxyUrl(trimmed, playlistUrl);
  if (!rewritten) return line;

  const leading = line.match(/^\s*/)?.[0] ?? '';
  const trailing = line.match(/\s*$/)?.[0] ?? '';
  return `${leading}${rewritten}${trailing}`;
}

function toProxyUrl(value: string, playlistUrl: string): string | null {
  if (value.startsWith('data:')) return null;

  let resolved: URL;

  try {
    resolved = new URL(value, playlistUrl);
  } catch {
    return null;
  }

  const resolvedUrl = resolved.toString();
  return resolved.hostname.toLowerCase() === 'manifest.streaks.jp' ? createHlsProxyUrl(resolvedUrl) : resolvedUrl;
}

function safePathname(value: string): string {
  try {
    return new URL(value).pathname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}
