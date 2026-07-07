# TVapp 引き継ぎ資料（2026-07-07 セッション終了時点）

> 次セッションはまず本ファイルと `CLAUDE.md`、そして recall されるメモリ（下記）を読むこと。
> 本番URL: `https://tvapp-web.kodama-hirotaka-190380-cloudflare.workers.dev`

## 全体像（何を作っているか）
TVER / ABEMA / YouTube / niconico を1つのWebアプリで切り替えて視聴する統合ビューア「TVapp」。
**$0運用**が絶対要件。フロント+ブラウズ=Cloudflare Workers(OpenNext) / 認証=Firebase(Google/メール/メールリンク・匿名なし) /
ストリーム解決=日本リージョンの Azure Function `Platform-Stream-Loader`(yt-dlp)。設計/推論=Fable5、実装=Codex(GPT5.5 high)、検証=Claude。

## いま完成して本番で動いているもic（✅）
- **TVER**: ビビッド高密度デザインのホーム（実ランキング）、**PC Chrome/スマホで動画再生できる**（本番確認済）。
  - 再生の要点: streaks の master m3u8 のみ CORS 非許可 → 同一オリジンHLSプロキシ `/api/service/stream/hls` で master だけ中継しCORS付与。
    **映像セグメントは直取り（帯域ゼロ・$0維持）**。プレイヤーは **hls.js優先**（Chromeの canPlayType 誤申告でネイティブ経路を選ぶと再生不可だった）。
  - レスポンシブ: iPhone/iPad/PCで左右見切れなし。**2026-07-07更新**: スマホ幅で左右余白を詰めコンテンツを広げた
    （wrap 16→12px、tv-row左24→18px、カード微増）。431〜640px帯の1位バッジ見切れも小オフセット(-10/-12px)を≤640へ適用して解消。360/390/480px実測OK。
- **ABEMA（ブラウズのみ）**: 番組表/チャンネル一覧を公開API(api.abema.io)経由で実データ表示。緑×黒の世界観。
- **CI/CD（tvapp-web）**: main保護（PR必須+CI必須+カバレッジ80%）。deploy.yml は version 上昇時のみCloudflareデプロイ。
  デプロイは `npm run deploy:safe`（再ビルド必須+build_sha鮮度照合）。テスト138+、カバレッジ~95%。
- **ロゴ**: 波モチーフのネオンロゴ（public/brand/）を favicon/ヘッダー/ログインに適用。

## ✅ ABEMA アプリ内再生（live + VOD）= ローカルで完成（2026-07-07 夜セッション）
**ABEMAのアプリ内再生（ライブ＋VODランキング）がローカルで完全動作。** 実ブラウザ(headless Chrome/CDP)で検証済:
- ライブ `abema-news`: readyState=4 / error=null / buffered=40s / 426x240 デコード（映像フレーム化まで確認）。
- VOD `210-18_s1_p1`・ランキング1位 season `90-1849_s3_p1`: readyState=4 / buffered≈92s / 427x240 デコード。
- ランキング1位カードのクリック→season→episode解決→`/service/abema/watch/…` へ**アプリ内遷移**（外部遷移なし）を実測。

### 何が入ったか（feature/tvapp-nextjs-upgrade-cicd、未マージ）
1. **再生アンブロック**: `src/middleware.ts` の公開許可に `/api/service/abema/{streaminglink,hls,key}` を追加。
   従来これらが認可ゲート(401)でブロックされ、hls.js が鍵/セグメントを取れず**Azure以前に再生不能**だった（真の主因の一つ）。
2. **VOD/ランキングのデータ層**（実データ疎通済）:
   - `src/lib/abema/auth.ts`: yt-dlp `_generate_aks` を TS 移植 → `POST api.abema.io/v1/users` で user token 取得＋module-scopeキャッシュ＋401再取得。
   - `src/app/api/service/abema/vod/ranking`: `GET user-content-api.p-c3-e.abema-tv.com/v1/modules?spotId=xRKNUGRQ&spotVersion=1&limit=8&qos=PC&qpl=web`（bearer user token）→ 実ランキング8棚（総合/アニメ/バラエティ/恋愛リアリティ/韓中ドラマ等）。
   - `src/app/api/service/abema/vod/episode`: series/season contentId → 再生用 episodeId 解決（**seasonIdクエリは送らない**＝送ると0件。id が `{contentId}_` で始まる無料話を優先）。
   - `src/app/api/service/abema/vod/genres`: `GET api.abema.io/v1/video/genres`。
   - `types/abema/{rawApi,view}.ts` + `utils/abema/normalizeVod.ts` + テスト。
