# TVER 再設計 — Codex 実装指示書(Implementation Brief)

- 対象リポジトリ: `xiaovy.tvapp.web`(Next.js 16 App Router / React 19 / Tailwind 3.4 / atomic design)
- 実装の正(モック): `docs/reference/03_decisions/multiservice-home-v2.html`
  - ヘッダー/ドック DOM: 1204〜1241 行(`.hd` / `.dk` / `.hd-sr` / `.hd-u`)
  - TVER 世界(タブパネル): 1248 行 `<section class="world" id="tv" role="tabpanel" aria-labelledby="dk-tver">`(クラス接頭辞 `tv-`)
  - サービス切替 JS(初期化・キーボード・ユーザーメニュー): 1795〜1897 行
- 詳細設計(この指示書の親): `docs/reference/02_architecture/03-tver-redesign-impl-plan.md`(トークン値・props 型・データ対応の一次情報。**迷ったら必ずこちらを参照**)
- スコープ: ホーム画面(`/`)のビジュアルを「TVER ビビッド高密度デザイン」に差し替える。**データ取得ロジック(`useSession → useTvHome → convertRankingToCardData`)は 1 行も変えない**。見た目のみ差し替える。
- サービス切替は TVER のみ実装。ABEMA / YouTube / niconico は「準備中」プレースホルダのタブとして骨組みだけ置く。

本書は客観的事実(モック実測値・既存コードの構造・CI ゲートの定義)のみを記述する。

---

## 0. 不可侵の制約(先に頭に入れる)

1. **データフロー不変**: `pages/Main.tsx` の先頭フック群(`useRouter/useAuth/useFirebaseAuth/useSessionService/useTvHomeService`)と 2 つの `useEffect`(認証リダイレクト・ランキング合成)は現状維持。変更は `return` の JSX と `useService()` 追加のみ。
2. **既存コンポーネントを消さない**: `ContentCard` / `ContentCardList` / `molecules/Header.tsx` は残す(他ページ参照・段階2機能のため)。ホームからの参照が無くなるだけ。`layout.tsx` の import 先だけ差し替える。
3. **CI ゲート(4 段。1 つでも落とさない)** — `.github/workflows/ci.yml`:
   - `npx tsc --noEmit`
   - `npm run test:coverage`(coverage `include` は `src/lib/**` と `src/utils/**` のみ。閾値 80%: lines/functions/branches/statements)
   - `npm run build`
   - `npm run cf:build`(OpenNext ビルド)
4. **カバレッジ対象の原則**: 新規の派生ロジックは**必ず `src/utils/` 配下の純関数**にし `*.test.ts` を付ける(未テストの util を追加するとゲートが落ちる)。コンポーネント(`src/components/**`)はカバレッジ対象外だが、回帰防止のため `*.test.tsx` を作る。
5. **`next lint` に依存しない**(Next 16 で廃止。CI は `tsc + test + build + cf:build` で担保)。
6. **dev サーバは検証後に必ず停止**(PID 管理。orphan 化厳禁。教訓 §CLAUDE.md)。
7. **段階2(視聴履歴/お気に入り/プロフィール)は既定 OFF**(`PHASE2_USER_DATA_ENABLED`)。`ResumeBand` は履歴依存のため、MVP では `items.length===0` でセクションごと非表示にする(履歴取得は行わない)。

---

## 1. 変更対象ファイル一覧

### 1.1 新規作成 — util(カバレッジ対象・テスト必須)

| # | ファイル | 役割 |
|---|---|---|
| U1 | `src/utils/tver/homeView/deriveExpiryLabel.ts` | `endAt`(UNIX 秒)→ 期限ラベル文字列 or null |
| U2 | `src/utils/tver/homeView/deriveFeatured.ts` | 総合ランキング → ヒーロー用 `FeaturedContent | null` |
| U3 | `src/utils/tver/homeView/deriveTickerItems.ts` | ランキング → ティッカー項目配列 |
| U4 | `src/utils/tver/homeView/deriveEndingSoon.ts` | 全ラベル横断で本日終了を重複排除・最大4件 |
| U5 | `src/utils/tver/homeView/sectionAccentForLabel.ts` | ラベル index → セクションアクセント(決定論・循環割当) |
| U6 | `src/utils/service/serviceCatalog.ts` | `ServiceId` / `ServiceMeta` / `SERVICES` / `isReady` |
| U7 | `src/utils/tver/homeView/types.ts`(任意) | `FeaturedContent` / `TickerItem` / `SectionAccent` 型集約 |

