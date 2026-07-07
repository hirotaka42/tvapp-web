# レスポンシブ修正 + HLS プレイヤー刷新 — 実装設計書

- 対象: `xiaovy.tvapp.web`(Next.js 16 App Router / React 19 / Tailwind 3.4 / atomic design)
- 関連: `docs/reference/02_architecture/03-tver-redesign-impl-plan.md`(TVER ホームのトークン・DOM 構造の一次情報)
- スコープ: (1) TVER ホームの左右見切れ解消(レスポンシブ)、(2) HLS 実再生プレイヤーへの置換。
- 本書は客観的事実(既存コードの構造・実測ブレークポイント・props 型)のみを記述する。

---

## 0. 不可侵の制約

1. **データフロー不変**: `useSession → useTvHome → convertRankingToCardData`、`useStream` / `useEpisode`、認証(Firebase / `AuthContext`)は 1 行も変えない。
2. **props インターフェース互換**: `VideoPlayer` の props(`url` / `onPlay` / `onProgress` / `playing` / `controls`)を維持する。呼び出し側(`episode/[episodeId]/page.tsx`・`DBVideoList.tsx`・`GroupedDBVideoList.tsx`)は無改修で動くこと。特に `onProgress` は `{ played, playedSeconds, loaded, loadedSeconds }` の形を維持(ゲスト30秒制限が `playedSeconds` に依存)。
3. **CI ゲート(4 段。1 つも落とさない)**:
   - `npx tsc --noEmit`
   - `npm run test:coverage`(coverage `include` は `src/lib/**` と `src/utils/**` のみ。閾値 80%: lines/functions/branches/statements)
   - `npm run build`
   - `npm run cf:build`(OpenNext。Workers ランタイム互換)
4. **カバレッジ対象の原則**: 新規の派生ロジック(HLS 判定・リトライ計算等)は**必ず `src/utils/` 配下の純関数**にし `*.test.ts` を付ける。コンポーネント(`src/components/**`)はカバレッジ対象外だが回帰防止に `*.test.tsx` を作ってよい。
5. **世界観を保つ**: TVER の「紙面 × ステッカー × 熱量」(クリーム地・極太黒枠・ハードシャドウ)を壊さない。縮小・折返し・スクロールで畳むが、色・枠・影の意匠は残す。
6. **dev サーバは検証後に必ず停止**(PID 管理・orphan 厳禁)。

---

## 1. レスポンシブ修正(左右見切れ解消)

### 1.1 現状の見切れ要因(`src/app/globals.css` 実測)

- `.wrap{max-width:1280px;padding:0 28px}` に対し、ヘッダーは `.hd-in{max-width:1380px;padding:10px 24px}` と幅・パディングが不一致。**コンテンツ列とヘッダー列の左右端が揃わない**。
- `.tv-row{padding:20px 8px 26px 22px;margin-left:-22px}` の**負のマージン**が `.wrap` の左端を越えて張り出す。`.tv-world{overflow:hidden}` で右側の張り出し(カードのハードシャドウ `box-shadow:5px 5px 0`)が視覚的にクリップされ、見切れて見える。
- `.tv-hero-art{transform:rotate(1.3deg);box-shadow:10px 10px 0 #ff2e88}` の回転+影が、狭幅で `.wrap` の右端を越え、`overflow:hidden` にクリップされる。
- `.tv-hero{grid-template-columns:1fr 1.02fr}` は 920px 以下で 1 列化する既存メディアクエリがあるが、iPad 縦(768)〜横(1024)帯での列比率・余白調整が未整備。

### 1.2 ブレークポイント方針(3 段。既存の世界観を保つ)

対象実機幅: **iPhone 375–430 / iPad 768–1024 / PC 1280+**。

