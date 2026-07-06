# TVapp セットアップ記録（構成変更ログ・トレーサビリティ用）

> 目的: Firebase / Cloudflare まわりで「誰が・いつ・何を設定したか」を後から必ず追えるようにする記録。
> 原則: **絶対に課金しない構成($0)を維持する**。有料プラン(Blaze)・従量課金サービスは有効化しない。
> この記録は設定を変えるたびに追記する。

## 対象・前提
- リポジトリ: `hirotaka42/tvapp-web`（Next.js アプリは `xiaovy.tvapp.web/`）
- 構成方針: Cloudflare Workers(OpenNext) + Firebase、TVER 解決は純TS。MVP は 閲覧/再生/認証。

## $0(無料)を守るためのルール（重要）
- **Firebase は Spark(無料)プランのまま**にする。**Blaze(従量課金)へ切り替えない**。
- 使うのは無料枠に収まる範囲のみ:
  - Firebase **Authentication**（メール/パスワード + 匿名）… 無料。
  - （段階2）Firestore … 無料枠内で利用（保存量・読み書き回数の無料枠を超えない運用）。
  - **Firebase Storage は使わない**（新規プロジェクトでは Blaze 必須になり得るため）。プロフィール画像機能は当面無効/代替。
  - Cloud Functions は使わない。
- **Cloudflare は Workers 無料枠**（10万リクエスト/日）。有料アドオンを付けない。
- 課金につながる操作（Blaze 化・カード登録・従量サービス有効化）は**行わない/勝手に行わない**。

## 変更ログ

### 2026-07-06 Firebase 初期設定（CLI: firebase-tools 15.x / 実行者アカウント hi202rotaka328@gmail.com）
- **Firebase プロジェクト**（既存・ユーザー作成）
  - 表示名: `TVAPP-Service`
  - Project ID: `tvapp-service`
  - Project Number: `1029534608920`
- **Web アプリを新規作成**（`firebase apps:create WEB "TVapp Web"`）
  - 表示名: `TVapp Web`
  - App ID: `1:1029534608920:web:816639fd7892db2b499d6d`
  - ※これは Auth 用の Web アプリ登録のみ。Hosting 等は作成していない（=課金要素なし）。
- **`.env.local` を自動生成**（`firebase apps:sdkconfig WEB` の値を書き込み・gitignored でコミットされない）
  - `NEXT_PUBLIC_FIREBASE_API_KEY`（Web の公開クライアントキー。秘密情報ではない）
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `tvapp-service.firebaseapp.com`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `tvapp-service`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `tvapp-service.firebasestorage.app`（値はあるが Storage は使わない）
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `1029534608920`
  - `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:1029534608920:web:816639fd7892db2b499d6d`
  - `NEXT_PUBLIC_IDTOKEN_NAME` = `IdToken`
- **firebase-tools 導入**: `npm install -g firebase-tools`（ローカル。ユーザーが `firebase login` 済み）

### 2026-07-06 認証(サインイン方法)の決定 — ユーザーがコンソールで設定
**採用するサインイン方法（有効化済み）**
- ✅ **Google**（Google アカウントでログイン）
- ✅ **メール/パスワード**
- ✅ **メールリンク（パスワードなし・passwordless）**… メール/パスワードの設定内で有効化
**採用しないもの（設計判断）**
- ❌ **匿名（ゲスト）ログインは使わない**（ユーザー決定。ゲスト前提を設計から外す）
  - 影響: 既存コードの「ゲストとしてログイン」ボタン、`signInAnonymously`、
    エピソードの「ゲスト30秒視聴制限」・ゲスト警告モーダルは**削除/無効化する**（別タスク）。
- いずれのサインイン方法も **Spark(無料)枠で提供**され課金は発生しない。
**公開名（Public-facing name）**: 推奨は「TVapp」。（設定値が確定したらここに追記）

