# ABEMA 世界 実装設計書（06-abema-impl-plan）

- 対象: `tvapp-web / xiaovy.tvapp.web`（`src/` 配下のみ。参照宣言外は触らない）
- 位置づけ: マルチサービス統合ビューアの ABEMA 世界（`service === 'abema'`）を「実現可能な範囲」に限定して実装する設計書。
- 参照モック: `docs/reference/03_decisions/multiservice-home-v2.html` の `#ab`（緑×黒 / 生放送ファースト / 番組表）
- 構造参考: `src/components/atomicDesign/organisms/TverHome.tsx` と `src/utils/tver/homeView/*`
- ステータス: 設計（未着手）。実装は別ブランチ（例 `feature/abema-world-browse`）。

> 本書は事実準拠。実現性調査（別途実施）の結論をそのまま前提にし、**過度な約束をしない**。
> 要点: ブラウズ（番組表 + チャンネル）は公開 API で実装可能／再生は DRM で不可（外部リンク導線に留める）。

---

## 0. 結論（TL;DR）

| 論点 | 判定 | 実装方針 |
|---|---|---|
| チャンネル一覧 | 可能（公開 API・認証不要） | `/api/service/abema/channels` で代理取得し正規化 |
| 番組表（EPG） | 可能（公開 API・認証不要） | `/api/service/abema/slots?date=YYYY-MM-DD` で代理取得し正規化 |
| 今放送中 / このあと | 可能（EPG から純関数で導出） | `startAt<=now<endAt` で live、以降を up-next |
| ランキング / VOD 一覧 | **不可**（401・usertoken 必須） | ランキングとしては出さない。EPG 由来の「本日のピックアップ」に置換し、正直に命名 |
| サムネ実 URL | **未確定**（推測パス全 404） | CSS グラデーション・プレースホルダ（`ag1..ag9` 相当）を主。実 URL は best-effort + `onError` フォールバック |
| アプリ内再生 | **不可（DRM）** | hls.js に配線しない。「ABEMA で視聴」外部リンク + 「アプリ内再生不可」明示 |

---

## 1. データ層

### 1.1 実現性の前提（調査結論の要約）

- 公開・認証不要で取得可能:
  - `GET https://api.abema.io/v1/channels` → 線形 51ch。各 `{ id, name, playback.hls, playback.dash, gnid }`。
  - `GET https://api.abema.io/v1/broadcast/slots?dateFrom=YYYY-MM-DD` → 番組表。実測サンプル 53 件/日。各 slot に
    `{ id, title, startAt, endAt(unix秒), channelId, highlight, detailHighlight, content(あらすじ),
    thumbnails{default, scenes:[{id,version,name}]}, timeshiftEndAt, timeshiftFreeEndAt, credit, labels,
    shares.links(abema.go.link ディープリンク) }`。
- 認証必須（401 "authorization header must exist"・デバイス登録 + HMAC 署名 usertoken bearer が要る）:
  `/v1/contentlist/ranking`・`/v1/video/programs/{id}`・`/v1/media`。→ **MVP では扱わない**。
- サムネ: メタ（id/version/name）は取れるが実 CDN URL 構築は未確定（旧 `hayabusa.io` は DNS 消滅、
  `image.p-c3-e.abema-tv.com` は名前解決するが推測パスは全 404）。→ 実 URL に依存しない設計にする。

### 1.2 API ルート（BFF・サーバー代理）

TVER と同じく Next.js の Route Handler で公開 API を代理する（CORS 回避・ヘッダ付与・キャッシュ・将来の usertoken 化の受け皿）。

- `src/app/api/service/abema/channels/route.ts`
  - `GET` → `https://api.abema.io/v1/channels` を代理。`Origin`/`User-Agent` などのヘッダを付けて取得。
  - 正規化して `{ channels: AbemaChannel[] }` を返す。`Cache-Control`（例 `s-maxage=600`）で軽くキャッシュ。