3. **UI**: `AbemaVodRanking`(organism) + `AbemaVodCard`(実サムネ・クリックでアプリ内再生) + `useAbemaVod` を `AbemaHome` に配線（番組表＝リアルタイムと並べて『ビデオランキング』を前面表示）。
4. **UI追加(2026-07-08)**:
   - **ヒーロー**: トップの大枠を将棋ライブ固定から、今日の総合ランキング/アニメランキングの1〜3位ランダム表示へ(`AbemaVodHero`/`pickVodHero`)。クリックでアプリ内再生。
   - **再生ページ番組情報**: watch ページにエピソード名/シリーズ/シーズン/話数/あらすじ/ジャンル/無料/サムネ + 「シリーズ・全話を見る」導線(`/api/service/abema/vod/program`)。
   - **親/シーズン/話数の辿り**: `/service/abema/series/[seriesId]`(シーズンタブ+話数リスト・各話アプリ内再生)。`/api/service/abema/vod/series` は各シーズンをフルseasonIdで個別取得(無職転生3期=24/25/3話 実測)。
   - 使用書: `docs/reference/04_usage/03-abema-local-playback.md`。

### ローカルで動かす手順（本番Azureは現状壊れているため、ローカルはローカルリゾルバ経由）
1. **リゾルバをローカル起動**（JP家庭回線＋local .venv で鍵導出が通る）:
   ```
   cd Platform-Stream-Loader && source .venv/bin/activate
   python scripts/local_resolver_server.py     # :7071 で Azure と同じ契約に応答（src自動検出）
   ```
   （`http://127.0.0.1:7071/api/backend_stream_url_http` が master+16byte鍵を返すdev用シム。`abema-news` で確認済。
   シム本体は **`Platform-Stream-Loader` の `chore/local-resolver-dev-shim` ブランチ**にコミット済＝要マージ。VERSION不変でCD非発火）。
2. **tvapp-web を起動**（リゾルバURLを渡す。.env.local は非破壊のためインライン推奨）:
   `cd xiaovy.tvapp.web && NEXT_PUBLIC_DEV_BYPASS_AUTH=1 AZURE_FUNCTION_STREEAMING=http://localhost:7071 npm run dev`
3. ABEMAワールド: localStorage `tvapp-svc-v2=abema`（ヘッダのABEMAタブ）。ビデオランキングのカードをクリック→アプリ内再生。

### ⚠ 落とし穴（実測で判明・重要）: 長時間起動のリゾルバは鍵が狂う
- 症状: しばらく起動しっぱなしのリゾルバ経由だと「マニフェスト・鍵・セグメントは全部200で取れるのに、readyState=0のまま再生されない（エラーも出ない）」。
- 原因: yt-dlp は `AbemaTVBaseIE._MEDIATOKEN` を**プロセス内クラス属性で使い回す**。これが古くなると **16byteだが実際には復号できない誤った鍵**を導出する（同一チケットで正しい鍵に対し別値を返す→AES-128が0/8）。プレイヤーは無言でセグメントを捨て続ける。
- 恒久対策: **`Platform-Stream-Loader` の `fix/abema-fresh-media-token` ブランチ**で `resolve_abema_stream` 冒頭に `_MEDIATOKEN` リセットを入れ、毎回新鮮なトークンで鍵導出（要マージ。本番Azure再デプロイ時もこの修正込みで）。
- 応急: リゾルバ・サーバーを再起動すれば新鮮なトークンで直る。
- **要マージのPlatform-Stream-Loaderブランチ2本**: `fix/abema-fresh-media-token`（鍵の恒久修正・重要）と `chore/local-resolver-dev-shim`（ローカル起動シム）。
- 検証手法メモ: 再生不能の切り分けは「サーバから鍵とセグメントを取り AES-128-CBC 復号して先頭0x47・188周期のTS同期を見る」のが確実（headlessブラウザの可否より速く確実に鍵の正誤が分かる）。