対応する `*.test.ts`: U1〜U6 それぞれに同ディレクトリで作成(§6.1)。

### 1.2 新規作成 — Context

| # | ファイル | 役割 |
|---|---|---|
| C1 | `src/contexts/ServiceContext.tsx` | `ServiceProvider` / `useService`。選択サービス state・localStorage・ハッシュ・`data-svc` 同期 |

### 1.3 新規作成 — atoms(`src/components/atomicDesign/atoms/`)

`ServiceDockButton.tsx` / `RankBadge.tsx` / `HotBadge.tsx` / `GenreTag.tsx` / `ExpiryLabel.tsx` / `CardThumbnail.tsx` / `IconLogo.tsx` / `TverButton.tsx`

### 1.4 新規作成 — molecules(`src/components/atomicDesign/molecules/`)

`ServiceDock.tsx` / `SearchBar.tsx` / `UserMenu.tsx` / `CategoryChips.tsx` / `TrendingTicker.tsx` / `RankingShelfCard.tsx` / `RankingShelf.tsx` / `ResumeBand.tsx` / `EndingSoonBand.tsx`

### 1.5 新規作成 — organisms(`src/components/atomicDesign/organisms/`)

`AppHeader.tsx` / `TverHero.tsx` / `TverHome.tsx` / `ComingSoonWorld.tsx` / `TverFooter.tsx`

### 1.6 改修(既存ファイル)

| ファイル | 変更 |
|---|---|
| `src/app/globals.css` | `tv-` 系 component クラス移植(モック CSS 205〜461 行を `@layer components` に。`#tv`→`.tv-world` 置換)。`.hd-*` / `.dk-*` ヘッダークラスも移植。`html[data-svc=...]` の body/世界地色連動も。 |
| `tailwind.config.ts` | `theme.extend` に色・角丸・ハードシャドウ・keyframes/animation を追加(設計書 §1.7 の値をそのまま) |
| `src/app/layout.tsx` | `import Header` → `import { AppHeader }`。`<Header />` → `<AppHeader />` |
| `src/app/providers.tsx` | `ServiceProvider` を追加し、`children`(=Header/Main を含む)を包む位置に配置 |
| `src/app/page.tsx` | ラッパの `max-w-6xl mx-auto p-0 xl:p-14` を撤去し `<main><Main /></main>` の素通しに(幅は各世界の `.wrap` が制御) |
| `src/components/atomicDesign/pages/Main.tsx` | `useService()` 追加 + `return` を `service==='tver' ? <TverHome …/> : <ComingSoonWorld service={service}/>` に差し替え(フック・useEffect は不変) |
| `src/components/atomicDesign/molecules/BrandPanel.tsx` | ログイン画面のプレースホルダ swoosh SVG をブランドワードマークに差し替え(§5) |
| `src/app/favicon.ico` / `src/app/icon.png`(追加) | ブランドアイコン適用(§5) |

### 1.7 再利用(そのまま使う)

- `atoms/ProfileAvatar.tsx`(props: `{ photoURL, userName, size, className }`)→ `UserMenu` のアバター
- `app/themeToggleSwitch.tsx`(`ThemeToggleSwitch`)→ `UserMenu` 内のダークトグル
- `molecules/ConfirmationModal.tsx`(props: `{ isOpen, onClose, onConfirm, title, confirmText, cancelText }`)→ ログアウト確認
- `contexts/AuthContext.tsx`(`useFirebaseAuth().user / clearAllAuthState`)→ `UserMenu` のログアウト
- 既存 `atoms/Button.tsx` はヒーロー CTA には使わない(`.tv-btn` が特殊なため `TverButton` 新設)

---

## 2. 実装順序(トークン → ヘッダー → ヒーロー → シェルフ → 組み込み)

