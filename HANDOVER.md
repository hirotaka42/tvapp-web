# TVapp 引き継ぎ資料（2026-07-13 セッション終了時点）

> 次セッションはまず本ファイル → `CLAUDE.md` → `docs/reference/04_usage/03-abema-local-playback.md` → recall されるメモリ、の順で読む。
> **本番URL**: `https://tvapp-web.xie-cloudflare.workers.dev`（Cloudflare Workers / OpenNext）。health は `/api/health`（`build_sha` で反映コミットを照合）。
> 役割分担: 設計・監査・UI/UX・検証=上位Claude、コード調査・実装=Codex（高難度は `-m gpt-5.6-sol -c model_reasoning_effort=ultra`。**`codex exec resume` はモデル/effort フラグを引き継がないので再指定必須**）。

## 1. これは何か
TVER / ABEMA / YouTube / niconico を1つのWebアプリで切り替えて視聴する統合ビューア。**$0運用が絶対要件**。
フロント+ブラウズ=Cloudflare Workers(OpenNext, Next16 App Router) / 認証=Firebase / ストリーム解決=日本リージョンの Azure Function `Platform-Stream-Loader`(yt-dlp)。

## 2. 現在地（2026-07-13・本番稼働中）
**tvapp-web `v1.7.0` を main マージ + Cloudflare 本番デプロイ済**（build_sha `7b8a74e` 一致を実測。PR #77）。

| 領域 | 本番の状態 |
|---|---|
| TVER（ブラウズ+再生） | ✅ 動作（スマホの体感改善済=v1.7.0。ユーザー実機で「カクつき減」確認済） |
| ABEMA ブラウズ（ランキング/シリーズ/番組情報） | ✅ 動作（同上・タブ切替が即時化） |
| ABEMA 再生の鍵導出（Azure） | ✅ 有効な鍵を返す |
| ABEMA 再生（プレイヤー到達） | 🔴 **本番で不安定**（下記「次タスク①」。keyStore がインメモリで isolate 間非共有）。ローカルは常に動く |
| CI/CD（GH Actions→Cloudflare自動デプロイ） | ✅ 有効（**版上げ+mainマージでのみ**デプロイ。deploy.yml が package.json version の上昇を検知） |
| Vercel | 🟡 GitHub 連携の残骸で PR にチェックが付くだけ。**デプロイ経路ではない**（本番は Cloudflare のみ。ログイン不可でプレビューも使わない。止めるなら Vercel 側で Git 連携解除） |

### v1.7.0 で入った変更（2026-07-13・スマホの TVER/ABEMA 軽量化。挙動・見た目のトーンは不変）
5観点並列調査（Workflow）→ Codex 実装 → fresh Codex 独立レビュー（major 8 / minor 4 検出→全修正）の手順で実施。

- **タブ切替をマウント保持+hidden 切替に**（`Main.tsx`）: TVER/ABEMA は一度表示したら `<div hidden>`(display:none) で切替。訪問済み管理は `visited` state+effect（render 中の ref 書き込みは React 純粋性違反かつ初期タブ誤登録になるため不可）。描画条件は「選択中 or 訪問済み」。**cinema は従来どおり都度マウント**（保持すると再入場時再取得が失われるため意図的に除外）。
- **復帰時の鮮度維持**: `AbemaHomeContainer`/`TverHome` は `active` prop を受け、非活性→活性の遷移で `now` を更新（LIVE判定・本日終了の再評価）。ABEMA は取得後120秒超 or 取得失敗時に channels/slots+VOD を再取得（`useAbemaHome`/`useAbemaVod` が `fetchedAt` を返す）。
- **メモ化**: `AbemaHome` の派生4種(deriveLiveNow/UpNext/Shelves/EpgGrid=O(slots×channels)) を useMemo 化・`now=Date.now()` デフォルト引数を排除。`TverHome` は useMemo+React.memo。
- **Intl.DateTimeFormat をモジュールスコープ1個に**: TVER `deriveExpiryLabel`（従来はホーム1描画で最大約1,500個生成）+ ABEMA 6ファイル重複の HH:mm を `src/utils/abema/homeView/formatJstTime.ts` に共通化。
- **無限アニメの画面外停止**: `src/hooks/useOffscreenPaused.ts`（IntersectionObserver・**callback ref 方式**=初回 null でも後から観測）で viewport 外のとき `anim-paused` クラス→ `animation-play-state:paused`。装着先=TrendingTicker/EndingSoonBand/AbemaLiveTicker/AbemaLiveHero/AbemaEpg/AbemaShelf/AbemaLiveNowPanel。`prefers-reduced-motion` ガードも追加。
- **VODヒーロー抑制**: 7秒回転と次画像先読みを `document.hidden` に加え `offsetParent === null`（サービス非表示=display:none 判定）で停止。
- **横スクロール棚のフルブリード化**（globals.css）: `.tv-row` が `.wrap`(12px)+自身18px の入れ子で左右に死帯を作っていた→負マージンで相殺しスクロール面を画面端まで拡張。先頭カード静止位置は **16px**（1位ランクバッジ rotate(-9deg) のはみ出し約4pxを吸収する値。12px だと欠ける）。≤400px帯・641〜1000px帯(28px)・`.ab-row` も同様。
- **タッチ端末の sticky hover 排除**: transform/box-shadow を遷移させるカード系 `:hover` を `@media(hover:hover)` でガード（デスクトップ不変）。
- **slots API の過去枠除外**: **当日リクエストのみ** `endMs > now-2h` でフィルタ（EPG窓下限 now-60分+60分マージン）。過去日付指定は従来どおり全枠（公開APIの互換維持）。
- **その他**: 未使用 Geist フォント2書体(約134KB)の next/font 読込削除・TVERヒーロー画像に `priority`・取得成功 console.log 削除・reduce のスプレッド除去・ServiceContext 初期化を useLayoutEffect 化。

