import {
  FILM_CONTEXT_PATTERN,
  NEWS_BLOCK_PATTERN,
  NEWS_CATEGORY_PATTERNS,
} from './constants.mjs';

export function isRevenueBlocked(text) {
  return NEWS_BLOCK_PATTERN.test(text);
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
  return true;
}