- `src/app/api/service/abema/slots/route.ts`
  - `GET ?date=YYYY-MM-DD`（省略時は JST の今日）→ `.../v1/broadcast/slots?dateFrom=<date>` を代理。
  - `date` は `^\d{4}-\d{2}-\d{2}$` で厳格バリデーション（不正は 400）。
  - 正規化して `{ date, slots: AbemaSlot[] }` を返す。`s-maxage=120` 程度。
- エラー時は TVER ルート同様 `NextResponse.json({ error }, { status })`。上流 401/5xx はそのままステータス反映し、
  クライアントは「一時的に取得不可」を表示（後述 UI のエラーステート）。

> 実装上の注意: これらのルートは Cloudflare Workers（OpenNext）で動く。`fetch` のみ使用し
> `firebase-admin`/Node 専用 API は使わない（段階2の Workers 非互換問題を踏襲しない）。

### 1.3 型定義

- `src/types/abema/rawApi.ts` — 上流 API の生レスポンス型（`RawAbemaChannel`, `RawAbemaSlot`, `RawAbemaSlotsResponse` 等。
  未使用フィールドは `[key: string]: unknown` で許容）。
- `src/types/abema/view.ts` — 画面用の正規化型:
  - `AbemaChannel { id; name; gnid; hls?; dash?; watchUrl }`
  - `AbemaSlot { id; channelId; title; startAt; endAt; startMs; endMs; content?; highlight?; labels?; thumbKey; watchUrl; timeshiftEndAt? }`
  - `AbemaLiveSlot extends AbemaSlot { progressPercent }`
  - `AbemaEpgGrid { window:{startMs,endMs}; columns:{label;startMs}[]; rows: AbemaEpgRow[]; nowPercent }`
  - `AbemaEpgRow { channel: AbemaChannel; cells: AbemaEpgCell[] }`, `AbemaEpgCell { slot: AbemaSlot; colStart:number; colSpan:number; isLive:boolean }`
  - `AbemaShelf { key; title; note; items: AbemaSlot[] }`
  - `AbemaTickerItem { id; badge; badgeVariant:'live'|'reserve'; text }`

### 1.4 変換（純関数 + テスト）

TVER の `src/utils/tver/homeView/*`（純関数 + `*.test.ts`・vitest）に倣い、副作用ゼロで単体テスト可能にする。

- `src/utils/abema/normalizeChannel.ts` — `RawAbemaChannel → AbemaChannel`。`watchUrl` は `https://abema.tv/now-on-air/{id}` を組み立て。
- `src/utils/abema/normalizeSlot.ts` — `RawAbemaSlot → AbemaSlot`。unix 秒 → ms、`watchUrl` は `shares.links` 優先、無ければ
  `https://abema.tv/channels/{channelId}/slots/{id}`。`thumbKey` は後述の決定的グラデーションキー。
- `src/utils/abema/homeView/deriveLiveNow.ts` — `(slots, now) → AbemaLiveSlot[]`（`startMs<=now<endMs`、`progressPercent` 付き）。
- `src/utils/abema/homeView/deriveUpNext.ts` — `(slots, now, limit=5) → AbemaSlot[]`（`startMs>now` を昇順で limit 件）。
- `src/utils/abema/homeView/deriveEpgGrid.ts` — `(channels, slots, now, windowHours=5, slotMinutes=30) → AbemaEpgGrid`。
  時間窓（例 現在時刻の 30 分前起点で 5 時間）を 30 分刻みの列に割り、各 slot を `colStart/colSpan` に写像（窓外はクリップ）。
- `src/utils/abema/homeView/deriveNowPercent.ts` — `(window, now) → number`（0..100、NOW 線位置）。
- `src/utils/abema/homeView/deriveShelves.ts` — `(slots, channels) → AbemaShelf[]`。EPG をチャンネル/ラベルでまとめ、
  **「ランキング」ではなく「本日のピックアップ」**として提示（例 「アニメの本日の番組」「生放送中」「まもなく放送」）。`note` に出典を明記。
