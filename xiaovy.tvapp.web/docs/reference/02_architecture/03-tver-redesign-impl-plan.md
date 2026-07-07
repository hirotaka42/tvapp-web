# TVER ビビッド高密度デザイン — React 本番実装 詳細設計書

- 対象: `xiaovy.tvapp.web`(Next.js 16 App Router / React 19 / Tailwind 3.4 / atomic design)
- モック(実装の正): `docs/reference/03_decisions/multiservice-home-v2.html` の `#tv`(TVER の世界 / `tv-` プレフィックス CSS・DOM)
- スコープ: ホーム画面(`/`)のビジュアルを「TVER ビビッド高密度デザイン」に差し替える。**データフロー(`useSession → useTvHome → ランキング合成`)は保持し、見た目のみ差し替える。**
- 前提: サービス切替は TVER のみ実装。ABEMA / YouTube / niconico は「準備中」プレースホルダのタブとして骨組みだけ置く。
- 実装者(Codex)が迷わない粒度で、トークン値・props 型・ファイルパス・データ対応・テスト対象を確定させる。

本書は客観的事実(モックの実測値・既存コードの構造)のみを記述する。

---

## 0. 全体像(何をどう差し替えるか)

現状のレンダリング経路:

```
app/page.tsx  →  pages/Main.tsx
  Main: useAuth() / useFirebaseAuth() / useSessionService() / useTvHomeService(session)
      → getAllLabels() / getContentsByLabel() / convertRankingToCardData()
      → rankingLabels: string[], rankingContents: Record<label, ConvertedContent[]>
      → 各 label ごとに <h2> + <ContentCardList>
app/layout.tsx  →  <Header />(全ページ共通・ヘッダー / 右サイドバー)
```

差し替え後の経路(**データ取得ロジックは 1 行も変えない**。`Main` の JSX 出力だけを差し替える):

```
app/layout.tsx  →  <AppHeader />(新: ロゴ / サービスドック / 検索 / ユーザーメニュー)
app/providers.tsx  →  <ServiceProvider>(新: 選択サービス state を Header と Main で共有)
app/page.tsx  →  pages/Main.tsx(改修)
  Main: 既存フック群はそのまま
      → useService() で選択サービスを読む
      → service === 'tver' なら <TverHome labels rankingContents />
        それ以外なら <ComingSoonWorld service=... />
TverHome(新 organism): TrendingTicker / CategoryChips / TverHero / ResumeBand
      / RankingShelf[](rankingLabels を map)/ EndingSoonBand / TverFooter
```

要点:
1. `Main` は「データを持つ既存のロジック層」の責務を維持し、表示は `TverHome` に委譲する。
2. `ContentCard` / `ContentCardList`(既存)は series/genre など他ページで使われるため**残す**。ホーム専用に新カード(`RankingShelfCard`)を作る。
3. カバレッジ 80% ゲートは **`src/lib/**` と `src/utils/**` のみ**を対象(`vitest.config.ts`)。新規の派生ロジック(期限ラベル・アクセント割当・ヒーロー/ティッカー選定)は**必ず `src/utils/` の純関数**として置き、テストを付ける(未テストの util を追加するとゲートが落ちる)。コンポーネントの `*.test.tsx` はカバレッジ対象外だが、信頼性のため作成する。

---

## 1. デザイントークン

モック `#tv` は実測で以下の値を使用している(すべて `docs/reference/03_decisions/multiservice-home-v2.html` の CSS から抜粋)。

### 1.1 TVER 世界(コンテンツ領域)のトークン — ライト(既定)

TVER の世界は「紙面 × ステッカー × 熱量」= クリーム地・極太黒枠・ハードシャドウ(ぼかし 0)・高彩度アクセント。

| 用途 | CSS変数(提案) | 値 |
|---|---|---|
| 世界の地色 | `--tv-bg` | `#fff7e9`(ドット: `radial-gradient(rgba(20,16,8,.06) 1.2px,transparent 1.3px)` / `22px 22px`) |
| インク(枠・本文濃色) | `--tv-ink` | `#0d0d10` |
| 本文 | `--tv-tx` | `#141414` |
| サブ本文 | `--tv-tx2` | `#5a5a5a` |
| 主アクセント(黄) | `--tv-acc` | `#ffd400` |
| ピンク | `--tv-pink` | `#ff2e88` |
| ピンク濃(リンク強調) | `--tv-pink-ink` | `#d81b6a` |
| ダーク面(帯・resume/last) | `--tv-panel` | `#0d0d10` |
| ダーク面カード | `--tv-panel-card` | `#1b1b22`(枠 `#34343e`) |
| フォーカスリング | `--tv-focus` | `3px solid #ff2e88` / `outline-offset:3px` / `border-radius:6px` |

セクション別アクセント(`.tv-sec` の修飾クラス):

| variant | `--acc`(アクセント) | `--mk`(マーカー/淡色) |
|---|---|---|
| `s-pink` | `#ff2e88` | `#ffd0e4` |
| `s-yellow` | `#f5a300` | `#ffe89a` |
| `s-blue` | `#0091d8` | `#bdedff` |
| `s-purple` | `#6c2bd9` | `#e2d4ff` |
| `s-orange` | `#ff5d1f` | `#ffd9c2` |