## 未実施（次にやること）
- [ ] コード反映: 匿名(ゲスト)導線の削除、Google ログイン導線の追加、メールリンク(passwordless)ログインの追加。
- [ ] Authentication > Settings > 承認済みドメイン: 本番の `*.workers.dev`（デプロイ後）を追加。localhost は既定で許可。
- [ ] Cloudflare: アカウント/ API トークン用意 → CI/CD Secrets 登録（`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）。
- [ ] GitHub Variables 登録（`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_IDTOKEN_NAME`）。
- [ ] （段階2）Firestore を無料枠で有効化（Blaze にしない）。Storage は使わない方針を維持。

### 2026-07-06 Cloudflare 初回デプロイ と 地域制限の判明（重要）
- **本番URL**: `https://tvapp-web.kodama-hirotaka-190380-cloudflare.workers.dev`（wrangler OAuth・workers.dev サブドメイン自動登録）。
- **デプロイ成功**: `next build`→OpenNext→`wrangler deploy`。health/`/`/login は 200、TVER ブラウズ(session/ランキング)も本番で成功。
- **⚠ 判明した制約（恒常）**: **ストリーム解決(Streaks playback)が本番で地域制限エラー(id124=geo)**。3回とも `この地域からは視聴できません`。
  - 原因: **Cloudflare Workers の外向き IP が非JP/データセンター判定**され、Streaks が JP 限定で拒否。ローカル(JP家庭回線)からは今も解決OK(live test 通過)。
  - 含意: **$0 の Cloudflare 単独では TVER 再生の「解決」だけが成立しない**(ブラウズは可)。解決には **JP egress のホスト**が要る。
  - 元実装(Azure Functions/JP)が見れていたのは JP-egress だったため。Azure Functions 従量課金も無料枠内(~$0)。
- **選択肢(要判断)**:
  - (A) ハイブリッド: フロント+ブラウズ=Cloudflare($0)、**解決だけ JP-egress**(ユーザーの Proxmox/SBC 家庭サーバ + **Cloudflare Tunnel 無料**、または Azure Functions JP ~$0)。
  - (B) 全体を JP 家庭サーバで動かす($0・常時起動+トンネル)。
  - (C) その他の JP-egress 無料ホストを調査。

### 2026-07-06 Azure委譲で再生解決が本番で成立(完成)
- **既存 Azure Function を再利用**(新規作成なし=追加費用なし)。
  - Function App: `Platform-Stream-Loader` / RG `rg-dev-xiaovy000` / **Japan East** / **状態 Running**。
  - プラン: **Y1(Dynamic)= Consumption 従量課金**(固定費なし・無料枠内=~$0)。ランタイム Python 3.12(yt-dlp)。
  - サブスクリプション: `XIAOVYポータル_開発_サービス提供`(9fcfd9ea-…)。**会社/組織テナント**(roivy.net, MFA)。※会社環境である点に留意。
  - health_check: `TVer/Twitter/YouTube/ABEMA/niconico` 対応。→ ABEMA/YouTube も将来ここ経由で対応可能。
- **Cloudflare 側の接続設定**:
  - `wrangler.jsonc` vars に `AZURE_FUNCTION_STREEAMING=https://platform-stream-loader.azurewebsites.net`(公開・非秘密)。
  - `AZURE_FUNCTION_STREEAMING_CODE_KEY` は **wrangler secret**(暗号化)で登録。
  - streaminglink ルートは二段構え(Azure設定時は委譲、未設定時は純TS)。
- **本番検証(成功)**: `/api/health` の resolver=`azure-jp`、`streaminglink` が m3u8 を返す。**地域制限を突破**。
- **最終到達点**: フロント+ブラウズ=Cloudflare($0) / 認証=Firebase(Google) / 解決=Azure Function(JP・~$0)。全経路が本番で稼働。

## 備考
- Web の `apiKey` はクライアントに埋め込む公開値であり秘密ではない（漏えい時も Firestore/Storage のセキュリティルールで守る設計）。
- 本記録は `.gitignore` の `**/docs/**` により通常は無視されるため、トレーサビリティ確保のため force-add でコミットする。
</content>