- `src/utils/abema/homeView/thumbGradientClass.ts` — `(id) → 'ag1'..'ag9'`（id ハッシュの決定的割当。サムネ実 URL 不在時の見た目安定）。
- `src/utils/abema/homeView/deriveTicker.ts` — `(liveSlots, upNext, limit) → AbemaTickerItem[]`（LIVE と時刻バッジを混在）。
- テスト: 各 `*.test.ts`（境界: 空配列 / 窓外 slot / 日跨ぎ / now==startMs / 同一チャンネル重複 / limit）。CI の 80% カバレッジ・ゲートに寄与。

### 1.5 取得フック

- `src/hooks/useAbemaHome.ts` — `useTvHome.ts` と同型。`/channels` と `/slots` を並行取得し、
  `{ channels, slots, date, loading, error, reload }` を返す。SSR 安全（`typeof window` ガード不要な範囲でクライアント fetch）。

### 1.6 取得不可データの扱い（正直な代替）

- ランキング/VOD 一覧は出さない。モックの「アニメランキング WEEKLY TOP 6」等の枠は
  **EPG 由来の「本日のピックアップ（{ジャンル}）」に置換**し、見出し脇の注記に「番組表より抽出」と明記する
  （実測できない週間ランキングを偽装しない）。
- サムネは `thumbGradientClass` のグラデーションを主表示。将来サムネ URL が確定したら `<img onError>` で
  グラデーションへフォールバックする二段構えに拡張可能な props 設計にしておく。

---

## 2. UI（AbemaHome organism）

モック `#ab` の DOM を React 分解する。TVER の `TverHome`（organism が molecule を並べる）構成を踏襲。

### 2.1 コンポーネント分解

- `src/components/atomicDesign/organisms/AbemaHome.tsx`（TverHome 相当のトップ）
  - props: `{ channels, slots, now? }`。内部で純関数（§1.4）を呼び、以下を並べる。
  - `<section className="world ab-world" id="ab" role="tabpanel" aria-labelledby="dk-abema" aria-label="ABEMA ホーム">`
- molecules（`src/components/atomicDesign/molecules/abema/`）:
  - `AbemaLiveTicker.tsx` — 生放送ティッカー（`ab-tick`）。`deriveTicker` の結果を 2 連結して marquee。
  - `AbemaLiveHero.tsx` — 今放送中（`ab-live`）。先頭 live slot。ON AIR バッジ・チャンネルタグ・タイトル/あらすじ・
    進捗バー（`progressPercent`）・**「ABEMA で視聴」外部リンク**（`watchUrl`）。**視聴者数は実測不可のため出さない**
    （モックの「24,318 人視聴中」は架空値なので表示しない）。
  - `AbemaUpNext.tsx` — このあとの注目（`ab-next`）。`deriveUpNext` を時刻付きリスト表示。予約ボタンは
    「ABEMA で開く」外部リンクに置換（アプリ内予約機能は持たない）。
  - `AbemaEpg.tsx` — 番組表（`ab-epg`）。`deriveEpgGrid` を channel 行 × 時間列でレンダ。NOW 線は `nowPercent`。
    横スクロールコンテナ（`ab-epg-sc`）で min-width グリッド。
  - `AbemaShelf.tsx` — 本日のピックアップ（`ab-sec`）。`AbemaShelf` を横スクロール行でカード表示。
  - `AbemaCard.tsx` — 番組カード（`ab-card`/`ab-clk`）。サムネはグラデ、LIVE バッジ・時刻・チャンネル名。
    クリックは `watchUrl` への外部リンク（`target="_blank" rel="noopener"`）。
  - `AbemaFooter.tsx` — フッター（`ab-ft`）。
- 表示は「本アプリはブラウズ専用。再生は ABEMA で行う」旨を hero 付近と footer に静かに明示。

### 2.2 スタイル（globals.css へ `.ab-world` スコープで移植）