**意図的な小差異**: タブ復帰時にスクロール位置と VOD ヒーローのスライド位置が保持される（従来は毎回リセット）。ユーザー確認済み・許容。

## 3. 次にやること（優先順）
1. 🔴 **鍵ストアをKV/Durable Objectsへ（本番ABEMA再生の安定化）**: 原因はAzureでなく `src/app/api/service/abema/keyStore.ts` が**インメモリで Cloudflare Workers の isolate 間で共有されない**こと。streaminglink(鍵保存)と`/api/service/abema/key`(取得)が別isolateだと404。KVは結果整合でput直後getに注意→**DOが堅い**、or 鍵をsidに署名付き埋め込む案も。設定済みCloudflare APIトークンはKV編集権限を含む。
2. 🟡 **さらなる軽量化の残り弾（今回は安全側で見送り）**: EPG の遅延描画（content-visibility は**不採用と裁定済み**=行数可変で intrinsic-size が実高と大きく乖離しスクロールジャンプ・paint containment がフルブリード負マージンをクリップ。やるなら行数から実高を計算して inline style で与えるか、仮想化）。slots 応答の未使用フィールド削減（`content` はヒーロー1件で使用中なので全削除不可）。
3. 🟡 **Vercelの GitHub 連携解除**（PR のノイズ除去。デプロイには無関係)。
4. 🟡 **README/docsの更新（実態乖離)**: root README(Docker時代) と app README(旧製品説明) が現構成と乖離。docs/reference の 01_spec/02_architecture も ABEMA 一式未反映。
5. YouTube / niconico の世界: モックのみ・未実装。段階2(お気に入り/視聴履歴等): `deferred-phase2/`退避・`PHASE2_USER_DATA_ENABLED=false`。

## 4. 落とし穴・教訓（再発防止）
- **ローカルの vitest 9件失敗は Node 25 の環境問題**（cleanToken/favoriteSeries の `localStorage.clear is not a function`。Node 25 の実験的 localStorage が jsdom と衝突）。**CI(Node 22) では全緑**。変更起因かどうかは「main に stash して同条件比較」で切り分ける。
- **`codex exec resume` は `-m`/`-c model_reasoning_effort` を引き継がない**（config 既定に落ちる)。resume 時もフラグを毎回明示する。出力ヘッダの `model:`/`reasoning effort:` で必ず確認。
- **content-visibility は安易に足さない**（上記 次タスク② の裁定理由。2026-07-13 に一度入れて独立レビューで却下)。
- **フルブリード棚の左インセットは 16px 未満にしない**（1位バッジの回転はみ出しが画面端で欠ける）。
- **リゾルバのメディアトークン失効**: yt-dlp `AbemaTVBaseIE._MEDIATOKEN` が古くなると16byteだが復号できない鍵を出す(全通信200・無エラー)。恒久修正は Platform-Stream-Loader main にマージ済。応急=リゾルバ再起動。
- **再生不能の切り分け**: 「鍵とセグメントを AES-128-CBC 復号して先頭0x47・188周期のTS同期を見る」が確実。
- **ABEMA API**: VOD系は user token 必須。シーズンは**フルseasonId(例`149-11_s2`)で個別取得**。話数サムネは `image.p-c2-x.abema-tv.com/image/programs/{episodeId}/thumb001.png`。
- **CI/デプロイ**: wranglerはNode>=22要求。CIデプロイは `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`(secret)+`NEXT_PUBLIC_FIREBASE_*`(vars)=設定済。deploy.yml は `test:coverage`(lib/utils に80%閾値)を通らないとデプロイしない。
- **デプロイは再ビルド必須**: 手動は `npm run deploy:safe`（.open-next削除→再ビルド→`--var BUILD_SHA`→本番/api/healthのbuild_sha照合）。

## 5. ローカル起動 / デプロイ
- **ローカルABEMA再生**（本番Azureに頼らずローカルリゾルバ経由）:
  1. `cd Platform-Stream-Loader && source .venv/bin/activate && python scripts/local_resolver_server.py`（:7071）
  2. `cd xiaovy.tvapp.web && NEXT_PUBLIC_DEV_BYPASS_AUTH=1 AZURE_FUNCTION_STREEAMING=http://localhost:7071 npm run dev`
  3. ヘッダのABEMAタブ（localStorage `tvapp-svc-v2=abema`）。
- **デプロイ**: 版上げ→mainマージで**GH Actionsが自動でCloudflareへ**（または手元 `npm run deploy:safe`）。長時間プロセス(dev/リゾルバ)は検証後に必ずkill。

## 6. 主要パス・ブランチ・PR
- フロント: `tvapp-service/tvapp-web/xiaovy.tvapp.web/`（本流=**main**）。
- リゾルバ: `tvapp-service/Platform-Stream-Loader/`（main。`src/services/abema.py`=鍵導出、`scripts/local_resolver_server.py`=dev用シム）。
- 直近のPR: **#77(v1.7.0 スマホ軽量化・2026-07-13)** / #58(ABEMA機能一式) #59(Node22+版) #60/#61(docs) #62(CI/CD疎通)。
- 設計/記録: `docs/reference/`（04_usage/03-abema-local-playback.md が最新の使用書）。v1.7.0 の調査・修正計画の詳細は PR #77 本文に集約。
