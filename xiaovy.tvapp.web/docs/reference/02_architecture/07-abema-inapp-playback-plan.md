# ABEMA アプリ内再生 設計書（07-abema-inapp-playback-plan）

- 対象: `tvapp-web / xiaovy.tvapp.web`（`src/` 配下のみ。参照宣言外は触らない）
- 位置づけ: ABEMA 世界（`service === 'abema'`）を **外部リンク導線から「アプリ内再生」へ切り替える**ための設計。
  タスク #21「ABEMAをアプリ内再生へ(外部リンク廃止・Azure解決)」に対応する。
- 前提資料:
  - `docs/reference/02_architecture/06-abema-impl-plan.md`（ブラウズ層＝番組表/チャンネル。再生は外部リンクに留めた版）
  - `docs/reference/02_architecture/05-responsive-and-player-plan.md`（`VideoPlayer` = hls.js 実再生の一次情報）
  - 実現性調査（yt-dlp v2026.03.17 で ABEMA のマニフェスト/暗号方式を実測）
- ステータス: 設計（未着手）。実装は別ブランチ（例 `feature/abema-inapp-playback`）。

> 本書は **事実準拠・過度な約束をしない**。§10（AI 出力の中立性）に従い、題材の是非は判断せず、
> 技術的事実（マニフェスト種別・暗号方式・到達可否）だけを述べる。

---

## 0. 結論（TL;DR）— 「不可」と「可能だが要バックエンド」を分けて述べる

| 論点 | 判定 | 根拠（事実） |
|---|---|---|
| ブラウザ単体（hls.js に生 ABEMA URL を渡すだけ）でのアプリ内再生 | **不可** | メディア m3u8 の鍵 URI が `abematv-license://<ticket>`。hls.js は http(s) 鍵 or 標準 EME(Widevine/PlayReady/FairPlay)しか扱えない。ABEMA はそのどちらでもない |
| CORS が原因か | **いいえ（CORS はブロッカーではない）** | マニフェストも `.ts` セグメントも `Access-Control-Allow-Origin: *` を返す。詰まりは鍵 URI 方式 |
| バックエンド仲介でのアプリ内再生 | **技術的に可能（ただし相応の実装が必要）** | 鍵は独自の **AES-128 派生鍵方式**であって復号不能な DRM ではない。yt-dlp `AbemaLicenseRH` がサーバ側で 16byte AES 鍵を導出して復号している事実がある |
| その「バックエンド仲介」を **いま E2E で通せるか** | **未検証（ローカルに Azure コードキー無し）** | `azureKeyAvailable:false`。Platform-Stream-Loader(Azure) は yt-dlp ベースで ABEMA 対応の記述はあるが、鍵導出済みマニフェストを返すか未確認。ローカル検証は yt-dlp v2026.03.17 で暗号方式のみ確認 |
| VOD（slot）マニフェスト到達 | **追加の壁（media token 必須）** | token 無しだと 403。ライブ（now-on-air）は 200 で取れる |

**要旨**: ユーザー要求（アプリ内再生）は「ブラウザだけ」では**成立しない**が、TVER で既に採っている
**サーバ側解決モデル**（`res_type=6` 系）を **鍵導出 + マニフェスト書き換え + 鍵配布**まで拡張すれば成立する。
これは「独自ライセンスで再生不能」ではなく「**独自 AES 鍵方式を、サーバがブラウザの代わりに解く**」という位置づけである。

---

## 1. なぜブラウザ単体では再生できないか（技術的説明）

### 1.1 マニフェストと暗号方式（実測事実）

- ABEMA の配信は **HLS(m3u8) のみ**（DASH/mpd は提供されない）。
- 線形 now-on-air は
  `https://linear-abematv.akamaized.net/channel/<ch>/1080/playlist.m3u8`（`Content-Type: application/x-mpegURL`）に解決。
- メディア m3u8 に次の鍵タグが含まれる:

  ```
  #EXT-X-KEY:METHOD=AES-128,URI="abematv-license://<ticket>",IV=0x...
  ```

  - `abematv-license://` は **http(s) ではない独自スキーム**。標準 EME でも Widevine でもない。
  - 広告ブレークのセグメントは **`METHOD=NONE`(非暗号)**。つまり 1 本の m3u8 内に暗号区間と非暗号区間が混在する。

### 1.2 鍵の入手と導出（yt-dlp `AbemaLicenseRH` が行っていること）

鍵は次の 2 段で得られる（サーバでしか実行できない）:

