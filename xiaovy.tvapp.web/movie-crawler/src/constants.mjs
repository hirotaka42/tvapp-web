export const USER_AGENT =
  'Mozilla/5.0 (compatible; TVappMovieBot/1.0; +https://github.com/hirotaka42/ai-steering; contact: repository-owner) AppleWebKit/537.36 Chrome/126.0 Safari/537.36';

export const MIN_REQUEST_INTERVAL_MS = 1000;
export const MAX_REQUEST_INTERVAL_MS = 2000;

export const ALLOWED_URL_RULES = [
  { host: 'eiga.com', paths: ['/movie/coming.ics', '/now/', '/coming/'] },
  { host: 'press.moviewalker.jp', paths: ['/list/coming/', '/movies/'] },
  { host: 'filmarks.com', paths: ['/list/now', '/list/coming'] },
  { host: 'natalie.mu', paths: ['/eiga/feed/news'] },
  { host: 'feeds.eiga.com', paths: ['/eiga_news.xml'] },
  { host: 'realsound.jp', paths: ['/movie/feed'] },
];

export const NEWS_BLOCK_PATTERN =
  /興収|興行収入|観客動員|動員|億円|万人|初登場\S*位|週末興行|ランキング|第?1位|No\.?1|ヒットスタート|突破|売上|初日満足度|【国内映画ランキング】|【映画.com配信アクセスランキング】/;

export const NEWS_CATEGORY_PATTERNS = [
  { category: 'release_date', pattern: /公開日決定|公開日が決定|公開日発表|公開日|延期|公開延期|封切り|公開決定/ },
  { category: 'cast', pattern: /追加キャスト|キャスト|出演|主演|監督|脚本|声優|吹替/ },
  { category: 'trailer', pattern: /予告|特報|本予告|映像解禁|ティザー|PV/ },
  { category: 'poster', pattern: /ポスター|ビジュアル|場面写真|新写真|キービジュアル/ },
  { category: 'festival', pattern: /映画祭|受賞|ノミネート|コンペティション|上映決定/ },
  { category: 'sequel', pattern: /続編|リメイク|実写化|映画化|シリーズ|新作/ },
  { category: 'revival', pattern: /特集|リバイバル|4K|再上映|復活上映|特別上映/ },
  { category: 'stage_greeting', pattern: /舞台挨拶|舞台あいさつ|イベント|登壇|試写会/ },
];

export const FILM_CONTEXT_PATTERN = /映画|劇場|公開|監督|主演/;