> 各ステップの完了ごとに `npx tsc --noEmit` を通し、util 追加時は同時にテストを書いて `npm run test:coverage` が緑を保つことを確認しながら進める(壊れた状態を残さない)。

### ステップ 0 — util 層 + テスト(カバレッジ先行確定)

1. `serviceCatalog.ts`(U6)を作成。`SERVICES` は設計書 §4.1 の 4 件をそのまま。`isReady` は TVER のみ true。
2. `deriveExpiryLabel` / `deriveFeatured` / `deriveTickerItems` / `deriveEndingSoon` / `sectionAccentForLabel`(U1〜U5)を純関数で作成。`now` は第 2 引数注入可(既定 `Date.now()`)。TZ は JST 前提。
3. 各 `*.test.ts` を同時作成(§6.1)。ここで `npm run test:coverage` が 80% を満たすことを確認。

### ステップ 1 — トークン(CSS/Tailwind)

4. `globals.css` にモック CSS(205〜461 行の `tv-` 群 + ヘッダー `.hd-*` / `.dk-*`)を `@layer components` として移植。セレクタ `#tv` は `.tv-world` に一括置換。`html[data-svc="tver"] body{background:#fff7e9}` 等の世界地色連動も移植(モック 37〜40 行)。
5. `tailwind.config.ts` の `theme.extend` に色(`tver.*` / `tv-sec.*`)・`borderRadius`(card/thumb)・`boxShadow`(hard 系)・`keyframes`/`animation`(`tv-marquee` / `tv-blink`)を追加。既存の `fade-out` は残す。
6. **視覚確認の下地**: この時点で `.tv-world` にダミー DOM を当てて崩れが無いかを確認できるが、必須ではない。

### ステップ 2 — ヘッダー(Context → atoms → molecules → AppHeader)

7. `ServiceContext.tsx`(C1)。初期値は ハッシュ > localStorage(キー `tvapp-svc-v2`)> `'tver'`(モック 1885〜1896 行と同一仕様)。`setService` は `document.documentElement.setAttribute('data-svc', s)` と localStorage・`history.replaceState('#'+s)` を行う。SSR 安全化(`useEffect` 内で初期化・`typeof window` ガード)。
8. `providers.tsx` に `<ServiceProvider>` を追加(Header と Main を同時に包む位置)。
9. atoms: `IconLogo`(モック 1208〜1213 のタイル+波形 SVG。`fill:var(--hd-acc)`)/ `ServiceDockButton` / `TverButton`。
10. molecules: `ServiceDock`(`role="tablist"`・←→ 移動・`1〜4` 選択、入力欄フォーカス中は数字キー無効)/ `SearchBar`(placeholder はサービス連動)/ `UserMenu`(`ProfileAvatar` + 氏名 + `role="menu"` ドロップダウン・外側クリック/Esc で閉じる・`ThemeToggleSwitch` + `ConfirmationModal` ログアウト)。
11. organism: `AppHeader`(`sticky top-0`。ログイン/登録 pathname では `null` を返す挙動を現 `Header.tsx` から継承)。
12. `layout.tsx` の `<Header />` を `<AppHeader />` に差し替え。ヘッダー単体で目視(ドック切替・キーボード・ユーザーメニュー開閉)。

### ステップ 3 — ヒーロー(atoms → TverHero)

13. atoms: `CardThumbnail`(`next/image` `unoptimized`/`fill`/`sizes`、ビネット `::before`、`.tv-tht`/`.tv-ep` オーバーレイ。**尺 `.tv-dur` はデータ無しのため出さない**)。
14. organism: `TverHero`(`featured = deriveFeatured(総合)`。null で非表示。コピーは定型文 + `seriesTitle` 差し込み〔設計書 §3.5〕。CTA は `TverButton`×2)。

### ステップ 4 — シェルフ(atoms → RankingShelfCard → RankingShelf → 帯)

