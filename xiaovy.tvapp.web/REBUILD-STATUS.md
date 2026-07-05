# TVapp 作り直し — 現況と続きの進め方(ハンドオフ)

> このファイルはリポジトリに含まれるので、別 PC で clone しても続きから進められる。
> ブランチ: `project/tvapp-redesign`。

## コンセプト(合意済み)
身内・限定公開向けの視聴ハブ。TVer / ABEMA / YouTube / ニコニコを横断して探し、お気に入り/履歴は一つの体験として溜まり、快適に観る。コンセプトからのフル作り直し。

## 確定した設計判断
- ソース取り込み: yt-dlp を汎用リゾルバに(既存 Platform-Stream-Loader=Azure Functions を育てる)。カタログはソース別アダプタ、再生解決は共通リゾルバ。別 BFF は作らない(tvapp-bff は畳む)。
- 再生可否: playable / drm-unplayable(ABEMA の DRM 保護=メタのみ) / account-required。
- 実行基盤($0 厳守): フロント=Cloudflare Workers 無料枠(@opennextjs/cloudflare、firebase-admin→jose/REST 改修が前提)、yt-dlp リゾルバ=Azure Functions 無料枠、Firebase Spark。有料ティア・課金アカウント要求は不採用(Fly.io/CF Containers/Cloud Run は対象外)。
- アクセス: 招待コード必須の登録 + Google/メール認証。ゲスト(匿名)廃止済み。
- UI/UX: 「夜の居間のスクリーン」=温チャコール+灯火アンバー、ダーク既定。絵文字禁止・モノクロ線 SVG アイコン・日本語 UI。ソース切替はセグメント A 主 + 横断おすすめ C 味付け。
- YouTube キュレーション: お笑い不要。音楽ランキング(日本/世界)・映画情報・ニュース・AI 関連。

## いま出来ているもの(このブランチ・push 済み f8211e3)
- デザイントークン(src/app/globals.css + Tailwind の app.* カラー)。
- ソース層 src/lib/sources/(types=ContentSource 契約 / mock 4ソース / registry / lookup)。
- 新 UI src/components/rebuild/(AppShell / SourceSwitcher / DiscoveryRow / ContentCard / DiscoveryHome / Player / FavoriteButton / icons)。
- 画面: 新ホーム /、プレーヤー /watch/[source]/[id]、/library。
- YouTube は実在6動画(音楽ランキング世界)を react-player で実ブラウザ再生確認済み。
- お気に入り/履歴 src/lib/userdata/local.ts(localStorage。明日 Firebase 認証後に Firestore users/{uid}/favorites・watchHistory へ差し替える設計)。
- テスト Vitest(sources / userdata / 既存 auth)。E2E scripts/e2e-smoke.mjs(puppeteer-core・要 dev 起動)。
- typecheck / lint / build / test 通過。

## 動かし方
    cd xiaovy.tvapp.web
    npm install
    npm run dev            # http://localhost:3000
    node scripts/e2e-smoke.mjs   # dev 起動下で E2E

注意: dev をバックグラウンド起動して自分で kill port 3000 しない(サーバ自滅の元)。

## 次にやること(実装 TODO)
全ソースでカタログ・本物サムネ・アプリ内再生を実物化(外部サイトへ飛ばさずアプリ内で再生)。
1. TVer(既存実装を精読して再現): src/app/api/service/**・content/**・services/**・utils/Convert/** を読み、匿名セッション(platform-api.tver.jp/v2/api/platform_users/browser/create, Origin/Referer=s.tver.jp)→ランキング/検索/シリーズ/エピソード→statics.tver.jp のサムネ→再生URL解決 を新アダプタ src/lib/sources/tver.ts(ContentSource 実装)に再現。TVer は匿名で creds 不要。
2. 再生URL解決: ローカルは Node 子プロセスで yt-dlp(https://tver.jp/episodes/{id} → m3u8)。本番は Azure Function。react-player(hls)で再生。
3. YouTube サムネ: https://i.ytimg.com/vi/{videoId}/hqdefault.jpg(APIキー不要)。
4. ニコニコ / ABEMA: yt-dlp で解決。ABEMA は無料/リニアのみ(DRM 保護作品はメタのみ)。
5. アカウント連携: userdata/local.ts を Firestore に差し替え(Firebase 認証・招待制)。Google 認証設定と一緒に。

## 認証情報(未投入=実バックエンドはまだ動かない)
.env.local は 31 キー中 4 つのみ充足。実カタログ(TVer は匿名で可)以外に必要:
- NEXT_PUBLIC_FIREBASE_*(ログイン/アカウント)
- firebase-admin の client_email / project_id 等(API ルート)
- AZURE_FUNCTION_STREEAMING(本番の再生URL解決)
テンプレは .env.local.example。値は Vercel の環境変数からコピー(チャットに貼らずファイルへ)。
