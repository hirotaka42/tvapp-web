# TVapp 引き継ぎ資料（2026-07-08 セッション終了時点）

> 次セッションはまず本ファイル → `CLAUDE.md` → `docs/reference/04_usage/03-abema-local-playback.md` → recall されるメモリ、の順で読む。
> **本番URL**: `https://tvapp-web.xie-cloudflare.workers.dev`（Cloudflare Workers / OpenNext）。
> 役割分担: 設計・監査・UI/UX・検証=上位Claude、コード調査・実装=Codex(GPT5.5 high)。

## 1. これは何か
TVER / ABEMA / YouTube / niconico を1つのWebアプリで切り替えて視聴する統合ビューア。**$0運用が絶対要件**。
フロント+ブラウズ=Cloudflare Workers(OpenNext, Next16 App Router) / 認証=Firebase / ストリーム解決=日本リージョンの Azure Function `Platform-Stream-Loader`(yt-dlp)。

## 2. 現在地（2026-07-08・本番稼働中）
**tvapp-web `v1.6.2` を main マージ + Cloudflare 本番デプロイ済**（build_sha 一致を実測）。

| 領域 | 本番の状態 |
|---|---|
| TVER（ブラウズ+再生） | ✅ 動作（PC Chrome/スマホ。スマホ幅の左右余白調整済） |
| ABEMA ブラウズ（ランキング/シリーズ/番組情報） | ✅ 動作（Cloudflare海外egressでも地域制限なし・実測200） |
| ABEMA 再生の鍵導出（Azure） | ✅ 有効な鍵を返す（本番でセグメントAES復号8/8を実測。Azure Functionは頻繁リサイクルでトークン新鮮） |
| ABEMA 再生（プレイヤー到達） | 🔴 **本番で不安定**（下記「次タスク①」）。ローカルは常に動く |
| CI/CD（GH Actions→Cloudflare自動デプロイ） | ✅ 有効化・実測済（版上げmainマージで自動デプロイ） |
| Vercel 自動デプロイ | 🟡 別途生きている（止めるならVercelダッシュボードでGit連携解除） |

### このセッションで入った主な機能（ABEMA中心）
- **アプリ内再生(live+VOD)**: 真の主因は `middleware.ts` が再生系(`/api/service/abema/{streaminglink,hls,key}`)を認可ゲート(401)でブロックしていたこと→TVERの`stream/hls`同様に公開許可へ追加。復号=HLSプロキシ+鍵配布（セグメントはCDN直取り=$0）。
- **VODランキング**: `/v1/modules?spotId=xRKNUGRQ`(bearer user token)で実8棚。認証は yt-dlp `_generate_aks`→`POST /v1/users` を TS移植（`src/lib/abema/auth.ts`）。
- **番組情報/シリーズ辿り**: 再生ページに番組メタ(シリーズ/シーズン/話数/あらすじ)+下部に同シリーズ全話バー(サムネ付)。シリーズ詳細ページ(シーズンタブ+話数)。
- **トップ刷新**: ヒーロー=ランキング上位の自動スライド(約10件・7秒送り・ドット)。右=「いま放送中」(リアルタイム)。
- **有料明示**: 有料(=`label.free!==true`)は「有料」表示し再生ブロック。再生エラー文言を原因別に多様化。
- **横断ナビ修正(TVER時代からの課題)**: タブは`setService`のみで遷移しないため再生ページで無反応だった→`useServiceNavigation`でhome以外は`/`へ遷移、再生ページは`window.confirm`確認付き。