| 帯 | 幅 | 方針 |
|---|---|---|
| PC | 1280+ | 現状の 2 列ヒーロー・横スクロール棚。`.wrap` と `.hd-in` の左右基準を一致させる |
| iPad | 768–1024 | ヒーロー 1 列化(920px 既存境界を 1024 まで引き上げ検討)。カード幅・gap をやや圧縮。ヘッダーのドックは折返し既存動作を維持 |
| iPhone | 375–430 | `.wrap` の左右 padding を 16px に。カード基準幅を縮小。ハードシャドウのオフセットを縮小して張り出しを抑える。ヒーローの回転を 0 に |

### 1.3 具体的な修正(CSS 中心・DOM は原則不変)

以下は `@layer components` 内で行い、既存トークン・意匠を保つ。

1. **左右基準の統一**: `.hd-in` の `max-width` / `padding` を `.wrap` に合わせる(左右端が一致するよう `max-width:1280px` 系へ寄せ、`padding` を共通化)。ロゴ・検索・ユーザーメニューの折返しは既存メディアクエリを維持。
2. **負のマージンの見直し**: `.tv-row` の `margin-left:-22px` + `padding-left:22px` による張り出しを、見切れないオフセットへ調整(棚の 1 枚目のシャドウが切れない範囲)。狭幅で `padding` を縮小。
3. **ヒーローの安全化**: 狭幅(iPad 以下)で `.tv-hero-art{transform:rotate(0)}`、`box-shadow` のオフセットを縮小。1 列化の境界を iPad 縦(≤1024 または ≤960)まで引き上げ、`gap` と `padding` を調整。
4. **カードの張り出し抑制**: 狭幅で `.tv-card` の `flex-basis` を段階的に縮小(430 と 375 で別値)。`.tv-clk` の `box-shadow` オフセットを狭幅で縮小。
5. **横スクロール要素の内側化**: `.tv-row` / `.tv-cat` は既に `overflow-x:auto`。棚は畳まず横スクロールで見せる方針を維持しつつ、左右端でカードが**切れて始まらない/切れて終わらない**よう `scroll-padding` と端 padding を整える。
6. **`overflow-x` の防御**: `body` もしくは `.tv-world` に対し、意図しない横スクロールバーが出ないことを各ブレークポイントで確認(要素の張り出しを CSS 側で吸収し、`overflow:hidden` に頼り切らない)。

### 1.4 派生ロジックの純関数化(任意・テスト対象)

CSS のみで解決できる範囲は util 不要。もしカード表示枚数やレスポンシブ判定を JS 側で持つ場合のみ `src/utils/` に純関数化し `*.test.ts` を付ける(未テスト util 追加はゲート違反)。**原則 CSS で完結させ、util は増やさない**。

---

## 2. HLS プレイヤー刷新(react-player → hls.js)

### 2.1 方針

- 依存追加: `npm i hls.js`(型同梱)。`react-player` への依存は `VideoPlayer` からは外す(他所の `stream/page.tsx` は別途 dynamic import のため対象外・無改修)。
- 再生方式:
  - **Safari(および HLS ネイティブ対応ブラウザ)**: `video.canPlayType('application/vnd.apple.mpegurl')` が真なら `<video>` に直接 `src` を割り当てる(hls.js 不使用)。
  - **その他(Chrome/Firefox/Edge)**: `Hls.isSupported()` が真なら hls.js をアタッチ。
  - どちらも不可なら「この環境では再生できません」旨のフォールバック表示。
- **SSR 回避**: hls.js はブラウザ API 依存。`VideoPlayer` は `'use client'` にし、hls.js は**動的 import**(`await import('hls.js')`)で client 実行時のみ読み込む。もしくは呼び出し側の `next/dynamic` で `ssr:false`。既存呼び出しを壊さないため、コンポーネント内で client ガード(既存 `clientSide` state 相当)を維持する。
- **16:9 レスポンシブ枠**: `aspect-ratio:16/9` の枠に `<video>` を `width:100%;height:100%;object-fit:contain` で収める。既存 `episode` ページは親が `aspect-video` を持つため、`VideoPlayer` 側は枠を埋める形にする(二重の枠にならないよう `.player-wrapper` を維持)。
- **エラーリトライ**: hls.js の `Hls.Events.ERROR` を購読し、`fatal` の場合に種別で処理:
  - `NETWORK_ERROR` → `hls.startLoad()` で再開(上限回数まで指数バックオフ)。
  - `MEDIA_ERROR` → `hls.recoverMediaError()`。
  - それ以外の fatal → `hls.destroy()` してエラー state へ。
  - リトライ回数・待機時間の計算は純関数 `src/utils/player/retryPolicy.ts` に切り出し `*.test.ts` を付ける(カバレッジ対象)。
