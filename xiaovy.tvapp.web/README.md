# TVapp Web

TVapp Web は、Next.js App Router で構成された TVapp のフロントエンド + BFF/API です。ログイン後のホームで共通ヘッダーのサービスドックから `TVER` / `ABEMA` / `YouTube` / `映画` を切り替え、選択サービスごとに別ワールドを描画します。

現行のサービス状態は次のとおりです。

| サービス | 状態 | 主な機能 |
| --- | --- | --- |
| TVER | ready | ホーム、ランキング、検索、シリーズ、エピソード再生、Streaks HLS 解決 |
| ABEMA | ready | ライブ/VOD/番組表の閲覧、ライブ/番組再生ページ、HLS proxy/key |
| YouTube | 準備中 | サービスドックには表示。現状は準備中ワールド |
| 映画 | ready | 上映中/近日公開/公開日未定、ランキング、ニュース、予告編検索、観たい印 |

## 技術スタック

- Next.js `16` App Router、React `19`、TypeScript
- Tailwind CSS `3`、Headless UI、Heroicons、Radix Dropdown、next-themes
- Cloudflare Workers + OpenNext (`@opennextjs/cloudflare`)
- Firebase Auth / Firebase Admin SDK
- Cloudflare D1 (`MOVIE_DB`) for 映画ワールド
- `hls.js` for HLS playback
- Vitest + jsdom + V8 coverage

## アプリ概要

### TVER

TVER は BFF/API 経由で session、ランキング合成ホーム、エピソード詳細、シリーズ話数、検索、静的 content JSON、ストリーム解決、HLS proxy を提供します。

再生 URL 解決は二段構えです。

1. `AZURE_FUNCTION_STREEAMING` が設定されている場合は、日本リージョンの Azure Function に委譲します。
2. 未設定の場合は純 TypeScript の Streaks 解決を使います。

純 TS 解決では、TVER session、`callEpisode`、静的 episode JSON、`streaks_info`、Streaks playback API を辿り、非 DRM の m3u8 を返します。Streaks key は JST 月から `(month % 6) || 6` で `key01..key06` を選び、playback には `Origin: https://tver.jp` が必要です。

### ABEMA

ABEMA は channels、slots、VOD genres/ranking/program/series/episode、streaminglink/hls/key の API を持ちます。ホームではライブ、VOD ヒーロー、現在放送中、VOD ランキング、EPG、番組棚を表示します。

再生系は `/api/service/abema/streaminglink` で解決し、Azure Function が設定されていれば `service_id=2&res_type=6` で委譲します。返却された manifest は `/api/service/abema/hls` で中継し、`abematv-license://ticket` は `/api/service/abema/key` に書き換えます。Azure から鍵が返る場合は session 単位で保持して hls.js から取得します。

### 映画

映画ワールドは 2026-07 に追加された情報ワールドです。再生、予約、購入の導線は持たず、上映中/近日公開/公開日未定、ランキング、ニュース、ジャンル別探索、予告編 YouTube 検索、localStorage の「観たい」印を提供します。

データは `movie-crawler` が日次で映画.com、Filmarks、MovieWalker、RSS フィード等を取得し、正規化して D1 へ ingest します。アプリは D1 を読み、公開ステータスを read 時に `release_date`、`date_precision`、`now_showing`、`is_postponed` から導出します。

## アーキテクチャ概要

- `src/app/layout.tsx` が `Providers` と `AppHeader` を配置します。
- `src/app/providers.tsx` が Firebase Auth、Theme、TVER 系 ServiceContext、ServiceProvider を束ねます。
- `src/contexts/ServiceContext.tsx` が選択サービスを localStorage、URL hash、`html[data-svc]` に同期します。
- `src/components/atomicDesign/pages/Main.tsx` が認証後にサービス別ワールドへ分岐します。ABEMA と映画は TVER session ゲートより前に専用 Container へ早期 return します。
- API Route は `src/app/api` 配下にあり、TVER/ABEMA/映画の BFF と health check を提供します。
- Cloudflare Workers では `wrangler.jsonc` の `main: .open-next/worker.js` と `nodejs_compat` で OpenNext 成果物を動かします。

## 開発手順

前提:

- Node.js 20 以上
- npm
- Firebase のクライアント設定値
- Cloudflare D1 を使う機能を本番相当で確認する場合は `MOVIE_DB` binding

依存を入れて開発サーバーを起動します。

```bash
npm install
npm run dev
```

通常は `http://localhost:3000` で確認します。

`.env.local` には Firebase と任意の委譲先を設定します。代表的な変数は次のとおりです。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_IDTOKEN_NAME=IdToken

