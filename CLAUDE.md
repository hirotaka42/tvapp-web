# CLAUDE.md — tvapp-web（TVapp Web）

> 横断の共通ルール(コミット規約・版ゲート・docs 体系・中立性 等)は、このリポジトリを束ねる
> ステアリング拠点 `ai-steering` の `AGENTS-SHARED.md` を正本とする(このリポは submodule)。
> ここには **このリポジトリ固有の地図と教訓** を書く。

## 1. これは何か
TVER をより手軽に見るための Web アプリ。Next.js 14→**16(App Router)**。
TVER の公開 API をサーバールートで代理し、**ストリーム解決を純 TypeScript 化**(Azure Functions / yt-dlp / Cosmos を廃止)、
**Cloudflare Workers(OpenNext)+ Firebase でほぼ $0** 運用を目指す。

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
</content>