### 1.2 太枠・角丸・ハードシャドウ

| 対象 | 枠 | 角丸 | 影(ぼかし 0 のオフセット影) |
|---|---|---|---|
| リッチカード `.tv-clk` | `2.5px solid #0d0d10` | `16px` | `5px 5px 0 var(--acc)` / hover `9px 9px 0 var(--acc)` |
| サムネ `.tv-th` | `2px solid #0d0d10` | `9px` | — |
| カテゴリチップ `.tv-cat a` | `2px solid #0d0d10` | `999px` | `2.5px 2.5px 0 #0d0d10` / hover `4px 4px 0` |
| ボタン `.tv-btn` | `2.5px solid #0d0d10` | `999px` | `4px 4px 0 #0d0d10` / hover `6px 6px 0`(+ `translate(-2px,-2px)`) |
| ランクバッジ `.tv-rk` | `2.5px solid #0d0d10` | `50%` | `2.5px 2.5px 0 rgba(13,13,16,.85)` |
| resume/last 帯 | — | `20px` | `6px 6px 0`(resume: `rgba(13,13,16,.22)` / last: `rgba(216,27,106,.5)`) |
| ヒーローアート `.tv-hero-art` | `3px solid #0d0d10` | `18px`(+ `rotate(1.3deg)`) | `10px 10px 0 #ff2e88` |

hover の基本挙動: `transform: translate(-2〜-3px,-2〜-3px)` + 影オフセット拡大(`transition: .16〜.18s ease`)。

### 1.3 タイポスケール

| 要素 | size / weight / その他 |
|---|---|
| ヒーロー h1 | `clamp(34px,4vw,52px)` / 800 / `line-height:1.16`。`em` に黄マーカー `linear-gradient(transparent 55%,#ffd400 55% 92%,transparent 92%)` |
| セクション h2 `.tv-sech h2` | `26px` / 800 / `italic` / マーカー `linear-gradient(transparent 58%,var(--mk) 58% 94%,transparent 94%)` |
| セクションタグ `.tag` | `12px` / 700 / `letter-spacing:.2em` / 黒地白字 / `rotate(-2deg)` |
| カード見出し `.tv-cm h3` | `14.5px` / 800 / `line-height:1.42` |
| サムネ内タイトル `.tv-tht` | `15px` / 800 / 白 / `text-shadow:0 2px 12px rgba(0,0,0,.5)` |
| カードサブ `.tv-st` | `11.5px` / 600 / `#5a5a5a` |
| ジャンルタグ `.tv-gn` | `10px` / 800 / `letter-spacing:.06em` / 枠 `1.5px` / 地 `var(--mk)` |
| 期限 `.tv-lf` | `11px` / 800 / `#d81b6a` |
| チップ `.tv-cat a` | `12.5px` / 800 |
| ティッカー `.tv-tick-seq` | `12.5px` / 700 / `letter-spacing:.06em` |
| 数字ラベル(条件付き) | `"Avenir Next Condensed","Arial Narrow",sans-serif` / `letter-spacing:.2em` |

フォント本体: 本文は既存 layout の Geist を継続しつつ、日本語は `"Hiragino Sans","Noto Sans JP",sans-serif` にフォールバック。数字装飾(EP.・TOP・更新時刻)のみ Condensed 系。

### 1.4 余白・レイアウト

- コンテナ `.wrap`: `max-width:1280px; margin:0 auto; padding:0 28px`(≤640px は `0 16px`)。
- セクション間 `.tv-sec`: `margin:46px 0`。
- 横スクロール行 `.tv-row`: `display:flex; gap:22px; overflow-x:auto; padding:20px 8px 26px 22px; margin-left:-22px; scroll-snap-type:x proximity`。カード `.tv-card`: `flex:0 0 258px; scroll-snap-align:start`。スクロールバーは黒 `#0d0d10`。
- ヒーロー `.tv-hero`: `grid-template-columns:1fr 1.02fr; gap:40px`(≤920px は 1 カラム)。
- 本日終了 `.tv-lrow`: `grid-template-columns:repeat(4,1fr); gap:12px`。

### 1.5 ヘッダーのトークン(サービス連動)

ヘッダーは構造共通・色は選択サービスに連動(`[data-svc]` で切替)。TVER の値:

```
--hd-bg:#0d0d10; --hd-tx:#ffffff; --hd-tx2:#9a9aa8; --hd-line:#2c2c34;
--hd-acc:#ffd400; --hd-acc-ink:#0d0d10; --hd-in:#1b1b22; --hd-glow:rgba(255,212,0,.4);
```

他サービス(ドックのドット色・準備中世界の地色に使用):
- ABEMA: acc `#17e087` / bg `#031510`
- YouTube: acc `#ff0033` / bg `#0f0f0f`
- niconico: acc `#ff8c1a` / bg `#fff8ea`

