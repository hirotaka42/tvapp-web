# CLAUDE.md — tvapp-web（TVapp Web）

> 横断の共通ルール(コミット規約・版ゲート・docs 体系・中立性 等)は、このリポジトリを束ねる
> ステアリング拠点 `ai-steering` の `AGENTS-SHARED.md` を正本とする(このリポは submodule)。
> ここには **このリポジトリ固有の地図と教訓** を書く。

> **🔴 次セッションはまず `HANDOVER.md` を読むこと。** 現在地・残作業・いまの問題(ABEMAアプリ内再生が
> あと一歩＝本番Azureが鍵を返さない)・開発ワークフローがまとまっている。作業再開の起点。

## 1. これは何か
複数の視聴サービスを1つの体験に束ねる**マルチサービス視聴・映画情報ポータル**。Next.js **16(App Router)**+ React 19。
共通ヘッダのサービスドックで **TVER / ABEMA / 映画 / YouTube(準備中)** を切替え、`data-svc` テーマでワールドごと描画する。
- **TVER**: 公開 API をサーバールートで代理し、**ストリーム解決を純 TypeScript 化**(月替キー・Origin 必須・DRM 除外)。Azure Function 委譲も併設。
- **ABEMA**: channels/slots/VOD + **アプリ内再生**(streaminglink/hls/key・HLS proxy で license ticket を自前 key ルートへ)。
- **映画ワールド(2026-07 追加)**: 再生・予約・購入を持たない**情報ワールド**。上映中/近日公開/ランキング/ニュース/ジャンル別/ヒーロー自動スライド/観たい印/予告編は YouTube 検索。**鍵ゼロ・完全$0**の日次クロール(映画.com/Filmarks/RSS)→ Cloudflare **D1**(7テーブル・公開ステータスは read 時導出)→ 読取 API。詳細は `docs/reference/01_spec/01-cinema-world.html`。
- **Cloudflare Workers(OpenNext)+ Firebase Auth + D1 でほぼ $0** 運用。デプロイは `deploy:safe`(版ゲート・build_sha 照合)。

## 2. 構成(どこに何があるか)
- `xiaovy.tvapp.web/` — Next.js アプリ本体(ここで開発・`npm run dev` 等を実行)。
  - `src/lib/tver/streamResolver.ts` — TVER→Streaks の純TS解決(月替わりキー `(JST月%6)||6`、playback は `Origin: https://tver.jp` 必須、DRM除外)。TDD(`*.test.ts` / ライブは `*.live.test.ts`)。
  - `src/lib/features.ts` — `PHASE2_USER_DATA_ENABLED`(既定OFF)。段階2(お気に入り/履歴/プロフィール/管理)を切替。
  - `open-next.config.ts` / `wrangler.jsonc` — Cloudflare Workers デプロイ。`npm run cf:build|cf:preview|cf:deploy`。
  - `docs/reference/` — 仕様書一式・デプロイ手順書・CI/CD設計・セットアップ記録(§8 HTML/MD)。※`.gitignore` の `**/docs/**` で無視されるため force-add で追跡。
  - `scripts/health-check.sh` — ローカル生存チェック(プロセス/HTTP/TVER実データ/ログ)。
- `deferred-phase2/api/` — firebase-admin/Cosmos 依存の段階2ルート(User/admin/cosmosdb)を退避(Workers 非互換のため MVP バンドルから除外)。
- `.github/workflows/` — CI(PR/branch検証) と 版ゲート・デプロイ(main への版上げマージ時のみ Cloudflare へ)。

## 3. MVP スコープ
閲覧(ランキング/検索/シリーズ)・再生・Firebase 認証(Google / メール+パスワード / メールリンク。**匿名は不採用**)。
お気に入り/視聴履歴/プロフィール/管理は段階2(Firestore クライアント方式で後日)。

## 4. 教訓（再発防止 — AI が育てる節。追記はユーザー確認後・この節のみ）
- [2026-07-06] 検証用に起動した `next dev` を落とし忘れ、端末から切り離された orphan として残り、SWC 再コンパイルで CPU 940%超・41分以上稼働しマシンを飽和させた → 原因: 長時間プロセスを起動しっぱなしで放置 → 次から: dev/watch 系を起動したら PID を控え、検証完了・作業終了時に必ず停止。再起動より同じ1本を使い回し、新規起動前に既存を kill。停止後は `ps` で残存ゼロとポート解放を確認する。
- [2026-07-06] Next 16 で CI の `next lint` が「Invalid project directory」で失敗 → 原因: Next 16 は `next lint` を廃止(build 時 ESLint 統合も廃止) → 次から: lint は `next lint` に依存せず ESLint を直接運用する(未整備なら CI から lint 段は外し、tsc+test+build+cf:build で担保)。
- [2026-07-07] PC Chromeだけ動画再生不可(iPhone/VLCは可) → 原因が3層: ①streaks master m3u8のCORS非許可 ②旧プレイヤーがネイティブHLS優先で、Chromeは canPlayType='maybe' と誤申告するのに実際は再生不可(video.error.code=4) ③帯域懸念 → 次から: HLSは hls.js 優先(ネイティブはSafari等のフォールバック)。CORSは同一オリジンプロキシで master のみ中継しセグメントは直取り(Cloudflareはegress非課金・帯域ゼロで$0)。**ブラウザ再生の検証はheadlessスクショでは不十分**。Chrome CDP(--remote-debugging-port)で `document.querySelector('video')` の error.code/readyState/buffered.end(0) を読む(readyState>=3 & error=null & buffered>0 で再生可)。最終判定はユーザー実機。
- [2026-07-07] ローカルでは動くのに本番で動かない(ABEMA鍵導出: ローカル.venvで16byte鍵導出成功、本番Azureは0件) → 教訓: **「ローカルで動いた」は「本番で動く」の保証ではない**。デプロイ後に本番の実挙動を必ず実測し、差分が出たら本番環境のログ(Azureなら Application Insights / `az functionapp log`)で原因を詰める。ヘッドレスの limits、実行環境のPythonバージョン/ネットワーク/内部API依存の差に注意。
- [2026-07-06] Cloudflare に「デプロイしたのに中身が古い」事故(認証刷新・ジャンル修正が本番未反映) → 原因: `opennextjs-cloudflare deploy`(=旧 cf:deploy)と bare `wrangler deploy` は**再ビルドせず既存 .open-next を上げるだけ**。古い成果物を上げ続けた → 次から: デプロイは必ず再ビルドを伴わせる(cf:deploy を `build && deploy` に修正済)。手動は `npm run deploy:safe`(scripts/deploy.sh): 未コミット中断→.open-next削除→再ビルド→`--var BUILD_SHA`埋込→本番 `/api/health` の build_sha が HEAD と一致するか照合し不一致なら失敗。CI の deploy.yml は cf:build 後に wrangler deploy するため元から安全。
</content>
