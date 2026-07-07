const ABEMA_USER_TOKEN_URL = 'https://api.abema.io/v1/users';
const SECRET_KEY =
  'v+Gjs=25Aw5erR!J8ZuvRrCx*rGswhB&qdHd_SYerEWdU&a?3DzN9BRbp5KwY4hEmcj5#fykMjJ=AuWz5GSMY-d@H7DMEh3M@9n2G552Us$$k9cD=3TxwWe86!x#Zyhe';

const encoder = new TextEncoder();
const secretKeyBytes = encoder.encode(SECRET_KEY);

export interface AbemaUserTokenCache {
  deviceId: string;
  userToken: string;
  obtainedAt: number;
}

interface AbemaAuthOptions {
  fetcher?: typeof fetch;
  now?: Date;
}

type AbemaFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

let cachedUserToken: AbemaUserTokenCache | null = null;

function getCrypto(): Crypto {
  if (!globalThis.crypto?.subtle || !globalThis.crypto.randomUUID) {
    throw new Error('Web Crypto API is not available');
  }
  return globalThis.crypto;
}

function concatBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(left.length + right.length);
  bytes.set(left);
  bytes.set(right, left.length);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function hmacSha256(message: Uint8Array): Promise<Uint8Array> {
  const key = await getCrypto().subtle.importKey(
    'raw',
    secretKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await getCrypto().subtle.sign('HMAC', key, message));
}

export async function generateAbemaApplicationKeySecret(deviceId: string, now = new Date()): Promise<string> {
  const deviceIdBytes = encoder.encode(deviceId);
  const seconds = Math.floor(now.getTime() / 1000);
  const ts1hour = (Math.floor(seconds / 3600) + 1) * 3600;
  const ts1hourBytes = encoder.encode(String(ts1hour));
  const time = new Date(ts1hour * 1000);

  let tmp = new Uint8Array();

  async function mixOnce(nonce: Uint8Array): Promise<void> {
    tmp = await hmacSha256(nonce);
  }

  async function mixTmp(count: number): Promise<void> {
    for (let index = 0; index < count; index += 1) {
      await mixOnce(tmp);
    }
  }

  async function mixTwist(nonce: Uint8Array): Promise<void> {
    tmp = await hmacSha256(concatBytes(encoder.encode(bytesToBase64Url(tmp)), nonce));
  }

  await mixOnce(secretKeyBytes);
  await mixTmp(time.getUTCMonth() + 1);
  await mixTwist(deviceIdBytes);
  await mixTmp(time.getUTCDate() % 5);
  await mixTwist(ts1hourBytes);
  await mixTmp(time.getUTCHours() % 5);

  return bytesToBase64Url(tmp);
}

export function invalidateAbemaUserToken(): void {
  cachedUserToken = null;
}

export async function getAbemaUserToken(options: AbemaAuthOptions = {}): Promise<AbemaUserTokenCache> {
  if (cachedUserToken) {
    return cachedUserToken;
  }

  const fetcher = options.fetcher ?? fetch;
  const deviceId = getCrypto().randomUUID();
  const applicationKeySecret = await generateAbemaApplicationKeySecret(deviceId, options.now);
  const response = await fetcher(ABEMA_USER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceId, applicationKeySecret }),
  });

  if (!response.ok) {
    throw new Error(`ABEMA user token fetch failed: ${response.status}`);
  }

  const payload = await response.json() as { token?: unknown };
  if (typeof payload.token !== 'string' || payload.token.length === 0) {
    throw new Error('ABEMA user token response did not include token');
  }

  cachedUserToken = {
    deviceId,
    userToken: payload.token,
    obtainedAt: options.now?.getTime() ?? Date.now(),
  };
  return cachedUserToken;
}

export async function fetchWithAbemaUserToken(
  input: string | URL | Request,
  init: AbemaFetchInit = {},
  options: AbemaAuthOptions = {},
): Promise<Response> {
  const fetcher = options.fetcher ?? fetch;

  async function execute(): Promise<Response> {
    const token = await getAbemaUserToken({ ...options, fetcher });
    const headers = new Headers(init.headers);
    headers.set('Authorization', `bearer ${token.userToken}`);
    return fetcher(input, { ...init, headers });
  }

  const response = await execute();
  if (response.status !== 401 && response.status !== 403) {
    return response;
  }

  invalidateAbemaUserToken();
  return execute();
}