body 地色をサービス連動: `html[data-svc="tver"] body{background:#fff7e9}`(他は上記 bg)。

### 1.6 ダーク対応

モックの TVER 世界は「クリーム地の世界観」を dark でも保持する設計(世界ごとに固定地色)。本実装の方針:

- **世界(コンテンツ領域)は data-svc 連動でライト系地色を維持**する(dark トグルでも TVER はクリーム地)。これはモック準拠。
- ただし AGENTS-SHARED / 既存 `next-themes`(`darkMode:"class"`)と整合させるため、TVER 世界にも `html.dark` 用のダーク・バリアントを用意する(任意採用。既定はモック準拠のライト地色固定):

| 変数 | ライト(既定/モック) | ダーク・バリアント(任意) |
|---|---|---|
| `--tv-bg` | `#fff7e9` | `#141210` |
| `--tv-ink` | `#0d0d10` | `#f5efe2`(枠・文字を反転) |
| `--tv-tx` | `#141414` | `#f2ede2` |
| `--tv-panel` | `#0d0d10` | `#08080a` |
| `--tv-acc` / `--tv-pink` | 変更なし(高彩度は据え置き) | 変更なし |

実装は CSS 変数を `[data-service-theme="tver"]` にまとめ、`.dark` で上書き可能にしておく(既定は上書きしない=モック準拠)。**MVP はモック準拠のライト固定で可**。ダーク・バリアントは後追いで良い(トグル自体はヘッダーのユーザーメニュー内に残す)。

### 1.7 Tailwind 拡張(`tailwind.config.ts`)

CSS 変数を主とし、頻出ユーティリティのみ Tailwind へ拡張する。`theme.extend` に追記:

```ts
extend: {
  colors: {
    tver: {
      bg: '#fff7e9', ink: '#0d0d10', acc: '#ffd400', pink: '#ff2e88',
      'pink-ink': '#d81b6a', panel: '#0d0d10', 'panel-card': '#1b1b22',
    },
    'tv-sec': {
      pink: '#ff2e88', yellow: '#f5a300', blue: '#0091d8',
      purple: '#6c2bd9', orange: '#ff5d1f',
    },
  },
  borderRadius: { card: '16px', thumb: '9px' },
  boxShadow: {
    'hard-sm': '2.5px 2.5px 0 #0d0d10',
    'hard': '5px 5px 0 var(--acc, #0d0d10)',
    'hard-lg': '9px 9px 0 var(--acc, #0d0d10)',
    'hard-btn': '4px 4px 0 #0d0d10',
  },
  keyframes: {
    'tv-marquee': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
    'tv-blink': { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
  },
  animation: {
    'tv-marquee': 'tv-marquee 28s linear infinite',
    'tv-blink': 'tv-blink 1.6s ease infinite',
  },
}
```

複雑な擬似要素(サムネのビネット `.tv-th::before`、ドットパターン地、マーカー下線グラデ)は Tailwind では冗長になるため、**`globals.css` に `tv-` プレフィックスの component クラスとして移植**する(モックの CSS をほぼそのまま流用)。Tailwind と併用可。`globals.css` に `@layer components` で `.tv-clk / .tv-th / .tv-rk / .tv-hot / .tv-sech ...` を定義するのが最短(モック 205〜461 行をコピーし、`#tv` を `.tv-world` に置換)。

---

## 2. コンポーネント分割(atomic design)

各コンポーネントの `type`(atom/molecule/organism/page/context/util)・props・責務・再利用区分(reuse / modify / new)を列挙。ファイルは `src/components/atomicDesign/<layer>/` 配下(既存慣習)。

### 2.1 Context / Provider

#### `ServiceProvider` / `useService`(new, context)
- パス: `src/contexts/ServiceContext.tsx`
- 責務: 選択中サービス(`'tver' | 'abema' | 'youtube' | 'niconico'`)を保持。`localStorage`(キー `tvapp-svc-v2`)と URL ハッシュ(`#tver` 等)へ同期。初期値は ハッシュ > localStorage > `'tver'`(モックの初期化ロジック 1885〜1896 行と同一仕様)。
- API:
```ts
type ServiceId = 'tver' | 'abema' | 'youtube' | 'niconico';
interface ServiceContextValue {
  service: ServiceId;
  setService: (s: ServiceId) => void;
}
```
- `Provider` は `app/providers.tsx` に追加し `<Header>`/`<Main>` の両方を包む。`setService` は `document.documentElement.setAttribute('data-svc', s)` も行う(ヘッダー配色・body 地色の連動)。

### 2.2 Atoms