1. `ticket` + **media token** を `https://license.abema.io/abematv-hls` に POST。
2. レスポンス `response.k` を **base-N デコード**し、`cid + DEVICE_ID` から作った鍵で **AES-ECB 復号**して、16byte の AES 鍵を **ローカルで導出**する。

この 16byte 鍵が得られれば、以降は**標準の AES-128 復号**でしかない（hls.js が普通に扱える領域）。

### 1.3 ブラウザに等価手段が無い理由

- hls.js / ブラウザ EME は `abematv-license://` を **フェッチも解決もできない**（http(s) 以外の鍵 URI 非対応）。
- 鍵導出（`license.abema.io` への media token 付き POST → base-N デコード → `cid+DEVICE_ID` の AES-ECB）は
  ブラウザのプレイヤーが**ネイティブに持たない処理**。EME にも該当ハンドラが無い。
- 二次的な壁: **VOD(slot) のマニフェストは media token 無しだと 403**。到達すらできない。

したがって、`hls.js` に生の ABEMA m3u8 をそのまま渡す実装（現 `VideoPlayer` に ABEMA URL を渡すだけ）は
**必ず失敗する**（`abematv-license://` の鍵解決不能、VOD は 403）。

---

## 2. 実現可能な最善＝バックエンド仲介モデル（TVER `res_type=6` の拡張）

現行 `src/app/api/service/call/streaminglink/route.ts` は、TVER に対し **Azure Function(日本リージョン)へ委譲 → `manifest_dict.urls[]`**
を受け取り、ブラウザは `VideoPlayer`(hls.js) で再生している。ABEMA も**同じ骨格**に載せるが、**鍵の壁のため追加の 2 点**が要る。

### 2.1 バックエンドがやること（5 ステップ）

1. **ゲスト usertoken を発行**（デバイス登録 + HMAC 署名）。
2. **media token を取得**（VOD の 403 回避・鍵取得の前提）。
3. **HLS m3u8 を解決**（now-on-air は linear、slot は VOD の m3u8）。
4. **各 `abematv-license://<ticket>` について 16byte AES 鍵を導出**
   （`license.abema.io` + base-N デコード + `cid+DEVICE_ID` の AES-ECB。yt-dlp `AbemaLicenseRH` と同手順）。
5. **`#EXT-X-KEY` を書き換え**、鍵 URI を **バックエンドが提供する https 鍵エンドポイント**（生 16byte を返す）に差し替え、
   m3u8 をプロキシ/中継する。`METHOD=NONE`(広告)区間はそのまま通す。

その結果、ブラウザ側は:

- 書き換え済み m3u8 を受け取り、
- `EXT-X-KEY` の https 鍵 URI から 16byte を取得し、
- セグメントは CORS が `*` なので **直接 CDN から取得**でき、
- **hls.js の標準 AES-128 復号**で再生できる。

> セグメント自体は CORS 開放のため、原則ブラウザから直接取得できる（プロキシ必須ではない）。
> ただし Range/認証やホスト制限の都合で、TVER の `hlsProxy` 同様にセグメントも中継する選択肢は残す。

### 2.2 図（データフロー）

```
[Browser]
  クリック(slot/channel)
        │  GET /api/service/abema/streaminglink?type=live&channelId=... (or type=slot&slotId=...)
        ▼
[BFF: Next Route Handler on Workers]
  (a) JP-egress 解決系へ委譲  ── azure or 自前 yt-dlp相当 ──▶ usertoken→media token→m3u8
  (b) abematv-license:// の ticket ごとに 16byte AES 鍵を導出
  (c) 返却: { video_url = /api/service/abema/hls?src=<書換前 or 解決済 m3u8>, m3u8_urls, subtitles }
        │
        │  GET /api/service/abema/hls?src=...   (マニフェスト取得＋EXT-X-KEY 書換)
        ▼
[BFF hls route]  ──▶ upstream m3u8 取得 → EXT-X-KEY の URI を /api/service/abema/key?... に書換 → 返却
        │
        │  GET /api/service/abema/key?ticket=...   (16byte 生鍵)
        ▼
[BFF key route] ──▶ (導出済み鍵をキャッシュから) 生 16byte を octet-stream で返却
        │
   hls.js: 書換 m3u8 + https 鍵 + CDN セグメント(CORS *) で標準 AES-128 復号 → <video> 再生
```

### 2.3 TVER 実装との対応（何を再利用し、何を足すか）

