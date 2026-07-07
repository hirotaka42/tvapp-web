export const ABEMA_HLS_PROXY_PATH = '/api/service/abema/hls';
export const ABEMA_KEY_PATH = '/api/service/abema/key';

const HLS_CONTENT_TYPES = new Set([
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'audio/mpegurl',
  'audio/x-mpegurl',
]);

const ALLOWED_HOSTS = new Set([
  'linear-abematv.akamaized.net',
  'vod-abematv.akamaized.net',
  'ds-linear-abematv.akamaized.net',
]);

export interface RewriteAbemaHlsOptions {
  sessionId?: string;
  keyPath?: string;
}

export function createAbemaHlsProxyUrl(sourceUrl: string, sessionId?: string): string {
  const params = new URLSearchParams({ src: sourceUrl });
  if (sessionId) params.set('sid', sessionId);
  return `${ABEMA_HLS_PROXY_PATH}?${params.toString()}`;
}

export function createAbemaKeyUrl(ticket: string, sessionId?: string, keyPath = ABEMA_KEY_PATH): string {
  const params = new URLSearchParams({ ticket });
  if (sessionId) params.set('sid', sessionId);
  return `${keyPath}?${params.toString()}`;
}

export function isAllowedAbemaHlsUrl(value: string): boolean {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  const hostname = url.hostname.toLowerCase();
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith('.abema.io') || hostname.endsWith('.akamaized.net');
}

export function isAbemaM3u8Resource(url: string, contentType?: string | null): boolean {
  const mediaType = contentType?.split(';', 1)[0]?.trim().toLowerCase();
  if (mediaType && HLS_CONTENT_TYPES.has(mediaType)) return true;

  try {
    return new URL(url).pathname.toLowerCase().endsWith('.m3u8');
  } catch {
    return false;
  }
}

export function contentTypeForAbemaUrl(url: string, fallback?: string | null): string {
  if (fallback) return fallback;

  const pathname = safePathname(url);
  if (pathname.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (pathname.endsWith('.ts')) return 'video/mp2t';
  if (pathname.endsWith('.m4s')) return 'video/iso.segment';
  if (pathname.endsWith('.mp4')) return 'video/mp4';
  if (pathname.endsWith('.aac')) return 'audio/aac';
  if (pathname.endsWith('.vtt')) return 'text/vtt';

  return 'application/octet-stream';
}

export function rewriteAbemaM3u8(playlist: string, playlistUrl: string, options: RewriteAbemaHlsOptions = {}): string {
  return playlist
    .split(/\r?\n/)
    .map((line) => rewriteAbemaM3u8Line(line, playlistUrl, options))
    .join('\n');
}

function rewriteAbemaM3u8Line(line: string, playlistUrl: string, options: RewriteAbemaHlsOptions): string {
  const trimmed = line.trim();
  if (!trimmed) return line;

  if (trimmed.startsWith('#')) {
    if (!trimmed.startsWith('#EXT-X-KEY')) return rewriteUriAttributes(line, playlistUrl, options);
    if (/METHOD\s*=\s*NONE/i.test(trimmed)) return line;

    return line.replace(/URI="abematv-license:\/\/([^"]+)"/g, (_match, ticket: string) => {
      return `URI="${createAbemaKeyUrl(ticket, options.sessionId, options.keyPath)}"`;
    });
  }

  const resolved = resolveAbemaUrl(trimmed, playlistUrl, options);
  if (!resolved) return line;

  const leading = line.match(/^\s*/)?.[0] ?? '';
  const trailing = line.match(/\s*$/)?.[0] ?? '';
  return `${leading}${resolved}${trailing}`;
}

function rewriteUriAttributes(line: string, playlistUrl: string, options: RewriteAbemaHlsOptions): string {
  return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
    const resolved = resolveAbemaUrl(uri, playlistUrl, options);
    return resolved ? `URI="${resolved}"` : `URI="${uri}"`;
  });
}

function resolveAbemaUrl(value: string, playlistUrl: string, options: RewriteAbemaHlsOptions): string | null {
  if (value.startsWith('data:') || value.startsWith('abematv-license://')) return null;

  let resolved: URL;

  try {
    resolved = new URL(value, playlistUrl);
  } catch {
    return null;
  }

  const resolvedUrl = resolved.toString();
  return resolved.pathname.toLowerCase().endsWith('.m3u8')
    ? createAbemaHlsProxyUrl(resolvedUrl, options.sessionId)
    : resolvedUrl;
}

function safePathname(value: string): string {
  try {
    return new URL(value).pathname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}