| # | 名前 | パス | reuse | props | 責務 |
|---|---|---|---|---|---|
| A1 | `ServiceDockButton` | `atoms/ServiceDockButton.tsx` | new | `{ service: ServiceId; label: string; accent: string; accentInk: string; selected: boolean; ready: boolean; hint?: string; onSelect: (s: ServiceId) => void; }` | ドック内 1 タブ。`<button role="tab" aria-selected aria-controls="tv" tabIndex={selected?0:-1}>`。`ready===false` は淡色 + 「準備中」ツールチップ(`title`/`aria-disabled`)。左のドット `i`(色 `accent`)。 |
| A2 | `RankBadge` | `atoms/RankBadge.tsx` | new | `{ rank: number }` | `.tv-rk` 円形バッジ。`rank===1→r1`(黄・大) / `2→r2`(銀) / `3→r3`(橙) / それ以外は白。`aria-label={`${rank}位`}`。**旧 `ContentCard` の SVG 画像バッジ(`PC_img_ranking_*.svg`)は使わず、CSS 円形に置換**(モック準拠)。 |
| A3 | `HotBadge` | `atoms/HotBadge.tsx` | new | `{ kind: 'up' \| 'new' \| 'last'; label: string }` | `.tv-hot`(`up`=ピンク / `nw`=青 / `lst`=黒地黄字)。**現行データに増減シグナルは無い**ため MVP では原則非表示。`last`(本日終了)だけ `endAt` 由来で表示可(§3.4)。 |
| A4 | `GenreTag` | `atoms/GenreTag.tsx` | new | `{ label: string }` | `.tv-gn` ピル。ホームでは所属セクションのラベル(ジャンル)を渡す。 |
| A5 | `ExpiryLabel` | `atoms/ExpiryLabel.tsx` | new | `{ endAt: number }` | `.tv-lf`。表示テキストは `deriveExpiryLabel(endAt)`(§utils)を呼ぶだけ。null なら描画しない。 |
| A6 | `CardThumbnail` | `atoms/CardThumbnail.tsx` | new | `{ id: string; src: string; title: string; episodeLabel?: string; accentClass?: string }` | `.tv-th`。`next/image`(`unoptimized`、`fill`、`sizes`)で `thumbnail.small`。ビネット `::before`、`.tv-tht`(seriesTitle)、`.tv-ep`(任意 episode ラベル)を重ねる。**`.tv-dur`(尺)はデータに無いため省略。** |
| A7 | `IconLogo` | `atoms/IconLogo.tsx` | new | `{ }` | ヘッダーのタイル+波形ロゴ SVG(モック 1208〜1213 行)。`fill:var(--hd-acc)` 連動。`lg-wm`「TVapp」+ `lg-sub`「Multi Stream」。 |
| A8 | `ProfileAvatar` | `atoms/ProfileAvatar.tsx` | **reuse** | 既存 `{ photoURL, userName, size, className }` | ユーザーメニューのアバターに流用。ヘッダー配色に合わせ `size="xs"` 相当を使用(必要なら `size` に `header` を追加検討)。 |
| A9 | `Button`(既存) | `atoms/Button.tsx` | reuse/参考 | 既存 | ヒーローの CTA は `.tv-btn` スタイルが特殊なため、**新規に `atoms/TverButton.tsx`(new)** を作るか、`.tv-btn` クラスを直接当てる。CTA は装飾専用なので `.tv-btn p/g` の 2 種で足りる。 |

#### `TverButton`(new, atom, 任意)
- パス: `atoms/TverButton.tsx`
- props: `{ variant: 'primary' | 'ghost'; href?: string; onClick?: () => void; children: ReactNode; iconLeft?: ReactNode }`
- 責務: `.tv-btn.p`(黄) / `.tv-btn.g`(白→ホバー淡ピンク)。ヒーロー CTA 用。

### 2.3 Molecules

