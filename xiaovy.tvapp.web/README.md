# TVapp

あなたの好きをもっと手軽に、もっと便利に。

## 特徴

- **豊富なコンテンツ**: ドラマ、バラエティ、アニメなど多彩なジャンルの作品
- **最新作から懐かしい作品まで**: 常に更新される充実したライブラリ
- **使いやすいインターフェース**: シンプルで直感的なUI/UX
- **ダークモード対応**: 目に優しい表示モード

## 技術スタック

- **フレームワーク**: Next.js 14
- **フロントエンド**: React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI, Headless UI
- **データベース**: MongoDB (Mongoose)
- **認証**: JWT
- **ホスティング**: Azure Functions

## 開発環境のセットアップ

### 前提条件

- Node.js 18 以上
- npm または yarn

### インストール

```bash
# 依存パッケージをインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

### 本番ビルド

```bash
npm run build
npm start
```

### コードのリント

```bash
npm run lint
```

## Docker での起動

```bash
# イメージをビルドしてコンテナを起動
docker-compose up --build

# バックグラウンドで実行
docker-compose up -d

# コンテナを停止
docker-compose down
```

## 環境変数

`.env.local` ファイルに以下の環境変数を設定してください：

```env
# === Azure Functions ===
AZURE_FUNCTION_STREEAMING=""
AZURE_FUNCTION_STREEAMING_CODE_KEY=""

# === 画像URL ===
NEXT_PUBLIC_IMAG_THUMBNAIL=""
NEXT_PUBLIC_IMAG_LOGO=""
MAIN_LOGO_SVG=""

# === ストリーミング設定 ===
NEXT_PUBLIC_JP_STREAMING_M3U_URL=""
NEXT_PUBLIC_STREAM_PASSWORD=""

# === Firebase設定（クライアント側） ===
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# === Firebase Admin SDK設定（サーバーサイドのみ） ===
FIREBASE_ADMIN_TYPE=""
FIREBASE_ADMIN_PROJECT_ID=""
FIREBASE_ADMIN_PRIVATE_KEY_ID=""
FIREBASE_ADMIN_PRIVATE_KEY=""
FIREBASE_ADMIN_CLIENT_EMAIL=""
FIREBASE_ADMIN_CLIENT_ID=""
FIREBASE_ADMIN_AUTH_URI=""
FIREBASE_ADMIN_TOKEN_URI=""
FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL=""
FIREBASE_ADMIN_CLIENT_CERT_URL=""
FIREBASE_ADMIN_UNIVERSE_DOMAIN=""

# === セキュリティ ===
SUPER_USER_CREATE_SECRET=""

# === CosmosDB 設定 ===
COSMOSDB_ENDPOINT=""
COSMOSDB_KEY=""
COSMOSDB_DATABASE_NAME=""
COSMOSDB_CONTAINER_NAME=""
COSMOSDB_SERIES_CONTAINER_NAME=""
COSMOSDB_FORCE_RECREATE_CONTAINERS=""

# === Azure Blob Storage 設定 ===
AZURE_STORAGE_CONNECTION_STRING=""
AZURE_STORAGE_ACCOUNT_NAME=""
AZURE_STORAGE_CONTAINER_NAME=""

# === その他 ===
NEXT_PUBLIC_IDTOKEN_NAME=""
```

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router ページと API ルート
│   ├── api/               # バックエンド API エンドポイント
│   │   ├── service/       # TVer API プロキシ
│   │   ├── user/          # ユーザー認証・登録
│   │   ├── content/       # コンテンツ取得
│   │   └── cosmosdb/      # Azure Cosmos DB 連携
│   └── [routes]/          # ページルート
├── components/            # React コンポーネント (Atomic Design パターン)
│   └── atomicDesign/
│       ├── atoms/         # 基本 UI コンポーネント
│       ├── molecules/     # 複合コンポーネント
│       └── pages/         # ページレベルコンポーネント
├── contexts/              # React Context 定義 (DI 用)
├── services/              # ビジネスロジック実装層
│   └── implementation/    # 具体的なサービス実装
├── hooks/                 # カスタム React フック
├── types/                 # TypeScript 型定義
└── utils/                 # ユーティリティ関数
```

## API エンドポイント

主要な API エンドポイント：

- `POST /api/service/session` - セッション管理
- `GET /api/service/call/home` - ホームコンテンツ取得
- `GET /api/service/call/episode/{id}` - エピソード詳細
- `GET /api/service/call/ranking/episode/detail/{genre}` - ランキング取得
  - ジャンル: `drama`, `variety`, `anime`, `news_documentary`, `sports`, `other`
- `GET /api/service/search?keyword=...` - コンテンツ検索
- `POST /api/service/call/streaminglink` - ストリーミングリンク取得
- `GET /api/service/stream/fetchM3u` - M3U ストリーム取得
- `GET /api/service/call/seriesEpisodes/{seriesId}` - シリーズエピソード取得

## ライセンス

このプロジェクトはプライベートリポジトリです。

## サポート

問題や質問がある場合は、Issue を作成してください。