15. atoms: `RankBadge`(rank 1/2/3 → r1/r2/r3、それ以外は白。`aria-label="${rank}位"`。**旧 SVG 画像バッジは使わず CSS 円形**)/ `GenreTag` / `ExpiryLabel`(`deriveExpiryLabel` を呼ぶだけ・null で非描画)/ `HotBadge`(MVP は `last`(本日終了)のみ表示)。
16. molecules: `RankingShelfCard`(1 リッチカード `.tv-clk`。リンク `/episode/${id}`)/ `RankingShelf`(`.tv-sec`。ヘッダー `.tv-sech` + `.tv-row` に card を map。`accent` で `s-pink/…` 付与)。
17. molecules: `TrendingTicker`(`deriveTickerItems`。0 件で非表示。`aria-hidden`・28s マーキー)/ `CategoryChips`(MVP 静的リンク)/ `EndingSoonBand`(`deriveEndingSoon`。0 件で非表示)/ `ResumeBand`(段階2 依存・MVP は空で非表示)。

### ステップ 5 — 組み込み(TverHome / ComingSoonWorld / Main / page)

18. organism: `TverHome`(`.tv-world` ルート・`role="tabpanel" aria-labelledby="dk-tver"`。順序: `TrendingTicker` → `CategoryChips` → `TverHero` → `ResumeBand`(条件付き)→ `RankingShelf`×N(`rankingLabels` を map・`sectionAccentForLabel(label,index)` で色)→ `EndingSoonBand` → `TverFooter`)。
19. organism: `ComingSoonWorld`(サービス配色で「準備中」パネル + TVER へ戻る導線・`role="tabpanel"`)/ `TverFooter`。
20. `Main.tsx` の `return` 差し替え、`page.tsx` ラッパ調整(§1.6)。
21. ブランド適用(§5)。

### ステップ 6 — テスト・検証

22. コンポーネント `*.test.tsx`(§6.2)。
23. `npx tsc --noEmit` → `npm run test:coverage`(80% 維持)→ `npm run build` → `npm run cf:build` を全通過。
24. `npm run dev` で目視(ライト/ダーク/印刷・横スクロール・ハードシャドウ・マーカー下線・フォーカスリング・ドック切替・キーボード)。**検証後に dev サーバを必ず停止し `ps` で残存ゼロ・ポート解放を確認**。

---

## 3. 各コンポーネントの受け入れ基準(Acceptance Criteria)

> props 型の一次情報は設計書 §2。ここでは「満たすべき観察可能な振る舞い」を定義する。

### 3.1 Context / util

- **`ServiceContext` / `useService`**: 初期値が ハッシュ > localStorage(`tvapp-svc-v2`)> `'tver'` の優先で決まる。`setService` 呼び出しで `document.documentElement` の `data-svc` 属性・localStorage・URL ハッシュが更新される。Provider 外での `useService` 呼び出しは明示エラー(または既定 `'tver'`)。SSR で `window` 参照エラーを出さない。
- **`deriveExpiryLabel(endAt, now?)`**: `endAt===0`・過去・遠未来(>90日)→ `null`。本日中(now〜今日 23:59:59 JST)終了 → 「本日 HH:MM 終了」(または残り時間表記)。それ以外 → 「あと N日」(切り上げ)。
- **`deriveFeatured(contents)`**: 空配列 → `null`。非空 → 先頭(1位)を採用。`seriesTitle` 欠落時は `title` にフォールバック。
- **`deriveTickerItems(contents)`**: 空 → `[]`。上位数件 + 本日終了は「まもなく終了」ラベルで混在。件数上限を守る。
- **`deriveEndingSoon(all, now)`**: 全ラベル横断で本日終了を抽出、`id` で重複排除、最大4件。該当なし → `[]`。
- **`sectionAccentForLabel(label, index)`**: `index` を `['s-pink','s-yellow','s-blue','s-orange','s-purple']` に循環割当。同 `index` は常に同色(決定論)。先頭(総合)はピンク。
- **`serviceCatalog`**: `SERVICES` 4 件・`hint` は `'1'..'4'` で一意・TVER のみ `ready:true`。`isReady('tver')===true`、他 `false`。

### 3.2 atoms