- 現状 `src/app/globals.css` は TVER 世界を `.tv-world` スコープで持ち（`#tv` id セレクタをクラス化済み）、
  `.ab-` は未定義。モック `#ab` の CSS（`docs/.../multiservice-home-v2.html` の「3. ABEMA 世界」節）を
  **`.ab-world` 配下にスコープして移植**する（`#ab` → `.ab-world`、子孫は `.ab-*` クラスをそのまま）。
- 緑×黒テーマの値は `serviceCatalog` の ABEMA メタと一致（`accent:#17e087` / `accentInk:#02180d`）。背景 `#02110a` 系。
- コメント流れる演出（`ab-cmt`）は装飾のみ・`aria-hidden`。実データではないので固定のダミー装飾に留め、
  視聴者数のような「数値の断定」はしない。

### 2.3 レスポンシブ（TVER の左右見切れ解消の知見を必ず踏襲）

TVER で確立した「左右見切れ無し」の実装知見を ABEMA にも適用する（globals.css 実測済みルール）:

- 世界ルートに `overflow-x:hidden; min-height:100vh`（`.tv-world` と同じ）を `.ab-world` にも付与し、ページ横スクロールを封じる。
- 横スクロール行（`.ab-row` / `.ab-epg-sc`）は **負の外側マージンを使わない**（モックの `margin-left:-22px` 相当は不採用）。
  代わりに `overflow-x:auto` + `scroll-padding-inline` + 内側パディングで見切れを防ぐ（TVER `.tv-row` と同方針）。
- コンテナは共通 `.wrap{max-width:1280px;margin:0 auto;padding:0 28px}`（狭幅 16px）。
- フレックス子に `min-width:0`（`ab-live-tt`・`ab-next .nm`・`ab-cm` 等）を付け、テキストは ellipsis で確実に収める。
- EPG グリッドは `min-width` を確保しつつ、親 `ab-epg-sc` の横スクロールに閉じ込める（ページ幅を押し広げない）。
- ブレークポイントは TVER 同様（`max-width:1000px`/`980px`/`640px`）でドック・EPG・top グリッドを 1 カラム化。
- 実装後は 3 モード（ライト/ダーク/印刷）ではなくアプリ画面として、狭幅〜広幅でスクショ確認（左右見切れゼロを目視）。

---

## 3. 再生

- **アプリ内再生は実装しない（DRM により不可）。** 事実:
  - 線形マスター m3u8 は HTTP200 で取れるが、メディア m3u8 が AES-128 で鍵 URI が `abematv-license://…`（非 HTTP の独自ライセンス方式）。
  - hls.js は http(s) 鍵 URI しか取得できず復号不可。EME/Widevine ではなく独自の派生鍵方式。
  - yt-dlp はサーバ側で鍵を導出して復号するが、ブラウザに等価手段はない。
    Azure Function（Platform-Stream-Loader）が返す `manifest_url` も `abematv-license://` を含み、そのままではブラウザ再生不可。
- **導線: 「ABEMA で視聴」外部リンク**。各カード/hero/EPG セルの `watchUrl`（`shares.links` の `abema.go.link` 優先、
  無ければ `abema.tv/...`）を `target="_blank" rel="noopener noreferrer"` で開く。
- **明示**: hero と footer に「本アプリ内では再生できません。再生は ABEMA アプリ/サイトで行われます」を静かに表示。
  誇大表現・視聴者数など架空値は出さない。
- 将来拡張（本書では実装しない）: サーバ側で yt-dlp 相当の鍵導出を再実装し、m3u8 書き換え（`abematv-license://` → 自前 HTTP 鍵エンドポイント）
  + セグメント proxy を用意すれば実再生の可能性はあるが、大掛かり。VOD は前段の一覧/メタ取得から usertoken 必須で追加の壁。**MVP 対象外**。

---

## 4. Main.tsx の分岐差し替え

`src/components/atomicDesign/pages/Main.tsx` の末尾分岐を、`service==='abema'` のとき `AbemaHome` を出すよう変更する。