| # | 名前 | パス | reuse | props | 責務 |
|---|---|---|---|---|---|
| M1 | `ServiceDock` | `molecules/ServiceDock.tsx` | new | `{ services: ServiceMeta[]; selected: ServiceId; onSelect: (s:ServiceId)=>void }` | `<nav class="dk" role="tablist">`。`ServiceDockButton` を map。キーボード操作(←→ で移動 + `1〜4` で選択)を内包(モック 1824〜1843 行の挙動)。入力欄フォーカス中は数字キー無効。 |
| M2 | `SearchBar` | `molecules/SearchBar.tsx` | new | `{ placeholder: string; defaultValue?: string; onSubmit?: (q:string)=>void }` | `.hd-sr` 検索。虫眼鏡 SVG + `<input type="search">`。placeholder はサービス連動(TVER=「番組名・出演者・キーワードで検索」)。submit で `/search?q=` へ(MVP は挙動任意)。 |
| M3 | `UserMenu` | `molecules/UserMenu.tsx` | new(既存 Header のロジック移植) | `{ user: { name: string; email: string; photoURL: string \| null }; onLogout: () => void; items?: MenuLink[] }` | `.hd-u`。`ProfileAvatar`(A8)+ 氏名 + ドロップダウン(`role="menu"`)。項目: アカウント設定 / マイリスト / 視聴履歴 / **ダークモードトグル(`ThemeToggleSwitch` 既存)** / ログアウト。外側クリック・Esc で閉じる(モック 1852〜1867 行)。ログアウトは既存 `useFirebaseAuth().clearAllAuthState` + `ConfirmationModal`(既存)を流用。 |
| M4 | `CategoryChips` | `molecules/CategoryChips.tsx` | new | `{ categories: { label:string; href:string; current?:boolean }[] }` | `.tv-cat` 横スクロール nav。MVP は静的(ホーム/ドラマ/バラエティ/アニメ/報道・ドキュメンタリー/スポーツ/映画/音楽/マイリスト)。`aria-current="page"` で現在。 |
| M5 | `TrendingTicker` | `molecules/TrendingTicker.tsx` | new | `{ items: TickerItem[] }` | `.tv-tick` マーキー(28s ループ、`aria-hidden`)。`items` は `deriveTickerItems(総合ランキング)`(§utils)で生成。0 件なら非表示。 |
| M6 | `RankingShelfCard` | `molecules/RankingShelfCard.tsx` | new | `RankingShelfCardProps`(下記) | `.tv-card > a.tv-clk`。1 リッチカード。`CardThumbnail`(A6)+ `RankBadge`(A2)+ `HotBadge`(A3, 任意)+ `.tv-cm`(h3=seriesTitle / `.tv-st`=放送局・日付)+ `.tv-mrow`(`GenreTag` + `ExpiryLabel`)。リンク先 `/episode/${id}`。 |
| M7 | `RankingShelf` | `molecules/RankingShelf.tsx` | new(旧 `ContentCardList` の後継) | `{ label: string; contents: ConvertedContent[]; accent: SectionAccent; moreHref?: string; updatedLabel?: string; topN?: number }` | `.tv-sec`。ヘッダー `.tv-sech`(h2=label + `.tag`「TOP N」+ `.upd`=更新表記 + `.tv-more`「もっと見る」)+ `.tv-row`(`RankingShelfCard` を map)。`accent` で `s-pink/...` を付与。 |
| M8 | `ResumeBand` | `molecules/ResumeBand.tsx` | new(**PHASE2 依存**) | `{ items: ResumeItem[] }` | `.tv-resume` 続きを見る帯。視聴途中(進捗 %)を表示。**現行 MVP は視聴履歴が段階2(既定 OFF)**のため、`items.length===0` で**セクションごと非表示**。`PHASE2_USER_DATA_ENABLED` が true かつ履歴取得済みのときだけ描画。 |
| M9 | `EndingSoonBand` | `molecules/EndingSoonBand.tsx` | new | `{ items: ConvertedContent[] }` | `.tv-last` 本日終了帯。`deriveEndingSoon(全ランキング, now)` で「本日 23:59 までに `endAt` を迎える」ものを抽出。0 件なら非表示。 |

`RankingShelfCardProps`:
```ts
interface RankingShelfCardProps {
  id: string;               // → /episode/${id}
  seriesTitle: string;      // 大見出し / サムネ内タイトル
  title: string;            // エピソード名(サブ・任意)
  thumbnail: string;        // ConvertedContent.thumbnail.small
  rank?: number;            // 0/undefined ならバッジ非表示
  genre?: string;           // 所属セクションのラベル
  broadcasterName?: string; // 放送局
  productionProviderName?: string;
  broadcastDateLabel?: string; // 「7月3日(金)放送」等
  endAt?: number;           // 期限ラベル用
  hot?: { kind:'up'|'new'|'last'; label:string }; // 任意
}
```

### 2.4 Organisms

| # | 名前 | パス | reuse | props | 責務 |
|---|---|---|---|---|---|
| O1 | `AppHeader` | `organisms/AppHeader.tsx` | new(現 `molecules/Header.tsx` を置換) | `{}` | `.hd` 全体。`IconLogo` + `ServiceDock`(`useService`)+ `SearchBar` + キーヒント(`.hd-hint`)+ `UserMenu`(`useFirebaseAuth`)。`layout.tsx` の `<Header/>` を `<AppHeader/>` に差し替え。`sticky top-0`。ログイン/登録画面では現行同様 `null`(pathname 判定を継承)。 |
| O2 | `TverHero` | `organisms/TverHero.tsx` | new | `{ featured: FeaturedContent \| null }` | `.tv-hero`。左: キッカー「今週の爆推し」+ h1(黄マーカー)+ コピー + メタ(放送局/曜日/無料範囲/字幕)+ CTA(`TverButton`×2)+ 検索ワード。右: `.tv-hero-art`(サムネ + エピソードステッカー)。`featured` は `deriveFeatured(総合ランキング)`(§utils)。null なら非表示。**ヒーローのコピー文はデータに無い**ため、seriesTitle/放送局から機械生成 or 定型文(§3.5)。 |
| O3 | `TverHome` | `organisms/TverHome.tsx` | new | `{ rankingLabels: string[]; rankingContents: Record<string, ConvertedContent[]> }` | TVER 世界(`#tv`)全体。順に `TrendingTicker` / `CategoryChips` / `TverHero` / `ResumeBand`(条件付き)/ `RankingShelf`×N(`rankingLabels` を map、`sectionAccentForLabel` で色割当)/ `EndingSoonBand` / `TverFooter`。ルート要素に `.tv-world`(旧 `#tv` のスタイル)と `role="tabpanel" aria-labelledby="dk-tver"`。 |
| O4 | `ComingSoonWorld` | `organisms/ComingSoonWorld.tsx` | new | `{ service: ServiceId }` | ABEMA/YouTube/niconico 用プレースホルダ。当該サービスの配色トークンで「準備中」パネル(見出し + 説明 + TVER へ戻る導線)。`role="tabpanel"`。 |
| O5 | `TverFooter` | `organisms/TverFooter.tsx` | new | `{}` | `.tv-ft`(ヘルプ/利用規約/プライバシー/対応サービス/運営会社 + コピーライト)。 |

