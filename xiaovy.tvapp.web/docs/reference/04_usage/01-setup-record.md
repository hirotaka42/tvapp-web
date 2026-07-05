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

## 未実施（次にやること）
- [ ] **Authentication のサインイン方法を有効化**（コンソール）: 「メール/パスワード」ON、「匿名」ON。
      ※ Identity Toolkit API での自動有効化は、認証情報ストア読み取りが安全上ブロックされたため手動トグルで行う。
- [ ] Authentication > Settings > 承認済みドメイン: 本番の `*.workers.dev`（デプロイ後）を追加。localhost は既定で許可。
- [ ] Cloudflare: アカウント/ API トークン用意 → CI/CD Secrets 登録（`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`）。
- [ ] GitHub Variables 登録（`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_IDTOKEN_NAME`）。
- [ ] （段階2）Firestore を無料枠で有効化（Blaze にしない）。Storage は使わない方針を維持。

## 備考
- Web の `apiKey` はクライアントに埋め込む公開値であり秘密ではない（漏えい時も Firestore/Storage のセキュリティルールで守る設計）。
- 本記録は `.gitignore` の `**/docs/**` により通常は無視されるため、トレーサビリティ確保のため force-add でコミットする。
</content>