| 要素 | TVER 既存 | ABEMA での扱い |
|---|---|---|
| 解決の JP-egress 委譲 | `resolveViaAzure`（`res_type=6`→`manifest_dict.urls[]`） | 同型で ABEMA を委譲。ただし **鍵導出済みマニフェストを返すモードが必要**（現 `res_type=6` は TVER/Streaks 前提で ABEMA の鍵書換はしない想定）。Azure 側の追加 or 自前解決が要る |
| マニフェスト書換プロキシ | `src/utils/tver/hlsProxy.ts` + `/api/service/stream/hls`（`manifest.streaks.jp` のみ書換・`streaks.jp` のみ許可） | **ABEMA 専用の書換ロジックが必要**。許可ホストは Akamai(`*.akamaized.net`)等、書換対象は `EXT-X-KEY` の `abematv-license://`。TVER の `hlsProxy` は流用せず ABEMA 版を新設 |
| 鍵配布 | 不要（Streaks は標準 AES/http 鍵 or クリア） | **新設が必要**（`abematv-license://` を https 生鍵に置換するための鍵エンドポイント） |
| プレイヤー | `VideoPlayer`(hls.js) | **再利用可**。ただし後述の double-proxy 問題に注意 |

---

## 3. このコードベースへの組み込み

### 3.1 `VideoPlayer` 再利用時の要注意（load-bearing）

現 `src/components/atomicDesign/atoms/VideoPlayer.tsx` は、渡された `url` を **無条件に**
`createHlsProxyUrl(url)`（= `/api/service/stream/hls?url=...`）でラップして hls.js に渡す:

```ts
hls.loadSource(createHlsProxyUrl(url));
```

そして `/api/service/stream/hls` は `isAllowedStreaksUrl` で **`streaks.jp` 系以外を 403** で弾く。
→ ABEMA の URL をそのまま `VideoPlayer` に渡すと **Streaks 専用プロキシに回されて 403** になる。

**対処（いずれか）**:
- (A) `VideoPlayer` に `proxy?: 'streaks' | 'none'`（既定 `streaks`）等のプロパティを足し、ABEMA では
  **既にプロキシ済みの `/api/service/abema/hls?...` URL を渡し、二重ラップしない**（`none`）。props 追加は
  05 設計書「§0-2 props 互換」を壊さないよう **任意プロパティ**にして既存呼び出しを無改修に保つ。
- (B) `VideoPlayer` を触らず、ABEMA 用の薄いラッパ（`AbemaVideoPlayer`）を作り、`createHlsProxyUrl` を使わず
  ABEMA 解決済み URL を直接 `hls.loadSource` する（内部ロジックは共通 util に切り出して共有）。

いずれも「ネイティブ HLS(Safari)＝`<video src>` 直割当」「リトライ/進捗 util」は現行を流用する。

### 3.2 新設 API ルート

- `src/app/api/service/abema/streaminglink/route.ts`
  - `GET ?type=live&channelId=...` または `GET ?type=slot&slotId=...`。
  - JP-egress 解決系へ委譲（§4 の二段構え）→ 鍵導出 → 返却
    `{ video_url, m3u8_urls, subtitles }`（TVER の streaminglink と**同じ返却形**にして `useStream`/`VideoPlayer` の期待に合わせる）。
  - `video_url` は **`/api/service/abema/hls?src=...`**（書換プロキシ経由）を指す。
- `src/app/api/service/abema/hls/route.ts`
  - upstream m3u8 を取得し、`EXT-X-KEY` の `abematv-license://<ticket>` を
    `/api/service/abema/key?ticket=<...>&sid=<session>` に書き換えて返す。`METHOD=NONE` はそのまま。
  - 許可ホストを ABEMA/Akamai 系に限定（TVER の `isAllowedStreaksUrl` の ABEMA 版）。CORS ヘッダ・Range 転送は TVER hls route を踏襲。
- `src/app/api/service/abema/key/route.ts`
  - 導出済み 16byte 鍵を `application/octet-stream` で返す（body = 生 16byte）。
  - 鍵は §3.3 のセッションキャッシュから引く（毎回 `license.abema.io` を叩かない）。

### 3.3 新設ライブラリ（純関数中心・テスト必須：CI 80% ゲート対象）

CI ゲートは `src/lib/**` と `src/utils/**` のみカバレッジ対象（05 設計書 §0-3）。派生ロジックはここに置き `*.test.ts` を付ける。