### 2.5 Pages

#### `Main`(modify)
- パス: `pages/Main.tsx`
- 変更点(**データ取得は不変**):
  - 先頭のフック群(`useRouter/useAuth/useFirebaseAuth/useSessionService/useTvHomeService`)と 2 つの `useEffect`(認証リダイレクト・ランキング合成)は**現状維持**。
  - `const { service } = useService();` を追加。
  - ローディング/未認証の早期 return も維持(スタイルだけ TVER ローディングに寄せて可)。
  - `return` を差し替え:
```tsx
return service === 'tver'
  ? <TverHome rankingLabels={rankingLabels} rankingContents={rankingContents} />
  : <ComingSoonWorld service={service} />;
```
- 注意: `app/page.tsx` のラッパ `max-w-6xl mx-auto p-0 xl:p-14` は TVER 世界の全幅レイアウト(`.wrap` が幅制御)と競合するため、**`app/page.tsx` を `<main>{<Main/>}</main>` の素通しに変更**(幅・パディングは各世界の `.wrap` に委ねる)。

### 2.6 削除/退避しないもの(明示)

- `ContentCard` / `ContentCardList`: series / genre 一覧など他ページで使用の可能性があるため**そのまま残す**(ホームからの参照は無くなる)。
- 現 `molecules/Header.tsx`: `AppHeader` へ置換後は不要になるが、**サイドバー(サンプルリスト/お気に入り/履歴/DBリスト)の機能は段階2**。`AppHeader` の `UserMenu` に主要導線を移し、DB リスト等は当面ドロップダウンのサブ項目 or 別ページへ。移設完了まで `Header.tsx` は削除せず残置し、layout の参照だけ差し替える。

---

## 3. データ対応(実データ ↔ 表示)

### 3.1 供給元(不変)

`convertRankingToCardData` が返す `ConvertedContent`:
```
id, title, seriesID, endAt, seriesTitle, broadcasterName,
productionProviderName, broadcastDateLabel,
thumbnail:{ small, xlarge }, rank
```
- サムネ URL(合成済み): `https://statics.tver.jp/images/content/thumbnail/episode/small/${id}.jpg`(`.small`)/ `xlarge`。
- `rankingLabels`(`getAllLabels`)= `components[].label`。ラベルがそのままセクション見出し(例:ジャンル別ランキング)。

### 3.2 カード各要素の対応表

| 表示要素(モック) | データフィールド | 備考 |
|---|---|---|
| `.tv-tht`(サムネ内タイトル) | `seriesTitle`(空なら `title`) | 2 行まで |
| `.tv-cm h3`(カード見出し) | `seriesTitle` | |
| `.tv-st`(サブ) | `${productionProviderName || broadcasterName}・${broadcastDateLabel}` | どちらか空なら詰める |
| `.tv-rk`(ランク) | `rank`(0/undefined は非表示) | §A2 |
| `.tv-gn`(ジャンル) | 所属セクションの `label` | 項目単位のジャンルは無いためセクション名を流用 |
| `.tv-lf`(期限) | `endAt` → `deriveExpiryLabel` | §3.4 |
| リンク | `id` → `/episode/${id}` | 既存 `ContentCard` と同一 |
| `.tv-ep`(エピソード小バッジ) | `title` から抽出可能なら | 抽出不可なら省略 |

### 3.3 データに存在しない要素(MVP の扱い)

以下はモックにあるが現行データに無い。**MVP では省略 or 定型/派生**とする(将来拡張点として §5 に記載):

| 要素 | 扱い |
|---|---|
| `.tv-dur`(尺 45:58 等) | 省略(データ無し)。将来 episode 詳細取得で補完。 |
| `.tv-hot`(▲12 UP / 初登場) | 増減シグナル無し → 原則非表示。`last`(本日終了)のみ `endAt` 由来で表示。 |
| `.tv-rbar`(視聴進捗) | 段階2(視聴履歴)。`ResumeBand` 内でのみ、PHASE2 有効時。 |
| ヒーローのコピー/ワード | 定型文 + seriesTitle 差し込み(§3.5)。 |
| ティッカーの `▲N` | 非表示(ラベルのみ:新着/まもなく終了/番組名)。 |
| 検索ワード(`.tv-word dd`) | 静的なプレースホルダ or 非表示。 |