## 🟡 残: 本番Azureが鍵を返さない（要ユーザーのAzure資格情報）
ローカルは完動。**本番 Azure だけが空を返す**。Codex調査(read-only)の結論:
- 現行 `Platform-Stream-Loader/src/services/abema.py` は master/ticket/key が無ければ必ず例外(500)を返す設計で、
  **200で空(manifest_dict.urls=[]・keys={})を返す経路は現行コードに存在しない**。→ 本番が空200を返すなら
  **本番が現行のABEMA専用コードを実行していない＝デプロイが古い/失敗**が最有力（次点: 本番ランタイム/yt-dlp差、Azure egressでの ABEMA API/license 失敗）。
- 確定コマンド（要 `az login` or SCM資格。**AI単独では実行不可**）:
  - SCMで実デプロイ済コードを確認: `curl -u "$SCM_USER:$SCM_PASS" "https://platform-stream-loader.scm.azurewebsites.net/api/vfs/site/wwwroot/services/abema.py" | head`
  - 本番ランタイム: SCM `/api/command` で `python -c "import sys,yt_dlp;print(sys.version, yt_dlp.version.__version__)"`
  - `az functionapp log tail -g rg-dev-xiaovy000 -n Platform-Stream-Loader` で例外確認。
- 本番修正後は tvapp-web の `AZURE_FUNCTION_STREEAMING` を本番Azureに戻し、feature→main→本番で最終確認。VOD/ライブとも同一鍵導出パスなので本番が鍵を返せば両方通る。

## 🟡 その他の保留・判断待ち
- **Platform-Stream-Loader のブランチ保護**: privateリポでGitHub無料プランのためブランチ保護がかけられない（403 "Upgrade to GitHub Pro"）。
  → public化 / 有料プラン / 運用ルールで守る、のいずれか要ユーザー判断。CI/CD自体は動く（version上昇でCD発火）。
- **Platform-Stream-Loader の GitHub Actions CD が Azure Login で失敗**: OIDCフェデレーション資格が main ブランチ subject を許可していない
  （`AADSTS700213 No matching federated identity record ... repo:.../ref:refs/heads/main`）。当面は**手元 func で直接デプロイ**で回避中
  （`cd src && func azure functionapp publish Platform-Stream-Loader --python --build remote`）。恒久対応はAzureアプリ登録にmain用フェデレーション資格を追加（会社テナント権限が要る）。
- YouTube / niconico の世界: モックのみ（docs/reference/03_decisions/multiservice-home-v2.html）。未実装。
- 段階2（お気に入り/視聴履歴/プロフィール/管理）: `deferred-phase2/` に退避、PHASE2_USER_DATA_ENABLED=false。Firestore方式で後日。

## 開発ワークフロー（厳守）
ローカル開発がデフォルト→**本物のAPIに繋いで実機確認**→問題なければmainマージ→Cloudflare/Azure本番で最終確認。
- ローカル: `cd xiaovy.tvapp.web && NEXT_PUBLIC_DEV_BYPASS_AUTH=1 npm run dev`（Firebase無しでも確認可・本番では無効）。
- 実機再生の検証: ヘッドレスは映像デコード不可。Chrome CDP(--remote-debugging-port)で video の error/readyState/buffered を読む。最終はユーザー実機。
- **dev サーバー等の長時間プロセスは検証後に必ず kill**（放置でorphan/CPU飽和の前科あり）。
- **実装は Codex(GPT5.5 high) に委任**。Codexは「動くふりで停止」するので、出力ファイルの伸び/ソース更新で生存判定し、固まったら kill→再起動（監視スクリプト方式）。

## 主要パス
- フロント: `tvapp-service/tvapp-web/xiaovy.tvapp.web/`（作業ブランチ `feature/tvapp-nextjs-upgrade-cicd`）。
- Azure: `tvapp-service/Platform-Stream-Loader/`（main。`src/services/abema.py` が鍵導出）。
- 設計/記録: `docs/reference/`（02_architecture に ABEMA/CI-CD/再生の設計、04_usage に実行手順・setup-record）。
</content>