現状:

```tsx
return service === 'tver'
    ? <TverHome rankingLabels={rankingLabels} rankingContents={rankingContents} />
    : <ComingSoonWorld service={service} />;
```

変更後（TVER のデータ取得ゲートに ABEMA を巻き込まない点に注意 — ABEMA は独自フックで取得）:

```tsx
if (service === 'abema') {
  return <AbemaHomeContainer />;   // useAbemaHome を内包し、loading/error を自前で扱う
}
return service === 'tver'
    ? <TverHome rankingLabels={rankingLabels} rankingContents={rankingContents} />
    : <ComingSoonWorld service={service} />;
```

- 実装メモ: 現 `Main` は TVER 用の `session`/`tvHomeData` が揃うまで全体を Loading にしている。ABEMA は TVER セッションに依存しないため、
  ABEMA 分岐は **その依存ゲートより前**で早期 return するか、`AbemaHomeContainer`（`useAbemaHome` を内包し loading/error/空を自前描画）に切り出す。
  これにより「ABEMA を開いているのに TVER データ待ちで固まる」事故を防ぐ。
- 認証: 現 `Main` はログイン必須（未認証は `/user/login`）。ABEMA もこのゲートの内側（ログイン後）に置く。公開 API だが導線は既存踏襲。
- `serviceCatalog.ts` の ABEMA `ready` は現状 `false`。差し替え完了時に `true` へ更新（`ComingSoonWorld` 経路から外す）。

---

## 5. 変更/新規ファイル一覧

新規:
- `src/app/api/service/abema/channels/route.ts`
- `src/app/api/service/abema/slots/route.ts`
- `src/types/abema/rawApi.ts`
- `src/types/abema/view.ts`
- `src/utils/abema/normalizeChannel.ts`（+ `.test.ts`）
- `src/utils/abema/normalizeSlot.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveLiveNow.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveUpNext.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveEpgGrid.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveNowPercent.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveShelves.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/deriveTicker.ts`（+ `.test.ts`）
- `src/utils/abema/homeView/thumbGradientClass.ts`（+ `.test.ts`）
- `src/hooks/useAbemaHome.ts`
- `src/components/atomicDesign/organisms/AbemaHome.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaLiveTicker.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaLiveHero.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaUpNext.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaEpg.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaShelf.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaCard.tsx`
- `src/components/atomicDesign/molecules/abema/AbemaFooter.tsx`

変更:
- `src/components/atomicDesign/pages/Main.tsx`（`service==='abema'` 分岐で `AbemaHome` 系を描画）
- `src/app/globals.css`（`.ab-world` スコープで ABEMA 世界 CSS を移植・左右見切れ対策込み）
- `src/utils/service/serviceCatalog.ts`（ABEMA `ready: true` へ更新）

---

## 6. 段階（実装順）

1. データ層: 型 → 2 本の API ルート → 純関数 + テスト（vitest 緑）。上流 API はサーバー側で疎通確認。
2. UI: `.ab-world` CSS 移植 → molecules → `AbemaHome` 組み上げ（モックデータで先に見た目確定）。
3. 結線: `useAbemaHome` → `AbemaHome`、`Main.tsx` 分岐差し替え、`serviceCatalog.ready` 更新。
4. 検証: 実 API で番組表/チャンネルが出ること、外部リンクが開くこと、狭幅〜広幅で左右見切れゼロ、再生不可の明示があること。
   dev サーバは検証後に必ず停止（PID 管理・orphan 残さない）。

## 7. 非目標（本書で約束しないこと）

- アプリ内でのライブ/VOD 再生（DRM のため）。
- ランキング/VOD 一覧の再現（usertoken 必須のため）。
- サムネイル実 CDN 画像の確実な表示（URL 未確定のため。グラデーション代替を主とする）。
- 予約/お気に入り等の ABEMA 側ユーザー機能（アプリはブラウズ + 外部リンクに留める）。