### 3.4 期限ラベル `deriveExpiryLabel(endAt: number): string | null`(util)
- 入力 `endAt` は UNIX 秒(既存コードは秒前提。`endAt || 0`)。
- 仕様:
  - `endAt` が 0/未来過ぎ(> 90日) or 過去 → `null`(非表示)。
  - 本日中(now〜今日 23:59:59)に終了 → `本日 HH:MM 終了`(または残り時間 `残り N時間M分`)。
  - それ以外 → `あと N日`(切り上げ)。
- TZ は JST 前提(vitest も `TZ=Asia/Tokyo` 固定)。テスト容易化のため `now` を第 2 引数で注入可能に:`deriveExpiryLabel(endAt, now = Date.now())`。

### 3.5 ヒーロー/ティッカー/終了帯の選定(util・純関数)
- `deriveFeatured(contents: ConvertedContent[]): FeaturedContent | null` — 総合(先頭ラベル)ランキングの 1 位を採用。コピーは `「${seriesTitle}」${title ? title + 'が' : ''}配信中` 等の定型。
- `deriveTickerItems(contents): TickerItem[]` — 上位数件 + `endAt` が本日終了の件を「まもなく終了」ラベルで混在。
- `deriveEndingSoon(all: Record<string,ConvertedContent[]>, now): ConvertedContent[]` — 全ラベル横断で本日終了のものを重複排除(`id`)して最大 4 件。
- `sectionAccentForLabel(label, index): SectionAccent` — index を `['s-pink','s-yellow','s-blue','s-orange','s-purple']` に循環割当(先頭=総合をピンク)。決定論。

すべて `src/utils/tver/homeView/` 配下に置き、テストを付ける(カバレッジ対象)。

---

## 4. サービス切替の骨組み(TVER のみ実装)

### 4.1 サービスカタログ(util)
- パス: `src/utils/service/serviceCatalog.ts`
```ts
export type ServiceId = 'tver' | 'abema' | 'youtube' | 'niconico';
export interface ServiceMeta {
  id: ServiceId; label: string; accent: string; accentInk: string;
  ready: boolean;      // TVER のみ true
  hint: string;        // '1'..'4'
  searchPlaceholder: string;
}
export const SERVICES: ServiceMeta[] = [
  { id:'tver',     label:'TVER',     accent:'#ffd400', accentInk:'#111008', ready:true,  hint:'1', searchPlaceholder:'番組名・出演者・キーワードで検索' },
  { id:'abema',    label:'ABEMA',    accent:'#17e087', accentInk:'#02180d', ready:false, hint:'2', searchPlaceholder:'番組・チャンネル・シリーズを検索' },
  { id:'youtube',  label:'YouTube',  accent:'#ff0033', accentInk:'#ffffff', ready:false, hint:'3', searchPlaceholder:'検索' },
  { id:'niconico', label:'niconico', accent:'#ff8c1a', accentInk:'#2c1602', ready:false, hint:'4', searchPlaceholder:'キーワード・タグで検索' },
];
export const isReady = (id: ServiceId) => SERVICES.find(s => s.id === id)?.ready ?? false;
```

### 4.2 切替挙動
- ドックのタブは常に 4 つ表示。`ready===false` のタブも選択可能だが、選択すると `Main` は `ComingSoonWorld` を描画(遷移はする。データ取得はしない)。
- 選択は `useService().setService`。`data-svc` 属性・`localStorage`・ハッシュを同期(§2.1)。
- キーボード: `1〜4` で選択、←→ でドック内移動(入力欄フォーカス中は無効)。
- `SearchBar` の placeholder は `SERVICES[selected].searchPlaceholder`。

### 4.3 将来拡張点
- 各サービスに `HomeProvider`(データ取得)を差し込むための境界を `Main` の分岐に用意済み。`ready` を true にし、対応する `XxxHome` organism を足すだけで有効化できる構造にする。
- `ServiceContext` の型に将来サービスを増やす場合は `SERVICES` と `ServiceId` を更新。

---

## 5. テスト方針

### 5.1 前提(カバレッジゲート)
- `vitest.config.ts` の coverage `include` は **`src/lib/**` と `src/utils/**` のみ**、閾値 80%(lines/functions/branches/statements)。
- 従って:
  - **新規の派生ロジックは必ず `src/utils/` の純関数**にし、`*.test.ts` を付ける(未テスト util を足すとゲートが落ちる)。
  - コンポーネント(`src/components/**`)はカバレッジ対象外。ただし信頼性のため `*.test.tsx`(testing-library)を作る(ゲートには影響しないが回帰防止)。
- 環境: `jsdom` + `vitest.setup.ts` + `@testing-library/react` は導入済み。`TZ=Asia/Tokyo` 固定。

### 5.2 util テスト(カバレッジ対象・必須)