AZURE_FUNCTION_STREEAMING=
AZURE_FUNCTION_STREEAMING_CODE_KEY=
INGEST_SECRET=
NEXT_PUBLIC_DEV_BYPASS_AUTH=
NEXT_PUBLIC_ENABLE_USER_DATA=
```

`NEXT_PUBLIC_DEV_BYPASS_AUTH` は開発用の認証バイパス値です。ローカル環境で値を置く場合は本番設定と混ぜないでください。

## テスト

ルートのテストは Vitest です。

```bash
npm run test
npm run test:coverage
npm run test:live
```

`test:live` は `TVER_LIVE=1` を付けて実 TVER API へ接続するライブテストを含めます。通常の `npm run test` では `*.live.test.ts` は除外されます。

coverage は `src/lib/**` と `src/utils/**` を対象に、lines/functions/branches/statements の 80% 閾値を設定しています。対象には TVER resolver、ABEMA 正規化/HLS、player 純関数、映画 status などが含まれます。

映画クローラは独立パッケージです。

```bash
cd movie-crawler
npm test
```

## デプロイ

Cloudflare Workers へは OpenNext 成果物をデプロイします。

```bash
npm run cf:build
npm run cf:preview
npm run cf:deploy
```

本番手動デプロイでは `deploy:safe` を使います。

```bash
npm run deploy:safe
```

`deploy:safe` は未コミット変更を検出して中断し、`.open-next` / `.next` を削除して再ビルドし、`BUILD_SHA` を埋め込んで `wrangler deploy` します。デプロイ後は本番 `/api/health` の `build_sha` が HEAD と一致するか照合します。

`wrangler.jsonc` には `AZURE_FUNCTION_STREEAMING` と D1 binding `MOVIE_DB` が定義されています。`AZURE_FUNCTION_STREEAMING_CODE_KEY` と `INGEST_SECRET` は secret として登録します。

## 映画クローラと日次 ingest

`movie-crawler` は鍵ゼロの日次クローラです。映画.com、Filmarks、MovieWalker、RSS フィードを取得し、興収/ランキング系ニュースを除外し、映画文脈とジャンルを正規化し、`og:image` 等からニュースサムネイルを補完します。

実行モード:

```bash
cd movie-crawler
node crawl.mjs --mode=post --endpoint=https://<host>/api/service/cinema/ingest --secret-env=INGEST_SECRET
node crawl.mjs --mode=sql --out=seed.sql
```

`post` モードは `x-ingest-secret` で `/api/service/cinema/ingest` に投入します。ingest route は body サイズ、件数、型、URL、文字列長を検証し、D1 batch/upsert で `movies`、`movie_credits`、`movie_source_ids`、`movie_news`、`news_movie_map`、`popularity_snapshots`、`ingest_runs` を更新します。

## 主要ディレクトリ

```text
src/app/                         Next.js App Router pages / API routes
src/app/api/service/call/         TVER BFF
src/app/api/service/stream/       TVER HLS proxy
src/app/api/service/abema/        ABEMA BFF / streaminglink / hls / key
src/app/api/service/cinema/       映画 D1 read API / ingest
src/components/atomicDesign/      UI components
src/components/atomicDesign/organisms/
                                  TVER / ABEMA / Cinema worlds
src/contexts/                     Auth, service selection, service contexts
src/hooks/                        BFF/API fetch hooks
src/lib/tver/                     TVER Streaks resolver and cache
src/lib/abema/                    ABEMA auth/client playback helpers
src/utils/                        Pure functions and test targets
src/types/                        Shared TypeScript types
db/cinema/schema.sql              D1 schema for cinema
db/cinema/CONTRACT.md             映画データ契約の一次資料。実装との差分あり
movie-crawler/                    Cinema daily crawler package
docs/reference/                   常設仕様/設計/運用ドキュメント
scripts/deploy.sh                 deploy:safe implementation
```

## 主要 API

- `POST /api/service/session`
- `GET /api/service/call/home`
- `GET /api/service/call/episode?id=...`
- `GET /api/service/call/seriesEpisodes/[seriesId]`
- `GET /api/service/search?keyword=...`
- `POST /api/service/call/streaminglink`
- `GET /api/service/stream/hls?src=...`
- `GET /api/service/abema/channels`
- `GET /api/service/abema/slots?date=YYYY-MM-DD`
- `GET /api/service/abema/vod/ranking`
- `GET /api/service/abema/vod/program?id=...`
- `GET /api/service/abema/vod/series?id=...`
- `GET /api/service/abema/vod/episode?id=...`
- `GET /api/service/abema/streaminglink`
- `GET /api/service/abema/hls?src=...`
- `GET /api/service/abema/key?ticket=...&sid=...`
- `GET /api/service/cinema/home`
- `GET /api/service/cinema/ranking?type=now|expected`
- `GET /api/service/cinema/news`
- `POST /api/service/cinema/ingest`
- `GET /api/health`

## ライセンス

このプロジェクトはプライベートリポジトリです。
