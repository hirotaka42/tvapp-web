# 映画ワールド 実装契約 (CONTRACT) — 2つの並列Codexが衝突なく実装するための正本

## 0. 目的とスコープ
TVappの4枠目(旧niconico・準備中)を「映画ワールド」(data-svc="cinema")に転換する。採用デザインは **マーキー・ナイト**（`_work/movie-mockups/mock-4-marquee-world.html` が正・忠実に移植）。既存 TVER/ABEMA と同じ共通スケルトンに溶け込ませる。
このサイトは**再生でなく情報提供**（今どんな映画をやっているか / これから何が始まるか / 最新映画ニュース）。**予約・購入・チケット導線は一切置かない**。予告編は YouTube 検索へ外部リンク（`https://www.youtube.com/results?search_query=<邦題> 予告編` を新規タブ）。

## 1. 全体アーキテクチャ（鍵ゼロ・完全$0）
- データは日次1回クロール→自前 D1 へ upsert→画面は D1 を読む。第三者APIに間借りしない自前パイプライン。
- 有料/要キーの外部API（TMDB/YouTube統計）は **v1では使わない**（将来キー投入時の補助として設計に残すのみ）。実データは鍵不要の源だけで賄う。
- D1 バインディング名 **`MOVIE_DB`**（db名 tvapp-movie / id 33f44167-8579-43b9-9865-71379d8d73ee、wrangler.jsonc 追記済み）。スキーマは `db/cinema/schema.sql`（適用済み・7テーブル）。
- Next(OpenNext on Cloudflare Workers)の API ルートから D1 を使う: `import { getCloudflareContext } from "@opennextjs/cloudflare"` → `const { env } = getCloudflareContext(); env.MOVIE_DB.prepare(...)`。既存の他ルート実装に倣う。
- クロール実行体は GitHub Actions 日次cron + ローカル実行。書き込みは (a) 認証付き ingest ルートへ POST、(b) SQLファイル→`wrangler d1 execute` の両対応。

