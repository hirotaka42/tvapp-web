#!/usr/bin/env node
import { crawlAll } from './src/sources.mjs';
import { postIngestChunks } from './src/ingestClient.mjs';
import { writeSqlFile } from './src/sqlWriter.mjs';

function parseArgs(argv) {
  const args = {};
  for (const item of argv) {
    if (!item.startsWith('--')) continue;
    const [key, ...rest] = item.slice(2).split('=');
    args[key] = rest.length > 0 ? rest.join('=') : true;
  }
  return args;
}

function usage() {
  return [
    'Usage:',
    '  node crawl.mjs --mode=post --endpoint=<url> --secret-env=INGEST_SECRET [--limit=<n>]',
    '  node crawl.mjs --mode=sql --out=<file> [--limit=<n>]',
  ].join('\n');
}

const args = parseArgs(process.argv.slice(2));
const mode = args.mode;
const limit = args.limit ? Number(args.limit) : null;

if (!['post', 'sql'].includes(mode)) {
  console.error(usage());
  process.exit(1);
}

if (limit !== null && (!Number.isFinite(limit) || limit <= 0)) {
  console.error('--limit must be a positive number');
  process.exit(1);
}

const result = await crawlAll({ limit });
const counts = {
  movies: result.movies.length,
  news: result.news.length,
  popularity: result.popularity.length,
};

for (const source of result.sourceResults) {
  if (source.status === 'error') {
    console.error(`[${source.name}] error: ${source.error}`);
  } else if (source.status === 'zero_rows') {
    console.error(`[${source.name}] zero_rows`);
  }
}

if (mode === 'sql') {
  const out = args.out;
  if (!out || out === true) {
    console.error(usage());
    process.exit(1);
  }
  await writeSqlFile(out, result);
  console.log(`Wrote ${out}: ${JSON.stringify(counts)}`);
} else {
  const secretEnv = typeof args['secret-env'] === 'string' ? args['secret-env'] : 'INGEST_SECRET';
  const secret = process.env[secretEnv];
  const responses = await postIngestChunks({
    endpoint: args.endpoint,
    secret,
    source: result.source,
    runDate: result.runDate,
    movies: result.movies,
    news: result.news,
    popularity: result.popularity,
    zeroSources: result.sourceResults
      .filter((source) => source.status === 'zero_rows')
      .map((source) => source.name),
  });
  console.log(`Posted ${responses.length} ingest request(s): ${JSON.stringify(counts)}`);
}
