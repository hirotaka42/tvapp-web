import {
  ALLOWED_URL_RULES,
  MAX_REQUEST_INTERVAL_MS,
  MIN_REQUEST_INTERVAL_MS,
  USER_AGENT,
} from './constants.mjs';

const lastRequestAtByHost = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitterIntervalMs() {
  return MIN_REQUEST_INTERVAL_MS
    + Math.floor(Math.random() * (MAX_REQUEST_INTERVAL_MS - MIN_REQUEST_INTERVAL_MS + 1));
}

export function assertAllowedUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new Error(`Blocked by crawler allow-list: ${url}`);
  }
  const rule = ALLOWED_URL_RULES.find((item) => item.host === parsed.hostname);
  if (!rule || !rule.paths.some((path) => parsed.pathname.startsWith(path))) {
    throw new Error(`Blocked by crawler allow-list: ${url}`);
  }
}

async function waitForHost(host) {
  const lastRequestAt = lastRequestAtByHost.get(host) ?? 0;
  const elapsed = Date.now() - lastRequestAt;
  const requiredInterval = jitterIntervalMs();
  if (elapsed < requiredInterval) {
    await sleep(requiredInterval - elapsed);
  }
}

export async function fetchText(url) {
  assertAllowedUrl(url);
  const { hostname } = new URL(url);
  await waitForHost(hostname);

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,text/calendar;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6',
    },
  });
  lastRequestAtByHost.set(hostname, Date.now());
  assertAllowedUrl(response.url || url);

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}: ${url}`);
  }

  return response.text();
}
