
## 目次

- [目次](#目次)
- [前提条件](#前提条件)
- [インストール](#インストール)
- [使い方 (Docker-Compose)](#使い方-docker-compose)
  - [起動](#起動)
  - [停止](#停止)
- [APIエンドポイント一覧](#apiエンドポイント一覧)

## 前提条件

このプロジェクトを実行するために必要な前提条件を以下に示します。

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)


## インストール

プロジェクトのクローンを作成します。

```bash
git clone https://github.com/hirotaka42/tvapp-web.git
wget https://gist.github.com/hirotaka42/2555081d216876b71b55644f0873b0bf/raw/fa3e4953719b764a54996460cfc593a4221f769c/.env.local -O tvapp-web/xiao.tvapp.web/.env.local
```

`.env.local`へ以下を追記
```
BETA_IDTOKEN=""
SAMPLE_IDTOKEN=""
JWT_EXPIRATION_TIME=""
JWT_SECRET_KEY=""
NEXT_PUBLIC_IDTOKEN_NAME=""
NEXT_PUBLIC_IMAG_THUMBNAIL=""
NEXT_PUBLIC_IMAG_LOGO=""

DB_CONNECTION_STRING=""
DB_USERNAME=""
DB_PASSWORD=""
AZURE_FUNCTION_STREEAMING=""
AZURE_FUNCTION_STREEAMING_CODE_KEY=""
```

デバッグ
```
cd tvapp-web/xiao.tvapp.web
npm i
npm run dev
```

## 使い方 (Docker-Compose)
### 起動
Docker Composeを使用してプロジェクトを起動します。
```
docker-compose up --build
```

永続的に起動するには以下
```
docker-compose up -d
```

### 停止
Docker Composeを使用してプロジェクトを停止します。
```
docker-compose down
```

## APIエンドポイント一覧
APIの主要なエンドポイントを以下に示します。

|エンドポイント|パラメータ|クエリ|レスポンス|リクエスト|
|---|---|---|---|---|
|`/api/TVapp/session`|-|-|`platformUid`<br>`platformToken`|セッションtoken を発行する|POST|
|`/api/TVapp/ranking/{genre}`|現在使用できるのは以下の6つ <br>`drama`<br>`variety`<br>`anime`<br>`news_documentary`<br>`sports`<br>`other`|-|カテゴリ別のランキング最大30個|GET|
|`/api/TVapp/service/search`|-|`keyword`<br>`platformUid`<br>`platformToken`|検索結果|GET|
|`/api/TVapp/service/callHome`|-|`platformUid`<br>`platformToken`|ホームに表示されている全番組データ|GET|
|`/api/TVapp/service/callEpisode/{episodeId}`|`{episodeId}`|`platformUid`<br>`platformToken`|エピソードIDにヒットする番組情報|GET|
|`/api/TVapp/content/series/{seriesId}`|`{seriesId}`|-|シリーズIDにヒットするシリーズの概要情報|GET|
|`/api/TVapp/streaming/{episodeId}`|`{episodeId}`|-|エピソードIDを元にしたm3u8形式のストリーミングURL|GET|

