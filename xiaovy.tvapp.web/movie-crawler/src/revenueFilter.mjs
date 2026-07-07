import {
  FILM_CONTEXT_PATTERN,
  NEWS_BLOCK_PATTERN,
  NEWS_CATEGORY_PATTERNS,
} from './constants.mjs';

export function isRevenueBlocked(text) {
  return NEWS_BLOCK_PATTERN.test(text);
}

// テレビドラマ/放送系(natalie の映画チャンネルに混入する)を除外する。
// ただし「映画化」「劇場版」等、映画である明確な信号があれば残す(ドラマの映画化ニュース等)。
const TV_DRAMA_PATTERN = /ドラマ|放送開始|放送日|放送中|連続テレビ小説|朝ドラ|大河ドラマ|シーズン\s*\d|season\s*\d|第\d+話|全\d+話|クール|見逃し配信|オンエア|テレビ東京|テレビ朝日|日本テレビ|フジテレビ|テレ朝|ＴＢＳ|TBS/;
const STRONG_FILM_PATTERN = /映画|劇場版|劇場公開|映画化|劇場アニメ|ロードショー|封切|4DX|IMAX/;

export function isTvDrama(text) {
  return TV_DRAMA_PATTERN.test(text) && !STRONG_FILM_PATTERN.test(text);
}

// タイトルに明確なテレビドラマ/放送標識がある記事は、要約に映画語があっても落とす(誤残り防止)。
const TITLE_DRAMA_HARD = /夏ドラマ|冬ドラマ|春ドラマ|秋ドラマ|放送開始|放送決定|放送日決定|連続テレビ小説|朝ドラ|大河ドラマ|Ｗ?W?主演ドラマ|シーズン\s*\d|season\s*\d/i;

export function isTitleTvDrama(title) {
  return TITLE_DRAMA_HARD.test(String(title ?? ''));
}

export function classifyNewsCategory(text) {
  const match = NEWS_CATEGORY_PATTERNS.find((item) => item.pattern.test(text));
  return match?.category ?? null;
}

export function shouldKeepNewsItem({ title = '', summary = '', source = '', tags = [] }) {
  const text = `${title}\n${summary}\n${tags.join('\n')}`;
  if (isRevenueBlocked(text)) return false;
  if ((source === 'natalie' || source === 'realsound') && !FILM_CONTEXT_PATTERN.test(text)) return false;
  if (source === 'realsound' && tags.includes('映画部SNSニュース')) return false;
  if (isTitleTvDrama(title)) return false;
  if (isTvDrama(text)) return false;
  return true;
}