- `src/lib/abema/streamResolver.ts` — usertoken 発行 → media token → m3u8 解決（JP-egress 前提）。`*.test.ts`（モック）＋ `*.live.test.ts`。
- `src/lib/abema/licenseKey.ts` — **yt-dlp `AbemaLicenseRH` 等価の鍵導出**（base-N デコード + `cid+DEVICE_ID` の AES-ECB → 16byte）。
  - 純粋な変換部（base-N デコード・ECB 変換）は DOM/ネット非依存にして単体テスト可能に切り出す。
  - Workers ランタイム互換に注意（Node の `crypto` ではなく **WebCrypto(`crypto.subtle`)** で AES-ECB 相当を実装するか、
    ECB が subtle に無い点を踏まえ純 JS 実装を検討。ここは実装時に要検証）。
- `src/utils/abema/hlsRewrite.ts` — m3u8 の `EXT-X-KEY(abematv-license://)` を鍵エンドポイント URI に書換／`METHOD=NONE` は素通し／
  相対セグメント URL の絶対化。`*.test.ts`（暗号区間・広告区間混在・IV 保持・複数 KEY タグの各境界）。

### 3.4 フックとページ

- `src/hooks/useAbemaStream.ts` — `useStream` と同型。`/api/service/abema/streaminglink` を叩き `{ video_url, loading, error }` を返す。
- 再生ページ: TVER の `episode/[episodeId]/page.tsx` に倣い、`service/abema/watch/[slotId]`（VOD）/ `.../live/[channelId]`（ライブ）を新設し、
  `VideoPlayer`（§3.1 の対処込み）で再生。番組メタ（タイトル/あらすじ/進捗）は 06 設計書の正規化型を流用。

### 3.5 UI 導線の差し替え（外部リンク廃止）

06 設計書では `AbemaCard` / `AbemaLiveHero` / `AbemaEpg` セルのクリックを **`watchUrl` の外部リンク**にしていた。
本設計ではこれらを **アプリ内再生ページへの遷移**に差し替える:

- `AbemaCard.tsx` / `AbemaLiveHero.tsx` / `AbemaUpNext.tsx` / `AbemaEpg.tsx`
  - `target="_blank"` の外部リンクをやめ、`service/abema/{watch|live}/...` への `next/link` 遷移に変更。
  - 解決失敗時（§4 で Azure/鍵が使えない環境）は **フォールバックとして「ABEMA で視聴」外部リンクを残す**設計にしておくと、
    未整備環境でも導線が死なない（機能フラグで切替。§4.3）。

---

## 4. 正直な制約・検証ギャップ（過度な約束をしない）

### 4.1 いまローカルで E2E を通せない（Azure コードキー不在）

- `azureKeyAvailable:false`。現 `streaminglink` の Azure 委譲は `AZURE_FUNCTION_STREEAMING_CODE_KEY` を要するが**ローカルに無い**。
- ローカル検証は yt-dlp v2026.03.17 で **マニフェスト種別・暗号方式・slots API 疎通**（`dateFrom=20260707` → 200, 52 slots）まで。
  **鍵導出込みのブラウザ再生までは未検証**。
- Platform-Stream-Loader(Azure) は yt-dlp ベースで ABEMA 対応の記述があるが、**`abematv-license://` を解いた（鍵書換済み）マニフェストを返すか**は未確認。
  現 `res_type=6` は TVER/Streaks 前提であり、**ABEMA 用に「鍵導出＋マニフェスト書換」を返すモードの有無を Azure 側で確認する必要**がある。

### 4.2 解決系の二段構え（TVER と同じ考え方）

JP-egress が必須（Cloudflare Workers の海外 IP から直叩きは地域制限で弾かれる）。したがって:

1. **Azure Function(日本リージョン)へ委譲**（キーが供給され、ABEMA 鍵書換モードがある場合）。— 現状キー不在で未検証。
2. **自前の JP-egress 解決**（`src/lib/abema/streamResolver.ts` + `licenseKey.ts`）。— Workers から ABEMA API/`license.abema.io` に
   到達できるか（地域制限・token 発行）を要検証。ローカル/JP ホストでは yt-dlp 相当で成立が見込める。

どちらも「JP-egress の確保」と「鍵導出の Workers ランタイム互換」が前提。**このどちらかが満たせない環境では在宅内再生は成立しない**。

### 4.3 段階導入（機能フラグ）