## 3. 次にやること（優先順）
1. 🔴 **鍵ストアをKV/Durable Objectsへ（本番ABEMA再生の安定化）**: 原因はAzureでなく `src/app/api/service/abema/keyStore.ts` が**インメモリで Cloudflare Workers の isolate 間で共有されない**こと。streaminglink(鍵保存)と`/api/service/abema/key`(取得)が別isolateだと404（実測: ライブ/VODが試行ごとにランダムで404）。KVは結果整合でput直後getに注意→**DOが堅い**、or 鍵をsidに署名付き埋め込む案も。**今回設定したCloudflare APIトークンはKV編集権限を含むので、KV名前空間の作成もこの端末の認証で可能**。
2. 🟡 **Vercelの自動デプロイを止める**: repoにvercel.json無し=Vercel GitHub連携由来。Vercelダッシュボードで対象プロジェクトのGit連携を解除（or repoにvercel.jsonで無効化）。本番はCloudflare。
3. 🟡 **README/docsの更新（実態乖離）**: `README.md`(root=**Docker時代の旧内容**)と`xiaovy.tvapp.web/README.md`(旧製品説明)が現構成(Next16+Cloudflare+ABEMA)と大きく乖離。`docs/reference`の 01_spec/02_architecture もABEMA一式を反映しきれていない。次回まとめて更新推奨。
4. YouTube / niconico の世界: モックのみ・未実装。段階2(お気に入り/視聴履歴/プロフィール/管理): `deferred-phase2/`退避・`PHASE2_USER_DATA_ENABLED=false`・Firestore方式で後日。

## 4. 落とし穴・教訓（再発防止）
- **リゾルバのメディアトークン失効**: 長時間起動のリゾルバは yt-dlp `AbemaTVBaseIE._MEDIATOKEN`(プロセス内クラス属性)が古くなり、**16byteだが復号できない誤った鍵**を出す(全通信200・無エラーで readyState=0)。恒久修正は `Platform-Stream-Loader` main にマージ済(resolve冒頭で`_MEDIATOKEN`リセット)。応急=リゾルバ再起動。
- **再生不能の切り分け**: 「サーバの鍵とセグメントを AES-128-CBC 復号して先頭0x47・188周期のTS同期を見る」が確実（headlessブラウザの可否判定より速く鍵の正誤が分かる）。
- **ABEMA API**: VOD系は user token 必須。シリーズの各シーズンは**フルseasonId(例`149-11_s2`)で個別取得**(短縮は0件)。話数サムネはAPI未提供だが `image.p-c2-x.abema-tv.com/image/programs/{episodeId}/thumb001.png` で200。
- **CI/デプロイ**: wranglerはNode>=22要求(deploy.yml/ci.ymlをnode22化済)。CIデプロイは `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`(secret)+`NEXT_PUBLIC_FIREBASE_*`(vars)が必要=**設定済**。過去のCI「成功」は版未変更でdeploy skipだっただけで、実デプロイは常にローカル`deploy:safe`だった。
- **デプロイは再ビルド必須**: 手動は `npm run deploy:safe`（.open-next削除→再ビルド→`--var BUILD_SHA`→本番/api/healthのbuild_sha照合）。

## 5. ローカル起動 / デプロイ
- **ローカルABEMA再生**（本番Azureに頼らずローカルリゾルバ経由）:
  1. `cd Platform-Stream-Loader && source .venv/bin/activate && python scripts/local_resolver_server.py`（:7071）
  2. `cd xiaovy.tvapp.web && NEXT_PUBLIC_DEV_BYPASS_AUTH=1 AZURE_FUNCTION_STREEAMING=http://localhost:7071 npm run dev`
  3. ヘッダのABEMAタブ（localStorage `tvapp-svc-v2=abema`）。
- **デプロイ**: 版上げ→mainマージで**GH Actionsが自動でCloudflareへ**（または手元 `npm run deploy:safe`）。長時間プロセス(dev/リゾルバ)は検証後に必ずkill。

## 6. 主要パス・ブランチ・PR
- フロント: `tvapp-service/tvapp-web/xiaovy.tvapp.web/`（本流=**main**。旧作業ブランチ `feature/tvapp-nextjs-upgrade-cicd` はマージ済）。
- リゾルバ: `tvapp-service/Platform-Stream-Loader/`（main。`src/services/abema.py`=鍵導出、`scripts/local_resolver_server.py`=dev用シム。両方main）。
- 本セッションのPR: tvapp-web #58(機能一式) #59(Node22+版) #60/#61(docs) #62(CI/CD疎通) / Platform-Stream-Loader #9(鍵修正) #10(シム)。
- 設計/記録: `docs/reference/`（04_usage/03-abema-local-playback.md が最新の使用書）。
