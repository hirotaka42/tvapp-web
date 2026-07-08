# ABEMA 世界 実装設計書（06-abema-impl-plan）

- 対象: `tvapp-web / xiaovy.tvapp.web`
- 位置づけ: マルチサービス統合ビューアの ABEMA 世界（`service === 'abema'`）の現行実装メモ
- ステータス: 実装済み（ブラウズ、VOD、アプリ内再生ルート、HLS proxy/key）
- 主な実装: `src/app/api/service/abema/*`, `src/hooks/useAbema*`, `src/components/atomicDesign/organisms/AbemaHome.tsx`, `src/app/service/abema/*`

本書は現行コードに基づく事実整理です。ABEMA は現在、ブラウズ、VOD、アプリ内再生ルート、HLS proxy/key を持ちます。

---

## 0. 結論（TL;DR）

| 項目 | 現状 | 実装箇所 |
| --- | --- | --- |
| サービス状態 | `ready: true` | `src/utils/service/serviceCatalog.ts` |
| チャンネル一覧 | BFF で取得、正規化 | `/api/service/abema/channels` |
| 番組表/slots | BFF で取得、EPG/現在放送中/このあとへ変換 | `/api/service/abema/slots`, `src/utils/abema/homeView/*` |
| VOD | genres/ranking/program/series/episode を取得 | `/api/service/abema/vod/*` |
| ホーム UI | ライブ/VODヒーロー、現在放送中、VODランキング、EPG、棚 | `AbemaHome.tsx`, `molecules/abema/*` |
| アプリ内再生 | 実装済み。ライブ/slot 用再生ページあり | `src/app/service/abema/live/[channelId]`, `watch/[slotId]` |
| HLS proxy | ABEMA/Akamai 系 URL を許可し、m3u8 を書き換え | `/api/service/abema/hls`, `src/utils/abema/hlsRewrite.ts` |
| 鍵取得 | Azure 委譲が返す鍵を session 保存し `/key` で配布 | `/api/service/abema/key`, `keyStore.ts` |

## 1. サービス分岐

`serviceCatalog.ts` の ABEMA は `ready: true` です。`Main.tsx` はログイン確認後、TVER の session/home 取得ゲートより前に `service === 'abema'` を判定し、`AbemaHomeContainer` を返します。

これにより ABEMA は TVER session に依存せず、独自 hook で channels、slots、VOD を取得します。YouTube は `ready: false` のため、準備中ワールドに落ちます。

## 2. データ取得

### 2.1 ブラウズ系 API

- `GET /api/service/abema/channels`
  - ABEMA の channels を BFF で取得し、画面用に正規化します。
- `GET /api/service/abema/slots?date=YYYY-MM-DD`
  - 番組表データを取得し、現在放送中、EPG、棚の材料にします。
- `src/hooks/useAbemaHome.ts`
  - channels と slots を並列取得します。

### 2.2 VOD API

現行コードには次の VOD API があります。

- `GET /api/service/abema/vod/genres`
- `GET /api/service/abema/vod/ranking`
- `GET /api/service/abema/vod/program`
- `GET /api/service/abema/vod/series`
- `GET /api/service/abema/vod/episode`

VOD 系は `src/lib/abema/auth.ts` で ABEMA user token を取得して上流 API を呼びます。画面側は `useAbemaVod`、`useAbemaProgram`、`useAbemaSeries` から利用します。

## 3. ホーム UI

`AbemaHomeContainer` は以下の情報を表示します。

- ライブ/VODティッカー
- VOD ヒーローまたはライブヒーロー
- 現在放送中パネル
- VOD ランキング
- EPG
- 番組棚
- フッター

UI は `src/components/atomicDesign/molecules/abema/` 配下の部品に分割されています。番組/カード画像は ABEMA の画像 URL 正規化と fallback を組み合わせます。

## 4. 再生

### 4.1 再生ページ

ABEMA にはアプリ内再生ページがあります。

- `src/app/service/abema/live/[channelId]/page.tsx`
- `src/app/service/abema/watch/[slotId]/page.tsx`
- `src/app/service/abema/series/[seriesId]/page.tsx`

再生ページは `useAbemaStream` から `/api/service/abema/streaminglink` を呼び、取得した `video_url` を `VideoPlayer` に渡します。ABEMA 側では TVER 用 Streaks proxy に流さないため、呼び出し側で ABEMA 用 URL を使います。

### 4.2 streaminglink

`/api/service/abema/streaminglink` は `type=live|slot` を受けます。

- Azure Function が設定されている場合:
  - `AZURE_FUNCTION_STREEAMING/api/backend_stream_url_http`
  - `service_id=2&res_type=6`
  - `Origin: https://abema.tv`
  - 返却された manifest URL を ABEMA HLS proxy URL に変換します。
  - `keys` または `key_dict` があれば `crypto.randomUUID()` の session ID で `keyStore` に保存します。
- Azure Function が未設定の場合:
  - `type=live` は linear m3u8 を返します。
  - `type=slot` は media token acquisition が必要なため 501 を返します。

失敗時は `premium`、`geo`、`upstream`、`not_found`、`resolver_unavailable`、`unknown` の reason を返します。

### 4.3 HLS proxy / key

`/api/service/abema/hls` は許可された ABEMA/Akamai 系 URL のみ中継します。m3u8 の場合は `rewriteAbemaM3u8` で相対 URL と `abematv-license://ticket` を書き換えます。

`/api/service/abema/key` は `ticket` と `sid` を受け、`keyStore` に保存済みの鍵を返します。鍵がない場合は 404 を返し、「derived AES keys or a browser-playable manifest」が必要であることを JSON で返します。

## 5. middleware

ABEMA 再生系の media endpoint は hls.js が Authorization header を付けられないため、middleware の公開パスに含まれます。

- `/api/service/abema/streaminglink`
- `/api/service/abema/hls`
- `/api/service/abema/key`

その他の `/api/` は既存方針どおり Bearer header の存在チェックを受けます。

## 6. テスト

ABEMA 関連のテストは Vitest で実装されています。

- `src/lib/abema/auth.test.ts`
- `src/app/api/service/abema/streaminglink/route.test.ts`
- `src/app/api/service/abema/vod/ranking/route.test.ts`
- `src/app/api/service/abema/vod/program/route.test.ts`
- `src/app/api/service/abema/vod/series/route.test.ts`
- `src/utils/abema/*.test.ts`
- `src/utils/abema/homeView/*.test.ts`

coverage gate は root の `vitest.config.ts` にあり、`src/lib/**` と `src/utils/**` を対象に 80% 閾値を設定しています。

## 7. 実装上の注意点

- ABEMA は TVER session を必要としないため、`Main.tsx` の分岐順を変えると ABEMA 表示が TVER データ待ちに巻き込まれる可能性があります。
- hls.js は key endpoint に Authorization header を付けないため、ABEMA media endpoint は route 側で URL allow-list と session key を使って制御します。
- Azure 委譲がない場合、slot 再生は 501 です。ライブは linear m3u8 の返却経路があります。
- UI 上の再生可否は、streaminglink のレスポンスと key の有無に依存します。