| ファイル | テスト観点 |
|---|---|
| `utils/tver/homeView/deriveExpiryLabel.test.ts` | 本日終了 / あとN日 / null(0・過去・遠未来)/ JST 境界(23:59)/ now 注入 |
| `utils/tver/homeView/deriveFeatured.test.ts` | 空配列→null / 1位採用 / seriesTitle 欠落時の title フォールバック |
| `utils/tver/homeView/deriveTickerItems.test.ts` | 件数上限 / 本日終了ラベル混在 / 空→[] |
| `utils/tver/homeView/deriveEndingSoon.test.ts` | 横断抽出 / id 重複排除 / 上限4 / 該当なし→[] |
| `utils/tver/homeView/sectionAccentForLabel.test.ts` | index 循環割当 / 決定論(同 index→同色) |
| `utils/service/serviceCatalog.test.ts` | `isReady` / TVER のみ ready / 4 件・hint 一意 |

境界網羅は `finding-edge-cases` の観点(空/null/最大最小/TZ 境界)で設計。

### 5.3 コンポーネントテスト(回帰防止・カバレッジ対象外)

| ファイル | 主なアサーション |
|---|---|
| `atoms/RankBadge.test.tsx` | rank=1/2/3/5 でクラス(r1/r2/r3/無印)・`aria-label` |
| `atoms/ExpiryLabel.test.tsx` | null で非描画 / テキスト表示(util をモック or 実 now 注入) |
| `atoms/CardThumbnail.test.tsx` | `img alt`=title / src にサムネ URL / タイトル overlay |
| `atoms/ServiceDockButton.test.tsx` | `role="tab"` / `aria-selected` / ready=false で `aria-disabled`・onSelect |
| `molecules/ServiceDock.test.tsx` | 4 タブ描画 / クリックで onSelect / ←→ キー移動 / 数字キー |
| `molecules/RankingShelfCard.test.tsx` | `/episode/${id}` リンク / seriesTitle / 放送局・日付 / rank バッジ有無 |
| `molecules/RankingShelf.test.tsx` | 見出し=label / カード数 / accent クラス / 空 contents |
| `molecules/UserMenu.test.tsx` | アバター / 氏名 / 開閉(クリック・Esc・外側)/ ログアウト呼び出し |
| `molecules/SearchBar.test.tsx` | placeholder 反映 / submit コールバック |
| `molecules/CategoryChips.test.tsx` | current の `aria-current` / リンク数 |
| `organisms/AppHeader.test.tsx` | ロゴ / ドック / 検索 / ユーザーメニューの存在(`useService`/`useFirebaseAuth` はモック) |
| `organisms/TverHome.test.tsx` | rankingLabels ぶんの shelf / featured / ending-soon(props 注入) |
| `organisms/ComingSoonWorld.test.tsx` | サービス名 / 「準備中」 / 戻る導線 |
| `pages/Main.test.tsx` | service=tver→TverHome / それ以外→ComingSoonWorld(フック群はモック) |

モック方針: `useFirebaseAuth`/`useService`/各サービスコンテキストは `vi.mock` でスタブ。`next/navigation` の `useRouter`/`usePathname` もスタブ(既存テストの慣習に合わせる)。

### 5.4 実行
- `npm run test`(全体) / `npm run test:coverage`(ゲート確認)。
- CI は既存の 80% ゲートを維持。**新規 util にテストを付ければゲートは維持される**(コンポーネント追加はカバレッジ分母に入らない)。

---

## 6. 実装順序(推奨)

1. util 層(§3.4/3.5/4.1)+ そのテスト → カバレッジ担保を先に確定。
2. `globals.css` に `tv-` component クラス移植(モック 205〜461 行、`#tv`→`.tv-world`、`.hd-*`/`.dk-*` も)+ `tailwind.config.ts` 拡張。
3. atoms(RankBadge / HotBadge / GenreTag / ExpiryLabel / CardThumbnail / ServiceDockButton / IconLogo / TverButton)。
4. molecules(ServiceDock / SearchBar / UserMenu / CategoryChips / TrendingTicker / RankingShelfCard / RankingShelf / EndingSoonBand / ResumeBand)。
5. `ServiceContext` + `providers.tsx` 追加。
6. organisms(AppHeader / TverHero / TverHome / ComingSoonWorld / TverFooter)。
7. `layout.tsx` の `Header`→`AppHeader` 差し替え、`page.tsx` ラッパ調整、`Main` の return 差し替え。
8. コンポーネントテスト。
9. `npm run test:coverage` / `npm run build` / dev で目視(ライト/ダーク/印刷、横スクロール、ドック切替、キーボード操作)。dev サーバは検証後に必ず停止(PID 管理)。

---

## 7. 受け入れ基準(Definition of Done)

- ホーム(`/`)が TVER ビビッド高密度デザインで描画され、**既存のランキングデータがそのまま**カード/シェルフに反映される。
- サービスドックで TVER↔他 3 サービス(準備中)を切替でき、他サービスは `ComingSoonWorld` を表示。localStorage/ハッシュ/キーボードが機能。
- ユーザーメニューにアバター+氏名+ドロップダウン(ダークトグル/ログアウト含む)。
- `npm run test:coverage` が 80% ゲートを維持。`npm run build` 成功。
- ライト/ダーク/印刷の 3 モードで表示崩れが無い(横スクロール・ハードシャドウ・マーカー下線・フォーカスリング)。
</content>
</invoke>