- **`ServiceDockButton`**: `role="tab"`・`aria-selected={selected}`・`aria-controls="tv"`・`tabIndex={selected?0:-1}`。`ready===false` は淡色 + 「準備中」を `title`/`aria-disabled` で提示(選択自体は可能)。クリックで `onSelect(service)`。左にドット(色 `accent`)。
- **`RankBadge`**: rank=1/2/3 で `r1`/`r2`/`r3` クラス、4 以上は無印(白)。`aria-label="${rank}位"`。
- **`HotBadge`**: `kind` に応じ `up`(ピンク)/`nw`(青)/`lst`(黒地黄字)。MVP では `last` のみ実描画される想定。
- **`GenreTag`**: `.tv-gn` ピルで `label` を表示。
- **`ExpiryLabel`**: `deriveExpiryLabel(endAt)` が `null` なら**何も描画しない**。非 null ならそのテキストを `.tv-lf` で表示。
- **`CardThumbnail`**: `img` の `alt` は `title`、`src` はサムネ URL。`.tv-tht`(seriesTitle)オーバーレイを重ねる。`episodeLabel` があれば `.tv-ep` を出す。尺は出さない。
- **`IconLogo`**: ヘッダーのタイル+波形ロゴを描画。`.lg-wm`「TVapp」+ `.lg-sub`「Multi Stream」を伴う。
- **`TverButton`**: `variant='primary'` は `.tv-btn.p`(黄)、`'ghost'` は `.tv-btn.g`。`href` があればリンク、なければ `onClick` ボタン。

### 3.3 molecules

- **`ServiceDock`**: `role="tablist"` に 4 タブ描画。クリックで `onSelect`。←→ でドック内フォーカス移動、`1〜4` で選択(document レベル。入力欄フォーカス中は数字キー無効)。
- **`SearchBar`**: `type="search"`。placeholder は選択サービスの `searchPlaceholder` を反映。submit で `onSubmit(q)` を呼ぶ(遷移は MVP 任意)。
- **`UserMenu`**: `ProfileAvatar` + 氏名 + ドロップダウン(`role="menu"`)。項目にダークトグル(`ThemeToggleSwitch`)とログアウトを含む。ボタンクリックで開閉、外側クリック・Esc で閉じる。ログアウトは `ConfirmationModal` 経由で `clearAllAuthState`。
- **`CategoryChips`**: `.tv-cat` に静的リンク群。`current` の項目に `aria-current="page"`。
- **`TrendingTicker`**: `items.length===0` で非表示。非空でマーキー描画(`aria-hidden`)。
- **`RankingShelfCard`**: リンク先が `/episode/${id}`。`seriesTitle`・放送局/日付(`.tv-st`)を表示。`rank` が 0/undefined ならバッジ非表示、それ以外は `RankBadge`。`endAt` から `ExpiryLabel`。
- **`RankingShelf`**: 見出しに `label`。`contents` の件数ぶんカードを描画。`accent` に対応する `s-*` クラスが付く。空 `contents` で行が空でも例外を出さない。
- **`EndingSoonBand`**: `items.length===0` で非表示。非空で `.tv-last` 帯に最大4件。
- **`ResumeBand`**: MVP は `items.length===0`(段階2 OFF)で**セクションごと非表示**。

### 3.4 organisms / page

- **`AppHeader`**: ロゴ・ドック・検索・ユーザーメニューが存在。`sticky top-0`。`pathname` が `/user/login` `/user/register` のとき `null`。
- **`TverHero`**: `featured` が `null` で非表示。非 null で h1(黄マーカー)・メタ・CTA・ヒーローアートを描画。
- **`TverHome`**: `rankingLabels` の数だけ `RankingShelf` を描画。`featured`・`ending-soon` は props/派生から供給。ルートに `.tv-world` と `role="tabpanel"`。
- **`ComingSoonWorld`**: サービス名・「準備中」表記・TVER へ戻る導線を含む。
- **`Main`**: `service==='tver'` で `<TverHome rankingLabels rankingContents/>`、それ以外で `<ComingSoonWorld service/>`。ローディング/未認証の早期 return は維持。

---

## 4. 既存データフロー維持の制約(再掲・厳守)

