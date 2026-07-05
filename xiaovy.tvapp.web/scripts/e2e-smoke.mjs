import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:3000';
const SHOT = '/tmp/e2e';
const results = [];
const ok = (m) => { results.push(['OK', m]); console.log('  OK  ' + m); };
const ng = (m) => { results.push(['NG', m]); console.log('  NG  ' + m); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const clickByText = async (page, selector, text) => {
  const handle = await page.evaluateHandle((sel, t) => {
    const els = Array.from(document.querySelectorAll(sel));
    return els.find(e => (e.textContent || '').trim().includes(t)) || null;
  }, selector, text);
  const el = handle.asElement();
  if (!el) return false;
  await el.click();
  return true;
};
const hasText = async (page, text) =>
  page.evaluate((t) => document.body.innerText.includes(t), text);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1400 });

try {
  // 1. ホーム(ダーク既定)
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(900);
  await page.screenshot({ path: SHOT + '-1-home-dark.png' });
  (await hasText(page, 'TVapp')) ? ok('ホーム: ブランド表示') : ng('ホーム: ブランド無し');
  (await hasText(page, 'ランキング')) ? ok('ホーム: ランキング表示') : ng('ホーム: ランキング無し');
  (await page.evaluate(() => document.documentElement.classList.contains('dark')))
    ? ok('ホーム: ダーク既定') : ng('ホーム: ダークでない');

  // 2. ソース切替 → YouTube
  const sw = (await clickByText(page, 'button', 'YouTube')) || (await clickByText(page, 'a,span,div', 'YouTube'));
  await sleep(700);
  await page.screenshot({ path: SHOT + '-2-youtube.png' });
  sw ? ok('切替: YouTube クリック成功') : ng('切替: YouTube ボタン見つからず');
  (await hasText(page, '音楽ランキング')) ? ok('YouTube: 音楽ランキング表示') : ng('YouTube: 音楽ランキング無し');
  (await hasText(page, 'Despacito')) ? ok('YouTube: 実動画 Despacito 表示') : ng('YouTube: Despacito 無し');

  // 3. プレーヤー
  await page.goto(BASE + '/watch/youtube/kJQP7kiw5Fk', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(2800);
  await page.screenshot({ path: SHOT + '-3-player.png' });
  (await hasText(page, 'Despacito')) ? ok('プレーヤー: タイトル表示') : ng('プレーヤー: タイトル無し');
  ((await page.$('iframe')) !== null) ? ok('プレーヤー: iframe(react-player)描画') : ng('プレーヤー: iframe 無し');

  // 4. お気に入り
  let favClicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x =>
      (x.getAttribute('aria-label') || '').includes('お気に入り') ||
      (x.title || '').includes('お気に入り'));
    if (b) { b.click(); return true; } return false;
  });
  if (!favClicked) favClicked = await clickByText(page, 'button', 'お気に入り');
  await sleep(500);
  const favLS = await page.evaluate(() => localStorage.getItem('tvapp.favorites') || '');
  favClicked ? ok('お気に入り: ボタンクリック') : ng('お気に入り: ボタン見つからず');
  favLS.includes('kJQP7kiw5Fk') ? ok('お気に入り: localStorage 保存') : ng('お気に入り: 未保存 (' + favLS.slice(0, 50) + ')');
  const histLS = await page.evaluate(() => localStorage.getItem('tvapp.history') || '');
  histLS.includes('kJQP7kiw5Fk') ? ok('履歴: 視聴で記録') : ng('履歴: 未記録');

  // 5. ライブラリ
  await page.goto(BASE + '/library', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(900);
  await page.screenshot({ path: SHOT + '-5-library.png' });
  (await hasText(page, 'Despacito')) ? ok('ライブラリ: Despacito 表示') : ng('ライブラリ: Despacito 無し');

  // 6. ライトテーマ
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 40000 });
  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(700);
  await page.screenshot({ path: SHOT + '-6-home-light.png' });
  (await page.evaluate(() => !document.documentElement.classList.contains('dark')))
    ? ok('ライト: 切替反映') : ng('ライト: ダークのまま');
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));

  // 7. モバイル
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(700);
  await page.screenshot({ path: SHOT + '-7-home-mobile.png' });
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  (w <= 400) ? ok('モバイル: 横あふれ無し (' + w + 'px)') : ng('モバイル: 横あふれ (' + w + 'px)');
  await page.goto(BASE + '/watch/youtube/9bZkp7q19f0', { waitUntil: 'networkidle2', timeout: 40000 });
  await sleep(1500);
  await page.screenshot({ path: SHOT + '-8-player-mobile.png' });
} catch (e) {
  ng('例外: ' + (e && e.message ? e.message : String(e)));
} finally {
  await browser.close();
}

const nNG = results.filter(r => r[0] === 'NG').length;
console.log('\n=== E2E: ' + results.filter(r => r[0] === 'OK').length + ' OK / ' + nNG + ' NG ===');
process.exit(nNG > 0 ? 1 : 0);