## 2. robots / クロール作法（必守・事実）
- eiga.com・MOVIE WALKER は **ClaudeBot/GPTBot/Bytespider を全面Disallow**。クローラは **AI系UAを名乗らない**。User-Agent は通常のブラウザ相当＋連絡先を含む説明的UA（例: `TVappMovieBot/1.0 (+contact)`, 実ブラウザUA文字列でも可）。
- リクエスト間 **1〜2秒 sleep**。同一ホスト連打しない。robots対象外パスのみ叩く（/coming/ /now/ /movie/*/theater/ /list/ 等はUA:*でDisallow対象外）。
- MOVIE WALKER はデフォルトcurl UAに404 → ブラウザ相当UAヘッダ必須。natalie は非ブラウザUAに403 → UAヘッダ必須。
- 取得0件は「サイト構造変化の疑い」として ingest_runs に status='zero_rows' 記録（黙殺しない）。

## 3. 公開ステータス導出（read時・JST基準・列に焼かない）
today = 今日のJST日付(YYYY-MM-DD)。各作品:
- `is_streaming_only=1` → 映画ワールドから除外（配信専用は出さない）。
- `release_date IS NULL` または `date_precision='unknown'` → status='undated'（表示「公開日未定」）。
- `is_postponed=1` → status='postponed'（表示「延期」）。
- `today < release_date` → status='upcoming'、daysUntil=release_date-today（表示「公開まであとN日」）。
- `release_date <= today AND now_showing=1` → status='now_showing'、daysSince=today-release_date+1（表示「公開N日目」）。
- `release_date <= today AND now_showing=0` → status='ended'（原則UI非表示。screening_end_dateがあれば併記）。

## 4. 読み取りAPI（Task B が実装。GET・D1読み取り・ステータス導出込み）
すべて `src/app/api/service/cinema/**/route.ts`。JSONを返す。Runtime は既存ルートに合わせる（edge/nodejs）。エラー時は `{error}` と適切なstatus。
- `GET /api/service/cinema/home` … 初期描画一括。返却:
  ```ts
  {
    now: MovieCard[];            // now_showing。daysSince付き。最大24
    upcoming: MovieCard[];       // status=upcoming。release_date昇順。daysUntil付き。最大24
    scheduleMonths: {            // 番組表/月別。今月含む先3ヶ月 + 未定
      ym: string;                // 'YYYY-MM'
      days: { date: string; weekday: string; films: MovieCard[] }[];
    }[];
    undated: MovieCard[];        // date_precision in (year|unknown) の公開予定
    ranking: { nowShowing: RankRow[]; expected: RankRow[] }; // 各最大10
    news: NewsItem[];            // is_forward_looking=1。published_at降順。最大12
    heroFilms: MovieCard[];      // 注目1〜3本(now/upcomingから選抜)
    lastCrawledAt: string | null;// ingest_runs最新のfinished_at
  }
  ```
- `GET /api/service/cinema/schedule?month=YYYY-MM` … 指定月の days[]（home 範囲外の月送り用）。
- `GET /api/service/cinema/ranking?type=now|expected` … 単体更新用（任意）。
- `GET /api/service/cinema/news?category=<news_category>` … カテゴリ絞り込み用（任意）。

型（`src/types/cinema.ts` に定義）:
```ts
type CinemaStatus = 'now_showing'|'upcoming'|'postponed'|'undated'|'ended';
interface MovieCard {
  slug: string; titleJa: string; titleOriginal?: string|null; overview?: string|null;
  runtimeMin?: number|null; rating?: 'G'|'PG12'|'R15+'|'R18+'|null; genres: string[];
  screeningFormats: string[]; releaseDate?: string|null; datePrecision:'day'|'month'|'year'|'unknown';
  releaseScale?: 'wide'|'limited'|null; posterUrl?: string|null; keyvisualUrl?: string|null;
  status: CinemaStatus; daysUntil?: number|null; daysSince?: number|null;
  director?: string|null; cast: string[];
  wantToWatch?: number|null; ratingAvg?: number|null; ratingCount?: number|null;
  sourceUrl?: string|null;       // 出典（eiga.com作品ページ等）
  trailerQuery: string;          // YouTube検索クエリ（=titleJa+' 予告編'）
}
interface RankRow { rank: number; movie: MovieCard; metric: 'want_to_watch'|'rating_avg'; value: number; deltaRank?: number|null; }
interface NewsItem { title: string; url: string; source: string; summary?: string|null; publishedAt: string; category?: string|null; thumbnailUrl?: string|null; relatedSlugs: string[]; }
```
- 画像URL(posterUrl/keyvisualUrl)はそのまま`<img>`で使う。**読み込み失敗時は必ずCSSグラデ+タイトルのfallback**（mock-4のプレースホルダ意匠）に切替（onerror/CSS）。ホットリンク不可でも崩れないこと。
- rows read節約: `now_showing`/`release_date` インデックスを使うクエリにし、`SELECT *` の広域スキャンを避ける。

## 5. Ingest API（Task A が実装。POST・認証・upsert）
- `POST /api/service/cinema/ingest`。ヘッダ `x-ingest-secret: <INGEST_SECRET>`（`getCloudflareContext().env.INGEST_SECRET` と定数時間比較）。不一致は401。
- body:
  ```ts
  {
    source: string;             // 'eiga_com'|'filmarks'|'natalie'... (run記録用)
    runDate: string;            // 'YYYY-MM-DD'
    movies?: IngestMovie[];     // upsert（slug or source_key で同定）
    news?: IngestNews[];        // guid で INSERT OR IGNORE
    popularity?: IngestPop[];   // (movie slug, source, metric, value, snapshot_date) upsert
  }
  ```
- 実装: `env.MOVIE_DB.batch([...])` でトランザクション的に upsert（SQL文100KB・パラメータ100個・50クエリ/呼び出し制限に注意し**チャンク分割**）。`INSERT ... ON CONFLICT(...) DO UPDATE`（movies=slug、movie_news=guid は OR IGNORE、popularity_snapshots=複合PK）。`content_hash` 未変更はスキップ可。最後に ingest_runs へ status/items_seen/items_upserted を記録。返却 `{ok:true, upserted:{movies,news,popularity}}`。
- **注意**: 巨大 body は Workers 制約に触れうるので、クローラ側で 100〜200件単位に分割POSTする前提（両者で整合）。

## 6. クローラ（Task A が実装。`movie-crawler/` 独立パッケージ・Node）
`movie-crawler/`（独自 package.json。deps: cheerio, fast-xml-parser のみ。Nodeで実行、Next本体にはバンドルしない）。
- CLI: `node crawl.mjs --mode=post --endpoint=<url> [--secret-env=INGEST_SECRET]` / `--mode=sql --out=seed.sql`（両対応）。`--limit` で件数制限（開発用）。
- **鍵ゼロ源**（実測2026-07-08。UA/間隔厳守）:
  1. 公開スケジュール: `https://eiga.com/movie/coming.ics`（iCal。自前パーサで行アンフォールド→VEVENT→ SUMMARY=title / DTSTART=release_date(day精度) / UID=`eiga.com_<id>`=source_key / DESCRIPTION（「配信」含む→is_streaming_only=1、末尾URL=source_url））。
  2. 今上映中: `https://eiga.com/now/`（+ /now/N/ 数ページ）。cheerioで作品ID(`id=mvNNNNNN`)/title/公開日/poster/監督・キャスト抽出→ now_showing=1。
  3. 月別/未定精度: `https://eiga.com/coming/YYYYMM/`(今月+先2月) と `/coming/999999/`(年のみ精度→date_precision='year')。
  4. メタ補完: MOVIE WALKER PRESS `https://press.moviewalker.jp/list/coming/`・詳細ページの `script[type="application/ld+json"]`(schema.org Movie: name/duration(ISO8601)/director/actor/image/datePublished)。ブラウザUA必須。
  5. 非興収ランキング: Filmarks `https://filmarks.com/list/now`(1〜数頁) と `/list/coming`。各カードの `data-mark`(観た)/`data-clip`(観たい) 属性のJSON と `.c-rating__score`(星平均) を抽出 → popularity_snapshots(source='filmarks', metric in want_to_watch/watched/rating_avg, snapshot_date=today)。
  6. ニュース: 映画ナタリー Atom `https://natalie.mu/eiga/feed/news`(UA必須) + 映画.com RSS `https://feeds.eiga.com/eiga_news.xml` + Real Sound `https://realsound.jp/movie/feed`。fast-xml-parserで解析。