- `convertRankingToCardData` が返す `ConvertedContent`(`id, title, seriesID, endAt, seriesTitle, broadcasterName, productionProviderName, broadcastDateLabel, thumbnail:{small,xlarge}, rank`)を**そのまま**表示層へ渡す。フィールドの追加取得・API 追加呼び出しはしない。
- サムネ URL は合成済み(`thumbnail.small` を使用)。
- カード各要素の対応は設計書 §3.2 の表に従う(`.tv-st = ${productionProviderName||broadcasterName}・${broadcastDateLabel}`、`.tv-gn` は所属セクションの `label`、リンクは `/episode/${id}`)。
- データに無い要素(尺 `.tv-dur` / 増減 `.tv-hot ▲N` / 進捗 `.tv-rbar` / 検索ワード)は **MVP では省略 or 派生/定型**(設計書 §3.3)。捏造データを埋め込まない。
- `Main.tsx` の 2 つの `useEffect` と早期 return を保持。差し替えるのは最終 `return` の JSX と `useService()` の 1 行のみ。

---

## 5. ロゴの適用先(favicon / ヘッダー / ログイン)

ブランド成果物(`public/brand/`):
- `tvapp-icon-light.png` / `tvapp-icon-dark.png`(アイコン。1024px 正方相当)
- `tvapp-wordmark-light.png` / `tvapp-wordmark-dark.png`(ワードマーク)

適用先:
1. **favicon / アプリアイコン**: `src/app/favicon.ico` を差し替え、加えて Next.js App Router のメタデータ規約に沿って `src/app/icon.png`(= `tvapp-icon-light.png` 由来)を配置(自動で `<link rel="icon">` が付く)。必要なら `apple-icon.png` も。透過 PNG 前提。ダーク用アイコンは `<head>` のメディアクエリ指定が必要になるため MVP は light 基調 1 枚で可。
2. **ヘッダー(`AppHeader` / `IconLogo`)**: モックはインライン SVG(波形)を使用。**MVP はモック準拠の `IconLogo` SVG を採用**(`fill:var(--hd-acc)` のサービス連動が効くため)。ブランド PNG をヘッダーに使う場合は `next/image` で `tvapp-icon-*` を配置し、`.lg-wm`「TVapp」テキストは残す(どちらを採るかは崩れの少ない方を選ぶ)。
3. **ログイン画面(`molecules/BrandPanel.tsx`)**: 現在プレースホルダの swoosh SVG(`viewBox="0 0 36 24"`)を、`tvapp-wordmark-light.png`(パネルが濃色グラデ背景のため light ワードマーク)に差し替える。`next/image` で幅指定・`alt="TVapp"`。ログインページ本体は `src/app/user/login/page.tsx`。

いずれも `next/image` は `unoptimized` 方針(既存カードと整合。OpenNext/Workers で最適化サーバに依存しない)。

---

## 6. テスト要件

### 6.1 util テスト(カバレッジ対象・必須。これが 80% ゲートを支える)

同ディレクトリに作成。観点は設計書 §5.2 と一致:

| ファイル | 観点 |
|---|---|
| `utils/tver/homeView/deriveExpiryLabel.test.ts` | 本日終了 / あとN日 / null(0・過去・遠未来)/ JST 23:59 境界 / `now` 注入 |
| `utils/tver/homeView/deriveFeatured.test.ts` | 空→null / 1位採用 / `seriesTitle` 欠落時 `title` フォールバック |
| `utils/tver/homeView/deriveTickerItems.test.ts` | 件数上限 / 本日終了ラベル混在 / 空→[] |
| `utils/tver/homeView/deriveEndingSoon.test.ts` | 横断抽出 / `id` 重複排除 / 上限4 / 該当なし→[] |
| `utils/tver/homeView/sectionAccentForLabel.test.ts` | index 循環割当 / 決定論 |
| `utils/service/serviceCatalog.test.ts` | `isReady` / TVER のみ ready / 4件・hint 一意 |