- **cleanup**: `useEffect` の戻り値で `hls.destroy()`、`video` のイベント解除、進捗 `requestAnimationFrame`/`setInterval` の解除を確実に行う(アンマウント・url 変更時)。教訓のリソースリーク防止。
- **進捗コールバック互換**: `<video>` の `timeupdate` から `onProgress({ played, playedSeconds, loaded, loadedSeconds })` を組み立てる。
  - `playedSeconds = video.currentTime`
  - `played = duration>0 ? currentTime/duration : 0`
  - `loadedSeconds = buffered.end(last)`(あれば)、`loaded = duration>0 ? loadedSeconds/duration : 0`
  - この算出も純関数 `src/utils/player/deriveProgress.ts` に切り出しテストを付ける(ゲスト30秒制限の回帰防止に有効)。
- **playing / controls**: `playing` の真偽で `video.play()` / `video.pause()` を制御(自動再生のブロックは握りつぶす)。`controls` を `<video controls>` に反映。`onPlay` は `play` イベントで発火。`playsInline` / `controlsList="nodownload"` を維持。

### 2.2 新規 util(カバレッジ対象・テスト必須)

| # | ファイル | 役割(純関数) |
|---|---|---|
| P1 | `src/utils/player/canPlayNativeHls.ts` | `video.canPlayType` 結果(文字列)を受けてネイティブ HLS 可否を bool で返す。DOM 非依存(引数に判定文字列を注入)にしてテスト可能にする |
| P2 | `src/utils/player/retryPolicy.ts` | 現在の試行回数 → 次に再試行するか・待機 ms を返す(上限・バックオフ)。純関数 |
| P3 | `src/utils/player/deriveProgress.ts` | `{ currentTime, duration, bufferedEnd }` → `{ played, playedSeconds, loaded, loadedSeconds }` を返す。0 除算・未取得を安全に扱う |

各 util は正常系・境界(0/未定義/上限)・異常系を網羅する `*.test.ts` を必ず添える。

### 2.3 VideoPlayer コンポーネント改修(`src/components/atomicDesign/atoms/VideoPlayer.tsx`)

- props 型は現行維持:
  ```ts
  interface VideoPlayerProps {
    url: string;
    onPlay?: () => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    playing?: boolean;
    controls?: boolean;
  }
  ```
- 内部で `<video ref>` を使い、上記 util を用いて HLS アタッチ・進捗算出・リトライを行う。
- `clientSide` ガード(SSR 回避)と `.player-wrapper` / `.react-player`(既存 CSS)相当の 16:9 枠を維持。
- hls.js は `await import('hls.js')` で動的読み込み。

### 2.4 呼び出し側

無改修で動くことを確認する。`episode/[episodeId]/page.tsx` は現行の props をそのまま渡す。`DBVideoList` / `GroupedDBVideoList` は `<VideoPlayer url=... />` のみ(進捗・playing 未指定でも既定で動く)。

---

## 3. 検証(完了条件)

1. `npx tsc --noEmit` 成功。
2. `npm run test:coverage` 成功(新 util を含め 80%+。lines/functions/branches/statements すべて)。
3. `npm run build` 成功。
4. (可能なら)`npm run cf:build` 成功。
5. レスポンシブは 375 / 430 / 768 / 1024 / 1280 の各幅で左右見切れ・意図しない横スクロールが無いこと(dev で確認、確認後に dev 停止)。

本書は事実の記述に徹する。実装で判断が要る箇所は既存コード・モックの実測値を一次情報とする。