- `serviceCatalog` の ABEMA は既にブラウズ用途で `ready:true`。再生導線は **別フラグ**（例 `ABEMA_INAPP_PLAYBACK_ENABLED`）で守り、
  解決系（Azure キー or 自前 JP 解決）が用意できた環境でのみ「アプリ内再生」に切替え、未整備環境は外部リンクにフォールバックする。
- こうすることで「デプロイ先で解決系が無く再生が死ぬ」事故を避けつつ、外部リンク廃止（#21）を **解決系が整った時点で完遂**できる。

### 4.4 その他の事実

- **VOD(slot) は media token 必須**（token 無し 403）。ライブ(now-on-air)より 1 段壁が高い。まずライブを通し、VOD は後続。
- 広告区間は `METHOD=NONE`。書換ロジックは暗号/非暗号の混在を正しく扱うこと（`METHOD=NONE` を鍵エンドポイントに書き換えない）。
- サムネ実 CDN URL は 06 と同じく未確定（本再生の可否には無関係）。

---

## 5. 段階（実装順）

1. **鍵導出の純関数化**: `src/lib/abema/licenseKey.ts`（base-N デコード + AES-ECB）＋ `src/utils/abema/hlsRewrite.ts` を
   yt-dlp `AbemaLicenseRH` の挙動に合わせて実装し、**オフラインの既知ベクタで単体テスト緑**（ネット不要な部分を先に固める）。
2. **解決系**: `streamResolver.ts`（usertoken→media token→m3u8）を JP-egress 前提で実装。まず **ライブ(now-on-air)**、次に VOD。
3. **API 3 本**: `streaminglink` / `abema/hls`（書換）/ `abema/key`（生鍵）。TVER hls route の CORS/Range 踏襲。
4. **プレイヤー結線**: §3.1 の対処（`VideoPlayer` に `proxy` プロパティ or `AbemaVideoPlayer`）→ `useAbemaStream` → 再生ページ。
5. **UI 差し替え**: `AbemaCard`/`AbemaLiveHero`/`AbemaEpg` のクリックをアプリ内再生へ（フラグで外部リンクにフォールバック可）。
6. **検証**: (a) 純関数テスト緑・`tsc --noEmit`・`build`・`cf:build`、(b) JP-egress 環境（or Azure キー供給後）でライブが実再生できること、
   (c) 未整備環境で外部リンクにフォールバックすること。**dev サーバは検証後に必ず停止**（PID 管理・orphan 厳禁。CLAUDE.md 教訓）。

---

## 6. 変更/新規ファイル一覧

新規:
- `src/app/api/service/abema/streaminglink/route.ts`
- `src/app/api/service/abema/hls/route.ts`
- `src/app/api/service/abema/key/route.ts`
- `src/lib/abema/streamResolver.ts`（+ `.test.ts` / `.live.test.ts`）
- `src/lib/abema/licenseKey.ts`（+ `.test.ts`）
- `src/utils/abema/hlsRewrite.ts`（+ `.test.ts`）
- `src/hooks/useAbemaStream.ts`
- `src/app/service/abema/live/[channelId]/page.tsx`
- `src/app/service/abema/watch/[slotId]/page.tsx`
- （§3.1 (B) を採る場合）`src/components/atomicDesign/atoms/AbemaVideoPlayer.tsx`

変更:
- `src/components/atomicDesign/atoms/VideoPlayer.tsx`（§3.1 (A) を採る場合のみ。任意プロパティ `proxy` を追加し既存呼び出しは無改修）
- `src/components/atomicDesign/molecules/abema/AbemaCard.tsx`（外部リンク → アプリ内再生遷移）
- `src/components/atomicDesign/molecules/abema/AbemaLiveHero.tsx`（同上・再生ボタン）
- `src/components/atomicDesign/molecules/abema/AbemaUpNext.tsx`（同上）
- `src/components/atomicDesign/molecules/abema/AbemaEpg.tsx`（セルのクリックを再生へ）
- `src/lib/features.ts`（`ABEMA_INAPP_PLAYBACK_ENABLED` フラグ追加）

---

## 7. 非目標（本書で約束しないこと）

- **ブラウザ単体（バックエンド無し）でのアプリ内再生**（`abematv-license://` の鍵解決不能のため。技術的に不可）。
- **Azure コードキー不在のままでの E2E 再生の保証**（キー供給 or 自前 JP-egress 解決の整備が前提。未検証）。
- **VOD の即時対応**（media token の壁があるため、まずライブから。VOD は後続）。
- ABEMA 側ユーザー機能（予約・お気に入り等）。本書は再生導線のアプリ内化に限定する。
</content>
</invoke>