- `now` は必ず引数注入して固定値でアサート(実時刻依存にしない)。`TZ=Asia/Tokyo` は vitest 設定で固定済み。
- **新規 util を追加してテストを付け忘れると 80% ゲートが落ちる**(coverage include が `src/utils/**` のため)。型のみのファイル(`types.ts`)は実行コードを持たせない(持たせるならテスト対象)。

### 6.2 コンポーネントテスト(回帰防止・カバレッジ対象外)

`@testing-library/react` + `jsdom`(導入済み)。`vi.mock` で `useService` / `useFirebaseAuth` / `next/navigation` の `useRouter`/`usePathname` をスタブ(既存テストの慣習に合わせる)。設計書 §5.3 の一覧を実装:

`atoms/RankBadge` / `atoms/ExpiryLabel` / `atoms/CardThumbnail` / `atoms/ServiceDockButton` / `molecules/ServiceDock` / `molecules/RankingShelfCard` / `molecules/RankingShelf` / `molecules/UserMenu` / `molecules/SearchBar` / `molecules/CategoryChips` / `organisms/AppHeader` / `organisms/TverHome` / `organisms/ComingSoonWorld` / `pages/Main`。

主アサーションは §3 の受け入れ基準を検証する形にする(例: `RankBadge` rank=1/2/3/5 でクラスと `aria-label`、`Main` は service 分岐で描画コンポーネントが変わる、など)。

### 6.3 実行

- `npm run test`(全体)/ `npm run test:coverage`(ゲート確認)。
- CI(`ci.yml`)は PR で `tsc --noEmit → test:coverage → build → cf:build` を回す。ローカルで同順に通してからコミット。

---

## 7. tsc / build / cf:build を壊さない制約

- **`npx tsc --noEmit` を緑に保つ**: props 型・`ServiceId` の union・`next/image` の型を正しく付ける。`any` に逃げない。未使用 import を残さない。
- **`"use client"`**: state/効果/`localStorage`/イベントを使うコンポーネント(Context・AppHeader・ServiceDock・UserMenu・TverHome 等)の先頭に付ける。util(`src/utils/**`)はクライアント/サーバ両用の純関数に保つ(`window` を直接触らない)。
- **`npm run build`(Next 16)**: サーバ/クライアント境界を守る。`app/page.tsx` は Server Component のまま(`<Main/>` が client)。
- **`npm run cf:build`(OpenNext/Workers)**: Node 専用 API・`firebase-admin` 等を新規に持ち込まない(段階2 は `deferred-phase2/` に退避済み)。`next/image` は `unoptimized` 方針を維持。
- **カバレッジ 80% ゲート**: §6.1 を満たせば維持される(コンポーネント追加は分母に入らない)。util を追加したら必ずテストを添える。

---

## 8. 完了定義(Definition of Done)

1. ホーム(`/`)が TVER ビビッド高密度デザインで描画され、既存ランキングデータがそのままカード/シェルフに反映される。
2. サービスドックで TVER↔他3(準備中)を切替でき、他は `ComingSoonWorld`。localStorage/ハッシュ/キーボードが機能。
3. ユーザーメニューにアバター+氏名+ドロップダウン(ダークトグル/ログアウト含む)。
4. ロゴが favicon・ヘッダー・ログインに適用されている(§5)。
5. `npx tsc --noEmit` / `npm run test:coverage`(80% 維持)/ `npm run build` / `npm run cf:build` が全通過。
6. ライト/ダーク/印刷の 3 モードで表示崩れが無い(横スクロール・ハードシャドウ・マーカー下線・フォーカスリング)。
7. dev サーバは検証後に停止済み(`ps` で残存ゼロ・ポート解放)。

---

## 9. コミット / ブランチ指針(AGENTS-SHARED §3)

- コミット本文は日本語・Conventional Commits 風接頭辞(`feat:` / `refactor:` / `chore:` 等)。**AI 署名・Co-Authored-By は付けない**。
- 意味のある最小単位ごとに commit & push(util+テスト → トークン → atoms → molecules → organisms → 組み込み → テスト、の粒度が目安)。
- 作業ブランチは `feature/<slug>-tver-redesign` 系(既存の作業ブランチ運用に合わせる)。ブランチ本数の見積もりはユーザー確認を経てから作成。
