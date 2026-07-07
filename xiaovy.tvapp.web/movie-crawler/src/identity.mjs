import { createHash } from 'node:crypto';

export function normalizeTitleForMatch(title) {
  return String(title ?? '')
    .normalize('NFKC')
    .replace(/[『』「」"'“”‘’]/g, '')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[【】[\]<>＜＞:：・･!！?？。、,.／/\\|｜\-ー〜~]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function slugFromSource({ source = 'movie', sourceKey, titleJa, releaseDate }) {
  const keyMatch = String(sourceKey ?? '').match(/(\d{4,})/);
  if (keyMatch) return `${source.replace(/_/g, '-')}-${keyMatch[1]}`;

  const base = `${normalizeTitleForMatch(titleJa)}:${releaseDate ?? ''}`;
  const hash = createHash('sha1').update(base).digest('hex').slice(0, 12);
  return `${source.replace(/_/g, '-')}-${hash}`;
}

export function isSameMovie(a, b) {
  if (normalizeTitleForMatch(a.titleJa) !== normalizeTitleForMatch(b.titleJa)) return false;
  if (!a.releaseDate || !b.releaseDate) return true;
  const aTime = Date.parse(`${a.releaseDate}T00:00:00Z`);
  const bTime = Date.parse(`${b.releaseDate}T00:00:00Z`);
  if (!Number.isFinite(aTime) || !Number.isFinite(bTime)) return false;
  return Math.abs(aTime - bTime) <= 1000 * 60 * 60 * 24 * 45;
}
