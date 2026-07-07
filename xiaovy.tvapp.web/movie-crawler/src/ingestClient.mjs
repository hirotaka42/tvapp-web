const DEFAULT_CHUNK_SIZE = 150;

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result.length > 0 ? result : [[]];
}

export async function postIngestChunks({
  endpoint,
  secret,
  source,
  runDate,
  movies,
  news,
  popularity,
  zeroSources = [],
  chunkSize = DEFAULT_CHUNK_SIZE,
}) {
  if (!endpoint) throw new Error('--endpoint is required in post mode');
  if (!secret) throw new Error('Ingest secret is empty');

  const movieChunks = chunks(movies, chunkSize);
  const newsChunks = chunks(news, chunkSize);
  const popularityChunks = chunks(popularity, chunkSize);
  const totalChunks = Math.max(movieChunks.length, newsChunks.length, popularityChunks.length);
  const results = [];

  for (let index = 0; index < totalChunks; index += 1) {
    const body = {
      source,
      runDate,
      movies: movieChunks[index] ?? [],
      news: newsChunks[index] ?? [],
      popularity: popularityChunks[index] ?? [],
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-secret': secret,
      },
      body: JSON.stringify(body),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Ingest failed ${response.status}: ${JSON.stringify(json)}`);
    }
    results.push(json);
  }

  for (const zeroSource of zeroSources) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ingest-secret': secret,
      },
      body: JSON.stringify({
        source: zeroSource,
        runDate,
        movies: [],
        news: [],
        popularity: [],
      }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Zero-row ingest failed ${response.status}: ${JSON.stringify(json)}`);
    }
    results.push(json);
  }

  return results;
}
