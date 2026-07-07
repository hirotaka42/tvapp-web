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
  - レスポンシブ: iPhone/iPad/PCで左右見切れなし（.tv-row の左padding 24px）。
- **ABEMA（ブラウズのみ）**: 番組表/チャンネル一覧を公開API(api.abema.io)経由で実データ表示。緑×黒の世界観。
- **CI/CD（tvapp-web）**: main保護（PR必須+CI必須+カバレッジ80%）。deploy.yml は version 上昇時のみCloudflareデプロイ。
  デプロイは `npm run deploy:safe`（再ビルド必須+build_sha鮮度照合）。テスト138+、カバレッジ~95%。
- **ロゴ**: 波モチーフのネオンロゴ（public/brand/）を favicon/ヘッダー/ログインに適用。

## 🔴 いま残っている最大の作業（次セッションの最優先）
**ABEMAのアプリ内再生が「あと一歩」で未完。** 現在地:
1. ✅ フロント実装済（feature/tvapp-nextjs-upgrade-cicd ブランチ、未マージ）:
   `/api/service/abema/{streaminglink,hls,key}` ルート、live/watch再生ページ、VideoPlayerに proxy prop、AbemaCard等をアプリ内再生遷移へ。
   → Azure が `{manifest_dict:{urls:[master]}, keys:{ticket:hex16}}` を返せば再生できる設計。
2. ✅ Azure側の鍵導出を実装（Platform-Stream-Loader main にマージ済・**手元funcで本番デプロイ済**）:
   ABEMAは独自暗号 `abematv-license://`。yt-dlp AbemaLicenseRH でサーバ側16byte鍵導出。**ローカルでは実ライブ2chで鍵16byte導出を実証済**。
3. 🔴 **未解決の問題**: **本番Azureに直接ABEMAライブを投げると master も keys も返らない（0件）**。ローカルは成功、本番Azureは失敗。
   - 検証コマンド: `az functionapp keys list -g rg-dev-xiaovy000 -n Platform-Stream-Loader` でkey取得し、
     `curl "https://platform-stream-loader.azurewebsites.net/api/backend_stream_url_http?code=<KEY>&url=https://abema.tv/now-on-air/abema-news"` → 現状 manifest_dict.urls空・keys空。
   - **次にやること**: Azure本番のログ/挙動を調べ、なぜ鍵導出が失敗するか特定。候補: (a) yt-dlpの内部API依存(AbemaLicenseRH)がAzure Python 3.12環境で例外、(b) src/services/abema.py の例外を握り潰して空を返している、(c) Azure worker から license.abema.io/api.abema.io への通信やDEVICE_ID発行が失敗、(d) デプロイ反映のタイムラグ。
     Azure の Application Insights / `az functionapp log` で例外を見る。ローカル(.venv)では動くので差分を詰める。
4. その後: Azure が鍵を返せたら、tvapp-web の feature ブランチを PR→main→本番デプロイし、**PC Chromeで ABEMA ライブがアプリ内再生できるか実機確認**（CDPで video error=null/readyState>=3/buffered>0、最終はユーザー実機）。VODは media token 必須でライブより難しく後続。

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