- **興収系ニュース除外**（2段フィルタ）:
  - block正規表現（1つでもヒットで破棄）: `興収|興行収入|観客動員|動員|億円|万人|初登場\S*位|週末興行|ランキング|第?1位|No\.?1|ヒットスタート|突破|売上|初日満足度|【国内映画ランキング】|【映画.com配信アクセスランキング】`
  - allowカテゴリ(news_category付与): release_date(公開日決定/延期)・cast(追加キャスト/監督)・trailer(予告/特報解禁)・poster(ポスター/ビジュアル解禁)・festival(映画祭/受賞)・sequel(続編/リメイク/実写化)・revival(特集/リバイバル/4K)・stage_greeting(舞台挨拶/イベント)。どれにも当たらなければ category=null で新着には出す。
  - ノイズ除去: natalie/realsoundはドラマ/芸能混入 → `映画|劇場|公開|監督|主演` を含むもののみ採用。realsound は category『映画部SNSニュース』タグ除外。
- **作品同定**: タイトル正規化(空白/記号/全半角/丸カッコ副題除去) + release_date近接。同定できたら movie_source_ids に (source, source_key, movie_id) 記録。ニュース→作品は Real Sound の作品名タグ(match='tag')＋他源はタイトル中『』照合(match='title_match')→ news_movie_map。
- 正規化して §5 の IngestMovie/IngestNews/IngestPop へマップ、`--mode=post` なら 100〜200件毎に分割POST、`--mode=sql` なら upsert SQL を out に書く（ローカル/初回seed用）。
- 冪等: 全ソースの取得件数を集計し、0件ソースは status='zero_rows'。

## 7. GitHub Actions 日次cron（Task A が実装）
`.github/workflows/movie-ingest.yml`: `on: schedule: - cron: '17 21 * * *'`（UTC=JST 6:17。毎時0分回避）+ `workflow_dispatch`。手順: checkout → setup-node 22 → `cd movie-crawler && npm ci` → `node crawl.mjs --mode=post --endpoint=${{ secrets.CINEMA_INGEST_ENDPOINT }} --secret-env=INGEST_SECRET`（`INGEST_SECRET: ${{ secrets.CINEMA_INGEST_SECRET }}`）。private無料枠内。**リポにsecretは書かない**。README/コメントに必要なsecret名を明記。

## 8. フロントエンド（Task B が実装。mock-4 忠実移植）
- 参照モック: `_work/movie-mockups/mock-4-marquee-world.html`（レイアウト・セクション・インタラクションの正）。既存 `_work/movie-mockups/prompt-4.txt` も参考可。
- セクション（mock-4順）: 封切りティッカー → 状態/ジャンルチップ → ヒーロー(注目1本・上映N日目pulse or あとN日カウントダウン・CTAは「予告編を見る」(YouTube)と「観たい」(localStorage印)のみ) → 今上映中row → 公開スケジュール(EPG風番組表・◀月▶ナビ・本日ライン・タイムライン⇄週カレンダー切替・狭幅で縦リストfallback) → 来月公開ラインアップ(縦2:3ポスター) → 人気ランキング(上映中/期待度の2タブ) → 映画ニュース → フッター(「情報提示のみ・予約/購入は扱いません」「最終更新 <lastCrawledAt>」「データ出典」)。
- 既存資産を再利用: `AppHeader`/`Header`/`ServiceDock`/`useService`/`useServiceNavigation`。ドックに「映画」タブが出て選択できること。
- 統合点（非破壊・最小差分）:
  - `src/utils/service/serviceCatalog.ts`: **niconico エントリを cinema に置換** → `{ id:'cinema', label:'映画', panelId:'cn', accent:'#e8940f', accentInk:'#2a1602', hint:'4', ready:true, searchPlaceholder:'作品名・監督・俳優で検索' }`。`ServiceId` 型の 'niconico' を 'cinema' に。**全参照(型/テスト/CSS/Context)を追随**。`serviceCatalog.test.ts` の niconico ケースを cinema に更新（ready=true）。
  - `src/app/globals.css`: `[data-svc="niconico"]` を `[data-svc="cinema"]` に置換し、mock-4 のパレットへ更新。ライト: `--hd-bg` は body背景 #fbf6ee 系、`--hd-tx:#251a10;--hd-tx2:#8d7a58;--hd-line:#ecdfc6;--hd-acc:#e8940f;--hd-acc-ink:#2a1602;--hd-in:#ffffff;--hd-glow:rgba(232,148,15,.35)`。`html[data-svc="cinema"] body{background:#fbf6ee}`。ダークは mock-4 のプラム夜×マーキー金に合わせ `html[data-theme="dark"][data-svc="cinema"]` 系で上書き。映画ワールド専用のセクションCSSは cinema プレフィックスで追記。既存 TVER/ABEMA/YouTube のCSSは触らない。
  - `src/components/atomicDesign/pages/Main.tsx`: `if (service === 'cinema') return <CinemaWorldContainer/>;` を追加（ComingSoonWorld フォールバックの前）。cinema は TVER のような session/tvHomeData 依存を持たない（D1 API から取得）。
  - 新規: `src/components/atomicDesign/organisms/CinemaWorld.tsx`(+ Container で fetch)、必要な molecules（CinemaScheduleGrid, CinemaRankingShelf, CinemaNewsList 等）。`src/app/api/service/cinema/*` の読み取りルート。`src/types/cinema.ts`。
- 予告編CTA: `window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(titleJa+' 予告編'),'_blank')`。動画埋め込み・プレーヤーは作らない。
- 「観たい」トグルは localStorage 保存の“印”（サーバー送信なし）。

## 9. 共有制約（両タスク共通）
- 絵文字を一切使わない（アイコンはインラインSVG/文字）。UIコピーは日本語・です/ます基調。
- 実データは実在の映画/人物になる（クロール由来なので当然）。モックの架空データは使わない（実データ描画）。
- Next本体の `package.json`/`wrangler.jsonc` は**変更しない**（Claudeが管理）。新依存が必要なら実装せず理由を報告。crawler は `movie-crawler/package.json` 内で完結。
- Cloudflare Workers/OpenNext 互換（Nodeでしか動かないAPIをルートに持ち込まない。重い処理はcrawler側=GH Actionsへ）。
- 既存の TVER/ABEMA/YouTube 挙動・CSS・ルートを壊さない（回帰させない）。
- テスト: crawler の iCal パーサ・興収フィルタ・正規化、API のステータス導出は vitest でユニットテストを付ける。
- 完了時に「変更/新規ファイル一覧」を報告。秘密情報（鍵/トークン）をコードに書かない。

## 10. ファイル分担（衝突回避・厳守）
- **Task A（データパイプライン）**: `movie-crawler/**`（新規）, `src/app/api/service/cinema/ingest/route.ts`（新規）, `.github/workflows/movie-ingest.yml`（新規）, `.env.local.example` へ INGEST_SECRET 行を**追記のみ**, crawler のテスト。
- **Task B（フロント＋読取API）**: `src/app/api/service/cinema/{home,schedule,ranking,news}/route.ts`（新規）, `src/components/atomicDesign/organisms/CinemaWorld*.tsx` ＋ molecules（新規）, `src/types/cinema.ts`（新規）, `src/utils/service/serviceCatalog.ts`＋`serviceCatalog.test.ts`（編集）, `src/app/globals.css`（cinema 部の編集）, `src/components/atomicDesign/pages/Main.tsx`（cinema 分岐追加）, ServiceId型に連なる参照の追随。
- 両者が触るファイルは無い（ingest と read はディレクトリが別）。共有は D1 スキーマと §4/§5 の型契約のみ。
